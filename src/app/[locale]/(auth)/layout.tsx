"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { AnimatedBackground } from "@/components/shared/animated-background";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("common");

  return (
    <div className="fixed inset-0 z-50">
      <AnimatedBackground />
      <div className="relative z-10 flex h-full flex-col items-center justify-center p-4">
        <Link href="/" className="font-display text-2xl font-bold tracking-tight text-foreground mb-8">
          People in Tech<span className="text-primary">.</span>
        </Link>
        <div className="w-full max-w-[400px]">{children}</div>
        <Link
          href="/"
          className="mt-6 text-sm text-white/30 hover:text-white/50 transition-colors"
        >
          {t("backToHome")}
        </Link>
      </div>
    </div>
  );
}
