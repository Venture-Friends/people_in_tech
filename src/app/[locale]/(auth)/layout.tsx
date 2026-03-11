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
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-4">
      <Link href="/" className="text-2xl font-bold text-primary mb-8">
        Hiring Partners
      </Link>
      <div className="w-full max-w-[400px]">{children}</div>
      <Link
        href="/"
        className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {t("backToHome")}
      </Link>
    </div>
  );
}
