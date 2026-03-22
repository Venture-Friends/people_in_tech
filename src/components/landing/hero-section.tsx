"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";

interface HeroSectionProps {
  stats: {
    companies: number;
    candidates: number;
    openRoles: number;
    events: number;
    sectors: number;
  };
}

export function HeroSection({ stats }: HeroSectionProps) {
  const t = useTranslations("landing");

  return (
    <section className="relative w-full py-24 md:py-36">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <h1 className="font-display text-4xl font-bold tracking-[-0.04em] text-foreground leading-[1.02] md:text-5xl lg:text-[76px]">
            Greece&apos;s Tech
            <br />
            <span className="text-white/[0.18]">Starts Here.</span>
          </h1>

          <p className="mt-6 max-w-[440px] text-[17px] leading-relaxed text-white/[0.38]">
            {t("heroSubtitle")}
          </p>

          {/* Search bar */}
          <Link href="/discover" className="mt-8 flex w-full max-w-[540px] items-center gap-3 rounded-[14px] border border-white/[0.07] bg-white/[0.03] px-4 py-3 backdrop-blur-[12px] transition-colors hover:border-white/[0.12] hover:bg-white/[0.05]">
            <Search className="size-5 text-white/30" />
            <span className="flex-1 text-[15px] text-white/25">Search companies, roles, events...</span>
            <kbd className="hidden rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-white/30 sm:inline-block">⌘K</kbd>
          </Link>

          {/* CTA row */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/discover">
              <Button size="lg" className="h-11 gap-2 rounded-lg px-7 text-[13px] font-semibold">
                Explore Companies
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/list-company">
              <Button variant="outline" size="lg" className="h-11 rounded-lg border-white/[0.08] bg-transparent px-7 text-[13px] font-medium text-white/60 hover:border-white/[0.15] hover:text-white">
                I&apos;m a Company
              </Button>
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-16 flex flex-wrap justify-center items-center gap-6 sm:gap-12">
            <div className="flex flex-col items-center">
              <span className="font-display text-3xl font-bold text-primary">{stats.companies}+</span>
              <span className="mt-1 text-xs text-white/30">Companies</span>
            </div>
            <div className="hidden sm:block h-8 w-px bg-white/[0.06]" />
            <div className="flex flex-col items-center">
              <span className="font-display text-3xl font-bold text-foreground">{stats.openRoles}+</span>
              <span className="mt-1 text-xs text-white/30">Open Roles</span>
            </div>
            <div className="hidden sm:block h-8 w-px bg-white/[0.06]" />
            <div className="flex flex-col items-center">
              <span className="font-display text-3xl font-bold text-foreground">{stats.sectors}</span>
              <span className="mt-1 text-xs text-white/30">Sectors</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
