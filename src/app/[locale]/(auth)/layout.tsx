"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("common");

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-background">
      {/* Subtle gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/[0.08] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary/[0.04] via-transparent to-transparent" />
      </div>

      {/* Centered content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-6">
        <Link
          href="/"
          className="font-display text-2xl font-bold tracking-tight text-foreground mb-10"
        >
          People in Tech<span className="text-primary">.</span>
        </Link>

        <div className="w-full max-w-[400px]">{children}</div>

        <Link
          href="/"
          className="mt-8 text-sm text-white/25 hover:text-white/45 transition-colors"
        >
          {t("backToHome")}
        </Link>
      </div>
    </div>
  );
}
