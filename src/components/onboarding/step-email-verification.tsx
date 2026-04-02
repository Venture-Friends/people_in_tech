"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { CheckCircle, Mail, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepEmailVerificationProps {
  onVerified: () => void;
}

export function StepEmailVerification({
  onVerified,
}: StepEmailVerificationProps) {
  const { data: session, isPending } = authClient.useSession();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);

  const isVerified = session?.user?.emailVerified === true;
  const email = session?.user?.email;

  async function handleResend() {
    if (!email) return;
    setResending(true);
    try {
      await authClient.sendVerificationEmail({
        email,
        callbackURL: window.location.href,
      });
      toast.success("Verification email sent! Check your inbox.");
    } catch {
      toast.error("Failed to send verification email. Try again.");
    } finally {
      setResending(false);
    }
  }

  async function handleCheckAgain() {
    setChecking(true);
    try {
      // Force a session refresh by fetching the session again
      const res = await fetch("/api/auth/get-session", {
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data?.user?.emailVerified) {
        toast.success("Email verified!");
        onVerified();
      } else {
        toast.info("Email not yet verified. Please check your inbox.");
      }
    } catch {
      toast.error("Failed to check verification status.");
    } finally {
      setChecking(false);
    }
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-white/30" />
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="flex flex-col items-center text-center py-8">
        <div className="rounded-full bg-primary/10 p-4 mb-4">
          <CheckCircle className="size-8 text-primary" />
        </div>
        <h3 className="font-display text-lg font-semibold text-white mb-1">
          Email Verified
        </h3>
        <p className="text-[14px] text-white/[0.35] mb-6">
          Your email <span className="text-white/60">{email}</span> is verified.
          You can proceed.
        </p>
        <Button type="button" onClick={onVerified} size="lg">
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center py-8">
      <div className="rounded-full bg-amber-500/10 p-4 mb-4">
        <Mail className="size-8 text-amber-400" />
      </div>
      <h3 className="font-display text-lg font-semibold text-white mb-1">
        Verify Your Email
      </h3>
      <p className="text-[14px] text-white/[0.35] mb-6 max-w-sm">
        We sent a verification link to{" "}
        <span className="text-white/60">{email}</span>. Please check your inbox
        and click the link.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button
          type="button"
          onClick={handleCheckAgain}
          size="lg"
          disabled={checking}
        >
          {checking ? (
            <Loader2 className="size-4 mr-1 animate-spin" />
          ) : (
            <RefreshCw className="size-4 mr-1" />
          )}
          {checking ? "Checking..." : "I've verified my email"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={handleResend}
          size="lg"
          disabled={resending}
          className="text-white/50 hover:text-white/80"
        >
          {resending ? (
            <Loader2 className="size-4 mr-1 animate-spin" />
          ) : (
            <Mail className="size-4 mr-1" />
          )}
          {resending ? "Sending..." : "Resend verification email"}
        </Button>
      </div>
    </div>
  );
}
