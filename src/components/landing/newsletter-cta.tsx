"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function NewsletterCta() {
  const t = useTranslations("landing");
  const [email, setEmail] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("Thanks for subscribing!");
    setEmail("");
  }

  return (
    <section className="w-full py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <h2 className="font-display text-[22px] font-semibold text-foreground">
            {t("newsletterTitle")}
          </h2>
          <p className="mt-2 text-[15px] text-white/[0.35]">
            {t("newsletterSubtitle")}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex w-full max-w-md gap-3">
            <Input
              type="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 flex-1 rounded-[10px] border-white/[0.07] bg-white/[0.03] text-sm focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
              required
            />
            <Button type="submit" className="h-11 rounded-[10px] px-6 text-[13px] font-semibold">
              {t("subscribe")}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
