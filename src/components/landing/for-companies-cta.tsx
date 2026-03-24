"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function ForCompaniesCta() {
  const t = useTranslations("landing");

  return (
    <section className="w-full py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-primary/[0.08] bg-gradient-to-br from-primary/[0.03] to-background/80 backdrop-blur-[12px] px-8 py-10 md:flex-row md:px-12">
          <div>
            <h2 className="font-display text-[28px] font-bold text-foreground">
              {t("forCompaniesTitle")}
            </h2>
            <p className="mt-2 max-w-md text-[15px] text-white/[0.35]">
              {t("forCompaniesSubtitle")}
            </p>
          </div>
          <Button render={<Link href="/list-company" />} size="lg" className="h-11 gap-2 rounded-lg px-7 text-[13px] font-semibold whitespace-nowrap">
            {t("claimPage")}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
