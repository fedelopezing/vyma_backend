import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeRatesController } from './exchange-rates.controller';
import { ExchangeRatesService } from './exchange-rates.service';

import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { ModuleAccessGuard } from '../common/guards/module-access.guard';
import { CompaniesRepository } from '../companies/repositories/companies.repository';

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
        {
          provide: CompaniesRepository,
          useValue: {
            findByUuid: jest.fn().mockResolvedValue({ id: 10, isActive: true }),
          },
        },
      ],
    })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(TenantGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(ModuleAccessGuard)
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

      const result = await controller.getRates(
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      );

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
      expect(serviceMock.getLatestRates).toHaveBeenCalledWith(10);
    });
  });

  describe('manualScrape', () => {
    it('should call service and return success message', async () => {
      serviceMock.scrapeAndSaveRates.mockResolvedValue(undefined);

      const result = await controller.manualScrape(10);

      expect(result).toEqual({
        message: 'Scraping manual de cotizaciones completado',
      });
      expect(serviceMock.scrapeAndSaveRates).toHaveBeenCalledWith(10);
    });
  });
});
