import { ApiTags } from '@nestjs/swagger';
import { Controller, Post, ForbiddenException } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { SeedService } from './seed.service';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  /**
   * Ejecuta la siembra de datos iniciales.
   * Solo disponible fuera de producción y requiere permisos de administrador.
   */
  @Post()
  @SkipThrottle() // El seed es una operación única, no aplica rate limiting
  execute() {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Seed is disabled in production');
    }
    return this.seedService.executeSeed();
  }
}
