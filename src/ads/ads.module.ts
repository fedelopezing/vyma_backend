import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdsController } from './ads.controller';
import { AdsService } from './ads.service';
import { Ad } from './entities/ad.entity';
import { AdRepository } from './repositories/ad.repository';
import { CompaniesModule } from '../companies/companies.module';
import { AD_REPOSITORY } from './constants/ads.constants';

@Module({
  imports: [TypeOrmModule.forFeature([Ad]), CompaniesModule],
  controllers: [AdsController],
  providers: [AdsService, { provide: AD_REPOSITORY, useClass: AdRepository }],
  exports: [AdsService, AD_REPOSITORY],
})
export class AdsModule {}
