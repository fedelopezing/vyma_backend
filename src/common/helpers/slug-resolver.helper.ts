import { QueryRunner } from 'typeorm';
import { News } from '../../news/entities/news.entity';
import { slugify } from './slugify.helper';

/**
 * Dado un slug base, busca colisiones en la DB (incluyendo eliminados)
 * y devuelve el mayor índice numérico existente.
 *
 * @example slugs existentes: ['mi-noticia', 'mi-noticia-1', 'mi-noticia-2'] → 2
 */
function findMaxSlugSuffix(candidates: News[], baseSlug: string): number {
  const pattern = new RegExp(`^${baseSlug}(?:-(\\d+))?$`);
  let max = 0;

  const inspectSlug = (slug: string | null) => {
    if (!slug) return;
    const match = slug.match(pattern);
    if (match) max = Math.max(max, match[1] ? parseInt(match[1], 10) : 1);
  };

  candidates.forEach(({ slugEs, slugEn }) => {
    inspectSlug(slugEs);
    inspectSlug(slugEn);
  });

  return max;
}

/**
 * Genera un slug único garantizando que no colisione con ninguno
 * de los slugs existentes (incluyendo noticias eliminadas).
 *
 * Estrategia: LIKE '{baseSlug}%' → evalúa sufijos → retorna 'base-N+1'.
 *
 * @param baseSlug  Slug base (ya slugificado)
 * @param qr        QueryRunner activo de la transacción en curso
 * @returns         Slug único listo para guardar
 */
export async function resolveUniqueSlug(
  baseSlug: string,
  qr: QueryRunner,
): Promise<string> {
  const candidates = await qr.manager
    .createQueryBuilder(News, 'news')
    .where('news.slugEs LIKE :slug OR news.slugEn LIKE :slug', {
      slug: `${baseSlug}%`,
    })
    .withDeleted()
    .getMany();

  if (candidates.length === 0) return baseSlug;

  const max = findMaxSlugSuffix(candidates, baseSlug);
  return max === 0 ? baseSlug : `${baseSlug}-${max + 1}`;
}

/**
 * Genera los dos slugs (ES + EN) de una noticia asegurando unicidad para ambos.
 * Si no hay título en inglés, deriva el slug inglés del español con el sufijo '-en'.
 */
export async function resolveNewsSlugs(
  tituloEs: string,
  tituloEn: string | null | undefined,
  qr: QueryRunner,
): Promise<{ slugEs: string; slugEn: string }> {
  const baseEs = slugify(tituloEs);
  const baseEn = tituloEn ? slugify(tituloEn) : `${baseEs}-en`;

  const [slugEs, slugEn] = await Promise.all([
    resolveUniqueSlug(baseEs, qr),
    resolveUniqueSlug(baseEn, qr),
  ]);

  return { slugEs, slugEn };
}
