"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { CompanyCard } from "@/components/shared/company-card";
import type { CompanyCardData } from "@/components/shared/company-card";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthGate } from "@/components/shared/auth-gate";
import { authClient } from "@/lib/auth-client";

const ANONYMOUS_LIMIT = 9;

interface CompanyGridProps {
  companies: CompanyCardData[];
  total: number;
  loading: boolean;
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="size-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
      <div className="mt-3">
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function CompanyGrid({ companies, total, loading }: CompanyGridProps) {
  const t = useTranslations("discover");
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session?.user;

  if (loading) {
    return (
      <div>
        <div className="mb-4 text-sm text-muted-foreground">
          <Skeleton className="h-4 w-28 inline-block" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <Search className="size-12 text-muted-foreground/40" />
        <p className="text-lg font-semibold text-foreground">{t("noResults")}</p>
        <p className="text-sm text-muted-foreground">Try different filters or search terms</p>
      </div>
    );
  }

  const shouldGate = !isAuthenticated && companies.length > ANONYMOUS_LIMIT;
  const visible = shouldGate ? companies.slice(0, ANONYMOUS_LIMIT) : companies;

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((company) => (
          <CompanyCard key={company.slug} company={company} />
        ))}
      </div>

      {shouldGate && (
        <AuthGate message="Join tech professionals discovering opportunities in Greece" />
      )}
    </div>
  );
}
