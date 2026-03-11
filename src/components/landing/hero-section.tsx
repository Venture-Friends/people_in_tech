"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "./animated-counter";

interface HeroSectionProps {
  stats: {
    companies: number;
    candidates: number;
    events: number;
    sectors: number;
  };
}

export function HeroSection({ stats }: HeroSectionProps) {
  const t = useTranslations("landing");

  return (
    <section className="bg-dot-grid relative w-full py-20 md:py-32">
      {/* Gradient overlay to soften dot grid */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            {t("heroTitle")}
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            {t("heroSubtitle")}
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button
              size="lg"
              className="h-12 px-8 text-base"
              render={<Link href="/discover" />}
            >
              {t("exploreCompanies")}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-8 text-base"
              render={<Link href="/discover" />}
            >
              {t("imACompany")}
            </Button>
          </div>

          <div className="mt-16 grid w-full max-w-2xl grid-cols-2 gap-8 md:grid-cols-4">
            <AnimatedCounter
              target={stats.companies}
              label={t("statsCompanies")}
            />
            <AnimatedCounter
              target={stats.candidates}
              label={t("statsCandidates")}
            />
            <AnimatedCounter
              target={stats.events}
              label={t("statsEvents")}
            />
            <AnimatedCounter
              target={stats.sectors}
              label={t("statsSectors")}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
