"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-5">
          <div className="rounded-full bg-red-500/10 p-4">
            <AlertCircle className="size-8 text-red-400" />
          </div>
        </div>
        <h1 className="font-display text-[24px] font-bold text-foreground tracking-tight">
          Invalid Reset Link
        </h1>
        <p className="text-[15px] text-white/[0.35] mt-2 mb-8">
          This password reset link is invalid or has expired.
        </p>
        <Button nativeButton={false} render={<Link href="/forgot-password" />} className="w-full" size="lg">
          Request New Link
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-5">
          <div className="rounded-full bg-primary/10 p-4">
            <CheckCircle className="size-8 text-primary" />
          </div>
        </div>
        <h1 className="font-display text-[24px] font-bold text-foreground tracking-tight">
          Password Reset Successfully
        </h1>
        <p className="text-[15px] text-white/[0.35] mt-2 mb-8">
          Your password has been updated. You can now sign in with your new password.
        </p>
        <Button nativeButton={false} render={<Link href="/login" />} className="w-full" size="lg">
          Sign In
        </Button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to reset password");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-display text-[24px] font-bold text-foreground tracking-tight">
          Set New Password
        </h1>
        <p className="text-[15px] text-white/[0.35] mt-1.5">
          Choose a new password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="new-password" className="text-sm text-white/50">
            New Password
          </Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1.5 rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] px-3.5 py-2.5 text-foreground placeholder:text-white/20 focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
          />
        </div>

        <div>
          <Label htmlFor="confirm-password" className="text-sm text-white/50">
            Confirm Password
          </Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="mt-1.5 rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] px-3.5 py-2.5 text-foreground placeholder:text-white/20 focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Reset Password"}
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
