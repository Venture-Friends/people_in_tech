"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function VerifyEmailStatus() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Missing verification token");
      return;
    }

    async function verify() {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        if (res.ok) {
          setStatus("success");
        } else {
          const data = await res.json();
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
          Verifying your email...
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
          Email Verified
        </h1>
        <p className="text-[15px] text-white/[0.35] mt-2 mb-8">
          Your email has been verified successfully. You&apos;re all set!
        </p>
        <Button nativeButton={false} render={<Link href="/discover" />} className="w-full" size="lg">
          Start Exploring
        </Button>
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
      <Button nativeButton={false} render={<Link href="/login" />} variant="outline" className="border-white/[0.08] text-white/60">
        Back to Sign In
      </Button>
    </div>
  );
}
