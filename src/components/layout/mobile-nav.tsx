"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Search, Briefcase, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/discover", icon: Search, labelKey: "discover" as const },
  { href: "/jobs", icon: Briefcase, labelKey: "jobs" as const },
  { href: "/events", icon: Calendar, labelKey: "events" as const },
  { href: "/dashboard", icon: User, labelKey: "profile" as const },
];

export function MobileNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  // Hide on auth pages
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 bg-[rgba(14,17,23,0.6)] backdrop-blur-[16px] border-t border-white/[0.04] sm:hidden">
      <div className="flex h-16 items-center justify-around">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-white/40 hover:text-foreground"
              )}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary" />
              )}
              <Icon className="size-5" />
              <span className="font-medium">{t(tab.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
