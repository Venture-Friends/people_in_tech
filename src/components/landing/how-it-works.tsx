"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
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
    <section className="w-full py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-center text-2xl font-bold md:text-3xl">
          {t("howItWorks")}
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card
                key={step.titleKey}
                className="rounded-xl border-border bg-card text-center"
              >
                <CardContent className="flex flex-col items-center gap-4 py-8">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="size-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {t(step.titleKey)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t(step.descKey)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
