export const FALLBACK_MEDIA_IMAGE = '/images/mamie-fallback.png';

/**
 * Construit une URL d'image optimisée via Supabase Image Transformations.
 * Remplace /object/ par /render/image/ et ajoute width + quality.
 * Si l'URL n'est pas Supabase, retourne l'originale.
 */
export function getOptimizedImageUrl(src, width, quality = 75) {
  if (!src || !src.includes('/storage/v1/object/public/')) return src;
  return src.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  ) + `?width=${width}&quality=${quality}`;
}

/** True quand la recette n’a pas d’URL d’image (on affiche le visuel de secours). */
export function isRecipeImageMissing(src) {
  return src == null || String(src).trim() === '';
}

export function getSafeImageSrc(src) {
  return src || FALLBACK_MEDIA_IMAGE;
}

export function handleMediaImageError(event) {
  const img = event?.currentTarget;
  if (!img) return;
  if (img.dataset.fallbackApplied === '1') return;
  img.dataset.fallbackApplied = '1';
  img.src = FALLBACK_MEDIA_IMAGE;
}
