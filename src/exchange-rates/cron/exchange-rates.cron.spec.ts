import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeRatesCron } from './exchange-rates.cron';
import { ExchangeRatesService } from '../exchange-rates.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

describe('ExchangeRatesCron', () => {
  let cron: ExchangeRatesCron;
  let mockExchangeRatesService: DeepMocked<ExchangeRatesService>;

  beforeEach(async () => {
    mockExchangeRatesService = createMock<ExchangeRatesService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeRatesCron,
        {
          provide: ExchangeRatesService,
          useValue: mockExchangeRatesService,
        },
      ],
    }).compile();

    cron = module.get<ExchangeRatesCron>(ExchangeRatesCron);
  });

  it('should be defined', () => {
    expect(cron).toBeDefined();
  });

  describe('handleDailyScrape', () => {
    it('should call exchangeRatesService.scrapeAndSaveRatesForAllCompanies', async () => {
      await cron.handleDailyScrape();

      expect(
        mockExchangeRatesService.scrapeAndSaveRatesForAllCompanies,
      ).toHaveBeenCalled();
    });

    it('should catch errors from service and not rethrow', async () => {
      const serviceMock =
        mockExchangeRatesService.scrapeAndSaveRatesForAllCompanies;
      serviceMock.mockRejectedValue(new Error('Scraping service failed'));

      await expect(cron.handleDailyScrape()).resolves.toBeUndefined();
      expect(
        mockExchangeRatesService.scrapeAndSaveRatesForAllCompanies,
      ).toHaveBeenCalled();
    });
  });
});
