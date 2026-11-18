/**
 * Génère un slug URL à partir d'un titre (ex. "Porridge Protéiné" → "porridge-proteine").
 */
export function getSlug(title) {
  if (!title || typeof title !== 'string') return '';
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Slug d'une recette ou d'un article : la colonne `slug` figée en base si elle existe,
 * sinon dérivé du titre. Renommer un contenu ne casse donc plus son URL.
 */
export function itemSlug(item) {
  return item?.slug || getSlug(item?.title);
}
