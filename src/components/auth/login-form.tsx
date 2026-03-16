"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Loader2, Linkedin } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("invalidCredentials"));
        return;
      }

      if (result?.ok) {
        router.push("/discover");
      }
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
          Welcome back to Hiring Partners
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <Label htmlFor="email" className="text-sm text-white/50">
            {t("email")}
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className="mt-1.5 rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] px-3.5 py-2.5 text-foreground placeholder:text-white/20 focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="password" className="text-sm text-white/50">
            {t("password")}
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
            className="mt-1.5 rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] px-3.5 py-2.5 text-foreground placeholder:text-white/20 focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          {errors.password && (
            <p id="password-error" className="text-sm text-destructive mt-1">
              {errors.password.message}
            </p>
          )}
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
        <Link href="/register" className="text-primary hover:underline">
          {t("signUp")}
        </Link>
      </p>
    </div>
  );
}
