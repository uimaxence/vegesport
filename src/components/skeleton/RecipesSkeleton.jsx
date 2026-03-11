import { SkeletonBox, SkeletonLine } from './Skeleton';

export default function RecipesSkeleton() {
  return (
    <div className="px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
        {/* Sidebar */}
        <aside className="lg:w-56 flex-shrink-0">
          <div className="sticky top-24 space-y-8">
            <SkeletonBox className="h-10 w-full rounded-[10px]" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <SkeletonLine width="70%" className="mb-2" />
                {[1, 2, 3, 4].map((j) => (
                  <SkeletonBox key={j} className="h-9 w-full rounded-lg" />
                ))}
              </div>
            ))}
            <div className="flex flex-wrap gap-1.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonBox key={i} className="h-8 w-16 rounded-lg" />
              ))}
            </div>
          </div>
        </aside>

        {/* Main grid */}
        <div className="flex-1">
          <div className="mb-8">
            <SkeletonLine width="60%" className="h-9 mb-1" />
            <SkeletonLine width="12rem" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div key={i} className="overflow-hidden rounded-xl">
                <SkeletonBox className="aspect-[4/3] w-full rounded-t-xl" />
                <div className="p-4 space-y-2">
                  <SkeletonLine width="90%" className="h-5" />
                  <SkeletonLine width="5rem" />
                  <div className="flex gap-1.5 mt-3">
                    <SkeletonBox className="h-6 w-20 rounded-lg" />
                    <SkeletonBox className="h-6 w-24 rounded-lg" />
                    <SkeletonBox className="h-6 w-20 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
