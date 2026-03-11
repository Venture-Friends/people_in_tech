import { Skeleton } from "@/components/ui/skeleton";

export default function JobsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="mt-2 h-5 w-80" />
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-lg" />
        ))}
      </div>

      {/* Job card list */}
      <div className="grid gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Skeleton className="size-10 shrink-0 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
              <Skeleton className="size-9 rounded-md" />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-36 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
