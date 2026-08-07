import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../roles/enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false;
    }

    if (user.isSuperAdmin || user.role === 'admin' || user.role === 'ADMIN') {
      return true;
    }

    const userRoleUpper = user.role?.toUpperCase();
    const userRolesUpper =
      user.roles?.map((r: string) => r.toUpperCase()) || [];

    return requiredRoles.some((role) => {
      const requiredUpper = role.toUpperCase();
      return (
        userRoleUpper === requiredUpper ||
        userRolesUpper.includes(requiredUpper)
      );
    });
  }
}
