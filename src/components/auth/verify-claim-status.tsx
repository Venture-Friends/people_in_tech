"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, AlertCircle, Loader2, Mail } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function VerifyClaimStatus() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasAccount, setHasAccount] = useState(true);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Missing verification token");
      return;
    }

    async function verify() {
      try {
        const res = await fetch(`/api/claims/verify?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setHasAccount(data.hasAccount);
          setStatus("success");
        } else {
          setErrorMessage(data.error || "Verification failed");
          setStatus("error");
        }
      } catch {
        setErrorMessage("Something went wrong");
        setStatus("error");
      }
    }

    verify();
  }, [token]);

  if (status === "loading") {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-5">
          <Loader2 className="size-8 text-primary animate-spin" />
        </div>
        <h1 className="font-display text-[24px] font-bold text-foreground tracking-tight">
          Verifying your claim...
        </h1>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-5">
          <div className="rounded-full bg-primary/10 p-4">
            <CheckCircle className="size-8 text-primary" />
          </div>
        </div>
        <h1 className="font-display text-[24px] font-bold text-foreground tracking-tight">
          Claim Verified
        </h1>
        <p className="text-[15px] text-white/[0.35] mt-2 mb-4">
          Your email has been verified and your claim has been submitted for
          review. Our team will review it within 2 business days.
        </p>

        {!hasAccount && (
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 mb-6">
            <div className="flex items-center gap-2 justify-center mb-2">
              <Mail className="size-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Account Created
              </span>
            </div>
            <p className="text-sm text-white/[0.35]">
              We&apos;ve created an account for you using your work email. You
              can sign in using the forgot password flow to set your password.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {!hasAccount ? (
            <Link href="/forgot-password">
              <Button className="w-full" size="lg">
                Set Your Password
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button className="w-full" size="lg">
                Sign In
              </Button>
            </Link>
          )}
          <Link href="/discover">
            <Button
              variant="outline"
              className="w-full border-white/[0.08] text-white/60"
              size="lg"
            >
              Continue Exploring
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="flex justify-center mb-5">
        <div className="rounded-full bg-red-500/10 p-4">
          <AlertCircle className="size-8 text-red-400" />
        </div>
      </div>
      <h1 className="font-display text-[24px] font-bold text-foreground tracking-tight">
        Verification Failed
      </h1>
      <p className="text-[15px] text-white/[0.35] mt-2 mb-8">
        {errorMessage}
      </p>
      <Link href="/discover">
        <Button variant="outline" className="border-white/[0.08] text-white/60">
          Back to Discover
        </Button>
      </Link>
    </div>
  );
}
