"use client";

import { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { EXPERIENCE_LEVELS } from "@/lib/constants/onboarding";
import type { OnboardingInput } from "@/lib/validations/onboarding";

interface StepAboutProps {
  register: UseFormRegister<OnboardingInput>;
  watch: UseFormWatch<OnboardingInput>;
  setValue: UseFormSetValue<OnboardingInput>;
  errors: FieldErrors<OnboardingInput>;
}

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

        {/* IC Track */}
        <p className="mt-3 mb-2 text-[11px] uppercase tracking-wider text-white/30">Individual Contributor</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-label="Individual Contributor levels">
          {EXPERIENCE_LEVELS.ic.map((option) => {
            const isSelected = currentLevel === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setValue("experienceLevel", option.value as OnboardingInput["experienceLevel"])}
                className={cn(
                  "flex flex-col items-start rounded-xl border px-3 py-2.5 cursor-pointer transition-all text-left",
                  isSelected
                    ? "border-primary/[0.25] bg-primary/[0.05] text-primary ring-1 ring-primary/20"
                    : "border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] text-white/40 hover:border-white/[0.1]"
                )}
              >
                <span className="text-[13px] font-medium">{t(option.labelKey)}</span>
                <span className={cn(
                  "text-[11px] mt-0.5",
                  isSelected ? "text-primary/60" : "text-white/25"
                )}>
                  {t(option.descKey)} · {option.years} yrs
                </span>
              </button>
            );
          })}
        </div>

        {/* Management Track */}
        <div className="my-3 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/[0.06]" />
          <span className="text-[10px] uppercase tracking-wider text-white/20">or</span>
          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>

        <p className="mb-2 text-[11px] uppercase tracking-wider text-white/30">Management</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="Management levels">
          {EXPERIENCE_LEVELS.management.map((option) => {
            const isSelected = currentLevel === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setValue("experienceLevel", option.value as OnboardingInput["experienceLevel"])}
                className={cn(
                  "flex flex-col items-start rounded-xl border px-3 py-2.5 cursor-pointer transition-all text-left",
                  isSelected
                    ? "border-primary/[0.25] bg-primary/[0.05] text-primary ring-1 ring-primary/20"
                    : "border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] text-white/40 hover:border-white/[0.1]"
                )}
              >
                <span className="text-[13px] font-medium">{t(option.labelKey)}</span>
                <span className={cn(
                  "text-[11px] mt-0.5",
                  isSelected ? "text-primary/60" : "text-white/25"
                )}>
                  {option.years} yrs
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
