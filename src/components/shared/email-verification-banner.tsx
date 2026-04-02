"use client";

import { useState, useEffect } from "react";
import { Mail, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const DISMISS_KEY = "email-verification-banner-dismissed";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const COOLDOWN_SECONDS = 60;

export function EmailVerificationBanner() {
  const { data: session } = authClient.useSession();
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash
  const [cooldown, setCooldown] = useState(0);
  const [isSending, setIsSending] = useState(false);

  // Check localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DISMISS_KEY);
      if (stored) {
        const dismissedAt = parseInt(stored, 10);
        if (!isNaN(dismissedAt) && Date.now() - dismissedAt < DISMISS_DURATION_MS) {
          setDismissed(true);
          return;
        }
      }
      setDismissed(false);
    } catch {
      setDismissed(false);
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  function handleDismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // Ignore
    }
  }

  async function handleResend() {
    if (cooldown > 0 || isSending) return;
    setIsSending(true);
    try {
      await authClient.sendVerificationEmail({
        email: session?.user?.email ?? "",
        callbackURL: "/dashboard/candidate",
      });
      toast.success("Verification email sent! Check your inbox.");
      setCooldown(COOLDOWN_SECONDS);
    } catch {
      toast.error("Failed to send verification email. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  // Don't show if verified, dismissed, or session not loaded
  if (!session || session.user.emailVerified || dismissed) {
    return null;
  }

  return (
    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-primary/[0.15] bg-primary/[0.03] backdrop-blur-[8px] px-4 py-3">
      <Mail className="size-4 shrink-0 text-primary/60" />
      <p className="flex-1 text-[13px] text-white/60">
        Verify your email to get job alerts.{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isSending}
          className="text-primary/80 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending
            ? "Sending..."
            : cooldown > 0
            ? `Resend in ${cooldown}s`
            : "Resend email"}
        </button>
      </p>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="shrink-0 text-white/30 hover:text-white/60 transition-colors"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
