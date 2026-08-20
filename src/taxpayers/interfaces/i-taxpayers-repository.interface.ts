import { TaxpayerCache } from '../entities/taxpayer-cache.entity';
import { TaxpayerDirectory } from '../entities/taxpayer-directory.entity';

export interface ITaxpayerCacheRepository {
  findByRuc(countryCode: string, ruc: string): Promise<TaxpayerCache | null>;
  upsert(
    countryCode: string,
    data: Partial<TaxpayerCache>,
  ): Promise<TaxpayerCache>;
  findExpiredRecords(limit: number): Promise<TaxpayerCache[]>;
  searchByName(
    countryCode: string,
    query: string,
    limit?: number,
    page?: number,
  ): Promise<[TaxpayerCache[], number]>;
}

export interface ITaxpayerDirectoryRepository {
  searchByName(
    countryCode: string,
    query: string,
    limit?: number,
    page?: number,
  ): Promise<[TaxpayerDirectory[], number]>;
}
