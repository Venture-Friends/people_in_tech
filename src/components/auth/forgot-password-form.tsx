"use client";

import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-5">
          <div className="rounded-full bg-white/[0.05] p-4">
            <Mail className="size-8 text-white/40" />
          </div>
        </div>
        <h1 className="font-display text-[24px] font-bold text-foreground tracking-tight">
          Check Your Email
        </h1>
        <p className="text-[15px] text-white/[0.35] mt-2 mb-2">
          If an account exists for this email, we&apos;ve sent a password reset link to
        </p>
        <p className="text-[15px] text-foreground font-medium mb-8">
          {email}
        </p>
        <p className="text-[13px] text-white/25 mb-6">
          The link expires in 1 hour. Check your spam folder if you don&apos;t see it.
        </p>
        <Button nativeButton={false} render={<Link href="/login" />} variant="outline" className="border-white/[0.08] text-white/60">
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-display text-[24px] font-bold text-foreground tracking-tight">
          Reset Password
        </h1>
        <p className="text-[15px] text-white/[0.35] mt-1.5">
          Enter your email to receive a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="reset-email" className="text-sm text-white/50">
            Email
          </Label>
          <Input
            id="reset-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1.5 rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] px-3.5 py-2.5 text-foreground placeholder:text-white/20 focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
          />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Send Reset Link"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm text-white/30 hover:text-white/50 transition-colors"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
