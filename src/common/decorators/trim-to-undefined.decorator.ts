import { Transform } from 'class-transformer';

/**
 * Decorador para DTOs que realiza trim a cadenas de texto
 * y convierte cadenas vacías (o compuestas únicamente por espacios) en undefined.
 */
export function TrimToUndefined() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed === '' ? undefined : trimmed;
    }
    return value;
  });
}
