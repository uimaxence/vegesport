/**
 * Primitives pour écrans de chargement type "skeleton" (empty states).
 * Utilise une animation légère pour indiquer le chargement.
 */
export function SkeletonBox({ className = '', style = {} }) {
  return (
    <div
      className={`animate-pulse rounded-sm bg-black/[0.06] ${className}`}
      style={style}
      aria-hidden
    />
  );
}

export function SkeletonLine({ width = '100%', className = '' }) {
  return (
    <SkeletonBox className={`h-3 ${className}`} style={{ width: width === '100%' ? '100%' : width }} />
  );
}

export function SkeletonCircle({ size = 40, className = '' }) {
  return (
    <SkeletonBox className={`rounded-full flex-shrink-0 ${className}`} style={{ width: size, height: size }} />
  );
}
