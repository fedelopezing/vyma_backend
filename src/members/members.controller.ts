import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { ApplyMemberDto, MemberQueryDto } from './dto';
import {
  ApiApplyMember,
  ApiGetApprovedMembers,
  ApiGetFeaturedMembers,
} from './decorators/members-swagger.decorators';

@ApiTags('Members')
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get(':companyId')
  @ApiGetApprovedMembers()
  async findAllApproved(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Query() query: MemberQueryDto,
  ) {
    return this.membersService.findApproved(query, companyId);
  }

  @Get(':companyId/featured')
  @ApiGetFeaturedMembers()
  async findFeatured(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.membersService.findFeatured(companyId);
  }

  @Post('apply')
  @ApiApplyMember()
  async apply(@Body() applyMemberDto: ApplyMemberDto) {
    return this.membersService.apply(applyMemberDto);
  }
}
