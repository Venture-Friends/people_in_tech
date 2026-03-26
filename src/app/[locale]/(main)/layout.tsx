import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AnimatedBackground } from "@/components/shared/animated-background";
import { FeedbackWidget } from "@/components/shared/feedback-widget";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnimatedBackground />
      <Navbar />
      <main id="main-content" className="relative z-[2] min-h-screen pt-16 pb-16 sm:pb-0">
        {children}
      </main>
      <Footer />
      <MobileNav />
      <FeedbackWidget />
    </>
  );
}
