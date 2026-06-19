import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdminMembersService } from './admin-members.service';
import { MemberQueryDto, UpdateMemberDto } from './dto';
import { TenantGuard } from '../common/guards/tenant.guard';
import { AuthPermissions } from '../auth/decorators';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { MemberStatus } from './entities/member.entity';
import {
  ApiGetAdminMembers,
  ApiUpdateMember,
  ApiUpdateMemberFeatured,
  ApiUpdateMemberStatus,
} from './decorators/members-swagger.decorators';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@ApiTags('Admin Members')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard)
@Controller('admin/members')
export class AdminMembersController {
  constructor(private readonly adminMembersService: AdminMembersService) {}

  @Get()
  @AuthPermissions('read:members')
  @ApiGetAdminMembers()
  async findAllAdmin(
    @Query() query: MemberQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.adminMembersService.findAll(query, req.user.companyId);
  }

  @Patch(':id/status')
  @AuthPermissions('update:members')
  @ApiUpdateMemberStatus()
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: MemberStatus,
    @Body('version') version: number | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.adminMembersService.updateStatus(
      id,
      status,
      version,
      req.user.companyId,
    );
  }

  @Patch(':id/featured')
  @AuthPermissions('update:members')
  @ApiUpdateMemberFeatured()
  async updateFeatured(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('isFeatured') isFeatured: boolean,
    @Body('version') version: number | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.adminMembersService.updateFeatured(
      id,
      isFeatured,
      version,
      req.user.companyId,
    );
  }

  @Put(':id')
  @AuthPermissions('update:members')
  @ApiUpdateMember()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMemberDto: UpdateMemberDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.adminMembersService.update(
      id,
      updateMemberDto,
      req.user.companyId,
    );
  }
}
