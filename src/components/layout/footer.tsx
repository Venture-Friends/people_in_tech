"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tFooter = useTranslations("footer");

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-card">
      {/* Gradient top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo & Tagline */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="text-lg font-bold text-primary">
              Hiring Partners
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {tFooter("tagline")}
            </p>
          </div>

          {/* Platform Links */}
          <nav aria-label="Platform">
            <h3 className="text-sm font-semibold text-foreground">
              {tFooter("platform")}
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <Link
                  href="/discover"
                  className="text-sm text-muted-foreground transition-all duration-150 hover:text-white hover:translate-x-0.5"
                >
                  {tNav("discover")}
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs"
                  className="text-sm text-muted-foreground transition-all duration-150 hover:text-white hover:translate-x-0.5"
                >
                  {tNav("jobs")}
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="text-sm text-muted-foreground transition-all duration-150 hover:text-white hover:translate-x-0.5"
                >
                  {tNav("events")}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Company Links */}
          <nav aria-label="Company">
            <h3 className="text-sm font-semibold text-foreground">
              {tFooter("company")}
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground transition-all duration-150 hover:text-white hover:translate-x-0.5"
                >
                  {tFooter("about")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground transition-all duration-150 hover:text-white hover:translate-x-0.5"
                >
                  {tFooter("contact")}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Legal Links */}
          <nav aria-label="Legal">
            <h3 className="text-sm font-semibold text-foreground">
              {tFooter("legal")}
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground transition-all duration-150 hover:text-white hover:translate-x-0.5"
                >
                  {tFooter("terms")}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground transition-all duration-150 hover:text-white hover:translate-x-0.5"
                >
                  {tFooter("privacy")}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center gap-2 border-t border-white/[0.06] pt-6 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <span>{tCommon("poweredBy")}</span>
          <span>
            &copy; {currentYear} Hiring Partners. {tFooter("allRightsReserved")}
          </span>
        </div>
      </div>
    </footer>
  );
}
