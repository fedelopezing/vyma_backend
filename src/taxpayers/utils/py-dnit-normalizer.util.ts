import { TaxpayerStatus } from '../constants/taxpayers-enums';

/**
 * La DNIT puede devolver códigos numéricos de estado en lugar de strings.
 * Esta capa garantiza que el sistema interno siempre trabaje con TaxpayerStatus.
 */
export function normalizeDnitStatus(
  rawStatus: string | number,
): TaxpayerStatus {
  const strStatus = String(rawStatus).toUpperCase().trim();

  const map: Record<string, TaxpayerStatus> = {
    '1': TaxpayerStatus.ACTIVO,
    '2': TaxpayerStatus.SUSPENDIDO,
    '3': TaxpayerStatus.CANCELADO,
    '4': TaxpayerStatus.BLOQUEADO,
    ACTIVO: TaxpayerStatus.ACTIVO,
    SUSPENDIDO: TaxpayerStatus.SUSPENDIDO,
    CANCELADO: TaxpayerStatus.CANCELADO,
    BLOQUEADO: TaxpayerStatus.BLOQUEADO,
  };

  return map[strStatus] ?? TaxpayerStatus.ACTIVO;
}
