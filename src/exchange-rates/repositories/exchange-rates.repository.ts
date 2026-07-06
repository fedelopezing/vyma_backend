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
    companyId: number,
    isFallback: boolean = false,
  ): Promise<ExchangeRate> {
    let exchangeRate = await this.repository.findOne({
      where: { currency, companyId },
    });

    if (!exchangeRate) {
      exchangeRate = this.repository.create({ currency, companyId });
    }

    exchangeRate.purchasePrice = purchasePrice;
    exchangeRate.salePrice = salePrice;
    exchangeRate.isFallback = isFallback;

    return this.repository.save(exchangeRate);
  }

  async findAll(companyId?: number): Promise<ExchangeRate[]> {
    if (companyId) {
      return this.repository.find({ where: { companyId } });
    }
    return this.repository.find();
  }

  async findByCurrency(
    currency: string,
    companyId: number,
  ): Promise<ExchangeRate | null> {
    return this.repository.findOne({ where: { currency, companyId } });
  }
}
