import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { News, NewsStatus } from './entities/news.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { NewsRepository } from './repositories/news.repository';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

describe('NewsService', () => {
  let service: NewsService;
  let mockNewsRepository: DeepMocked<NewsRepository>;
  let mockEventEmitter: DeepMocked<EventEmitter2>;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockNewsRepository = createMock<NewsRepository>();
    mockEventEmitter = createMock<EventEmitter2>();

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

      const result = await service.create(dto, '1', undefined);

      expect(result).toEqual(savedMock);
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
      expect(mockNewsRepository.createNews).toHaveBeenCalledWith(
        dto,
        '1',
        undefined,
      );
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

      await service.create(dto, '1', undefined);

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

      await expect(service.create(dto, '1', undefined)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockNewsRepository.createNews).not.toHaveBeenCalled();
    });

    it('debería pasar companyId al repositorio al crear', async () => {
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
        companyId: 5,
      } as News;
      mockNewsRepository.createNews.mockResolvedValue(savedMock);

      await service.create(dto, '1', 5);

      expect(mockNewsRepository.createNews).toHaveBeenCalledWith(dto, '1', 5);
    });
  });

  describe('findAll', () => {
    it('debería retornar noticias publicadas y paginadas', async () => {
      const mockNews = [{ id: '1' }] as News[];
      mockNewsRepository.findPaginated.mockResolvedValueOnce([mockNews, 1]);

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
      expect(mockNewsRepository.findPaginated).toHaveBeenCalledWith(
        { page: 1, limit: 10 },
        undefined,
        NewsStatus.PUBLICADO,
      );
    });

    it('debería forzar el estado PUBLICADO incluso si se pasa otro estado o undefined en la consulta pública', async () => {
      mockNewsRepository.findPaginated.mockResolvedValueOnce([[], 0]);

      await service.findAll({
        page: 1,
        limit: 10,
        estado: NewsStatus.BORRADOR,
      });

      expect(mockNewsRepository.findPaginated).toHaveBeenCalledWith(
        { page: 1, limit: 10, estado: NewsStatus.BORRADOR },
        undefined,
        NewsStatus.PUBLICADO,
      );
    });

    it('debería filtrar por companyId si se especifica en la consulta pública', async () => {
      mockNewsRepository.findPaginated.mockResolvedValueOnce([[], 0]);

      await service.findAll({
        page: 1,
        limit: 10,
        companyId: 3,
      });

      expect(mockNewsRepository.findPaginated).toHaveBeenCalledWith(
        { page: 1, limit: 10, companyId: 3 },
        3,
        NewsStatus.PUBLICADO,
      );
    });

    it('debería pasar el término de búsqueda q al repositorio', async () => {
      mockNewsRepository.findPaginated.mockResolvedValueOnce([[], 0]);

      await service.findAll({
        page: 1,
        limit: 10,
        q: 'término',
      });

      expect(mockNewsRepository.findPaginated).toHaveBeenCalledWith(
        { page: 1, limit: 10, q: 'término' },
        undefined,
        NewsStatus.PUBLICADO,
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
      const mockNews = [{ id: '1' }] as News[];
      mockNewsRepository.findPaginated.mockResolvedValueOnce([mockNews, 1]);

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
      expect(mockNewsRepository.findPaginated).toHaveBeenCalledWith(
        { page: 1, limit: 10, estado: NewsStatus.BORRADOR },
        undefined,
      );
    });

    it('debería filtrar por companyId cuando se provee', async () => {
      mockNewsRepository.findPaginated.mockResolvedValueOnce([[], 0]);

      await service.findAllAdmin({ page: 1, limit: 10 }, 7);

      expect(mockNewsRepository.findPaginated).toHaveBeenCalledWith(
        { page: 1, limit: 10 },
        7,
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

    it(
      'debería lanzar ForbiddenException si la noticia pertenece a otra ' +
        'empresa y el usuario no es superAdmin',
      async () => {
        const existingNews = {
          id: '1',
          companyId: 3,
          estado: NewsStatus.BORRADOR,
        } as News;
        mockNewsRepository.findOneById.mockResolvedValueOnce(existingNews);

        const user = {
          sub: 1,
          isSuperAdmin: false,
          companyId: 2,
        };

        await expect(
          service.update('1', { tituloEs: 'Nuevo' }, user as never),
        ).rejects.toThrow(ForbiddenException);
      },
    );

    it(
      'debería permitir actualizar si la noticia pertenece a otra empresa ' +
        'pero el usuario es superAdmin',
      async () => {
        const existingNews = {
          id: '1',
          companyId: 3,
          estado: NewsStatus.BORRADOR,
        } as News;
        mockNewsRepository.findOneById.mockResolvedValueOnce(existingNews);

        const user = {
          sub: 1,
          isSuperAdmin: true,
          companyId: undefined,
        };

        const updateDto = { tituloEs: 'Nuevo' };
        const savedMock = { ...existingNews, ...updateDto } as News;
        mockNewsRepository.updateNews.mockResolvedValueOnce(savedMock);

        const result = await service.update('1', updateDto, user as never);
        expect(result.tituloEs).toBe('Nuevo');
      },
    );

    it(
      'debería permitir actualizar si la noticia pertenece a la misma ' +
        'empresa que el usuario',
      async () => {
        const existingNews = {
          id: '1',
          companyId: 2,
          estado: NewsStatus.BORRADOR,
        } as News;
        mockNewsRepository.findOneById.mockResolvedValueOnce(existingNews);

        const user = {
          sub: 1,
          isSuperAdmin: false,
          companyId: 2,
        };

        const updateDto = { tituloEs: 'Nuevo' };
        const savedMock = { ...existingNews, ...updateDto } as News;
        mockNewsRepository.updateNews.mockResolvedValueOnce(savedMock);

        const result = await service.update('1', updateDto, user as never);
        expect(result.tituloEs).toBe('Nuevo');
      },
    );
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

    it(
      'debería lanzar ForbiddenException si el id pertenece a otra empresa ' +
        'y el usuario no es superAdmin',
      async () => {
        const existingNews = {
          id: '1',
          companyId: 3,
          estado: NewsStatus.BORRADOR,
        } as News;
        mockNewsRepository.findOneById.mockResolvedValueOnce(existingNews);

        const user = {
          sub: 1,
          isSuperAdmin: false,
          companyId: 2,
        };

        await expect(service.remove('1', user as never)).rejects.toThrow(
          ForbiddenException,
        );
      },
    );

    it(
      'debería permitir borrar si el id pertenece a otra empresa ' +
        'pero el usuario es superAdmin',
      async () => {
        const existingNews = {
          id: '1',
          companyId: 3,
          estado: NewsStatus.BORRADOR,
        } as News;
        mockNewsRepository.findOneById.mockResolvedValueOnce(existingNews);
        mockNewsRepository.softDelete.mockResolvedValueOnce(undefined);

        const user = {
          sub: 1,
          isSuperAdmin: true,
          companyId: undefined,
        };

        await service.remove('1', user as never);
        expect(mockNewsRepository.softDelete).toHaveBeenCalledWith('1');
      },
    );

    it(
      'debería permitir borrar si el id pertenece a la misma empresa ' +
        'que el usuario',
      async () => {
        const existingNews = {
          id: '1',
          companyId: 2,
          estado: NewsStatus.BORRADOR,
        } as News;
        mockNewsRepository.findOneById.mockResolvedValueOnce(existingNews);
        mockNewsRepository.softDelete.mockResolvedValueOnce(undefined);

        const user = {
          sub: 1,
          isSuperAdmin: false,
          companyId: 2,
        };

        await service.remove('1', user as never);
        expect(mockNewsRepository.softDelete).toHaveBeenCalledWith('1');
      },
    );
  });
});
