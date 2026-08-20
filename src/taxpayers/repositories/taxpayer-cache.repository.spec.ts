import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxpayerCacheRepository } from './taxpayer-cache.repository';
import { TaxpayerCache } from '../entities/taxpayer-cache.entity';

describe('TaxpayerCacheRepository', () => {
  let repository: TaxpayerCacheRepository;
  let typeormRepo: jest.Mocked<Repository<TaxpayerCache>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxpayerCacheRepository,
        {
          provide: getRepositoryToken(TaxpayerCache),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<TaxpayerCacheRepository>(TaxpayerCacheRepository);
    typeormRepo = module.get(getRepositoryToken(TaxpayerCache));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByRuc', () => {
    it('debería buscar por countryCode y ruc', async () => {
      const entity = {
        id: '1',
        countryCode: 'PY',
        ruc: '80012345-0',
      } as TaxpayerCache;
      typeormRepo.findOne.mockResolvedValue(entity);

      const result = await repository.findByRuc('PY', '80012345-0');

      expect(typeormRepo.findOne).toHaveBeenCalledWith({
        where: { countryCode: 'PY', ruc: '80012345-0' },
      });
      expect(result).toBe(entity);
    });
  });

  describe('upsert', () => {
    it('debería actualizar registro existente si ya existe', async () => {
      const existing = {
        id: '1',
        countryCode: 'PY',
        ruc: '80012345-0',
        businessName: 'VIEJO NOMBRE',
      } as TaxpayerCache;

      typeormRepo.findOne.mockResolvedValue(existing);
      typeormRepo.save.mockImplementation(
        async (item) => item as TaxpayerCache,
      );

      const result = await repository.upsert('PY', {
        ruc: '80012345-0',
        businessName: 'NUEVO NOMBRE',
      });

      expect(typeormRepo.findOne).toHaveBeenCalledWith({
        where: { countryCode: 'PY', ruc: '80012345-0' },
      });
      expect(typeormRepo.save).toHaveBeenCalled();
      expect(result.businessName).toBe('NUEVO NOMBRE');
    });

    it('debería crear nuevo registro si no existe', async () => {
      typeormRepo.findOne.mockResolvedValue(null);
      const created = {
        countryCode: 'PY',
        ruc: '80012345-0',
        businessName: 'NUEVA EMPRESA',
      } as TaxpayerCache;

      typeormRepo.create.mockReturnValue(created);
      typeormRepo.save.mockResolvedValue({
        id: '2',
        ...created,
      } as TaxpayerCache);

      const result = await repository.upsert('PY', {
        ruc: '80012345-0',
        businessName: 'NUEVA EMPRESA',
      });

      expect(typeormRepo.create).toHaveBeenCalledWith({
        countryCode: 'PY',
        ruc: '80012345-0',
        businessName: 'NUEVA EMPRESA',
      });
      expect(typeormRepo.save).toHaveBeenCalled();
      expect(result.id).toBe('2');
    });
  });

  describe('findExpiredRecords', () => {
    it('debería buscar registros con cacheExpiresAt menor a 24 horas', async () => {
      const records = [{ id: '1' }] as TaxpayerCache[];
      typeormRepo.find.mockResolvedValue(records);

      const result = await repository.findExpiredRecords(50);

      expect(typeormRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
          order: { cacheExpiresAt: 'ASC' },
        }),
      );
      expect(result).toBe(records);
    });
  });
});
