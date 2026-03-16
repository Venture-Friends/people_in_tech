"use client";

import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSendReset(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStep(2);
  }

  function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);

    if (!newPassword || newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setSuccess(true);
  }

  // Step 3: Success state
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
        <Link href="/login">
          <Button className="w-full" size="lg">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  // Step 2: Check your email
  if (step === 2) {
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
          We&apos;ve sent a password reset link to
        </p>
        <p className="text-[15px] text-foreground font-medium mb-8">
          {email}
        </p>

        <button
          type="button"
          onClick={() => setStep(3)}
          className="text-sm text-primary hover:underline transition-colors"
        >
          I have the reset code
        </button>

        <div className="mt-3">
          <button
            type="button"
            onClick={() => {/* MVP: no actual resend */}}
            className="text-sm text-primary hover:underline transition-colors"
          >
            Resend
          </button>
        </div>

        <div className="mt-8">
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

  // Step 1: Enter email
  if (step === 1) {
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

        <form onSubmit={handleSendReset} className="space-y-5">
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

          <Button type="submit" className="w-full" size="lg">
            Send Reset Link
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

  // Step 3: Set new password
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

      <form onSubmit={handleResetPassword} className="space-y-5">
        <div>
          <Label htmlFor="new-password" className="text-sm text-white/50">
            New Password
          </Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
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

        {passwordError && (
          <p className="text-sm text-destructive text-center">{passwordError}</p>
        )}

        <Button type="submit" className="w-full" size="lg">
          Reset Password
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
