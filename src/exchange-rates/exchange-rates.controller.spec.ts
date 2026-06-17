import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeRatesController } from './exchange-rates.controller';
import { ExchangeRatesService } from './exchange-rates.service';

import { PermissionsGuard } from '../auth/guards/permissions.guard';

describe('ExchangeRatesController', () => {
  let controller: ExchangeRatesController;
  let serviceMock: Record<string, jest.Mock>;

  beforeEach(async () => {
    serviceMock = {
      getLatestRates: jest.fn(),
      scrapeAndSaveRates: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExchangeRatesController],
      providers: [
        {
          provide: ExchangeRatesService,
          useValue: serviceMock,
        },
      ],
    })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<ExchangeRatesController>(ExchangeRatesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRates', () => {
    it('should return mapped rates', async () => {
      const date = new Date();
      serviceMock.getLatestRates.mockResolvedValue([
        {
          currency: 'USD',
          purchasePrice: 7000,
          salePrice: 7100,
          isFallback: false,
          updatedAt: date,
        },
      ]);

      const result = await controller.getRates();

      expect(result).toEqual({
        rates: [
          {
            currency: 'USD',
            purchasePrice: 7000,
            salePrice: 7100,
            isFallback: false,
            updatedAt: date,
          },
        ],
      });
      expect(serviceMock.getLatestRates).toHaveBeenCalled();
    });
  });

  describe('manualScrape', () => {
    it('should call service and return success message', async () => {
      serviceMock.scrapeAndSaveRates.mockResolvedValue(undefined);

      const result = await controller.manualScrape();

      expect(result).toEqual({
        message: 'Scraping manual de cotizaciones completado',
      });
      expect(serviceMock.scrapeAndSaveRates).toHaveBeenCalled();
    });
  });
});
