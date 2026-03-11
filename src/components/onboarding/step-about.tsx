"use client";

import { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from "react-hook-form";
import { useTranslations } from "next-intl";
import { User, Briefcase, GraduationCap, Rocket } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { OnboardingInput } from "@/lib/validations/onboarding";

interface StepAboutProps {
  register: UseFormRegister<OnboardingInput>;
  watch: UseFormWatch<OnboardingInput>;
  setValue: UseFormSetValue<OnboardingInput>;
  errors: FieldErrors<OnboardingInput>;
}

const EXPERIENCE_OPTIONS = [
  { value: "STUDENT" as const, icon: GraduationCap, labelKey: "student" as const },
  { value: "GRADUATE" as const, icon: Briefcase, labelKey: "graduate" as const },
  { value: "JUNIOR" as const, icon: Rocket, labelKey: "junior" as const },
];

export function StepAbout({ register, watch, setValue, errors }: StepAboutProps) {
  const t = useTranslations("onboarding");
  const currentLevel = watch("experienceLevel");

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="fullName">{t("fullName")}</Label>
        <Input
          id="fullName"
          type="text"
          autoComplete="name"
          {...register("fullName")}
          className="mt-1.5"
        />
        {errors.fullName && (
          <p className="text-sm text-destructive mt-1">
            {errors.fullName.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="headline">{t("headline")}</Label>
        <Input
          id="headline"
          type="text"
          placeholder={t("headlinePlaceholder")}
          {...register("headline")}
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="linkedinUrl">{t("linkedinUrl")}</Label>
        <Input
          id="linkedinUrl"
          type="url"
          placeholder="https://linkedin.com/in/..."
          {...register("linkedinUrl")}
          className="mt-1.5"
        />
        {errors.linkedinUrl && (
          <p className="text-sm text-destructive mt-1">
            {errors.linkedinUrl.message}
          </p>
        )}
      </div>

      <div>
        <Label>{t("experienceLevel")}</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
          {EXPERIENCE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = currentLevel === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setValue("experienceLevel", option.value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-4 cursor-pointer transition-all",
                  isSelected
                    ? "bg-primary/10 border-primary text-primary ring-1 ring-primary"
                    : "bg-card border-border text-muted-foreground hover:border-foreground/30"
                )}
              >
                <Icon className="size-6" />
                <span className="text-sm font-medium">{t(option.labelKey)}</span>
              </button>
            );
          })}
        </div>
        {errors.experienceLevel && (
          <p className="text-sm text-destructive mt-1">
            {errors.experienceLevel.message}
          </p>
        )}
      </div>
    </div>
  );
}
