"use client";

import { useTranslations } from "next-intl";
import { CompanyCard, type CompanyCardData } from "@/components/shared/company-card";
import { SectionHeader } from "@/components/shared/section-header";

interface FeaturedCompaniesProps {
  companies: CompanyCardData[];
}

export function FeaturedCompanies({ companies }: FeaturedCompaniesProps) {
  const t = useTranslations("landing");

  if (companies.length === 0) return null;

  return (
    <section className="w-full py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title={t("featuredCompanies")} href="/discover" />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <CompanyCard key={company.slug} company={company} />
          ))}
        </div>
      </div>
    </section>
  );
}
