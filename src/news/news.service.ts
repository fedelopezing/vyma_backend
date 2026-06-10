import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, QueryRunner } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { News, NewsStatus } from './entities/news.entity';
import { User } from '../users/entities/user.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsPaginationDto } from './dto/news-pagination.dto';
import {
  NewsPublishedEvent,
  NEWS_PUBLISHED_EVENT,
} from './events/news-published.event';
import {
  resolveNewsSlugs,
  resolveUniqueSlug,
  runInTransaction,
  buildPaginatedResponse,
} from '../common/helpers';
import { PaginatedResponse } from '../common/interfaces';
import { slugify } from '../common/helpers/slugify.helper';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
    private readonly dataSource: DataSource,
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
    const news = await this.newsRepository.findOne({ where: { id } });
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
  ) {
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

    const savedNews = await runInTransaction(this.dataSource, async (qr) => {
      const slugs = await resolveNewsSlugs(dto.tituloEs, dto.tituloEn, qr);

      const news = this.newsRepository.create({
        ...dto,
        ...slugs,
        autor: { id: parseInt(autorId, 10) } as User,
      });

      return qr.manager.save(news);
    });

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
    const news = await this.newsRepository
      .createQueryBuilder('news')
      .where('(news.slugEs = :slug OR news.slugEn = :slug)', { slug })
      .andWhere('news.estado = :estado', { estado: NewsStatus.PUBLICADO })
      .getOne();

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

    const savedNews = await runInTransaction(this.dataSource, async (qr) => {
      // Regenerar slugs solo si la noticia es un borrador y el título cambió.
      if (news.estado === NewsStatus.BORRADOR) {
        await this.regenerateSlugsIfTitleChanged(news, dto, qr);
      }

      Object.assign(news, dto);
      return qr.manager.save(news);
    });

    if (isPublishingNow || wasPublished) {
      this.publishEvent(savedNews);
    }

    return savedNews;
  }

  async remove(id: string): Promise<void> {
    await this.findNewsOrFail(id);
    await this.newsRepository.softDelete(id);
  }

  // ─── Lógica auxiliar privada ─────────────────────────────────────────────────

  /**
   * Regenera slugEs y slugEn si los títulos cambiaron en un borrador.
   * Muta el objeto `news` directamente para que los cambios queden listos al hacer `save`.
   */
  private async regenerateSlugsIfTitleChanged(
    news: News,
    dto: UpdateNewsDto,
    qr: QueryRunner,
  ): Promise<void> {
    const tituloEsChanged = dto.tituloEs && dto.tituloEs !== news.tituloEs;
    const tituloEnChanged = dto.tituloEn && dto.tituloEn !== news.tituloEn;

    if (tituloEsChanged) {
      news.slugEs = await resolveUniqueSlug(slugify(dto.tituloEs!), qr);
    }

    if (tituloEnChanged) {
      news.slugEn = await resolveUniqueSlug(slugify(dto.tituloEn!), qr);
    }
  }
}
