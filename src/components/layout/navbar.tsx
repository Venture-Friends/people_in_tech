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
  SheetClose,
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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary">
            Hiring Partners
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t(link.labelKey)}
                {isActive && (
                  <span className="absolute inset-x-1 -bottom-[1.125rem] h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          {/* Desktop Auth Buttons / User Menu */}
          <div className="hidden items-center gap-2 md:flex">
            {status === "loading" ? (
              <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
            ) : session?.user ? (
              <UserMenu />
            ) : (
              <>
                <Button variant="ghost" size="sm" render={<Link href="/login" />}>
                  {t("signIn")}
                </Button>
                <Button size="sm" render={<Link href="/register" />}>
                  {t("getStarted")}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" aria-label="Open menu" />
                }
              >
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <SheetHeader className="border-b border-border p-4">
                  <SheetTitle className="text-left text-primary font-bold">
                    Hiring Partners
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-1 p-4">
                  {navLinks.map((link) => {
                    const isActive = pathname.startsWith(link.href);
                    return (
                      <SheetClose
                        key={link.href}
                        render={<Link href={link.href} />}
                        className={cn(
                          "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {t(link.labelKey)}
                      </SheetClose>
                    );
                  })}
                </div>
                <div className="mt-auto border-t border-border p-4">
                  {session?.user ? (
                    <div className="flex flex-col gap-2">
                      <div className="text-sm font-medium text-foreground">
                        {session.user.name}
                      </div>
                      <SheetClose
                        render={<Link href="/dashboard" />}
                        className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        {t("dashboard")}
                      </SheetClose>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-center"
                        render={<Link href="/login" />}
                      >
                        {t("signIn")}
                      </Button>
                      <Button
                        className="w-full justify-center"
                        render={<Link href="/register" />}
                      >
                        {t("getStarted")}
                      </Button>
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
