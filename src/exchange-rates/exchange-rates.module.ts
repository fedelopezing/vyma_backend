import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { EmailModule } from '../email/email.module';
import { ExchangeRate } from './entities/exchange-rate.entity';
import { CompaniesModule } from '../companies/companies.module';
import { ExchangeRatesController } from './exchange-rates.controller';
import { ExchangeRatesService } from './exchange-rates.service';
import { ExchangeRatesRepository } from './repositories/exchange-rates.repository';
import { EXCHANGE_RATES_REPOSITORY_TOKEN } from './interfaces/exchange-rates-repository.interface';
import { ExchangeRatesCron } from './cron/exchange-rates.cron';
import { ExchangeRatesListener } from './listeners/exchange-rates.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExchangeRate]),
    CacheModule.register(),
    EmailModule,
    CompaniesModule,
  ],
  controllers: [ExchangeRatesController],
  providers: [
    ExchangeRatesService,
    ExchangeRatesCron,
    ExchangeRatesListener,
    {
      provide: EXCHANGE_RATES_REPOSITORY_TOKEN,
      useClass: ExchangeRatesRepository,
    },
  ],
  exports: [ExchangeRatesService],
})
export class ExchangeRatesModule {}
