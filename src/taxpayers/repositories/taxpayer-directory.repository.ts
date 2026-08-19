import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxpayerDirectory } from '../entities/taxpayer-directory.entity';
import { ITaxpayerDirectoryRepository } from '../interfaces/i-taxpayers-repository.interface';

@Injectable()
export class TaxpayerDirectoryRepository
  implements ITaxpayerDirectoryRepository
{
  constructor(
    @InjectRepository(TaxpayerDirectory)
    private readonly repo: Repository<TaxpayerDirectory>,
  ) {}

  async searchByName(
    countryCode: string,
    query: string,
    limit: number = 10,
    page: number = 1,
  ): Promise<[TaxpayerDirectory[], number]> {
    const skip = (page - 1) * limit;
    // Requires pg_trgm extension and GIN index
    return this.repo
      .createQueryBuilder('dir')
      .where('dir.countryCode = :countryCode', { countryCode })
      .andWhere('dir.businessName ILIKE :query', { query: `%${query}%` })
      .orderBy(`similarity(dir.businessName, :exactQuery)`, 'DESC')
      .setParameter('exactQuery', query)
      .skip(skip)
      .take(limit)
      .getManyAndCount();
  }
}
