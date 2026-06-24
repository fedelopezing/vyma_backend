import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { News, NewsStatus } from '../entities/news.entity';
import {
  resolveNewsSlugs,
  resolveUniqueSlug,
  runInTransaction,
} from '../../common/helpers';
import { slugify } from '../../common/helpers/slugify.helper';
import { User } from '../../users/entities/user.entity';
import { CreateNewsDto, UpdateNewsDto, NewsPaginationDto } from '../dto';

@Injectable()
export class NewsRepository {
  constructor(
    @InjectRepository(News)
    private readonly repository: Repository<News>,
    private readonly dataSource: DataSource,
  ) {}

  async findPaginated(
    paginationDto: NewsPaginationDto,
    companyId?: number,
    forceStatus?: NewsStatus,
  ): Promise<[News[], number]> {
    const { page = 1, limit = 10, categoria, estado } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.repository
      .createQueryBuilder('news')
      .orderBy('news.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (companyId !== undefined) {
      query.andWhere('news.companyId = :companyId', { companyId });
    }

    if (categoria) {
      query.andWhere('news.categoria = :categoria', { categoria });
    }

    const targetStatus = forceStatus ?? estado;
    if (targetStatus) {
      query.andWhere('news.estado = :estado', { estado: targetStatus });
    }

    if (paginationDto.q) {
      query.andWhere(
        '(unaccent(news.tituloEs) ILIKE unaccent(:q) OR ' +
          'unaccent(news.tituloEn) ILIKE unaccent(:q) OR ' +
          'unaccent(news.resumenEs) ILIKE unaccent(:q) OR ' +
          'unaccent(news.resumenEn) ILIKE unaccent(:q))',
        { q: `%${paginationDto.q}%` },
      );
    }

    return query.getManyAndCount();
  }

  async findOneById(id: string): Promise<News | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findOneBySlug(slug: string): Promise<News | null> {
    return this.repository
      .createQueryBuilder('news')
      .where('(news.slugEs = :slug OR news.slugEn = :slug)', { slug })
      .andWhere('news.estado = :estado', { estado: NewsStatus.PUBLICADO })
      .getOne();
  }

  async createNews(
    dto: CreateNewsDto,
    autorId: string,
    companyId?: number,
  ): Promise<News> {
    return runInTransaction(this.dataSource, async (qr) => {
      const slugs = await resolveNewsSlugs(dto.tituloEs, dto.tituloEn, qr);

      const news = this.repository.create({
        ...dto,
        ...slugs,
        autor: { id: parseInt(autorId, 10) } as User,
        ...(companyId !== undefined && { companyId }),
      });

      return qr.manager.save(news);
    });
  }

  async updateNews(news: News, dto: UpdateNewsDto): Promise<News> {
    return runInTransaction(this.dataSource, async (qr) => {
      if (news.estado === NewsStatus.BORRADOR) {
        const tituloEsChanged = dto.tituloEs && dto.tituloEs !== news.tituloEs;
        const tituloEnChanged = dto.tituloEn && dto.tituloEn !== news.tituloEn;

        if (tituloEsChanged) {
          news.slugEs = await resolveUniqueSlug(slugify(dto.tituloEs!), qr);
        }

        if (tituloEnChanged) {
          news.slugEn = await resolveUniqueSlug(slugify(dto.tituloEn!), qr);
        }
      }

      Object.assign(news, dto);
      return qr.manager.save(news);
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
