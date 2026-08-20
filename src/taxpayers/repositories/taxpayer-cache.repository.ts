import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { TaxpayerCache } from '../entities/taxpayer-cache.entity';
import { ITaxpayerCacheRepository } from '../interfaces/i-taxpayers-repository.interface';

@Injectable()
export class TaxpayerCacheRepository implements ITaxpayerCacheRepository {
  constructor(
    @InjectRepository(TaxpayerCache)
    private readonly repo: Repository<TaxpayerCache>,
  ) {}

  async findByRuc(
    countryCode: string,
    ruc: string,
  ): Promise<TaxpayerCache | null> {
    return this.repo.findOne({
      where: { countryCode, ruc },
    });
  }

  async upsert(
    countryCode: string,
    data: Partial<TaxpayerCache>,
  ): Promise<TaxpayerCache> {
    const existing = await this.findByRuc(countryCode, data.ruc);

    if (existing) {
      Object.assign(existing, data);
      return this.repo.save(existing);
    }

    const newRecord = this.repo.create({ ...data, countryCode });
    return this.repo.save(newRecord);
  }

  async findExpiredRecords(limit: number): Promise<TaxpayerCache[]> {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find records that expire in less than 24h
    return this.repo.find({
      where: { cacheExpiresAt: LessThan(in24h) },
      take: limit,
      order: { cacheExpiresAt: 'ASC' },
    });
  }

  /**
   * Búsqueda por razón social / nombre usando ILIKE + similarity (pg_trgm).
   * Opera sobre la tabla taxpayer_cache — no requiere padrón offline.
   * Sólo retorna registros con caché vigente (cacheExpiresAt > NOW()).
   */
  async searchByName(
    countryCode: string,
    query: string,
    limit: number = 10,
    page: number = 1,
  ): Promise<[TaxpayerCache[], number]> {
    const skip = (page - 1) * limit;
    const now = new Date();

    return this.repo
      .createQueryBuilder('tc')
      .where('tc.countryCode = :countryCode', { countryCode })
      .andWhere('tc.cacheExpiresAt > :now', { now })
      .andWhere('tc.businessName ILIKE :query', { query: `%${query}%` })
      .orderBy(`similarity(tc.businessName, :exactQuery)`, 'DESC')
      .setParameter('exactQuery', query)
      .skip(skip)
      .take(limit)
      .getManyAndCount();
  }
}
