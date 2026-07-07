import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { ApplyMemberDto, MemberQueryDto, MemberResponseDto } from './dto';
import {
  ApiApplyMember,
  ApiGetApprovedMembers,
  ApiGetFeaturedMembers,
} from './decorators/members-swagger.decorators';
import { CompaniesRepository } from '../companies/repositories/companies.repository';
import { resolveActiveCompany } from '../common/helpers/company-resolver.helper';

@ApiTags('Members')
@Controller('members')
export class MembersController {
  constructor(
    private readonly membersService: MembersService,
    private readonly companiesRepository: CompaniesRepository,
  ) {}

  @Get(':companyUuid')
  @ApiGetApprovedMembers()
  async findAllApproved(
    @Param('companyUuid') companyUuid: string,
    @Query() query: MemberQueryDto,
  ) {
    const company = await resolveActiveCompany(
      companyUuid,
      this.companiesRepository,
    );
    const paginated = await this.membersService.findApproved(query, company.id);
    return {
      data: paginated.data.map((m) => MemberResponseDto.fromEntity(m)),
      meta: paginated.meta,
    };
  }

  @Get(':companyUuid/featured')
  @ApiGetFeaturedMembers()
  async findFeatured(@Param('companyUuid') companyUuid: string) {
    const company = await resolveActiveCompany(
      companyUuid,
      this.companiesRepository,
    );
    const members = await this.membersService.findFeatured(company.id);
    return members.map((m) => MemberResponseDto.fromEntity(m));
  }

  @Post('apply')
  @ApiApplyMember()
  async apply(@Body() applyMemberDto: ApplyMemberDto) {
    const company = await resolveActiveCompany(
      applyMemberDto.companyUuid,
      this.companiesRepository,
    );
    applyMemberDto.companyId = company.id;
    const member = await this.membersService.apply(applyMemberDto);
    return MemberResponseDto.fromEntity(member);
  }
}
