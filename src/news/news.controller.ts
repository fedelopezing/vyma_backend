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
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsPaginationDto } from './dto/news-pagination.dto';
import { News } from './entities/news.entity';
import { UserRoleGuard } from '../auth/guards/user-role.guard';
import { RoleProtected } from '../auth/decorators/role-protected.decorator';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { User } from '../users/entities/user.entity';

/** Tipo de request con usuario autenticado inyectado por Passport. */
interface AuthenticatedRequest extends Request {
  user: User;
}

@ApiTags('News')
@Controller('api/v1/news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  // ─── Endpoints públicos ────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Listar noticias publicadas (paginado)' })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de noticias publicadas',
  })
  findAll(
    @Query() paginationDto: NewsPaginationDto,
  ): Promise<{ data: News[]; total: number }> {
    return this.newsService.findAll(paginationDto);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Obtener una noticia publicada por su slug' })
  @ApiParam({
    name: 'slug',
    description: 'Slug de la noticia en español o inglés',
    example: 'apertura-nuevo-centro-salud',
  })
  @ApiResponse({ status: 200, description: 'Noticia encontrada' })
  @ApiResponse({
    status: 404,
    description: 'Noticia no encontrada o no publicada',
  })
  findOneBySlug(@Param('slug') slug: string): Promise<News> {
    return this.newsService.findOneBySlug(slug);
  }

  // ─── Endpoints administrativos ─────────────────────────────────────────────

  @Get('admin')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), UserRoleGuard)
  @RoleProtected(ValidRoles.admin)
  @ApiOperation({
    summary: 'Listar todas las noticias (borradores y publicadas) — solo admin',
  })
  @ApiResponse({ status: 200, description: 'Listado completo de noticias' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permiso (no es admin)' })
  findAllAdmin(
    @Query() paginationDto: NewsPaginationDto,
  ): Promise<{ data: News[]; total: number }> {
    return this.newsService.findAllAdmin(paginationDto);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), UserRoleGuard)
  @RoleProtected(ValidRoles.admin)
  @ApiOperation({ summary: 'Crear una nueva noticia — solo admin' })
  @ApiResponse({ status: 201, description: 'Noticia creada exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o incompletos (bilingüismo al publicar)',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permiso (no es admin)' })
  create(
    @Body() createNewsDto: CreateNewsDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<News> {
    return this.newsService.create(createNewsDto, String(req.user.id));
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), UserRoleGuard)
  @RoleProtected(ValidRoles.admin)
  @ApiOperation({ summary: 'Actualizar una noticia — solo admin' })
  @ApiParam({
    name: 'id',
    description: 'UUID de la noticia',
    example: 'uuid-aqui',
  })
  @ApiResponse({ status: 200, description: 'Noticia actualizada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o incompletos' })
  @ApiResponse({ status: 404, description: 'Noticia no encontrada' })
  update(
    @Param('id') id: string,
    @Body() updateNewsDto: UpdateNewsDto,
  ): Promise<News> {
    return this.newsService.update(id, updateNewsDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), UserRoleGuard)
  @RoleProtected(ValidRoles.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una noticia (soft-delete) — solo admin' })
  @ApiParam({
    name: 'id',
    description: 'UUID de la noticia',
    example: 'uuid-aqui',
  })
  @ApiResponse({ status: 204, description: 'Noticia eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Noticia no encontrada' })
  remove(@Param('id') id: string): Promise<void> {
    return this.newsService.remove(id);
  }
}
