/**
 * Calcula el Dígito Verificador (DV) según la norma técnica de la SET / DNIT de Paraguay.
 * Aplica algoritmo de Módulo 11 con ponderación cíclica del 2 al 11.
 */
export function calculateParaguayDv(documentNumber: string): string {
  const cleanDoc = documentNumber.replace(/\D/g, '');
  if (!cleanDoc) return '0';

  let total = 0;
  let factor = 2;

  for (let i = cleanDoc.length - 1; i >= 0; i--) {
    total += parseInt(cleanDoc[i], 10) * factor;
    factor = factor === 11 ? 2 : factor + 1;
  }

  const remainder = total % 11;
  const dv = remainder > 1 ? 11 - remainder : 0;

  return dv.toString();
}

/**
 * Normaliza el input del usuario: extrae la base del RUC eliminando el DV si viene incluido.
 * Acepta formatos: "80012345-6", "80012345 6", "80012345".
 */
export function normalizeDocumentInput(input: string): {
  base: string;
  dv: string;
} {
  const normalized = input.trim().replace(/\s+/g, '');
  const parts = normalized.split('-');
  const base = parts[0].replace(/\D/g, '');
  const dv = calculateParaguayDv(base);
  return { base, dv };
}
