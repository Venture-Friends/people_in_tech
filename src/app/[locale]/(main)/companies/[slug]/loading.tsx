import { Skeleton } from "@/components/ui/skeleton";

export default function CompanyLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Company Hero skeleton */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {/* Cover image */}
        <Skeleton className="h-32 w-full sm:h-48" />

        {/* Content */}
        <div className="px-4 pb-6 sm:px-6">
          {/* Logo */}
          <div className="-mt-10 mb-4 sm:-mt-12">
            <Skeleton className="size-20 rounded-xl border-4 border-card" />
          </div>

          {/* Name */}
          <Skeleton className="h-9 w-64" />
          <Skeleton className="mt-2 h-5 w-96" />

          {/* Badges */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>

          {/* Status badge */}
          <div className="mt-4">
            <Skeleton className="h-6 w-36 rounded-full" />
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="mt-8">
        <div className="flex gap-4 border-b border-border pb-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>

        {/* Tab content skeleton */}
        <div className="mt-6 space-y-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-5/6" />
          <Skeleton className="h-5 w-2/3" />
        </div>
      </div>
    </div>
  );
}
