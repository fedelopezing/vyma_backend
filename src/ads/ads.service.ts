import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Ad } from './entities/ad.entity';
import { CreateAdDto, UpdateAdDto, AdsPaginationDto } from './dto';
import { AdNotFoundException } from './exceptions/ad-not-found.exception';
import { buildPaginatedResponse } from '../common/helpers';
import { PaginatedResponse } from '../common/interfaces';
import { AD_REPOSITORY } from './constants/ads.constants';
import { IAdRepository } from './interfaces/i-ad-repository.interface';

@Injectable()
export class AdsService {
  private readonly logger = new Logger(AdsService.name);

  constructor(
    @Inject(AD_REPOSITORY)
    private readonly adRepository: IAdRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ─── Helpers privados ────────────────────────────────────────────────────────

  private async findAdOrFail(id: string): Promise<Ad> {
    const ad = await this.adRepository.findOneById(id);
    if (!ad) {
      throw new AdNotFoundException(id);
    }
    return ad;
  }

  // ─── Endpoints públicos ──────────────────────────────────────────────────────

  /**
   * Retorna los banners activos de una empresa, con un límite máximo de 5 (Regla B del PRD).
   * Este endpoint es consumido por el carrusel del portal Astro.
   */
  async findActive(companyId: number): Promise<Ad[]> {
    return this.adRepository.findActiveByCompany(companyId);
  }

  // ─── CRUD Admin ─────────────────────────────────────────────────────────────

  async findAllAdmin(
    paginationDto: AdsPaginationDto,
    companyId: number,
  ): Promise<PaginatedResponse<Ad>> {
    const [data, total] = await this.adRepository.findPaginated(
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

  async create(dto: CreateAdDto, companyId: number): Promise<Ad> {
    const ad = await this.adRepository.create(dto, companyId);

    this.eventEmitter.emit('ad.created', {
      adId: ad.id,
      companyId: ad.companyId,
    });
    this.logger.log(`Ad created: ${ad.id} for company ${companyId}`);

    return ad;
  }

  async update(id: string, dto: UpdateAdDto): Promise<Ad> {
    const ad = await this.findAdOrFail(id);
    const updated = await this.adRepository.update(ad, dto);

    this.eventEmitter.emit('ad.updated', {
      adId: updated.id,
      companyId: updated.companyId,
    });

    return updated;
  }

  async remove(id: string): Promise<void> {
    const ad = await this.findAdOrFail(id);
    await this.adRepository.softDelete(id);

    this.eventEmitter.emit('ad.deleted', {
      adId: id,
      companyId: ad.companyId,
    });
    this.logger.log(`Ad soft-deleted: ${id}`);
  }
}
