"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
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
    <section className="relative w-full py-20 md:py-32">
      {/* Soft radial gradient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-primary/[0.06] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Announcement pill */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] px-4 py-1.5 text-sm text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            {t("heroTitle").split(" ").slice(0, 3).join(" ")}
          </div>

          <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-[-0.02em] md:text-6xl">
            {t("heroTitle")}
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground md:text-xl">
            {t("heroSubtitle")}
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button size="lg" className="h-12 gap-2 px-8 text-base" render={<Link href="/discover" />}>
              {t("exploreCompanies")}
              <ArrowRight className="size-4" />
            </Button>
            <Button variant="outline" size="lg" className="h-12 border-white/[0.06] bg-white/[0.06] px-8 text-base hover:bg-white/[0.1]" render={<Link href="/discover" />}>
              {t("imACompany")}
            </Button>
          </div>

          <div className="mt-20 grid w-full max-w-2xl grid-cols-2 gap-0 rounded-2xl border border-white/[0.06] bg-card p-6 md:grid-cols-4 md:gap-0 md:divide-x md:divide-white/[0.06]">
            <AnimatedCounter target={stats.companies} label={t("statsCompanies")} />
            <AnimatedCounter target={stats.candidates} label={t("statsCandidates")} />
            <AnimatedCounter target={stats.events} label={t("statsEvents")} />
            <AnimatedCounter target={stats.sectors} label={t("statsSectors")} />
          </div>
        </div>
      </div>
    </section>
  );
}
