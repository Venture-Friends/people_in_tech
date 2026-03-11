"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CompanyCard, type CompanyCardData } from "@/components/shared/company-card";
import { ArrowRight } from "lucide-react";

interface FeaturedCompaniesProps {
  companies: CompanyCardData[];
}

export function FeaturedCompanies({ companies }: FeaturedCompaniesProps) {
  const t = useTranslations("landing");

  if (companies.length === 0) return null;

  return (
    <section className="w-full py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold md:text-3xl">
            {t("featuredCompanies")}
          </h2>
          <Link
            href="/discover"
            className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            {t("viewAll")}
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
          {companies.map((company) => (
            <div key={company.slug} className="min-w-[280px] snap-start">
              <CompanyCard company={company} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
