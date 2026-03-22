"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const tNav = useTranslations("nav");
  const tFooter = useTranslations("footer");

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-[2] border-t border-white/[0.04]">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo & Tagline */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="font-display text-lg font-bold text-foreground tracking-tight">
              People in Tech<span className="text-primary">.</span>
            </Link>
            <p className="mt-3 max-w-xs text-[13px] text-white/30 leading-relaxed">
              Discover Greece&apos;s tech ecosystem. Powered by POS4work Innovation Hub.
            </p>
          </div>

          {/* Platform Links */}
          <nav aria-label="Platform">
            <h3 className="text-[11px] uppercase tracking-[1.5px] font-semibold text-white/30">
              {tFooter("platform")}
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <Link
                  href="/discover"
                  className="text-[13px] text-white/40 hover:text-white transition-colors"
                >
                  {tNav("discover")}
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs"
                  className="text-[13px] text-white/40 hover:text-white transition-colors"
                >
                  {tNav("jobs")}
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="text-[13px] text-white/40 hover:text-white transition-colors"
                >
                  {tNav("events")}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Company Links */}
          <nav aria-label="Company">
            <h3 className="text-[11px] uppercase tracking-[1.5px] font-semibold text-white/30">
              {tFooter("company")}
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <a
                  href="#"
                  className="text-[13px] text-white/40 cursor-default"
                >
                  {tFooter("about")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[13px] text-white/40 cursor-default"
                >
                  {tFooter("contact")}
                </a>
              </li>
            </ul>
          </nav>

          {/* Legal Links */}
          <nav aria-label="Legal">
            <h3 className="text-[11px] uppercase tracking-[1.5px] font-semibold text-white/30">
              {tFooter("legal")}
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <a
                  href="#"
                  className="text-[13px] text-white/40 cursor-default"
                >
                  {tFooter("terms")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[13px] text-white/40 cursor-default"
                >
                  {tFooter("privacy")}
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center gap-2 border-t border-white/[0.04] pt-6 text-center sm:flex-row sm:justify-between">
          <span className="text-[12px] text-white/15">
            &copy; {currentYear} People in Tech. {tFooter("allRightsReserved")}
          </span>
        </div>
      </div>
    </footer>
  );
}
