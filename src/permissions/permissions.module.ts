import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { RolesModule } from '../roles/roles.module';
import { PermissionsRepository } from './repositories/permissions.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission]),
    forwardRef(() => RolesModule),
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionsRepository],
  exports: [TypeOrmModule, PermissionsService, PermissionsRepository],
})
export class PermissionsModule {}
