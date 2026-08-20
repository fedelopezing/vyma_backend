import { TaxpayerStatus, TaxpayerType } from '../constants/taxpayers-enums';

export interface ITaxpayerExternalData {
  businessName: string;
  firstName?: string;
  lastName?: string;
  taxpayerType: TaxpayerType | string;
  status: TaxpayerStatus | string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  economicActivity?: string;
  rawData: Record<string, unknown>;
}

export interface ITaxpayerProvider {
  /**
   * Consulta el padrón externo para obtener datos del contribuyente.
   * Retorna null si no se encuentra o si ocurre cualquier error de red.
   */
  fetchByDocument(
    documentNumber: string,
    dv: string,
  ): Promise<ITaxpayerExternalData | null>;
}
