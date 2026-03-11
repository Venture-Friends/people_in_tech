"use client";

import { useTranslations } from "next-intl";
import { Search, Heart, Bell } from "lucide-react";

const steps = [
  {
    icon: Search,
    titleKey: "discoverTitle" as const,
    descKey: "discoverDesc" as const,
  },
  {
    icon: Heart,
    titleKey: "followTitle" as const,
    descKey: "followDesc" as const,
  },
  {
    icon: Bell,
    titleKey: "getAlertedTitle" as const,
    descKey: "getAlertedDesc" as const,
  },
];

export function HowItWorks() {
  const t = useTranslations("landing");

  return (
    <section className="w-full py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-center text-2xl font-bold md:text-3xl">{t("howItWorks")}</h2>
        <p className="mb-12 text-center text-muted-foreground">{t("heroSubtitle")}</p>

        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="absolute top-12 left-[16.67%] right-[16.67%] hidden h-px bg-white/[0.06] md:block" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.titleKey} className="flex flex-col items-center text-center">
                <div className="relative mb-4 flex size-12 items-center justify-center rounded-full bg-surface-2 ring-4 ring-background">
                  <Icon className="size-5 text-primary" />
                  <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground">{t(step.titleKey)}</h3>
                <p className="mt-2 max-w-xs text-sm text-muted-foreground">{t(step.descKey)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
