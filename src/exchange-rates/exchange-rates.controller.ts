import { Controller, Get, Post } from '@nestjs/common';
import { ExchangeRatesService } from './exchange-rates.service';
import {
  ApiGetExchangeRates,
  ApiManualScrape,
} from './decorators/exchange-rates-swagger.decorators';
import { ExchangeRatesResponseDto, ManualScrapeResponseDto } from './dto';
import { AuthPermissions } from '../auth/decorators/auth-permissions.decorator';

@Controller('exchange-rates')
export class ExchangeRatesController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  @Get()
  @ApiGetExchangeRates()
  async getRates(): Promise<ExchangeRatesResponseDto> {
    const rates = await this.exchangeRatesService.getLatestRates();
    return {
      rates: rates.map((rate) => ({
        currency: rate.currency,
        purchasePrice: rate.purchasePrice,
        salePrice: rate.salePrice,
        isFallback: rate.isFallback,
        updatedAt: rate.updatedAt,
      })),
    };
  }

  @Post('scrape')
  @AuthPermissions('exchange_rates:manage')
  @ApiManualScrape()
  async manualScrape(): Promise<ManualScrapeResponseDto> {
    await this.exchangeRatesService.scrapeAndSaveRates();
    return { message: 'Scraping manual de cotizaciones completado' };
  }
}
