import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TaxpayersService } from './taxpayers.service';
import {
  TAXPAYERS_CACHE_REPOSITORY,
  TAXPAYER_PROVIDER_FACTORY,
} from './constants/taxpayers.tokens';
import { ITaxpayerCacheRepository } from './interfaces/i-taxpayers-repository.interface';
import { TaxpayerProviderFactory } from './providers/provider.factory';
import { TaxpayerEvents } from './constants/taxpayers-events.enum';
import { TaxpayerCache } from './entities/taxpayer-cache.entity';

describe('TaxpayersService', () => {
  let service: TaxpayersService;
  let cacheRepo: jest.Mocked<ITaxpayerCacheRepository>;
  let providerFactory: jest.Mocked<TaxpayerProviderFactory>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockProvider = {
    fetchByDocument: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxpayersService,
        {
          provide: TAXPAYERS_CACHE_REPOSITORY,
          useValue: {
            findByRuc: jest.fn(),
            upsert: jest.fn(),
            findExpiredRecords: jest.fn(),
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

    service = module.get<TaxpayersService>(TaxpayersService);
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

  describe('validateDv', () => {
    it('debería calcular el dígito verificador correctamente', () => {
      const result = service.validateDv('80012345', 'PY');
      expect(result).toEqual({
        documentNumber: '80012345',
        dv: '0',
        ruc: '80012345-0',
      });
    });
  });

  describe('lookup', () => {
    it('debería retornar de caché si existe y no está expirado', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const cachedTaxpayer = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        countryCode: 'PY',
        documentNumber: '80012345',
        dv: '0',
        ruc: '80012345-0',
        businessName: 'EMPRESA CACHE S.A.',
        taxpayerType: 'PERSONA_JURIDICA',
        status: 'ACTIVO',
        address: 'Avda. Central 123',
        city: 'Asunción',
        cacheExpiresAt: futureDate,
        rawData: { phone: '0981123456' },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as TaxpayerCache;

      cacheRepo.findByRuc.mockResolvedValue(cachedTaxpayer);

      const result = await service.lookup({
        document: '80012345',
        country: 'PY',
      });

      expect(cacheRepo.findByRuc).toHaveBeenCalledWith('PY', '80012345-0');
      expect(providerFactory.getProvider).not.toHaveBeenCalled();
      expect(result.found).toBe(true);
      expect(result.fromCache).toBe(true);
      expect(result.businessName).toBe('EMPRESA CACHE S.A.');
      expect(result.phone).toBe('0981123456');
    });

    it('debería consultar proveedor externo si no está en caché y guardar el resultado', async () => {
      cacheRepo.findByRuc.mockResolvedValue(null);
      mockProvider.fetchByDocument.mockResolvedValue({
        businessName: 'EMPRESA EXTERNA S.A.',
        firstName: undefined,
        lastName: undefined,
        taxpayerType: 'PERSONA_JURIDICA',
        status: 'ACTIVO',
        address: 'Calle Palma 456',
        city: 'Asunción',
        phone: '021445566',
        email: 'info@externa.com.py',
        economicActivity: 'Comercio',
        rawData: { phone: '021445566' },
      });

      const savedEntity = {
        id: '1',
        countryCode: 'PY',
        documentNumber: '80012345',
        dv: '0',
        ruc: '80012345-0',
        businessName: 'EMPRESA EXTERNA S.A.',
        taxpayerType: 'PERSONA_JURIDICA',
        status: 'ACTIVO',
        address: 'Calle Palma 456',
        city: 'Asunción',
        cacheExpiresAt: new Date(),
        rawData: { phone: '021445566' },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as TaxpayerCache;

      cacheRepo.upsert.mockResolvedValue(savedEntity);

      const result = await service.lookup({
        document: '80012345',
        country: 'PY',
      });

      expect(providerFactory.getProvider).toHaveBeenCalledWith('PY');
      expect(mockProvider.fetchByDocument).toHaveBeenCalledWith(
        '80012345',
        '0',
      );
      expect(cacheRepo.upsert).toHaveBeenCalled();
      expect(result.found).toBe(true);
      expect(result.fromCache).toBe(false);
      expect(result.businessName).toBe('EMPRESA EXTERNA S.A.');
    });

    it('debería emitir STATUS_CHANGED si el estado cambia respecto al caché', async () => {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1);

      const oldCached = {
        id: '1',
        countryCode: 'PY',
        documentNumber: '80012345',
        dv: '0',
        ruc: '80012345-0',
        businessName: 'EMPRESA S.A.',
        taxpayerType: 'PERSONA_JURIDICA',
        status: 'ACTIVO',
        cacheExpiresAt: expiredDate,
        updatedAt: new Date(),
      } as unknown as TaxpayerCache;

      cacheRepo.findByRuc.mockResolvedValue(oldCached);
      mockProvider.fetchByDocument.mockResolvedValue({
        businessName: 'EMPRESA S.A.',
        taxpayerType: 'PERSONA_JURIDICA',
        status: 'BLOQUEADO',
        rawData: {},
      });

      const updatedEntity = {
        ...oldCached,
        status: 'BLOQUEADO',
      } as unknown as TaxpayerCache;

      cacheRepo.upsert.mockResolvedValue(updatedEntity);

      await service.lookup({ document: '80012345', country: 'PY' });

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        TaxpayerEvents.STATUS_CHANGED,
        expect.objectContaining({
          countryCode: 'PY',
          ruc: '80012345-0',
          oldStatus: 'ACTIVO',
          newStatus: 'BLOQUEADO',
        }),
      );
    });

    it('debería retornar fallback con manualEntryRequired si el proveedor externo retorna null', async () => {
      cacheRepo.findByRuc.mockResolvedValue(null);
      mockProvider.fetchByDocument.mockResolvedValue(null);

      const result = await service.lookup({
        document: '99999999',
        country: 'PY',
      });

      expect(result.found).toBe(false);
      expect(result.manualEntryRequired).toBe(true);
      expect(result.documentNumber).toBe('99999999');
    });

    it('debería manejar excepciones de forma segura y retornar fallback manual', async () => {
      cacheRepo.findByRuc.mockRejectedValue(new Error('DB Connection Failed'));

      const result = await service.lookup({
        document: '80012345',
        country: 'PY',
      });

      expect(result.found).toBe(false);
      expect(result.manualEntryRequired).toBe(true);
      expect(result.ruc).toBe('80012345-0');
    });
  });
});
