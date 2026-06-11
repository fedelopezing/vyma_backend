import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from './require-permissions.decorator';

export function AuthPermissions(...permissions: string[]) {
  return applyDecorators(
    RequirePermissions(...permissions),
    UseGuards(AuthGuard('jwt'), PermissionsGuard),
    ApiBearerAuth(),
    ApiResponse({ status: 401, description: 'No autenticado' }),
    ApiResponse({
      status: 403,
      description: 'Sin permiso (privilegios insuficientes)',
    }),
  );
}
