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
import { ApplyMemberDto, MemberQueryDto, MemberResponseDto } from './dto';
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
    const paginated = await this.membersService.findApproved(query, companyId);
    return {
      data: paginated.data.map((m) => MemberResponseDto.fromEntity(m)),
      meta: paginated.meta,
    };
  }

  @Get(':companyId/featured')
  @ApiGetFeaturedMembers()
  async findFeatured(@Param('companyId', ParseIntPipe) companyId: number) {
    const members = await this.membersService.findFeatured(companyId);
    return members.map((m) => MemberResponseDto.fromEntity(m));
  }

  @Post('apply')
  @ApiApplyMember()
  async apply(@Body() applyMemberDto: ApplyMemberDto) {
    const member = await this.membersService.apply(applyMemberDto);
    return MemberResponseDto.fromEntity(member);
  }
}
