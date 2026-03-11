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
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-card px-6 py-12 text-center md:px-12">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <h2 className="text-2xl font-bold md:text-3xl">{t("newsletterTitle")}</h2>
          <p className="mt-3 text-muted-foreground">{t("newsletterSubtitle")}</p>

          <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <Input
              type="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 flex-1 bg-background border-white/[0.06] focus:border-white/[0.12]"
              required
            />
            <Button type="submit" size="lg" className="h-10 px-6">{t("subscribe")}</Button>
          </form>
        </div>
      </div>
    </section>
  );
}
