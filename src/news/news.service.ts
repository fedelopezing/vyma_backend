import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { News, NewsStatus } from './entities/news.entity';
import { NewsRepository } from './repositories/news.repository';
import { CreateNewsDto, UpdateNewsDto, NewsPaginationDto } from './dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import {
  NewsPublishedEvent,
  NEWS_PUBLISHED_EVENT,
} from './events/news-published.event';
import { buildPaginatedResponse } from '../common/helpers';
import { PaginatedResponse } from '../common/interfaces';

@Injectable()
export class NewsService {
  constructor(
    private readonly newsRepository: NewsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ─── Guards de dominio ───────────────────────────────────────────────────────

  /**
   * Lanza BadRequestException si faltan los campos bilingües requeridos
   * para publicar una noticia (tituloEn, resumenEn, contenidoEn).
   */
  private assertBilingualComplete(dto: Partial<CreateNewsDto>): void {
    const missing = !dto.tituloEn || !dto.resumenEn || !dto.contenidoEn;
    if (missing) {
      throw new BadRequestException(
        'Para publicar, los campos en inglés (tituloEn, resumenEn, contenidoEn) son obligatorios.',
      );
    }
  }

  /**
   * Lanza NotFoundException si la noticia no existe.
   */
  private async findNewsOrFail(id: string, user?: JwtPayload): Promise<News> {
    const news = await this.newsRepository.findOneById(id);
    if (!news) {
      throw new NotFoundException(`Noticia con id '${id}' no encontrada.`);
    }
    if (user && !user.isSuperAdmin && news.companyId !== user.companyId) {
      throw new ForbiddenException(
        'No tienes los permisos necesarios para realizar esta acción',
      );
    }
    return news;
  }

  // ─── Eventos ────────────────────────────────────────────────────────────────

  private publishEvent(news: News): void {
    this.eventEmitter.emit(
      NEWS_PUBLISHED_EVENT,
      new NewsPublishedEvent(news.id, news.slugEs, news.slugEn, news.estado),
    );
  }

  // ─── CRUD Admin ─────────────────────────────────────────────────────────────

  async create(
    dto: CreateNewsDto,
    autorId: string,
    companyId?: number,
  ): Promise<News> {
    if (dto.estado === NewsStatus.PUBLICADO) {
      this.assertBilingualComplete(dto);
    }

    const savedNews = await this.newsRepository.createNews(
      dto,
      autorId,
      companyId,
    );

    if (savedNews.estado === NewsStatus.PUBLICADO) {
      this.publishEvent(savedNews);
    }

    return savedNews;
  }

  async findAllAdmin(
    paginationDto: NewsPaginationDto,
    companyId?: number,
  ): Promise<PaginatedResponse<News>> {
    const [data, total] = await this.newsRepository.findPaginated(
      paginationDto,
      companyId,
    );
    return buildPaginatedResponse(
      data,
      total,
      paginationDto.page,
      paginationDto.limit,
    );
  }

  async update(
    id: string,
    dto: UpdateNewsDto,
    user?: JwtPayload,
  ): Promise<News> {
    const news = await this.findNewsOrFail(id, user);

    const wasPublished = news.estado === NewsStatus.PUBLICADO;
    const isPublishingNow = dto.estado === NewsStatus.PUBLICADO;
    const remainsPublished = wasPublished && dto.estado !== NewsStatus.BORRADOR;

    if (isPublishingNow || remainsPublished) {
      this.assertBilingualComplete({ ...news, ...dto });
    }

    const savedNews = await this.newsRepository.updateNews(news, dto);

    if (isPublishingNow || wasPublished) {
      this.publishEvent(savedNews);
    }

    return savedNews;
  }

  async remove(id: string, user?: JwtPayload): Promise<void> {
    await this.findNewsOrFail(id, user);
    await this.newsRepository.softDelete(id);
  }

  // ─── CRUD público ─────────────────────────────────────────────────────────────

  async findAll(
    paginationDto: NewsPaginationDto,
  ): Promise<PaginatedResponse<News>> {
    const [data, total] = await this.newsRepository.findPaginated(
      paginationDto,
      paginationDto.companyId,
      NewsStatus.PUBLICADO,
    );
    return buildPaginatedResponse(
      data,
      total,
      paginationDto.page,
      paginationDto.limit,
    );
  }

  async findOneBySlug(slug: string): Promise<News> {
    const news = await this.newsRepository.findOneBySlug(slug);

    if (!news) {
      throw new NotFoundException(
        `Noticia con slug '${slug}' no encontrada o no está publicada.`,
      );
    }

    return news;
  }
}
