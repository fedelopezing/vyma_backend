import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxpayerDirectoryRepository } from './taxpayer-directory.repository';
import { TaxpayerDirectory } from '../entities/taxpayer-directory.entity';

describe('TaxpayerDirectoryRepository', () => {
  let repository: TaxpayerDirectoryRepository;
  let typeormRepo: jest.Mocked<Repository<TaxpayerDirectory>>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    setParameter: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxpayerDirectoryRepository,
        {
          provide: getRepositoryToken(TaxpayerDirectory),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
      ],
    }).compile();

    repository = module.get<TaxpayerDirectoryRepository>(
      TaxpayerDirectoryRepository,
    );
    typeormRepo = module.get(getRepositoryToken(TaxpayerDirectory));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('searchByName', () => {
    it('debería construir la consulta con trigram y paginación', async () => {
      const items: TaxpayerDirectory[] = [
        {
          id: '1',
          countryCode: 'PY',
          ruc: '80012345-0',
          businessName: 'IMPORTADORA TEST',
        },
      ];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([items, 1]);

      const [result, total] = await repository.searchByName(
        'PY',
        'IMPORTADORA',
        10,
        2,
      );

      expect(typeormRepo.createQueryBuilder).toHaveBeenCalledWith('dir');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'dir.countryCode = :countryCode',
        { countryCode: 'PY' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'dir.businessName ILIKE :query',
        { query: '%IMPORTADORA%' },
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual(items);
      expect(total).toBe(1);
    });
  });
});
