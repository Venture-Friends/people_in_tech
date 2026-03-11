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
        <div className="flex flex-col items-center text-center">
          <h2 className="max-w-2xl text-2xl font-bold md:text-3xl">
            {t("forCompaniesTitle")}
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            {t("forCompaniesSubtitle")}
          </p>
          <Button
            size="lg"
            className="mt-8 h-12 gap-2 px-8 text-base"
            render={<Link href="/discover" />}
          >
            {t("claimPage")}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
