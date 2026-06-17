import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeRate } from '../entities/exchange-rate.entity';
import { IExchangeRatesRepository } from '../interfaces/exchange-rates-repository.interface';

@Injectable()
export class ExchangeRatesRepository implements IExchangeRatesRepository {
  constructor(
    @InjectRepository(ExchangeRate)
    private readonly repository: Repository<ExchangeRate>,
  ) {}

  async createOrUpdate(
    currency: string,
    purchasePrice: number,
    salePrice: number,
    isFallback: boolean = false,
  ): Promise<ExchangeRate> {
    let exchangeRate = await this.repository.findOne({ where: { currency } });

    if (!exchangeRate) {
      exchangeRate = this.repository.create({ currency });
    }

    exchangeRate.purchasePrice = purchasePrice;
    exchangeRate.salePrice = salePrice;
    exchangeRate.isFallback = isFallback;
    // TypeORM @UpdateDateColumn updates it automatically, but we can be explicit or rely on TypeORM

    return this.repository.save(exchangeRate);
  }

  async findAll(): Promise<ExchangeRate[]> {
    return this.repository.find();
  }

  async findByCurrency(currency: string): Promise<ExchangeRate | null> {
    return this.repository.findOne({ where: { currency } });
  }
}
