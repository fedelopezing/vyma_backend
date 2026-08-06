import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import {
  CreateStaffMemberDto,
  UpdateStaffMemberDto,
  QueryStaffMemberDto,
} from './dto';
import { StaffStatus } from './constants/staff-enums';
import { AuthPermissions } from '../auth/decorators';
import { ActiveCompanyId } from '../common/decorators/active-company-id.decorator';
import {
  ApiGetStaffList,
  ApiGetStaffMember,
  ApiCreateStaffMember,
  ApiUpdateStaffMember,
  ApiChangeStaffStatus,
  ApiDeleteStaffMember,
} from './decorators/staff-swagger.decorators';

import { UseGuards } from '@nestjs/common';
import { TenantGuard } from '../common/guards/tenant.guard';
import { ModuleAccessGuard } from '../common/guards/module-access.guard';
import { RequireModule } from '../common/decorators/require-module.decorator';
import { CompanyModule } from '../common/constants/modules.enum';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../roles/enums/role.enum';

@ApiTags('Staff')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, ModuleAccessGuard, RolesGuard)
@RequireModule(CompanyModule.STAFF)
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  @AuthPermissions('read:staff')
  @ApiGetStaffList()
  async findAll(
    @Query() query: QueryStaffMemberDto,
    @ActiveCompanyId() companyId: number,
  ) {
    // Inject the active companyId from the user's context into the query
    const scopedQuery = { ...query, companyId };
    return this.staffService.findAll(scopedQuery);
  }

  @Get(':id')
  @AuthPermissions('read:staff')
  @ApiGetStaffMember()
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @ActiveCompanyId() companyId: number,
  ) {
    return this.staffService.findById(id, companyId);
  }

  @Post()
  @AuthPermissions('write:staff')
  @ApiCreateStaffMember()
  async create(
    @Body() createDto: CreateStaffMemberDto,
    @ActiveCompanyId() companyId: number,
  ) {
    return this.staffService.create(createDto, companyId);
  }

  @Patch(':id')
  @AuthPermissions('write:staff')
  @ApiUpdateStaffMember()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateStaffMemberDto,
    @ActiveCompanyId() companyId: number,
  ) {
    return this.staffService.update(id, updateDto, companyId);
  }

  @Patch(':id/status')
  @AuthPermissions('write:staff')
  @ApiChangeStaffStatus()
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: StaffStatus,
    @ActiveCompanyId() companyId: number,
  ) {
    return this.staffService.changeStatus(id, status, companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN, Role.MANAGER)
  @AuthPermissions('write:staff')
  @ApiDeleteStaffMember()
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @ActiveCompanyId() companyId: number,
  ) {
    return this.staffService.remove(id, companyId);
  }
}
