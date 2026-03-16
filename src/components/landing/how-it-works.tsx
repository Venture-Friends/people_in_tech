"use client";

import { Search, Bookmark, Bell } from "lucide-react";

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Explore",
    description: "Browse 20+ innovative tech companies in Greece. Filter by industry, location, and tech stack.",
  },
  {
    icon: Bookmark,
    number: "02",
    title: "Save & Track",
    description: "Bookmark companies you're interested in. Build your personal watchlist of employers you care about.",
  },
  {
    icon: Bell,
    number: "03",
    title: "Get Notified",
    description: "Receive alerts when your saved companies post new roles or host events. Never miss an opportunity.",
  },
];

export function HowItWorks() {
  return (
    <section className="w-full py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-center font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          How It Works
        </h2>
        <p className="mb-12 text-center text-[15px] text-white/[0.35]">
          Three simple steps to find your next opportunity
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-6 text-center"
              >
                <span className="absolute top-4 right-4 font-display text-xs font-semibold text-primary/30">
                  {step.number}
                </span>
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/[0.08]">
                  <Icon className="size-5 text-primary" />
                </div>
                <h3 className="font-display text-base font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-white/[0.35]">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
