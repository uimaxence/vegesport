import { SkeletonBox, SkeletonLine } from './Skeleton';

export default function BlogSkeleton() {
  return (
    <div className="px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <SkeletonLine width="4rem" className="mb-3" />
          <SkeletonLine width="90%" className="h-9" />
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-10 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonBox key={i} className="h-9 w-20 rounded-sm" />
          ))}
        </div>

        {/* Featured card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 mb-12">
          <SkeletonBox className="aspect-[3/2] rounded-sm" />
          <div className="flex flex-col justify-center gap-3">
            <SkeletonLine width="5rem" />
            <SkeletonLine width="100%" className="h-6" />
            <SkeletonLine width="95%" className="h-6" />
            <SkeletonLine width="80%" />
            <SkeletonLine width="70%" />
            <div className="flex gap-4 mt-2">
              <SkeletonLine width="4rem" />
              <SkeletonLine width="3rem" />
            </div>
          </div>
        </div>

        {/* Grid articles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="group">
              <SkeletonBox className="aspect-[3/2] rounded-sm w-full" />
              <div className="mt-3 space-y-2">
                <SkeletonLine width="4rem" />
                <SkeletonLine width="100%" className="h-4" />
                <SkeletonLine width="90%" />
                <SkeletonLine width="60%" />
                <div className="flex gap-3 mt-2">
                  <SkeletonLine width="3rem" />
                  <SkeletonLine width="2.5rem" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
