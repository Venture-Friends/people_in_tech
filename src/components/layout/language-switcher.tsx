"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function toggleLocale() {
    const nextLocale = locale === "en" ? "el" : "en";
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLocale}
      className="gap-1.5 rounded-full border-white/[0.06] bg-transparent px-3 py-1 text-muted-foreground hover:border-white/[0.12] hover:text-foreground"
      aria-label={`Switch to ${locale === "en" ? "Greek" : "English"}`}
    >
      <Globe className="size-3.5" />
      <span className="text-xs font-medium uppercase">{locale === "en" ? "EN" : "EL"}</span>
    </Button>
  );
}
