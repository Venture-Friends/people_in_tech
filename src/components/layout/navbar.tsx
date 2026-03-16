"use client";

import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LanguageSwitcher } from "./language-switcher";
import { UserMenu } from "./user-menu";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/discover", labelKey: "discover" as const },
  { href: "/jobs", labelKey: "jobs" as const },
  { href: "/events", labelKey: "events" as const },
];

export function Navbar() {
  const t = useTranslations("nav");
  const { data: session, status } = useSession();
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-[oklch(0.07_0.01_260_/_0.6)] backdrop-blur-[16px] backdrop-saturate-[1.2] border-b border-white/[0.04]">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-8">
        {/* Logo — left */}
        <div className="flex items-center">
          <Link href="/" className="font-display text-lg font-bold text-foreground tracking-tight">
            Hiring<span className="text-primary">.</span>
          </Link>
        </div>

        {/* Desktop Nav Links — true center */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 text-[13px] font-medium transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-white/40 hover:text-white/80"
                )}
              >
                {t(link.labelKey)}
              </Link>
            );
          })}
        </nav>

        {/* Right Side */}
        <div className="flex items-center justify-end gap-2">
          <LanguageSwitcher />

          {/* Desktop Auth Buttons / User Menu */}
          <div className="hidden items-center gap-2 md:flex">
            {status === "loading" ? (
              <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
            ) : session?.user ? (
              <UserMenu />
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[13px] font-medium text-white/50 hover:text-white"
                  >
                    {t("signIn")}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground text-[13px] font-semibold rounded-lg px-[18px] py-2 hover:bg-[oklch(0.92_0.27_128)] hover:shadow-[0_4px_16px_oklch(0.88_0.27_128_/_0.25)]"
                  >
                    {t("getStarted")}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger
                className={cn(
                  "group/button inline-flex shrink-0 items-center justify-center rounded-lg size-8",
                  "text-sm font-medium transition-all outline-none select-none",
                  "hover:bg-muted/50 hover:text-foreground"
                )}
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent
                side="right"
                className="max-w-[280px] w-[85vw] p-0 bg-[oklch(0.07_0.01_260_/_0.9)] backdrop-blur-[16px]"
              >
                <SheetHeader className="border-b border-white/[0.04] p-4">
                  <SheetTitle className="text-left font-display text-lg font-bold text-foreground tracking-tight">
                    Hiring<span className="text-primary">.</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-1 p-4">
                  {navLinks.map((link) => {
                    const isActive = pathname.startsWith(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "flex items-center rounded-lg px-3 py-3 text-[13px] font-medium transition-colors min-h-[44px]",
                          isActive
                            ? "text-foreground"
                            : "text-white/40 hover:text-white/80"
                        )}
                      >
                        {t(link.labelKey)}
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-auto border-t border-white/[0.04] p-4">
                  {session?.user ? (
                    <div className="flex flex-col gap-2">
                      <div className="text-sm font-medium text-foreground">
                        {session.user.name}
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center rounded-lg px-3 py-3 text-[13px] font-medium min-h-[44px] text-white/40 hover:text-white/80 transition-colors"
                      >
                        {t("dashboard")}
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link href="/login">
                        <Button
                          variant="ghost"
                          className="w-full justify-center text-[13px] font-medium text-white/50 hover:text-white"
                        >
                          {t("signIn")}
                        </Button>
                      </Link>
                      <Link href="/register">
                        <Button className="w-full justify-center bg-primary text-primary-foreground text-[13px] font-semibold rounded-lg hover:bg-[oklch(0.92_0.27_128)] hover:shadow-[0_4px_16px_oklch(0.88_0.27_128_/_0.25)]">
                          {t("getStarted")}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
