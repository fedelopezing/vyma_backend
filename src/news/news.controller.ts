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
  Request,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import {
  ApiFindAllAdminNews,
  ApiCreateNews,
  ApiUpdateNews,
  ApiDeleteNews,
  ApiFindAllNews,
  ApiFindOneNewsBySlug,
} from './decorators/news-swagger.decorators';

import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsPaginationDto } from './dto/news-pagination.dto';
import { News } from './entities/news.entity';
import { PaginatedResponse } from '../common/interfaces';
import { AuthRoles } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { User } from '../users/entities/user.entity';

/** Tipo de request con usuario autenticado inyectado por Passport. */
interface AuthenticatedRequest extends Request {
  user: User;
}

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  // ─── Endpoints administrativos ─────────────────────────────────────────────

  @Get('admin')
  @AuthRoles(ValidRoles.admin, ValidRoles.manager)
  @ApiFindAllAdminNews()
  findAllAdmin(
    @Query() paginationDto: NewsPaginationDto,
  ): Promise<PaginatedResponse<News>> {
    return this.newsService.findAllAdmin(paginationDto);
  }

  @Post('admin')
  @AuthRoles(ValidRoles.admin, ValidRoles.manager)
  @ApiCreateNews()
  create(
    @Body() createNewsDto: CreateNewsDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<News> {
    return this.newsService.create(createNewsDto, String(req.user.id));
  }

  @Put('admin/:id')
  @AuthRoles(ValidRoles.admin, ValidRoles.manager)
  @ApiUpdateNews()
  update(
    @Param('id') id: string,
    @Body() updateNewsDto: UpdateNewsDto,
  ): Promise<News> {
    return this.newsService.update(id, updateNewsDto);
  }

  @Delete('admin/:id')
  @AuthRoles(ValidRoles.admin, ValidRoles.manager)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteNews()
  remove(@Param('id') id: string): Promise<void> {
    return this.newsService.remove(id);
  }

  // ─── Endpoints públicos ────────────────────────────────────────────────────

  @Get()
  @ApiFindAllNews()
  findAll(
    @Query() paginationDto: NewsPaginationDto,
  ): Promise<PaginatedResponse<News>> {
    return this.newsService.findAll(paginationDto);
  }

  @Get(':slug')
  @ApiFindOneNewsBySlug()
  findOneBySlug(@Param('slug') slug: string): Promise<News> {
    return this.newsService.findOneBySlug(slug);
  }
}
