import { ApiTags } from '@nestjs/swagger';
import { Controller, Post } from '@nestjs/common';
import { SeedService } from './seed.service';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  execute() {
    return this.seedService.executeSeed();
  }
}
