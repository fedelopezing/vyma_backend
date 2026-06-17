import { Test, TestingModule } from '@nestjs/testing';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsPaginationDto } from './dto/news-pagination.dto';
import { News, NewsStatus } from './entities/news.entity';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { UserCompanyRepository } from '../companies/repositories/user-company.repository';

describe('NewsController', () => {
  let controller: NewsController;
  let newsService: jest.Mocked<NewsService>;

  const mockNewsService: jest.Mocked<Partial<NewsService>> = {
    findAll: jest.fn(),
    findAllAdmin: jest.fn(),
    findOneBySlug: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockNews: Partial<News> = {
    id: 'uuid-123',
    tituloEs: 'Noticia de prueba',
    slugEs: 'noticia-de-prueba',
    estado: NewsStatus.PUBLICADO,
  };

  const mockJwtPayload: JwtPayload = {
    sub: 1,
    uuid: 'user-uuid-123',
    email: 'test@example.com',
    role: 'admin',
    companyId: 2,
    companyUuid: 'company-uuid-123',
    isSuperAdmin: false,
  };

  const mockAuthenticatedRequest = {
    user: mockJwtPayload,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsController],
      providers: [
        { provide: NewsService, useValue: mockNewsService },
        {
          provide: UserCompanyRepository,
          useValue: { isActiveMember: jest.fn().mockResolvedValue(true) },
        },
      ],
    })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<NewsController>(NewsController);
    newsService = module.get(NewsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('debería llamar a newsService.findAll() con el DTO y retornar el resultado', async () => {
      const paginationDto: NewsPaginationDto = { page: 1, limit: 10 };
      const expected = {
        data: [mockNews as News],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
      newsService.findAll.mockResolvedValueOnce(expected);

      const result = await controller.findAll(paginationDto);

      expect(newsService.findAll).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual(expected);
    });
  });

  describe('findOneBySlug', () => {
    it('debería llamar a newsService.findOneBySlug() con el slug correcto', async () => {
      newsService.findOneBySlug.mockResolvedValueOnce(mockNews as News);

      const result = await controller.findOneBySlug('noticia-de-prueba');

      expect(newsService.findOneBySlug).toHaveBeenCalledWith(
        'noticia-de-prueba',
      );
      expect(result).toEqual(mockNews);
    });
  });

  describe('findAllAdmin', () => {
    it('debería llamar a newsService.findAllAdmin() con el DTO de paginación y el companyId', async () => {
      const paginationDto: NewsPaginationDto = { page: 1, limit: 20 };
      const expected = {
        data: [mockNews as News],
        meta: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
      newsService.findAllAdmin.mockResolvedValueOnce(expected);

      const result = await controller.findAllAdmin(
        paginationDto,
        mockAuthenticatedRequest as never,
      );

      expect(newsService.findAllAdmin).toHaveBeenCalledWith(paginationDto, 2);
      expect(result).toEqual(expected);
    });

    it('debería llamar a newsService.findAllAdmin() con el companyId del DTO si el usuario es superAdmin', async () => {
      const paginationDto: NewsPaginationDto = {
        page: 1,
        limit: 20,
        companyId: 5,
      };
      const superAdminRequest = {
        user: {
          ...mockJwtPayload,
          isSuperAdmin: true,
          companyId: undefined,
        },
      };
      newsService.findAllAdmin.mockResolvedValueOnce({
        data: [],
        meta: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      await controller.findAllAdmin(paginationDto, superAdminRequest as never);

      expect(newsService.findAllAdmin).toHaveBeenCalledWith(paginationDto, 5);
    });
  });

  describe('create', () => {
    it('debería llamar a newsService.create() con el DTO, el autorId y el companyId extraídos del JWT', async () => {
      const dto: CreateNewsDto = {
        tituloEs: 'Nueva noticia',
        resumenEs: 'Resumen',
        contenidoEs: '<p>Contenido</p>',
        imagenPortada: 'https://example.com/img.jpg',
        estado: NewsStatus.BORRADOR,
      };
      newsService.create.mockResolvedValueOnce(mockNews as News);

      const result = await controller.create(
        dto,
        mockAuthenticatedRequest as never,
      );

      expect(newsService.create).toHaveBeenCalledWith(dto, '1', 2);
      expect(result).toEqual(mockNews);
    });
  });

  describe('update', () => {
    it('debería llamar a newsService.update() con el id, el DTO y el user correctos', async () => {
      const dto: UpdateNewsDto = { tituloEs: 'Título actualizado' };
      const updatedNews = {
        ...mockNews,
        tituloEs: 'Título actualizado',
      } as News;
      newsService.update.mockResolvedValueOnce(updatedNews);

      const result = await controller.update(
        'uuid-123',
        dto,
        mockAuthenticatedRequest as never,
      );

      expect(newsService.update).toHaveBeenCalledWith(
        'uuid-123',
        dto,
        mockJwtPayload,
      );
      expect(result).toEqual(updatedNews);
    });
  });

  describe('remove', () => {
    it('debería llamar a newsService.remove() con el id, el user y no retornar body', async () => {
      newsService.remove.mockResolvedValueOnce(undefined);

      const result = await controller.remove(
        'uuid-123',
        mockAuthenticatedRequest as never,
      );

      expect(newsService.remove).toHaveBeenCalledWith(
        'uuid-123',
        mockJwtPayload,
      );
      expect(result).toBeUndefined();
    });
  });
});
