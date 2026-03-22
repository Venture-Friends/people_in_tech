import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SessionProvider } from "@/components/providers/session-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Toaster } from "@/components/ui/sonner";
import { AnimatedBackground } from "@/components/shared/animated-background";
import { FeedbackWidget } from "@/components/shared/feedback-widget";
import { TailwindIndicator } from "@/components/shared/tailwind-indicator";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <SessionProvider>
        <AnimatedBackground />
        <Navbar />
        <main id="main-content" className="relative z-[2] min-h-screen pt-16 pb-16 sm:pb-0">
          {children}
        </main>
        <Footer />
        <MobileNav />
        <Toaster />
        <FeedbackWidget />
        <TailwindIndicator />
      </SessionProvider>
    </NextIntlClientProvider>
  );
}
