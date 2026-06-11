import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { UsersModule } from '../users/users.module';
import { CommonModule } from '../common/common.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { RolesRepository } from './repositories/roles.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
    forwardRef(() => PermissionsModule),
    UsersModule,
    CommonModule,
  ],
  controllers: [RolesController],
  providers: [RolesService, RolesRepository],
  exports: [TypeOrmModule, RolesService, RolesRepository],
})
export class RolesModule {}
