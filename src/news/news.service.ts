import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { News, NewsStatus } from './entities/news.entity';
import { NewsRepository } from './repositories/news.repository';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsPaginationDto } from './dto/news-pagination.dto';
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
  private async findNewsOrFail(id: string): Promise<News> {
    const news = await this.newsRepository.findOneById(id);
    if (!news) {
      throw new NotFoundException(`Noticia con id '${id}' no encontrada.`);
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

  // ─── Queries ─────────────────────────────────────────────────────────────────

  /**
   * Construye una query base paginada con filtros opcionales de categoría y estado.
   * Pasa `forceStatus` para forzar el filtro (ej. solo PUBLICADO en la web pública).
   */
  private buildPaginatedQuery(
    paginationDto: NewsPaginationDto,
    forceStatus?: NewsStatus,
  ): import('typeorm').SelectQueryBuilder<News> {
    const { page = 1, limit = 10, categoria, estado } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.newsRepository
      .createQueryBuilder('news')
      .orderBy('news.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (categoria) {
      query.andWhere('news.categoria = :categoria', { categoria });
    }

    const targetStatus = forceStatus ?? estado;
    if (targetStatus) {
      query.andWhere('news.estado = :estado', { estado: targetStatus });
    }

    return query;
  }

  // ─── CRUD público ─────────────────────────────────────────────────────────────

  async create(dto: CreateNewsDto, autorId: string): Promise<News> {
    if (dto.estado === NewsStatus.PUBLICADO) {
      this.assertBilingualComplete(dto);
    }

    const savedNews = await this.newsRepository.createNews(dto, autorId);

    if (savedNews.estado === NewsStatus.PUBLICADO) {
      this.publishEvent(savedNews);
    }

    return savedNews;
  }

  async findAll(
    paginationDto: NewsPaginationDto,
  ): Promise<PaginatedResponse<News>> {
    const query = this.buildPaginatedQuery(paginationDto, NewsStatus.PUBLICADO);
    const [data, total] = await query.getManyAndCount();
    return buildPaginatedResponse(
      data,
      total,
      paginationDto.page,
      paginationDto.limit,
    );
  }

  async findAllAdmin(
    paginationDto: NewsPaginationDto,
  ): Promise<PaginatedResponse<News>> {
    const query = this.buildPaginatedQuery(paginationDto);
    const [data, total] = await query.getManyAndCount();
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

  async update(id: string, dto: UpdateNewsDto): Promise<News> {
    const news = await this.findNewsOrFail(id);

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

  async remove(id: string): Promise<void> {
    await this.findNewsOrFail(id);
    await this.newsRepository.softDelete(id);
  }
}
