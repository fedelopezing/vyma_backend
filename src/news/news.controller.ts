import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import {
  ApiFindAllAdminNews,
  ApiCreateNews,
  ApiUpdateNews,
  ApiDeleteNews,
  ApiFindAllNews,
  ApiFindOneNewsBySlug,
} from './decorators/news-swagger.decorators';

import { NewsService } from './news.service';
import { CreateNewsDto, UpdateNewsDto, NewsPaginationDto } from './dto';
import { News } from './entities/news.entity';
import { PaginatedResponse } from '../common/interfaces';
import { AuthPermissions } from '../auth/decorators';
import { TenantGuard } from '../common/guards/tenant.guard';
import { ModuleAccessGuard } from '../common/guards/module-access.guard';
import { RequireModule } from '../common/decorators/require-module.decorator';
import { CompanyModule } from '../common/constants/modules.enum';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ActiveCompanyId } from '../common/decorators';
import { CompaniesRepository } from '../companies/repositories/companies.repository';
import { resolveActiveCompany } from '../common/helpers/company-resolver.helper';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
  companyId?: number;
}

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly companiesRepository: CompaniesRepository,
  ) {}

  // ─── Endpoints administrativos (tenant-scoped) ─────────────────────────────

  @Get('admin')
  @AuthPermissions('read:news')
  @UseGuards(AuthGuard('jwt'), TenantGuard, ModuleAccessGuard)
  @RequireModule(CompanyModule.NEWS)
  @ApiFindAllAdminNews()
  findAllAdmin(
    @Query() paginationDto: NewsPaginationDto,
    @ActiveCompanyId() companyId: number,
  ): Promise<PaginatedResponse<News>> {
    return this.newsService.findAllAdmin(paginationDto, companyId);
  }

  @Post('admin')
  @AuthPermissions('create:news')
  @UseGuards(AuthGuard('jwt'), TenantGuard, ModuleAccessGuard)
  @RequireModule(CompanyModule.NEWS)
  @ApiCreateNews()
  create(
    @Body() createNewsDto: CreateNewsDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<News> {
    return this.newsService.create(
      createNewsDto,
      String(req.user.sub),
      req.companyId,
    );
  }

  @Put('admin/:id')
  @AuthPermissions('update:news')
  @UseGuards(AuthGuard('jwt'), TenantGuard, ModuleAccessGuard)
  @RequireModule(CompanyModule.NEWS)
  @ApiUpdateNews()
  update(
    @Param('id') id: string,
    @Body() updateNewsDto: UpdateNewsDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<News> {
    return this.newsService.update(id, updateNewsDto, {
      companyId: req.companyId,
      isSuperAdmin: req.user.isSuperAdmin,
    });
  }

  @Delete('admin/:id')
  @AuthPermissions('delete:news')
  @UseGuards(AuthGuard('jwt'), TenantGuard, ModuleAccessGuard)
  @RequireModule(CompanyModule.NEWS)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteNews()
  remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.newsService.remove(id, {
      companyId: req.companyId,
      isSuperAdmin: req.user.isSuperAdmin,
    });
  }

  // ─── Endpoints públicos (sin filtro de tenant) ─────────────────────────────

  @Get()
  @ApiFindAllNews()
  async findAll(
    @Query() paginationDto: NewsPaginationDto,
  ): Promise<PaginatedResponse<News>> {
    const company = await resolveActiveCompany(
      paginationDto.companyUuid,
      this.companiesRepository,
    );
    paginationDto.companyId = company.id;
    return this.newsService.findAll(paginationDto);
  }

  @Get(':slug')
  @ApiFindOneNewsBySlug()
  findOneBySlug(@Param('slug') slug: string): Promise<News> {
    return this.newsService.findOneBySlug(slug);
  }
}
