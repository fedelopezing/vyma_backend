import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';

import { TaxpayersController } from './taxpayers.controller';
import { TaxpayersService } from './taxpayers.service';
import { TaxpayersDirectoryService } from './taxpayers.directory.service';
import { TaxpayersCronService } from './taxpayers.cron.service';
import { TaxpayerProviderFactory } from './providers/provider.factory';
import { PyDnitPublicProvider } from './providers/py-dnit-public.provider';
import { TaxpayerCache } from './entities/taxpayer-cache.entity';
import { TaxpayerDirectory } from './entities/taxpayer-directory.entity';
import { TaxpayerCacheRepository } from './repositories/taxpayer-cache.repository';
import { TaxpayerDirectoryRepository } from './repositories/taxpayer-directory.repository';
import {
  TAXPAYERS_CACHE_REPOSITORY,
  TAXPAYERS_DIRECTORY_REPOSITORY,
  TAXPAYER_PROVIDER_FACTORY,
} from './constants/taxpayers.tokens';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaxpayerCache, TaxpayerDirectory]),
    HttpModule.register({
      timeout: 3000,
      maxRedirects: 2,
    }),
    ScheduleModule.forRoot(),
    // En NestJS, EventEmitterModule.forRoot() se suele declarar en AppModule,
    // pero si no está ahí, esto garantiza que los providers puedan usar eventEmitter
  ],
  controllers: [TaxpayersController],
  providers: [
    TaxpayersService,
    TaxpayersDirectoryService,
    TaxpayersCronService,
    PyDnitPublicProvider,
    {
      provide: TAXPAYERS_CACHE_REPOSITORY,
      useClass: TaxpayerCacheRepository,
    },
    {
      provide: TAXPAYERS_DIRECTORY_REPOSITORY,
      useClass: TaxpayerDirectoryRepository,
    },
    {
      provide: TAXPAYER_PROVIDER_FACTORY,
      useClass: TaxpayerProviderFactory,
    },
  ],
  exports: [TaxpayersService, TaxpayersDirectoryService],
})
export class TaxpayersModule {}
