import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { inter, spaceGrotesk, notoSans } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "People in Tech — Greece's tech talent pool",
  description:
    "Join the talent pool trusted by Greece's top tech companies. One profile, every opportunity.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html lang={locale} className="dark">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${notoSans.variable} antialiased`}
      >
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
