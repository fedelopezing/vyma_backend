import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TaxpayersCronService } from './taxpayers.cron.service';
import {
  TAXPAYERS_CACHE_REPOSITORY,
  TAXPAYER_PROVIDER_FACTORY,
} from './constants/taxpayers.tokens';
import { ITaxpayerCacheRepository } from './interfaces/i-taxpayers-repository.interface';
import { TaxpayerProviderFactory } from './providers/provider.factory';
import { TaxpayerEvents } from './constants/taxpayers-events.enum';
import { TaxpayerCache } from './entities/taxpayer-cache.entity';

describe('TaxpayersCronService', () => {
  let service: TaxpayersCronService;
  let cacheRepo: jest.Mocked<ITaxpayerCacheRepository>;
  let providerFactory: jest.Mocked<TaxpayerProviderFactory>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockProvider = {
    fetchByDocument: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxpayersCronService,
        {
          provide: TAXPAYERS_CACHE_REPOSITORY,
          useValue: {
            findExpiredRecords: jest.fn(),
            upsert: jest.fn(),
          },
        },
        {
          provide: TAXPAYER_PROVIDER_FACTORY,
          useValue: {
            getProvider: jest.fn().mockReturnValue(mockProvider),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TaxpayersCronService>(TaxpayersCronService);
    cacheRepo = module.get(TAXPAYERS_CACHE_REPOSITORY);
    providerFactory = module.get(TAXPAYER_PROVIDER_FACTORY);
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleCronRefresh', () => {
    it('no debería hacer nada si no hay registros expirando', async () => {
      cacheRepo.findExpiredRecords.mockResolvedValue([]);

      await service.handleCronRefresh();

      expect(cacheRepo.findExpiredRecords).toHaveBeenCalledWith(100);
      expect(providerFactory.getProvider).not.toHaveBeenCalled();
    });

    it('debería refrescar registros y emitir evento si cambia el status', async () => {
      const expiringRecord = {
        id: '1',
        countryCode: 'PY',
        documentNumber: '80012345',
        dv: '0',
        ruc: '80012345-0',
        businessName: 'EMPRESA TEST S.A.',
        status: 'ACTIVO',
      } as TaxpayerCache;

      cacheRepo.findExpiredRecords.mockResolvedValue([expiringRecord]);
      mockProvider.fetchByDocument.mockResolvedValue({
        businessName: 'EMPRESA TEST S.A.',
        taxpayerType: 'PERSONA_JURIDICA',
        status: 'SUSPENDIDO',
        rawData: {},
      });
      cacheRepo.upsert.mockResolvedValue({} as any);

      await service.handleCronRefresh();

      expect(providerFactory.getProvider).toHaveBeenCalledWith('PY');
      expect(mockProvider.fetchByDocument).toHaveBeenCalledWith(
        '80012345',
        '0',
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        TaxpayerEvents.STATUS_CHANGED,
        expect.objectContaining({
          countryCode: 'PY',
          ruc: '80012345-0',
          oldStatus: 'ACTIVO',
          newStatus: 'SUSPENDIDO',
        }),
      );
      expect(cacheRepo.upsert).toHaveBeenCalled();
    });

    it('debería tolerar errores individuales durante el ciclo del cron', async () => {
      const expiringRecord = {
        id: '1',
        countryCode: 'PY',
        documentNumber: '80012345',
        dv: '0',
        ruc: '80012345-0',
      } as TaxpayerCache;

      cacheRepo.findExpiredRecords.mockResolvedValue([expiringRecord]);
      mockProvider.fetchByDocument.mockRejectedValue(
        new Error('Network failure'),
      );

      await expect(service.handleCronRefresh()).resolves.not.toThrow();
    });
  });
});
