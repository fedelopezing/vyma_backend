import { Transform } from 'class-transformer';

/**
 * Decorador para DTOs que normaliza parámetros de consulta booleanos.
 * Convierte valores en formato string 'true' o '1' a true,
 * y 'false' o '0' a false.
 */
export function ParseBooleanQuery() {
  return Transform(({ value }) => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  });
}
