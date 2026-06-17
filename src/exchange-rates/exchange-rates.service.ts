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
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getLatestRates(): Promise<ExchangeRate[]> {
    const cachedRates = await this.cacheManager.get<ExchangeRate[]>(
      this.CACHE_KEY,
    );
    if (cachedRates) {
      return cachedRates;
    }

    const rates = await this.exchangeRatesRepository.findAll();
    if (rates.length > 0) {
      await this.cacheManager.set(this.CACHE_KEY, rates, 24 * 60 * 60 * 1000);
    }

    return rates;
  }

  async scrapeAndSaveRates(): Promise<void> {
    this.logger.log('Starting exchange rates scraping...');
    try {
      const items = await this.fetchChacoRates();
      await this.saveRates(items);
      await this.cacheManager.del(this.CACHE_KEY);
      this.logger.log('Successfully scraped and saved exchange rates');
    } catch (error: unknown) {
      await this.handleScrapingFailure(error);
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

  private async saveRates(items: CambiosChacoItem[]): Promise<void> {
    const rates = extractRelevantRates(items);

    for (const rate of rates) {
      await this.exchangeRatesRepository.createOrUpdate(
        rate.currency,
        rate.purchase,
        rate.sale,
        false,
      );
    }
  }

  private async handleScrapingFailure(error: unknown): Promise<void> {
    this.logger.error(
      'Failed to scrape exchange rates',
      error instanceof Error ? error.stack : 'Unknown error',
    );

    try {
      const existingRates = await this.exchangeRatesRepository.findAll();
      for (const rate of existingRates) {
        await this.exchangeRatesRepository.createOrUpdate(
          rate.currency,
          rate.purchasePrice,
          rate.salePrice,
          true,
        );
      }
    } catch (dbError) {
      this.logger.error(
        'Error attempting to load/update existing rates for fallback',
        dbError,
      );
    }

    await this.cacheManager.del(this.CACHE_KEY);

    this.eventEmitter.emit('rates.scraping_failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date(),
    });
  }
}
