import { Skeleton } from "@/components/ui/skeleton";

export default function FragranceDetailLoading() {
  return (
    <div className="container py-8">
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Image skeleton */}
        <Skeleton className="aspect-square w-full max-w-md rounded-lg" />

        {/* Details skeleton */}
        <div className="space-y-6">
          <div>
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-10 w-64 mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-12" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>

      {/* Notes pyramid skeleton */}
      <Skeleton className="h-64 w-full rounded-lg mb-12" />

      {/* Reviews skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
