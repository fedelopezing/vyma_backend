import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ExchangeRatesService } from './exchange-rates.service';
import { CompaniesRepository } from '../companies/repositories/companies.repository';
import { EXCHANGE_RATES_REPOSITORY_TOKEN } from './interfaces/exchange-rates-repository.interface';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ExchangeRatesService', () => {
  let service: ExchangeRatesService;
  let repositoryMock: Record<string, jest.Mock>;
  let cacheManagerMock: Record<string, jest.Mock>;
  let eventEmitterMock: Record<string, jest.Mock>;
  let companiesRepositoryMock: Record<string, jest.Mock>;

  beforeEach(async () => {
    repositoryMock = {
      findAll: jest.fn(),
      createOrUpdate: jest.fn(),
    };

    cacheManagerMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    eventEmitterMock = {
      emit: jest.fn(),
    };

    companiesRepositoryMock = {
      findAllActiveWithModule: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeRatesService,
        {
          provide: EXCHANGE_RATES_REPOSITORY_TOKEN,
          useValue: repositoryMock,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
        {
          provide: EventEmitter2,
          useValue: eventEmitterMock,
        },
        {
          provide: CompaniesRepository,
          useValue: companiesRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<ExchangeRatesService>(ExchangeRatesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLatestRates', () => {
    it('should return from cache if available', async () => {
      const cachedData = [
        { currency: 'USD', purchasePrice: 7000, salePrice: 7100 },
      ];
      cacheManagerMock.get.mockResolvedValue(cachedData);

      const result = await service.getLatestRates(10);
      expect(result).toEqual(cachedData);
      expect(repositoryMock.findAll).not.toHaveBeenCalled();
    });

    it('should fetch from DB and cache if not in cache', async () => {
      cacheManagerMock.get.mockResolvedValue(null);
      const dbData = [
        { currency: 'USD', purchasePrice: 7000, salePrice: 7100 },
      ];
      repositoryMock.findAll.mockResolvedValue(dbData);

      const result = await service.getLatestRates(10);
      expect(result).toEqual(dbData);
      expect(repositoryMock.findAll).toHaveBeenCalledWith(10);
      expect(cacheManagerMock.set).toHaveBeenCalledWith(
        'latest_exchange_rates_10',
        dbData,
        expect.any(Number),
      );
    });
  });

  describe('scrapeAndSaveRates', () => {
    it('should scrape, parse, and save rates successfully', async () => {
      const apiResponse = {
        data: {
          items: [
            { isoCode: 'USD', purchasePrice: '7000', salePrice: '7100' },
            { isoCode: 'BRL', purchasePrice: 1400, salePrice: 1450 },
            { isoCode: 'XXX', purchasePrice: 10, salePrice: 20 }, // Should be ignored
          ],
        },
      };
      mockedAxios.get.mockResolvedValue(apiResponse);

      await service.scrapeAndSaveRates(10);

      expect(repositoryMock.createOrUpdate).toHaveBeenCalledWith(
        'USD',
        7000,
        7100,
        10,
        false,
      );
      expect(repositoryMock.createOrUpdate).toHaveBeenCalledWith(
        'BRL',
        1400,
        1450,
        10,
        false,
      );
      expect(repositoryMock.createOrUpdate).not.toHaveBeenCalledWith(
        'XXX',
        expect.any(Number),
        expect.any(Number),
        10,
        false,
      );
      expect(cacheManagerMock.del).toHaveBeenCalledWith(
        'latest_exchange_rates_10',
      );
      expect(eventEmitterMock.emit).not.toHaveBeenCalled();
    });

    it('should handle API errors, set fallback, and emit event', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API Down'));

      const existingRates = [
        {
          currency: 'USD',
          purchasePrice: 7000,
          salePrice: 7100,
          isFallback: false,
        },
      ];
      repositoryMock.findAll.mockResolvedValue(existingRates);

      await service.scrapeAndSaveRates(10);

      expect(repositoryMock.findAll).toHaveBeenCalledWith(10);
      expect(repositoryMock.createOrUpdate).toHaveBeenCalledWith(
        'USD',
        7000,
        7100,
        10,
        true,
      );
      expect(eventEmitterMock.emit).toHaveBeenCalledWith(
        'rates.scraping_failed',
        expect.objectContaining({
          error: 'API Down',
          timestamp: expect.any(Date),
        }),
      );
      expect(cacheManagerMock.del).toHaveBeenCalledWith(
        'latest_exchange_rates_10',
      );
    });

    it('should handle invalid API response format, trigger fallback, and emit event', async () => {
      const apiResponse = {
        data: {
          items: null,
        },
      };
      mockedAxios.get.mockResolvedValue(apiResponse);

      const existingRates = [
        {
          currency: 'USD',
          purchasePrice: 7000,
          salePrice: 7100,
          isFallback: false,
        },
      ];
      repositoryMock.findAll.mockResolvedValue(existingRates);

      await service.scrapeAndSaveRates(10);

      expect(repositoryMock.findAll).toHaveBeenCalledWith(10);
      expect(repositoryMock.createOrUpdate).toHaveBeenCalledWith(
        'USD',
        7000,
        7100,
        10,
        true,
      );
      expect(eventEmitterMock.emit).toHaveBeenCalledWith(
        'rates.scraping_failed',
        expect.objectContaining({
          error: expect.stringContaining(
            'Formato de respuesta inválido de Cambios Chaco',
          ),
          timestamp: expect.any(Date),
        }),
      );
      expect(cacheManagerMock.del).toHaveBeenCalledWith(
        'latest_exchange_rates_10',
      );
    });
  });
});
