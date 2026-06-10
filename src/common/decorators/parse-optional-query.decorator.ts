import { Transform } from 'class-transformer';

/**
 * Decorador para DTOs que normaliza parámetros de consulta opcionales.
 * Convierte valores como 'null', 'NULL', 'undefined', '' (cadena vacía) y null reales en undefined.
 * Esto evita que las validaciones de tipo u otras validaciones (ej. @IsEnum) fallen con cadenas nulas o vacías.
 */
export function ParseOptionalQuery() {
  return Transform(({ value }) => {
    if (
      value === null ||
      value === 'null' ||
      value === 'NULL' ||
      value === 'undefined' ||
      value === ''
    ) {
      return undefined;
    }
    return value;
  });
}
