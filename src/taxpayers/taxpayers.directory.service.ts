import { Injectable, Inject, Logger } from '@nestjs/common';
import { TAXPAYERS_CACHE_REPOSITORY } from './constants/taxpayers.tokens';
import { ITaxpayerCacheRepository } from './interfaces/i-taxpayers-repository.interface';
import { TaxpayerResponseDto, SearchTaxpayerDto } from './dto';
import { TaxpayerType, TaxpayerStatus } from './constants/taxpayers-enums';

/**
 * Servicio de búsqueda por nombre/razón social.
 *
 * Estrategia (v2.0): Opera sobre `taxpayer_cache` (no sobre el padrón offline).
 * El padrón de la DNIT ya no está disponible como descarga masiva, por lo que
 * la búsqueda retorna los contribuyentes que han sido consultados previamente
 * (caché activa). Usa índice GIN (pg_trgm) para búsquedas trigram eficientes.
 */
@Injectable()
export class TaxpayersDirectoryService {
  private readonly logger = new Logger(TaxpayersDirectoryService.name);

  constructor(
    @Inject(TAXPAYERS_CACHE_REPOSITORY)
    private readonly cacheRepo: ITaxpayerCacheRepository,
  ) {}

  async search(dto: SearchTaxpayerDto): Promise<TaxpayerResponseDto[]> {
    const { q, search, country = 'PY', limit = 10, page = 1 } = dto;
    const searchTerm = (search || q || '').trim();
    if (!searchTerm) {
      return [];
    }

    try {
      const [results] = await this.cacheRepo.searchByName(
        country,
        searchTerm,
        limit,
        page,
      );

      return results.map((entity) => ({
        found: true,
        documentNumber: entity.documentNumber,
        dv: entity.dv,
        ruc: entity.ruc,
        businessName: entity.businessName,
        taxpayerType: entity.taxpayerType as TaxpayerType,
        status: entity.status as TaxpayerStatus,
        fromCache: true,
        manualEntryRequired: false,
      }));
    } catch (error) {
      this.logger.error(
        `Error searching cache for query ${searchTerm}: ${error}`,
      );
      return [];
    }
  }
}
