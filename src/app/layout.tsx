import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { inter, spaceGrotesk, notoSans } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hiring Partners, Discover Greek Tech Companies",
  description:
    "Explore top tech employers in Greece. Find companies, salaries, reviews, and open positions on the leading employer discovery platform.",
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
        {children}
      </body>
    </html>
  );
}
