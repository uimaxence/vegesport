import { SkeletonBox, SkeletonLine } from './Skeleton';

/**
 * Skeleton type "liste" (icône + lignes de texte) comme sur la maquette empty state.
 */
export default function PlanningSkeleton() {
  return (
    <div className="px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <SkeletonLine width="6rem" className="mb-2" />
          <SkeletonLine width="85%" className="h-9" />
          <SkeletonLine width="70%" className="mt-2" />
        </div>

        {/* List items (icon + text lines) - style maquette */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex items-start gap-4 py-3">
              <SkeletonBox className="w-12 h-12 flex-shrink-0 rounded-lg" />
              <div className="flex-1 min-w-0 space-y-2">
                <SkeletonLine width={i % 2 === 0 ? '95%' : '75%'} className="h-4" />
                <SkeletonLine width="60%" className="h-3" />
                <SkeletonLine width="40%" className="h-3" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer / actions */}
        <div className="mt-10 flex gap-3">
          <SkeletonBox className="h-11 w-40 rounded-lg" />
          <SkeletonBox className="h-11 w-36 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
