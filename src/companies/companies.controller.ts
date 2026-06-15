import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

import { CompaniesService } from './companies.service';
import { CreateCompanyDto, UpdateCompanyDto, AddMemberDto } from './dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { AuthRoles } from '../auth/decorators/auth-roles.decorator';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { Company } from './entities/company.entity';
import { UserCompany } from './entities/user-company.entity';
import {
  ApiCreateCompany,
  ApiFindAllCompanies,
  ApiUpdateCompany,
  ApiFindCompanyByUuid,
  ApiAddCompanyMember,
  ApiRemoveCompanyMember,
} from './decorators/companies-swagger.decorators';

interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    uuid: string;
    email: string;
    role: string;
    companyId?: number;
    companyUuid?: string;
    isSuperAdmin: boolean;
  };
}

@ApiTags('companies')
@ApiBearerAuth()
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  // ─── SuperAdmin endpoints ──────────────────────────────────────────────────

  @Post()
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateCompany()
  create(
    @Body() dto: CreateCompanyDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Company> {
    if (!req.user?.isSuperAdmin) {
      throw new ForbiddenException('Only superadmin can create companies');
    }
    return this.companiesService.create(dto);
  }

  @Get()
  @Auth()
  @ApiFindAllCompanies()
  findAll(@Req() req: AuthenticatedRequest): Promise<Company[]> {
    if (!req.user?.isSuperAdmin) {
      throw new ForbiddenException('Only superadmin can list all companies');
    }
    return this.companiesService.findAll();
  }

  @Patch(':uuid')
  @Auth()
  @ApiUpdateCompany()
  update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: UpdateCompanyDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Company> {
    if (!req.user?.isSuperAdmin) {
      throw new ForbiddenException('Only superadmin can update companies');
    }
    return this.companiesService.update(uuid, dto);
  }

  // ─── Admin / SuperAdmin endpoints ─────────────────────────────────────────

  @Get(':uuid')
  @AuthRoles(ValidRoles.admin)
  @ApiFindCompanyByUuid()
  findByUuid(@Param('uuid', ParseUUIDPipe) uuid: string): Promise<Company> {
    return this.companiesService.findByUuid(uuid);
  }

  // ─── Member management (TenantGuard added in Layer 5) ────────────────────

  @Post(':uuid/members')
  @AuthRoles(ValidRoles.admin)
  @HttpCode(HttpStatus.CREATED)
  @ApiAddCompanyMember()
  addMember(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: AddMemberDto,
  ): Promise<UserCompany> {
    return this.companiesService.addMember(uuid, dto);
  }

  @Delete(':uuid/members/:userUuid')
  @AuthRoles(ValidRoles.admin)
  @HttpCode(HttpStatus.OK)
  @ApiRemoveCompanyMember()
  removeMember(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Param('userUuid', ParseUUIDPipe) userUuid: string,
  ): Promise<void> {
    return this.companiesService.removeMember(uuid, userUuid);
  }
}
