export const FALLBACK_MEDIA_IMAGE = '/images/mamie-fallback.png';

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
