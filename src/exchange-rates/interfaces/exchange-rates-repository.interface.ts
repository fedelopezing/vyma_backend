import { ExchangeRate } from '../entities/exchange-rate.entity';

export const EXCHANGE_RATES_REPOSITORY_TOKEN = Symbol(
  'EXCHANGE_RATES_REPOSITORY_TOKEN',
);

export interface IExchangeRatesRepository {
  createOrUpdate(
    currency: string,
    purchasePrice: number,
    salePrice: number,
    companyId: number,
    isFallback?: boolean,
  ): Promise<ExchangeRate>;
  findAll(companyId?: number): Promise<ExchangeRate[]>;
  findByCurrency(
    currency: string,
    companyId: number,
  ): Promise<ExchangeRate | null>;
}
