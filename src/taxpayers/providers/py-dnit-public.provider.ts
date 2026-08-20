import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  ITaxpayerExternalData,
  ITaxpayerProvider,
} from '../interfaces/i-taxpayer-provider.interface';
import { TaxpayerType } from '../constants/taxpayers-enums';
import { normalizeDnitStatus } from '../utils/py-dnit-normalizer.util';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class PyDnitPublicProvider implements ITaxpayerProvider {
  private readonly logger = new Logger(PyDnitPublicProvider.name);

  // NOTA: Esta es una URL de ejemplo ya que el usuario indicó "no tengo ninguna API key"
  // y solicitó armar el módulo en Paraguay. En producción, se usaría un endpoint real o scraping.
  private readonly apiUrl = 'https://turuc.com.py/api/contribuyente';

  constructor(private readonly httpService: HttpService) {}

  async fetchByDocument(
    documentNumber: string,
    dv: string,
  ): Promise<ITaxpayerExternalData | null> {
    try {
      // Endpoint público de consulta de RUC en Paraguay (sin API key requerida)
      const response = await firstValueFrom(
        this.httpService.get<{
          data?: {
            doc?: number | string;
            razonSocial?: string;
            dv?: number | string;
            ruc?: string;
            estado?: string;
            esPersonaJuridica?: boolean;
            esEntidadPublica?: boolean;
            direccion?: string;
            ciudad?: string;
            telefono?: string;
            correo?: string;
            actividadEconomica?: string;
          };
          message?: string;
        }>(`${this.apiUrl}/${documentNumber}`, {
          timeout: 3000,
        }),
      );

      const item = response.data?.data;
      if (!item || !item.razonSocial) {
        return null; // No encontrado
      }

      const taxpayerType = item.esPersonaJuridica
        ? TaxpayerType.PERSONA_JURIDICA
        : TaxpayerType.PERSONA_FISICA;

      return {
        businessName: item.razonSocial,
        firstName: undefined,
        lastName: undefined,
        taxpayerType,
        status: normalizeDnitStatus(item.estado || 'ACTIVO'),
        address: item.direccion,
        city: item.ciudad,
        phone: item.telefono,
        email: item.correo,
        economicActivity: item.actividadEconomica,
        rawData: item,
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.warn(
          `Error al consultar DNIT para RUC ${documentNumber}-${dv}: ${error.message}`,
        );
      } else {
        this.logger.error(`Error inesperado al consultar DNIT: ${error}`);
      }
      return null; // Fallback elegante, nunca lanza excepción
    }
  }
}
