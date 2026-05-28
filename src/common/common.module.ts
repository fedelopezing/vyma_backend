import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { CacheService } from './services/cache.service';

@Module({
  controllers: [CommonController],
  providers: [CommonService, CacheService],
  exports: [CommonService, CacheService],
})
export class CommonModule {}
