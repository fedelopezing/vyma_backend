import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Ad } from '../entities/ad.entity';
import { IAdRepository } from '../interfaces/i-ad-repository.interface';
import { CreateAdDto, UpdateAdDto, AdsPaginationDto } from '../dto';
import { MAX_ACTIVE_ADS } from '../constants/ads.constants';

@Injectable()
export class AdRepository implements IAdRepository {
  constructor(
    @InjectRepository(Ad)
    private readonly repository: Repository<Ad>,
  ) {}

  /**
   * Obtiene los banners activos de una empresa, limitado a MAX_ACTIVE_ADS (5),
   * ordenados por order ASC y createdAt DESC.
   */
  async findActiveByCompany(companyId: number): Promise<Ad[]> {
    return this.repository.find({
      where: { companyId, isActive: true },
      order: { order: 'ASC', createdAt: 'DESC' },
      take: MAX_ACTIVE_ADS,
    });
  }

  /**
   * Retorna una lista paginada de anuncios para el panel de administración.
   * Incluye activos e inactivos; soporta filtro por isActive y búsqueda de texto.
   */
  async findPaginated(
    paginationDto: AdsPaginationDto,
    companyId: number,
  ): Promise<[Ad[], number]> {
    const { page = 1, limit = 10, isActive, q } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.repository
      .createQueryBuilder('ad')
      .where('ad.companyId = :companyId', { companyId })
      .orderBy('ad.order', 'ASC')
      .addOrderBy('ad.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (isActive !== undefined) {
      query.andWhere('ad.isActive = :isActive', { isActive });
    }

    if (q) {
      query.andWhere(
        '(unaccent(ad.altEs) ILIKE unaccent(:q) OR unaccent(ad.altEn) ILIKE unaccent(:q))',
        { q: `%${q}%` },
      );
    }

    return query.getManyAndCount();
  }

  async findOneById(id: string): Promise<Ad | null> {
    return this.repository.findOne({ where: { id } });
  }

  async create(dto: CreateAdDto, companyId: number): Promise<Ad> {
    const ad = this.repository.create({
      ...dto,
      companyId,
    });
    return this.repository.save(ad);
  }

  async update(ad: Ad, dto: UpdateAdDto): Promise<Ad> {
    Object.assign(ad, dto);
    return this.repository.save(ad);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
