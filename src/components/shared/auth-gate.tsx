"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { Lock } from "lucide-react";

interface AuthGateProps {
  /** Message shown above the CTA */
  message?: string;
}

export function AuthGate({
  message = "Sign up to see all results",
}: AuthGateProps) {
  const pathname = usePathname();

  return (
    <div className="relative">
      {/* Gradient fade overlay */}
      <div className="pointer-events-none absolute inset-x-0 -top-32 h-32 bg-gradient-to-b from-transparent to-background z-10" />

      {/* CTA card */}
      <div className="relative z-20 flex flex-col items-center py-16">
        <div className="w-full max-w-md rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/[0.08]">
            <Lock className="size-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">{message}</h3>
          <p className="mt-1 text-sm text-white/30">
            Free to join. Set up your profile in under 2 minutes.
          </p>
          <Link
            href={`/register?returnTo=${encodeURIComponent(pathname)}`}
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get Started for Free
          </Link>
          <p className="mt-3 text-xs text-white/20">
            Already have an account?{" "}
            <Link
              href={`/login?returnTo=${encodeURIComponent(pathname)}`}
              className="text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
