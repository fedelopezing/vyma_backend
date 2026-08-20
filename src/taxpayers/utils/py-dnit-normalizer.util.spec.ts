import { normalizeDnitStatus } from './py-dnit-normalizer.util';
import { TaxpayerStatus } from '../constants/taxpayers-enums';

describe('py-dnit-normalizer.util', () => {
  it('debería mapear códigos numéricos a TaxpayerStatus', () => {
    expect(normalizeDnitStatus('1')).toBe(TaxpayerStatus.ACTIVO);
    expect(normalizeDnitStatus(1)).toBe(TaxpayerStatus.ACTIVO);
    expect(normalizeDnitStatus('2')).toBe(TaxpayerStatus.SUSPENDIDO);
    expect(normalizeDnitStatus(2)).toBe(TaxpayerStatus.SUSPENDIDO);
    expect(normalizeDnitStatus('3')).toBe(TaxpayerStatus.CANCELADO);
    expect(normalizeDnitStatus(3)).toBe(TaxpayerStatus.CANCELADO);
    expect(normalizeDnitStatus('4')).toBe(TaxpayerStatus.BLOQUEADO);
    expect(normalizeDnitStatus(4)).toBe(TaxpayerStatus.BLOQUEADO);
  });

  it('debería mapear strings conocidos a TaxpayerStatus', () => {
    expect(normalizeDnitStatus('ACTIVO')).toBe(TaxpayerStatus.ACTIVO);
    expect(normalizeDnitStatus('SUSPENDIDO')).toBe(TaxpayerStatus.SUSPENDIDO);
    expect(normalizeDnitStatus('CANCELADO')).toBe(TaxpayerStatus.CANCELADO);
    expect(normalizeDnitStatus('BLOQUEADO')).toBe(TaxpayerStatus.BLOQUEADO);
    expect(normalizeDnitStatus('  activo  ')).toBe(TaxpayerStatus.ACTIVO);
  });

  it('debería retornar ACTIVO como fallback para valores desconocidos', () => {
    expect(normalizeDnitStatus('DESCONOCIDO')).toBe(TaxpayerStatus.ACTIVO);
    expect(normalizeDnitStatus('999')).toBe(TaxpayerStatus.ACTIVO);
  });
});
