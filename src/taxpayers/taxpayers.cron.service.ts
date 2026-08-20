import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  TAXPAYERS_CACHE_REPOSITORY,
  TAXPAYER_PROVIDER_FACTORY,
} from './constants/taxpayers.tokens';
import { ITaxpayerCacheRepository } from './interfaces/i-taxpayers-repository.interface';
import { TaxpayerProviderFactory } from './providers/provider.factory';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  TaxpayerEvents,
  TaxpayerStatusChangedEvent,
} from './constants/taxpayers-events.enum';

@Injectable()
export class TaxpayersCronService {
  private readonly logger = new Logger(TaxpayersCronService.name);

  constructor(
    @Inject(TAXPAYERS_CACHE_REPOSITORY)
    private readonly cacheRepo: ITaxpayerCacheRepository,
    @Inject(TAXPAYER_PROVIDER_FACTORY)
    private readonly providerFactory: TaxpayerProviderFactory,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // Se ejecuta el primer día de cada mes a la medianoche (1 vez al mes)
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleCronRefresh() {
    this.logger.log(
      'Iniciando refresco proactivo mensual de caché de contribuyentes...',
    );

    try {
      // Tomar hasta 100 registros próximos a expirar
      const expiringRecords = await this.cacheRepo.findExpiredRecords(100);

      if (expiringRecords.length === 0) {
        this.logger.log('No hay registros de caché próximos a expirar.');
        return;
      }

      this.logger.log(`Refrescando ${expiringRecords.length} registros...`);

      let refreshed = 0;
      let errors = 0;

      for (const record of expiringRecords) {
        try {
          const provider = this.providerFactory.getProvider(record.countryCode);
          const externalData = await provider.fetchByDocument(
            record.documentNumber,
            record.dv,
          );

          if (externalData) {
            // Verificar si el estado cambió
            if (record.status !== externalData.status) {
              const event: TaxpayerStatusChangedEvent = {
                countryCode: record.countryCode,
                ruc: record.ruc,
                oldStatus: record.status,
                newStatus: externalData.status as string,
                detectedAt: new Date(),
              };
              this.eventEmitter.emit(TaxpayerEvents.STATUS_CHANGED, event);
            }

            // Actualizar TTL mensual (30 días)
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);

            await this.cacheRepo.upsert(record.countryCode, {
              documentNumber: record.documentNumber,
              dv: record.dv,
              ruc: record.ruc,
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

            refreshed++;
          }
        } catch (error) {
          this.logger.warn(`No se pudo refrescar RUC ${record.ruc}: ${error}`);
          errors++;
        }

        // Pausa de 200ms entre llamadas para no saturar la API
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      this.logger.log(
        `Refresco completado. Exitosos: ${refreshed}, Errores: ${errors}`,
      );
    } catch (error) {
      this.logger.error(`Error crítico en el Cron de refresco: ${error}`);
    }
  }
}
