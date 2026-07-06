import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { UserCompanyRepository } from '../../companies/repositories/user-company.repository';
import { CompaniesRepository } from '../../companies/repositories/companies.repository';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
  companyId?: number;
  activeModules?: string[];
}

/**
 * TenantGuard — Enforces multi-tenant isolation based on X-Company-Id header.
 *
 * Must be placed AFTER JwtAuthGuard in the guards array so that
 * req.user is already populated when this guard runs.
 *
 * Logic:
 *  1. Extract X-Company-Id from request headers.
 *  2. If missing or invalid → throw BadRequestException.
 *  3. If user is SuperAdmin → skip membership check.
 *  4. Otherwise verify the user is an active member of the company.
 *  5. If not → throw ForbiddenException.
 *  6. Load company and attach companyId and activeModules to the request.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private readonly userCompanyRepository: UserCompanyRepository,
    private readonly companiesRepository: CompaniesRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User is not authenticated');
    }

    const companyUuid = request.headers['x-company-id'];
    if (!companyUuid || typeof companyUuid !== 'string') {
      throw new BadRequestException('X-Company-Id header is required');
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(companyUuid)) {
      throw new BadRequestException('X-Company-Id must be a valid UUID');
    }

    const company = await this.companiesRepository.findByUuid(companyUuid);
    if (!company || !company.isActive) {
      throw new ForbiddenException('Company is inactive or does not exist');
    }

    // SuperAdmin bypasses tenant isolation membership check
    if (user.isSuperAdmin !== true) {
      const isMember = await this.userCompanyRepository.isActiveMember(
        user.sub,
        company.id,
      );

      if (!isMember) {
        throw new ForbiddenException('Access to this company is not allowed');
      }
    }

    // Attach company info to request for downstream usage
    request.companyId = company.id;
    request.activeModules = company.activeModules || [];

    return true;
  }
}
