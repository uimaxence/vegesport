export const FALLBACK_MEDIA_IMAGE = '/images/mamie-fallback.png';

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
