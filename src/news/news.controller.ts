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
  BadRequestException,
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
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ActiveCompanyId } from '../common/decorators';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  // ─── Endpoints administrativos (tenant-scoped) ─────────────────────────────

  @Get('admin')
  @AuthPermissions('read:news')
  @UseGuards(AuthGuard('jwt'), TenantGuard)
  @ApiFindAllAdminNews()
  findAllAdmin(
    @Query() paginationDto: NewsPaginationDto,
    @ActiveCompanyId() companyId: number,
  ): Promise<PaginatedResponse<News>> {
    return this.newsService.findAllAdmin(paginationDto, companyId);
  }

  @Post('admin')
  @AuthPermissions('create:news')
  @UseGuards(AuthGuard('jwt'), TenantGuard)
  @ApiCreateNews()
  create(
    @Body() createNewsDto: CreateNewsDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<News> {
    return this.newsService.create(
      createNewsDto,
      String(req.user.sub),
      req.user.companyId,
    );
  }

  @Put('admin/:id')
  @AuthPermissions('update:news')
  @UseGuards(AuthGuard('jwt'), TenantGuard)
  @ApiUpdateNews()
  update(
    @Param('id') id: string,
    @Body() updateNewsDto: UpdateNewsDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<News> {
    return this.newsService.update(id, updateNewsDto, req.user);
  }

  @Delete('admin/:id')
  @AuthPermissions('delete:news')
  @UseGuards(AuthGuard('jwt'), TenantGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteNews()
  remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.newsService.remove(id, req.user);
  }

  // ─── Endpoints públicos (sin filtro de tenant) ─────────────────────────────

  @Get()
  @ApiFindAllNews()
  findAll(
    @Query() paginationDto: NewsPaginationDto,
  ): Promise<PaginatedResponse<News>> {
    if (!paginationDto.companyId) {
      throw new BadRequestException(
        'El parámetro companyId es obligatorio para la búsqueda de noticias públicas',
      );
    }
    return this.newsService.findAll(paginationDto);
  }

  @Get(':slug')
  @ApiFindOneNewsBySlug()
  findOneBySlug(@Param('slug') slug: string): Promise<News> {
    return this.newsService.findOneBySlug(slug);
  }
}
