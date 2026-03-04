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
