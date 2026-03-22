import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { inter, spaceGrotesk, notoSans } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "People in Tech — Discover the companies building Greece's tech future",
  description:
    "Discover the companies building Greece's tech future. Follow, get alerts, and find your next role.",
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
