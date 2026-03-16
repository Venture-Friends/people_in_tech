"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CompanyCard, type CompanyCardData } from "@/components/shared/company-card";

interface FeaturedCompaniesProps {
  companies: CompanyCardData[];
}

export function FeaturedCompanies({ companies }: FeaturedCompaniesProps) {
  const t = useTranslations("landing");

  if (companies.length === 0) return null;

  return (
    <section className="w-full py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-foreground tracking-tight">
            {t("featuredCompanies")}
          </h2>
          <Link
            href="/discover"
            className="text-[13px] font-medium text-primary/60 hover:text-primary transition-colors"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <CompanyCard key={company.slug} company={company} />
          ))}
        </div>
      </div>
    </section>
  );
}
