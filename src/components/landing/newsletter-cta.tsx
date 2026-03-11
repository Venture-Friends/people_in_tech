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
    <section className="w-full py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-card border border-border px-6 py-12 text-center md:px-12">
          <h2 className="text-2xl font-bold md:text-3xl">
            {t("newsletterTitle")}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {t("newsletterSubtitle")}
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <Input
              type="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 flex-1"
              required
            />
            <Button type="submit" size="lg" className="h-10 px-6">
              {t("subscribe")}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
