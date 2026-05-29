import slugifyLib from 'slugify';

/**
 * Genera un slug limpio y amigable para URLs a partir de un texto.
 * Remueve caracteres especiales, acentos y convierte a minúsculas.
 *
 * @param text El texto a convertir en slug.
 * @returns El slug generado.
 */
export const slugify = (text: string): string => {
  if (!text) return '';
  return slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
    locale: 'es',
  });
};
