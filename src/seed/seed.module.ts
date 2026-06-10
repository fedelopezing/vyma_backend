import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { SeedRepository } from './seed.repository';

@Module({
  controllers: [SeedController],
  providers: [SeedService, SeedRepository],
})
export class SeedModule {}
