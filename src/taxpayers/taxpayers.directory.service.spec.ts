import { Test, TestingModule } from '@nestjs/testing';
import { TaxpayersDirectoryService } from './taxpayers.directory.service';
import { TAXPAYERS_CACHE_REPOSITORY } from './constants/taxpayers.tokens';
import { ITaxpayerCacheRepository } from './interfaces/i-taxpayers-repository.interface';
import { TaxpayerCache } from './entities/taxpayer-cache.entity';
import { TaxpayerType, TaxpayerStatus } from './constants/taxpayers-enums';

describe('TaxpayersDirectoryService', () => {
  let service: TaxpayersDirectoryService;
  let cacheRepo: jest.Mocked<Pick<ITaxpayerCacheRepository, 'searchByName'>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxpayersDirectoryService,
        {
          provide: TAXPAYERS_CACHE_REPOSITORY,
          useValue: {
            searchByName: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TaxpayersDirectoryService>(TaxpayersDirectoryService);
    cacheRepo = module.get(TAXPAYERS_CACHE_REPOSITORY);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    it('debería retornar array vacío si el término de búsqueda está vacío', async () => {
      const result = await service.search({ q: '   ' });
      expect(result).toEqual([]);
      expect(cacheRepo.searchByName).not.toHaveBeenCalled();
    });

    it('debería buscar en la caché y mapear resultados correctamente', async () => {
      const entities: Partial<TaxpayerCache>[] = [
        {
          id: '1',
          countryCode: 'PY',
          documentNumber: '80012345',
          dv: '0',
          ruc: '80012345-0',
          businessName: 'IMPORTADORA TEST S.A.',
          taxpayerType: TaxpayerType.PERSONA_JURIDICA,
          status: TaxpayerStatus.ACTIVO,
          cacheExpiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        },
      ];

      cacheRepo.searchByName.mockResolvedValue([
        entities as TaxpayerCache[],
        1,
      ]);

      const result = await service.search({
        q: 'IMPORTADORA',
        country: 'PY',
        limit: 10,
        page: 1,
      });

      expect(cacheRepo.searchByName).toHaveBeenCalledWith(
        'PY',
        'IMPORTADORA',
        10,
        1,
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        found: true,
        documentNumber: '80012345',
        dv: '0',
        ruc: '80012345-0',
        businessName: 'IMPORTADORA TEST S.A.',
        taxpayerType: TaxpayerType.PERSONA_JURIDICA,
        status: TaxpayerStatus.ACTIVO,
        fromCache: true,
        manualEntryRequired: false,
      });
    });

    it('debería manejar errores y retornar array vacío', async () => {
      cacheRepo.searchByName.mockRejectedValue(new Error('Query Error'));

      const result = await service.search({ q: 'ERROR' });

      expect(result).toEqual([]);
    });
  });
});
