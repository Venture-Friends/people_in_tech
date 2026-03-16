"use client";

import { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Briefcase, GraduationCap, Rocket } from "lucide-react";
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
  { value: "STUDENT" as const, icon: GraduationCap, labelKey: "student" as const, description: "Currently studying" },
  { value: "GRADUATE" as const, icon: Briefcase, labelKey: "graduate" as const, description: "Recently graduated" },
  { value: "JUNIOR" as const, icon: Rocket, labelKey: "junior" as const, description: "1-3 years experience" },
];

export function StepAbout({ register, watch, setValue, errors }: StepAboutProps) {
  const t = useTranslations("onboarding");
  const currentLevel = watch("experienceLevel");

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="fullName" className="text-[13px] font-medium text-white/50">{t("fullName")}</Label>
        <Input
          id="fullName"
          type="text"
          autoComplete="name"
          {...register("fullName")}
          className="mt-1.5 rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus-visible:border-primary/30 focus-visible:ring-1 focus-visible:ring-primary/20"
        />
        {errors.fullName && (
          <p className="text-sm text-destructive mt-1">
            {errors.fullName.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="headline" className="text-[13px] font-medium text-white/50">{t("headline")}</Label>
        <Input
          id="headline"
          type="text"
          placeholder={t("headlinePlaceholder")}
          {...register("headline")}
          className="mt-1.5 rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus-visible:border-primary/30 focus-visible:ring-1 focus-visible:ring-primary/20"
        />
      </div>

      <div>
        <Label htmlFor="linkedinUrl" className="text-[13px] font-medium text-white/50">{t("linkedinUrl")}</Label>
        <Input
          id="linkedinUrl"
          type="url"
          placeholder="https://linkedin.com/in/..."
          {...register("linkedinUrl")}
          className="mt-1.5 rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus-visible:border-primary/30 focus-visible:ring-1 focus-visible:ring-primary/20"
        />
        {errors.linkedinUrl && (
          <p className="text-sm text-destructive mt-1">
            {errors.linkedinUrl.message}
          </p>
        )}
      </div>

      <div>
        <Label className="text-[13px] font-medium text-white/50">{t("experienceLevel")}</Label>
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
                  "flex flex-col items-center gap-2 rounded-2xl border p-5 cursor-pointer transition-all",
                  isSelected
                    ? "border-primary/[0.25] bg-primary/[0.05] text-primary ring-1 ring-primary/20"
                    : "border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] text-white/40 hover:border-white/[0.1]"
                )}
              >
                <Icon className="size-6" />
                <span className="text-sm font-medium">{t(option.labelKey)}</span>
                <span className={cn(
                  "text-xs",
                  isSelected ? "text-primary/60" : "text-white/25"
                )}>
                  {option.description}
                </span>
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
