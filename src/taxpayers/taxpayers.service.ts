import { Injectable, Inject, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  TAXPAYERS_CACHE_REPOSITORY,
  TAXPAYER_PROVIDER_FACTORY,
} from './constants/taxpayers.tokens';
import { ITaxpayerCacheRepository } from './interfaces/i-taxpayers-repository.interface';
import { TaxpayerProviderFactory } from './providers/provider.factory';
import {
  TaxpayerEvents,
  TaxpayerStatusChangedEvent,
} from './constants/taxpayers-events.enum';
import {
  TaxpayerResponseDto,
  DvValidationResponseDto,
  LookupTaxpayerDto,
} from './dto';
import { normalizeDocumentInput } from './utils/py-modulo11.util';
import { TaxpayerCache } from './entities/taxpayer-cache.entity';

@Injectable()
export class TaxpayersService {
  private readonly logger = new Logger(TaxpayersService.name);

  constructor(
    @Inject(TAXPAYERS_CACHE_REPOSITORY)
    private readonly cacheRepo: ITaxpayerCacheRepository,
    @Inject(TAXPAYER_PROVIDER_FACTORY)
    private readonly providerFactory: TaxpayerProviderFactory,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async lookup(dto: LookupTaxpayerDto): Promise<TaxpayerResponseDto> {
    const { document, country = 'PY' } = dto;

    // 1. Normalización y cálculo DV (asumimos lógica PY temporalmente como base)
    const { base, dv } = normalizeDocumentInput(document);
    const ruc = `${base}-${dv}`;

    try {
      // 2. Consulta Caché Global
      const cached = await this.cacheRepo.findByRuc(country, ruc);
      if (cached && cached.cacheExpiresAt > new Date()) {
        return this.mapToResponse(cached, true, false);
      }

      // 3. Consulta Externa si es Miss o Expiró
      const provider = this.providerFactory.getProvider(country);
      const externalData = await provider.fetchByDocument(base, dv);

      if (externalData) {
        // Verificar si hubo cambio de estado para emitir evento (M4)
        if (cached && cached.status !== externalData.status) {
          const event: TaxpayerStatusChangedEvent = {
            countryCode: country,
            ruc,
            oldStatus: cached.status,
            newStatus: externalData.status as string,
            detectedAt: new Date(),
          };
          this.eventEmitter.emit(TaxpayerEvents.STATUS_CHANGED, event);
        }

        // 4. Guardar en Caché (TTL 30 días)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const saved = await this.cacheRepo.upsert(country, {
          documentNumber: base,
          dv,
          ruc,
          businessName: externalData.businessName,
          firstName: externalData.firstName,
          lastName: externalData.lastName,
          taxpayerType: externalData.taxpayerType as string,
          status: externalData.status as string,
          address: externalData.address,
          city: externalData.city,
          rawData: externalData.rawData,
          cacheExpiresAt: expiresAt,
        });

        return this.mapToResponse(saved, false, false);
      }

      // 5. Fallback si no se encontró en API externa
      // Devolvemos el DV calculado para que el Frontend autocompleta el campo DV y requiere ingreso manual
      return {
        found: false,
        documentNumber: base,
        dv,
        ruc,
        fromCache: false,
        manualEntryRequired: true,
      };
    } catch (error) {
      this.logger.error(`Error en lookup para ${document}: ${error}`);

      // Fallback elegante en caso de error crítico
      const { base, dv } = normalizeDocumentInput(document);
      return {
        found: false,
        documentNumber: base,
        dv,
        ruc: `${base}-${dv}`,
        fromCache: false,
        manualEntryRequired: true,
      };
    }
  }

  validateDv(
    document: string,
    _country: string = 'PY',
  ): DvValidationResponseDto {
    // Actualmente solo implementa PY
    const { base, dv } = normalizeDocumentInput(document);
    return {
      documentNumber: base,
      dv,
      ruc: `${base}-${dv}`,
    };
  }

  private mapToResponse(
    entity: TaxpayerCache,
    fromCache: boolean,
    manualEntryRequired: boolean,
  ): TaxpayerResponseDto {
    return {
      found: true,
      documentNumber: entity.documentNumber,
      dv: entity.dv,
      ruc: entity.ruc,
      businessName: entity.businessName,
      firstName: entity.firstName,
      lastName: entity.lastName,
      taxpayerType: entity.taxpayerType,
      status: entity.status,
      address: entity.address,
      city: entity.city,
      phone: (entity.rawData?.phone as string) || undefined,
      email: (entity.rawData?.email as string) || undefined,
      economicActivity:
        (entity.rawData?.economicActivity as string) || undefined,
      fromCache,
      manualEntryRequired,
      lastSyncedAt: entity.updatedAt,
    };
  }
}
