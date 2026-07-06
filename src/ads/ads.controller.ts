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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import {
  ApiGetActiveAds,
  ApiGetAdminAds,
  ApiCreateAd,
  ApiUpdateAd,
  ApiDeleteAd,
} from './decorators/ads-swagger.decorators';

import { AdsService } from './ads.service';
import { CreateAdDto, UpdateAdDto, AdsPaginationDto } from './dto';
import { Ad } from './entities/ad.entity';
import { PaginatedResponse } from '../common/interfaces';
import { AuthPermissions } from '../auth/decorators';
import { TenantGuard } from '../common/guards/tenant.guard';
import { ModuleAccessGuard } from '../common/guards/module-access.guard';
import { RequireModule } from '../common/decorators/require-module.decorator';
import { CompanyModule } from '../common/constants/modules.enum';
import { ActiveCompanyId } from '../common/decorators';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompaniesRepository } from '../companies/repositories/companies.repository';
import { resolveActiveCompany } from '../common/helpers/company-resolver.helper';

@ApiTags('Ads')
@Controller('ads')
export class AdsController {
  constructor(
    private readonly adsService: AdsService,
    private readonly companiesRepository: CompaniesRepository,
  ) {}

  // ─── Endpoint público ─────────────────────────────────────────────────────

  /**
   * GET /ads/active?companyId=1
   * Retorna los banners activos del carrusel (máximo 5), sin autenticación.
   */
  @Get('active')
  @ApiGetActiveAds()
  async findActive(@Query('companyUuid') companyUuid: string): Promise<Ad[]> {
    const company = await resolveActiveCompany(
      companyUuid,
      this.companiesRepository,
    );
    return this.adsService.findActive(company.id);
  }

  // ─── Endpoints administrativos (tenant-scoped) ────────────────────────────

  /**
   * GET /ads/admin
   * Lista todos los anuncios del tenant autenticado (activos e inactivos).
   */
  @Get('admin')
  @AuthPermissions('read:ads')
  @UseGuards(AuthGuard('jwt'), TenantGuard, ModuleAccessGuard)
  @RequireModule(CompanyModule.ADS)
  @ApiGetAdminAds()
  findAllAdmin(
    @Query() paginationDto: AdsPaginationDto,
    @ActiveCompanyId() companyId: number,
  ): Promise<PaginatedResponse<Ad>> {
    return this.adsService.findAllAdmin(paginationDto, companyId);
  }

  /**
   * POST /ads/admin
   * Crea un nuevo anuncio asociado al tenant autenticado.
   */
  @Post('admin')
  @AuthPermissions('create:ads')
  @UseGuards(AuthGuard('jwt'), TenantGuard, ModuleAccessGuard)
  @RequireModule(CompanyModule.ADS)
  @ApiCreateAd()
  create(
    @Body() createAdDto: CreateAdDto,
    @ActiveCompanyId() companyId: number,
  ): Promise<Ad> {
    return this.adsService.create(createAdDto, companyId);
  }

  /**
   * PUT /ads/admin/:id
   * Actualiza un anuncio existente del tenant autenticado.
   */
  @Put('admin/:id')
  @AuthPermissions('update:ads')
  @UseGuards(AuthGuard('jwt'), TenantGuard, ModuleAccessGuard)
  @RequireModule(CompanyModule.ADS)
  @ApiUpdateAd()
  update(
    @Param('id') id: string,
    @Body() updateAdDto: UpdateAdDto,
    @ActiveCompanyId() companyId: number,
  ): Promise<Ad> {
    return this.adsService.update(id, updateAdDto, companyId);
  }

  /**
   * DELETE /ads/admin/:id
   * Realiza un soft delete de un anuncio del tenant autenticado.
   */
  @Delete('admin/:id')
  @AuthPermissions('delete:ads')
  @UseGuards(AuthGuard('jwt'), TenantGuard, ModuleAccessGuard)
  @RequireModule(CompanyModule.ADS)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteAd()
  remove(
    @Param('id') id: string,
    @ActiveCompanyId() companyId: number,
  ): Promise<void> {
    return this.adsService.remove(id, companyId);
  }
}
