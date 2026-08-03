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

@ApiTags('Staff')
@ApiBearerAuth()
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
  async findOne(@Param('id', ParseIntPipe) id: number) {
    // Optionally check if the staff member belongs to the active company
    // inside the service to prevent cross-tenant data leaks.
    return this.staffService.findById(id);
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
  ) {
    return this.staffService.changeStatus(id, status);
  }

  @Delete(':id')
  @AuthPermissions('write:staff')
  @ApiDeleteStaffMember()
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.remove(id);
  }
}
