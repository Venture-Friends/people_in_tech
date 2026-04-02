"use client";

import { Search, Bookmark, Bell } from "lucide-react";

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Browse",
    description: "Explore tech companies by sector, stack, or location. See who's hiring and what they're building.",
  },
  {
    icon: Bookmark,
    number: "02",
    title: "Connect",
    description: "Create your profile and let companies discover you. One application reaches every employer in the pool.",
  },
  {
    icon: Bell,
    number: "03",
    title: "Get Matched",
    description: "Get notified when companies match your skills. Never miss a role that fits.",
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
          Three steps to join Greece&apos;s tech talent pool
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
