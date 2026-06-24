import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { NewsRepository } from './news.repository';
import { News, NewsStatus, NewsCategory } from '../entities/news.entity';

describe('NewsRepository', () => {
  let repository: NewsRepository;
  let typeOrmRepository: Repository<News>;

  const mockQueryBuilder = {
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsRepository,
        {
          provide: getRepositoryToken(News),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
            findOne: jest.fn(),
            create: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {},
        },
      ],
    }).compile();

    repository = module.get<NewsRepository>(NewsRepository);
    typeOrmRepository = module.get<Repository<News>>(getRepositoryToken(News));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findPaginated', () => {
    it('debería configurar correctamente skip, take y ordenación por defecto', async () => {
      await repository.findPaginated({ page: 2, limit: 5 });

      expect(typeOrmRepository.createQueryBuilder).toHaveBeenCalledWith('news');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'news.createdAt',
        'DESC',
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
    });

    it('debería agregar filtro por companyId si se provee', async () => {
      await repository.findPaginated({ page: 1, limit: 10 }, 42);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'news.companyId = :companyId',
        { companyId: 42 },
      );
    });

    it('debería agregar filtro por categoria si se provee', async () => {
      await repository.findPaginated({
        page: 1,
        limit: 10,
        categoria: NewsCategory.COMUNICADO,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'news.categoria = :categoria',
        { categoria: NewsCategory.COMUNICADO },
      );
    });

    it('debería agregar filtro por estado si se provee forceStatus', async () => {
      await repository.findPaginated(
        { page: 1, limit: 10 },
        undefined,
        NewsStatus.PUBLICADO,
      );

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'news.estado = :estado',
        { estado: NewsStatus.PUBLICADO },
      );
    });

    it('debería agregar filtro por estado desde paginationDto si no se provee forceStatus', async () => {
      await repository.findPaginated({
        page: 1,
        limit: 10,
        estado: NewsStatus.BORRADOR,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'news.estado = :estado',
        { estado: NewsStatus.BORRADOR },
      );
    });

    it('debería agregar condiciones de búsqueda con unaccent si se provee q', async () => {
      await repository.findPaginated({ page: 1, limit: 10, q: 'hola' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('unaccent(news.tituloEs) ILIKE unaccent(:q)'),
        { q: '%hola%' },
      );
    });
  });
});
