import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MODULES_KEY } from '../decorators/require-module.decorator';
import { CompanyModule } from '../constants/modules.enum';
import { Request } from 'express';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
  activeModules?: string[];
}

/**
 * ModuleAccessGuard — Restricts access to endpoints based on Company Feature Flags.
 *
 * Must be placed AFTER TenantGuard in the guards chain so that
 * req.activeModules is already populated.
 */
@Injectable()
export class ModuleAccessGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredModules = this.reflector.getAllAndOverride<CompanyModule[]>(
      MODULES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredModules || requiredModules.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    // SuperAdmin bypasses feature flags checks
    if (user?.isSuperAdmin === true) {
      return true;
    }

    const activeModules = request.activeModules || [];

    const hasAccess = requiredModules.every((module) =>
      activeModules.includes(module),
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        `This company does not have access to the following modules: ${requiredModules.join(', ')}`,
      );
    }

    return true;
  }
}
