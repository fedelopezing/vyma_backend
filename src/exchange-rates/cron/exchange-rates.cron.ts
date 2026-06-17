import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ExchangeRatesService } from '../exchange-rates.service';

@Injectable()
export class ExchangeRatesCron {
  private readonly logger = new Logger(ExchangeRatesCron.name);

  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  @Cron('0 0 6 * * 1-5') // 06:00 AM Monday to Friday
  async handleDailyScrape() {
    this.logger.log('Starting daily exchange rates cron job at 06:00 AM...');
    try {
      await this.exchangeRatesService.scrapeAndSaveRates();
      this.logger.log('Daily exchange rates cron job completed successfully');
    } catch (error) {
      this.logger.error('Error in daily exchange rates cron job', error);
    }
  }
}
