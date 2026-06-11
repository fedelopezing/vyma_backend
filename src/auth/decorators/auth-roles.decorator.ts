import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

import { UserRoleGuard } from '../guards/user-role.guard';
import { RoleProtected } from './role-protected.decorator';
import { ValidRoles } from '../interfaces/valid-roles';

export function AuthRoles(...roles: ValidRoles[]) {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(AuthGuard('jwt'), UserRoleGuard),
    ApiBearerAuth(),
    ApiResponse({ status: 401, description: 'No autenticado' }),
    ApiResponse({ status: 403, description: 'Sin permiso (rol insuficiente)' }),
  );
}
