import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { NewsService } from './news.service';
import { News, NewsStatus } from './entities/news.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { NewsRepository } from './repositories/news.repository';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

describe('NewsService', () => {
  let service: NewsService;
  let mockNewsRepository: DeepMocked<NewsRepository>;
  let mockEventEmitter: DeepMocked<EventEmitter2>;

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

  beforeEach(async () => {
    jest.clearAllMocks();
    mockQueryBuilder.getMany.mockResolvedValue([]);
    mockQueryBuilder.getOne.mockResolvedValue(null);
    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    mockNewsRepository = createMock<NewsRepository>();
    mockEventEmitter = createMock<EventEmitter2>();

    mockNewsRepository.createQueryBuilder.mockReturnValue(
      mockQueryBuilder as any,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsService,
        { provide: NewsRepository, useValue: mockNewsRepository },
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
      } as News;
      mockNewsRepository.createNews.mockResolvedValue(savedMock);

      const result = await service.create(dto, '1');

      expect(result).toEqual(savedMock);
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
      expect(mockNewsRepository.createNews).toHaveBeenCalledWith(dto, '1');
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
      } as News;
      mockNewsRepository.createNews.mockResolvedValue(savedMock);

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
      expect(mockNewsRepository.createNews).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('debería retornar noticias publicadas y paginadas', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([
        [{ id: '1' }],
        1,
      ]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        data: [{ id: '1' }],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'news.estado = :estado',
        { estado: NewsStatus.PUBLICADO },
      );
    });

    it('debería forzar el estado PUBLICADO incluso si se pasa otro estado o undefined en la consulta pública', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([
        [{ id: '1' }],
        1,
      ]);

      await service.findAll({
        page: 1,
        limit: 10,
        estado: NewsStatus.BORRADOR,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'news.estado = :estado',
        { estado: NewsStatus.PUBLICADO },
      );
    });
  });

  describe('findOneBySlug', () => {
    it('debería retornar la noticia si existe y está publicada', async () => {
      const mockResult = { id: '1', slugEs: 'mi-noticia' } as News;
      mockNewsRepository.findOneBySlug.mockResolvedValue(mockResult);

      const result = await service.findOneBySlug('mi-noticia');
      expect(result).toEqual(mockResult);
      expect(mockNewsRepository.findOneBySlug).toHaveBeenCalledWith(
        'mi-noticia',
      );
    });

    it('debería lanzar NotFoundException si no existe o no está publicada', async () => {
      mockNewsRepository.findOneBySlug.mockResolvedValue(null);
      await expect(service.findOneBySlug('no-existe')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAllAdmin', () => {
    it('debería retornar todas las noticias filtradas por estado', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([
        [{ id: '1' }],
        1,
      ]);

      const result = await service.findAllAdmin({
        page: 1,
        limit: 10,
        estado: NewsStatus.BORRADOR,
      });

      expect(result).toEqual({
        data: [{ id: '1' }],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'news.estado = :estado',
        { estado: NewsStatus.BORRADOR },
      );
    });

    it('debería omitir filtros de categoría y estado si no se proveen (o son undefined)', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([
        [{ id: '1' }],
        1,
      ]);

      await service.findAllAdmin({
        page: 1,
        limit: 10,
        categoria: undefined,
        estado: undefined,
      });

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('debería actualizar noticia en borrador y no emitir evento', async () => {
      const existingNews = {
        id: '1',
        tituloEs: 'Viejo',
        slugEs: 'viejo',
        estado: NewsStatus.BORRADOR,
      } as News;
      mockNewsRepository.findOneById.mockResolvedValueOnce(existingNews);

      const updateDto = { tituloEs: 'Nuevo' };
      const savedMock = {
        ...existingNews,
        ...updateDto,
        slugEs: 'nuevo',
      } as News;
      mockNewsRepository.updateNews.mockResolvedValueOnce(savedMock);

      const result = await service.update('1', updateDto);

      expect(result.slugEs).toBe('nuevo');
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
      expect(mockNewsRepository.updateNews).toHaveBeenCalledWith(
        existingNews,
        updateDto,
      );
    });

    it('debería emitir evento al pasar de borrador a publicado', async () => {
      const existingNews = {
        id: '1',
        tituloEs: 'T',
        estado: NewsStatus.BORRADOR,
      } as News;
      mockNewsRepository.findOneById.mockResolvedValueOnce(existingNews);

      const updateDto = {
        estado: NewsStatus.PUBLICADO,
        tituloEn: 'T',
        resumenEn: 'R',
        contenidoEn: 'C',
        resumenEs: 'R',
        contenidoEs: 'C',
      };

      const savedMock = { ...existingNews, ...updateDto } as News;
      mockNewsRepository.updateNews.mockResolvedValueOnce(savedMock);

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
      } as News;
      mockNewsRepository.findOneById.mockResolvedValueOnce(existingNews);

      const updateDto = { estado: NewsStatus.PUBLICADO };

      await expect(service.update('1', updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debería lanzar NotFoundException si no existe el ID para update', async () => {
      mockNewsRepository.findOneById.mockResolvedValueOnce(null);
      await expect(service.update('999', { tituloEs: 'T' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('debería aplicar Soft-Delete correctamente', async () => {
      const existingNews = { id: '1', tituloEs: 'T' } as News;
      mockNewsRepository.findOneById.mockResolvedValueOnce(existingNews);
      mockNewsRepository.softDelete.mockResolvedValueOnce(undefined);

      await service.remove('1');

      expect(mockNewsRepository.softDelete).toHaveBeenCalledWith('1');
    });

    it('debería lanzar NotFoundException si no existe el ID para remove', async () => {
      mockNewsRepository.findOneById.mockResolvedValueOnce(null);
      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});
