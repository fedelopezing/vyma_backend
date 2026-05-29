import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Post,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SkipThrottle } from '@nestjs/throttler';
import { SeedService } from './seed.service';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';

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
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions('write:users')
  execute() {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Seed is disabled in production');
    }
    return this.seedService.executeSeed();
  }
}
