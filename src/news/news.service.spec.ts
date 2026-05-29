import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { NewsService } from './news.service';
import { News, NewsStatus } from './entities/news.entity';
import { CreateNewsDto } from './dto/create-news.dto';

describe('NewsService', () => {
  let service: NewsService;

  const mockNewsRepository = {
    create: jest.fn(),
    findOne: jest.fn(),
    softDelete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    withDeleted: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
    getManyAndCount: jest.fn(),
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockQueryBuilder.getMany.mockResolvedValue([]);
    mockQueryBuilder.getOne.mockResolvedValue(null);
    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsService,
        { provide: getRepositoryToken(News), useValue: mockNewsRepository },
        { provide: DataSource, useValue: mockDataSource },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<NewsService>(NewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería crear una noticia en borrador sin campos bilingües', async () => {
      const dto: CreateNewsDto = {
        tituloEs: 'Mi noticia',
        resumenEs: 'Resumen',
        contenidoEs: 'Contenido',
        imagenPortada: 'url',
        estado: NewsStatus.BORRADOR,
      };

      const savedMock = {
        id: '1',
        slugEs: 'mi-noticia',
        slugEn: 'mi-noticia-en',
        estado: NewsStatus.BORRADOR,
      };
      mockNewsRepository.create.mockReturnValue(savedMock);
      mockQueryRunner.manager.save.mockResolvedValueOnce(savedMock);

      const result = await service.create(dto, '1');

      expect(result).toEqual(savedMock);
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('debería emitir evento news.published al crear en estado PUBLICADO', async () => {
      const dto: CreateNewsDto = {
        tituloEs: 'Mi noticia',
        tituloEn: 'My news',
        resumenEs: 'Res',
        resumenEn: 'Res en',
        contenidoEs: 'Cont',
        contenidoEn: 'Cont en',
        imagenPortada: 'url',
        estado: NewsStatus.PUBLICADO,
      };

      const savedMock = {
        id: '1',
        slugEs: 'mi-noticia',
        slugEn: 'my-news',
        estado: NewsStatus.PUBLICADO,
      };
      mockNewsRepository.create.mockReturnValue(savedMock);
      mockQueryRunner.manager.save.mockResolvedValueOnce(savedMock);

      await service.create(dto, '1');

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'news.published',
        expect.any(Object),
      );
    });

    it('debería lanzar BadRequestException al publicar sin campos bilingües', async () => {
      const dto: CreateNewsDto = {
        tituloEs: 'Mi noticia',
        resumenEs: 'Res',
        contenidoEs: 'Cont',
        imagenPortada: 'url',
        estado: NewsStatus.PUBLICADO,
      };

      await expect(service.create(dto, '1')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockQueryRunner.startTransaction).not.toHaveBeenCalled();
    });

    it('debería resolver colisión de slugs añadiendo sufijo numérico', async () => {
      const dto: CreateNewsDto = {
        tituloEs: 'Mi noticia',
        resumenEs: 'Resumen',
        contenidoEs: 'Contenido',
        imagenPortada: 'url',
        estado: NewsStatus.BORRADOR,
      };

      // Primero se llama para slugEs ('mi-noticia')
      mockQueryBuilder.getMany.mockResolvedValueOnce([
        { slugEs: 'mi-noticia' },
        { slugEs: 'mi-noticia-1' },
      ]);
      // Luego se llama para slugEn ('mi-noticia-en')
      mockQueryBuilder.getMany.mockResolvedValueOnce([]);

      // En el mockRepository, retornaremos el objeto con el slug auto-resuelto.
      // La función create asume que `create` usa los slugs que se le pasan.
      mockNewsRepository.create.mockImplementation((args) => args);
      mockQueryRunner.manager.save.mockImplementation((args) => args);

      const result = await service.create(dto, '1');

      expect(result.slugEs).toBe('mi-noticia-2');
    });
  });

  describe('findAll', () => {
    it('debería retornar noticias publicadas y paginadas', async () => {
      mockNewsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([
        [{ id: '1' }],
        1,
      ]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({ data: [{ id: '1' }], total: 1 });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'news.estado = :estado',
        { estado: NewsStatus.PUBLICADO },
      );
    });
  });

  describe('findOneBySlug', () => {
    it('debería retornar la noticia si existe y está publicada', async () => {
      mockNewsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      const mockResult = { id: '1', slugEs: 'mi-noticia' };
      mockQueryBuilder.getOne.mockResolvedValueOnce(mockResult);

      const result = await service.findOneBySlug('mi-noticia');
      expect(result).toEqual(mockResult);
    });

    describe('findAllAdmin', () => {
      it('debería retornar todas las noticias filtradas por estado', async () => {
        mockNewsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
        mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([
          [{ id: '1' }],
          1,
        ]);

        const result = await service.findAllAdmin({
          page: 1,
          limit: 10,
          estado: NewsStatus.BORRADOR,
        });

        expect(result).toEqual({ data: [{ id: '1' }], total: 1 });
        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
          'news.estado = :estado',
          { estado: NewsStatus.BORRADOR },
        );
      });
    });

    describe('update', () => {
      it('debería actualizar noticia en borrador y no emitir evento', async () => {
        const existingNews = {
          id: '1',
          tituloEs: 'Viejo',
          slugEs: 'viejo',
          estado: NewsStatus.BORRADOR,
        };
        mockNewsRepository.findOne.mockResolvedValueOnce(existingNews);

        const updateDto = { tituloEs: 'Nuevo' };
        const savedMock = { ...existingNews, ...updateDto, slugEs: 'nuevo' };

        mockQueryBuilder.getMany.mockResolvedValueOnce([]); // Para regenerar slug
        mockQueryRunner.manager.save.mockResolvedValueOnce(savedMock);

        const result = await service.update('1', updateDto);

        expect(result.slugEs).toBe('nuevo');
        expect(mockEventEmitter.emit).not.toHaveBeenCalled();
      });

      it('debería emitir evento al pasar de borrador a publicado', async () => {
        const existingNews = {
          id: '1',
          tituloEs: 'T',
          estado: NewsStatus.BORRADOR,
        };
        mockNewsRepository.findOne.mockResolvedValueOnce(existingNews);

        const updateDto = {
          estado: NewsStatus.PUBLICADO,
          tituloEn: 'T',
          resumenEn: 'R',
          contenidoEn: 'C',
          resumenEs: 'R',
          contenidoEs: 'C',
        };

        const savedMock = { ...existingNews, ...updateDto };
        mockQueryRunner.manager.save.mockResolvedValueOnce(savedMock);

        await service.update('1', updateDto);

        expect(mockEventEmitter.emit).toHaveBeenCalledWith(
          'news.published',
          expect.any(Object),
        );
      });

      it('debería lanzar BadRequestException al publicar sin campos bilingües', async () => {
        const existingNews = {
          id: '1',
          tituloEs: 'T',
          estado: NewsStatus.BORRADOR,
        };
        mockNewsRepository.findOne.mockResolvedValueOnce(existingNews);

        const updateDto = { estado: NewsStatus.PUBLICADO };

        await expect(service.update('1', updateDto)).rejects.toThrow(
          BadRequestException,
        );
      });

      it('debería lanzar NotFoundException si no existe el ID para update', async () => {
        mockNewsRepository.findOne.mockResolvedValueOnce(null);
        await expect(service.update('999', { tituloEs: 'T' })).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('remove', () => {
      it('debería aplicar Soft-Delete correctamente', async () => {
        const existingNews = { id: '1', tituloEs: 'T' };
        mockNewsRepository.findOne.mockResolvedValueOnce(existingNews);
        mockNewsRepository.softDelete.mockResolvedValueOnce(undefined);

        await service.remove('1');

        expect(mockNewsRepository.softDelete).toHaveBeenCalledWith('1');
      });

      it('debería lanzar NotFoundException si no existe el ID para remove', async () => {
        mockNewsRepository.findOne.mockResolvedValueOnce(null);
        await expect(service.remove('999')).rejects.toThrow(NotFoundException);
      });
    });
  });
});
