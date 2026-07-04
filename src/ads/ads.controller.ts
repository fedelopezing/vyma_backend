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
  ParseIntPipe,
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
import { ActiveCompanyId } from '../common/decorators';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Ads')
@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  // ─── Endpoint público ─────────────────────────────────────────────────────

  /**
   * GET /ads/active?companyId=1
   * Retorna los banners activos del carrusel (máximo 5), sin autenticación.
   */
  @Get('active')
  @ApiGetActiveAds()
  async findActive(
    @Query('companyId', ParseIntPipe) companyId: number,
  ): Promise<Ad[]> {
    return this.adsService.findActive(companyId);
  }

  // ─── Endpoints administrativos (tenant-scoped) ────────────────────────────

  /**
   * GET /ads/admin
   * Lista todos los anuncios del tenant autenticado (activos e inactivos).
   */
  @Get('admin')
  @AuthPermissions('read:ads')
  @UseGuards(AuthGuard('jwt'), TenantGuard)
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
  @UseGuards(AuthGuard('jwt'), TenantGuard)
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
  @UseGuards(AuthGuard('jwt'), TenantGuard)
  @ApiUpdateAd()
  update(
    @Param('id') id: string,
    @Body() updateAdDto: UpdateAdDto,
  ): Promise<Ad> {
    return this.adsService.update(id, updateAdDto);
  }

  /**
   * DELETE /ads/admin/:id
   * Realiza un soft delete de un anuncio del tenant autenticado.
   */
  @Delete('admin/:id')
  @AuthPermissions('delete:ads')
  @UseGuards(AuthGuard('jwt'), TenantGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteAd()
  remove(@Param('id') id: string): Promise<void> {
    return this.adsService.remove(id);
  }
}
