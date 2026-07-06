import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { EventEmitter2 } from '@nestjs/event-emitter';
import axios from 'axios';
import {
  EXCHANGE_RATES_REPOSITORY_TOKEN,
  IExchangeRatesRepository,
} from './interfaces/exchange-rates-repository.interface';
import { ExchangeRate } from './entities/exchange-rate.entity';
import { InvalidScrapingResponseException } from './exceptions/invalid-scraping-response.exception';
import { CambiosChacoItem, extractRelevantRates } from './exchange-rates.utils';
import { CompaniesRepository } from '../companies/repositories/companies.repository';

interface CambiosChacoResponse {
  items: CambiosChacoItem[];
}

@Injectable()
export class ExchangeRatesService {
  private readonly logger = new Logger(ExchangeRatesService.name);
  private readonly CACHE_KEY = 'latest_exchange_rates';
  private readonly API_URL =
    'https://www.cambioschaco.com.py/api/branch_office/1/exchange';

  constructor(
    @Inject(EXCHANGE_RATES_REPOSITORY_TOKEN)
    private readonly exchangeRatesRepository: IExchangeRatesRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly eventEmitter: EventEmitter2,
    private readonly companiesRepository: CompaniesRepository,
  ) {}

  async getLatestRates(companyId: number): Promise<ExchangeRate[]> {
    const cacheKey = `${this.CACHE_KEY}_${companyId}`;
    const cachedRates = await this.cacheManager.get<ExchangeRate[]>(cacheKey);
    if (cachedRates) {
      return cachedRates;
    }

    const rates = await this.exchangeRatesRepository.findAll(companyId);
    if (rates.length > 0) {
      await this.cacheManager.set(cacheKey, rates, 24 * 60 * 60 * 1000);
    }

    return rates;
  }

  async scrapeAndSaveRates(companyId: number): Promise<void> {
    this.logger.log(
      `Starting exchange rates scraping for company ${companyId}...`,
    );
    try {
      const items = await this.fetchChacoRates();
      await this.saveRates(items, companyId);
      await this.cacheManager.del(`${this.CACHE_KEY}_${companyId}`);
      this.logger.log(
        `Successfully scraped and saved exchange rates for company ${companyId}`,
      );
    } catch (error: unknown) {
      await this.handleScrapingFailure(error, companyId);
    }
  }

  async scrapeAndSaveRatesForAllCompanies(): Promise<void> {
    this.logger.log(
      'Starting exchange rates scraping for all active companies...',
    );
    const companies = await this.companiesRepository.findAll();
    const targetCompanies = companies.filter((c) =>
      c.activeModules?.includes('EXCHANGE_RATES'),
    );

    for (const company of targetCompanies) {
      try {
        await this.scrapeAndSaveRates(company.id);
      } catch (err) {
        this.logger.error(
          `Failed scheduled scrape for company ${company.id}`,
          err,
        );
      }
    }
  }

  private async fetchChacoRates(): Promise<CambiosChacoItem[]> {
    const response = await axios.get<CambiosChacoResponse>(this.API_URL, {
      timeout: 10000,
    });
    const items = response.data?.items;

    if (!items || !Array.isArray(items)) {
      throw new InvalidScrapingResponseException(
        'El campo items no es un arreglo válido',
      );
    }

    return items;
  }

  private async saveRates(
    items: CambiosChacoItem[],
    companyId: number,
  ): Promise<void> {
    const rates = extractRelevantRates(items);

    for (const rate of rates) {
      await this.exchangeRatesRepository.createOrUpdate(
        rate.currency,
        rate.purchase,
        rate.sale,
        companyId,
        false,
      );
    }
  }

  private async handleScrapingFailure(
    error: unknown,
    companyId: number,
  ): Promise<void> {
    this.logger.error(
      `Failed to scrape exchange rates for company ${companyId}`,
      error instanceof Error ? error.stack : 'Unknown error',
    );

    try {
      const existingRates =
        await this.exchangeRatesRepository.findAll(companyId);
      for (const rate of existingRates) {
        await this.exchangeRatesRepository.createOrUpdate(
          rate.currency,
          rate.purchasePrice,
          rate.salePrice,
          companyId,
          true,
        );
      }
    } catch (dbError) {
      this.logger.error(
        `Error attempting to load/update existing rates for fallback for company ${companyId}`,
        dbError,
      );
    }

    await this.cacheManager.del(`${this.CACHE_KEY}_${companyId}`);

    this.eventEmitter.emit('rates.scraping_failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      companyId,
      timestamp: new Date(),
    });
  }
}
