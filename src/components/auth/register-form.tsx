"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Linkedin } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { error: authError } = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (authError) {
        if (authError.message?.includes("already")) {
          setError(t("emailExists"));
        } else {
          setError(authError.message || t("invalidCredentials"));
        }
        return;
      }

      // autoSignIn: true means user is already logged in
      router.push("/onboarding");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-white/30 mb-2">
          <span>Step 1 of 2</span>
          <span>Create Account</span>
        </div>
        <div className="h-1 rounded-full bg-white/[0.06]">
          <div className="h-full w-1/2 rounded-full bg-primary transition-all" />
        </div>
      </div>

      {/* Title & subtitle */}
      <div className="text-center mb-8">
        <h1 className="font-display text-[24px] font-bold text-foreground tracking-tight">
          Create Account
        </h1>
        <p className="text-[15px] text-white/[0.35] mt-1.5">
          Join the Greek tech community
        </p>
      </div>

      {/* LinkedIn button */}
      <button
        type="button"
        disabled
        className="w-full flex items-center justify-center gap-2.5 rounded-[10px] border border-white/[0.08] bg-white/[0.03] text-white/50 py-3 text-sm font-medium cursor-not-allowed transition-colors"
      >
        <Linkedin className="size-4" />
        Continue with LinkedIn (Coming soon)
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="h-px flex-1 bg-white/[0.08]" />
        <span className="text-xs text-white/20">or</span>
        <div className="h-px flex-1 bg-white/[0.08]" />
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <Label htmlFor="name" className="text-sm text-white/50">
            {t("name")}
          </Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            name="name"
            className="mt-1.5 rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] px-3.5 py-2.5 text-foreground placeholder:text-white/20 focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-sm text-white/50">
            {t("email")}
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            name="email"
            className="mt-1.5 rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] px-3.5 py-2.5 text-foreground placeholder:text-white/20 focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
          />
        </div>

        <div>
          <Label htmlFor="password" className="text-sm text-white/50">
            {t("password")}
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            name="password"
            className="mt-1.5 rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] px-3.5 py-2.5 text-foreground placeholder:text-white/20 focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Get Started"}
        </Button>
      </form>

      {/* Sign in link */}
      <p className="mt-6 text-center text-sm text-white/30">
        {t("hasAccount")}{" "}
        <Link href="/login" className="text-primary hover:underline">
          {t("signIn")}
        </Link>
      </p>
    </div>
  );
}
