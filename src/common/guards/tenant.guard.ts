import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { UserCompanyRepository } from '../../companies/repositories/user-company.repository';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

/**
 * TenantGuard — Enforces multi-tenant isolation.
 *
 * Must be placed AFTER JwtAuthGuard in the guards array so that
 * req.user is already populated when this guard runs.
 *
 * Logic:
 *  1. If req.user.isSuperAdmin === true → allow unconditionally.
 *  2. Otherwise verify the user is an active member of req.user.companyId.
 *  3. If not → throw ForbiddenException.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly userCompanyRepository: UserCompanyRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    // SuperAdmin bypasses tenant isolation
    if (user.isSuperAdmin === true) {
      return true;
    }

    const { sub: userId, companyId } = user;

    if (!companyId) {
      throw new ForbiddenException('Access to this company is not allowed');
    }

    const isMember = await this.userCompanyRepository.isActiveMember(
      userId,
      companyId,
    );

    if (!isMember) {
      throw new ForbiddenException('Access to this company is not allowed');
    }

    return true;
  }
}
