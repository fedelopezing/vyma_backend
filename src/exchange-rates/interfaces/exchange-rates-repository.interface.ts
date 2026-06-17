import { ExchangeRate } from '../entities/exchange-rate.entity';

export const EXCHANGE_RATES_REPOSITORY_TOKEN = Symbol(
  'EXCHANGE_RATES_REPOSITORY_TOKEN',
);

export interface IExchangeRatesRepository {
  createOrUpdate(
    currency: string,
    purchasePrice: number,
    salePrice: number,
    isFallback?: boolean,
  ): Promise<ExchangeRate>;
  findAll(): Promise<ExchangeRate[]>;
  findByCurrency(currency: string): Promise<ExchangeRate | null>;
}
