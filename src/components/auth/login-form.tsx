"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Loader2, Linkedin } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { error: authError } = await authClient.signIn.email({
        email,
        password,
      });

      if (authError) {
        setError(t("invalidCredentials"));
        return;
      }

      router.push(returnTo || "/discover");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      {/* Title & subtitle */}
      <div className="text-center mb-8">
        <h1 className="font-display text-[24px] font-bold text-foreground tracking-tight">
          Sign In
        </h1>
        <p className="text-[15px] text-white/[0.35] mt-1.5">
          Welcome back to Greece&apos;s tech talent pool
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
            autoComplete="current-password"
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
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : t("signIn")}
        </Button>
      </form>

      {/* Forgot password */}
      <div className="mt-4 text-center">
        <Link
          href="/forgot-password"
          className="text-sm text-white/30 hover:text-white/50 transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      {/* Sign up link */}
      <p className="mt-6 text-center text-sm text-white/30">
        {t("noAccount")}{" "}
        <Link href={returnTo ? `/register?returnTo=${encodeURIComponent(returnTo)}` : "/register"} className="text-primary hover:underline">
          {t("signUp")}
        </Link>
      </p>
    </div>
  );
}
