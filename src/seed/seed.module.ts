import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { AuthModule } from '../auth/auth.module';
import { RolesModule } from '../roles/roles.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AuthModule, RolesModule, PermissionsModule, UsersModule],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
