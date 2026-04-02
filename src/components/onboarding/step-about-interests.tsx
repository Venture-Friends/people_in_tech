"use client";

import {
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ComboboxMultiSelect } from "@/components/shared/combobox-multi-select";
import { SkillPicker } from "@/components/shared/skill-picker";
import { cn } from "@/lib/utils";
import {
  EXPERIENCE_LEVELS,
  ROLE_GROUPS,
  ALL_ROLES,
  MAX_ROLE_SELECTIONS,
  INDUSTRY_OPTIONS,
} from "@/lib/constants/onboarding";
import type { OnboardingInput } from "@/lib/validations/onboarding";

interface StepAboutInterestsProps {
  register: UseFormRegister<OnboardingInput>;
  watch: UseFormWatch<OnboardingInput>;
  setValue: UseFormSetValue<OnboardingInput>;
  errors: FieldErrors<OnboardingInput>;
}

export function StepAboutInterests({
  register,
  watch,
  setValue,
  errors,
}: StepAboutInterestsProps) {
  const t = useTranslations("onboarding");
  const currentLevel = watch("experienceLevel");
  const roleInterests = watch("roleInterests");
  const skills = watch("skills");
  const industries = watch("industries");

  return (
    <div className="space-y-6">
      {/* ── About section ── */}
      <div>
        <Label
          htmlFor="fullName"
          className="text-[13px] font-medium text-white/50"
        >
          {t("fullName")}
        </Label>
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
        <Label
          htmlFor="headline"
          className="text-[13px] font-medium text-white/50"
        >
          {t("professionalTitle")}
        </Label>
        <Input
          id="headline"
          type="text"
          placeholder={t("professionalTitlePlaceholder")}
          {...register("headline")}
          className="mt-1.5 rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px] focus-visible:border-primary/30 focus-visible:ring-1 focus-visible:ring-primary/20"
        />
      </div>

      <div>
        <Label
          htmlFor="linkedinUrl"
          className="text-[13px] font-medium text-white/50"
        >
          {t("linkedinUrl")}
        </Label>
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
        <Label className="text-[13px] font-medium text-white/50">
          {t("experienceLevel")}
        </Label>
        <div
          className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2"
          role="radiogroup"
          aria-label="Experience level"
        >
          {EXPERIENCE_LEVELS.map((option) => {
            const isSelected = currentLevel === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() =>
                  setValue(
                    "experienceLevel",
                    option.value as OnboardingInput["experienceLevel"],
                  )
                }
                className={cn(
                  "flex flex-col items-start rounded-xl border px-3 py-2.5 cursor-pointer transition-all text-left",
                  isSelected
                    ? "border-primary/[0.25] bg-primary/[0.05] text-primary ring-1 ring-primary/20"
                    : "border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] text-white/40 hover:border-white/[0.1]",
                )}
              >
                <span className="text-[13px] font-medium">
                  {t(option.labelKey)}
                </span>
                <span
                  className={cn(
                    "text-[11px] mt-0.5",
                    isSelected ? "text-primary/60" : "text-white/25",
                  )}
                >
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

      <Separator className="border-white/[0.04]" />

      {/* ── Interests section ── */}
      <div>
        <ComboboxMultiSelect
          label={t("roleInterests")}
          options={ALL_ROLES}
          groups={ROLE_GROUPS as unknown as Record<string, string[]>}
          selected={roleInterests || []}
          onChange={(selected) =>
            setValue("roleInterests", selected, { shouldValidate: true })
          }
          max={MAX_ROLE_SELECTIONS}
          placeholder="Search roles..."
        />
        {errors.roleInterests && (
          <p className="text-sm text-destructive mt-1">
            {errors.roleInterests.message}
          </p>
        )}
      </div>

      <div>
        <Label className="mb-2 text-[13px] font-medium text-white/50">
          {t("skills")}
        </Label>
        <SkillPicker
          selected={skills || []}
          onChange={(s) => setValue("skills", s)}
          placeholder={t("addSkill")}
        />
      </div>

      <div>
        <ComboboxMultiSelect
          label={t("industries")}
          options={INDUSTRY_OPTIONS}
          selected={industries || []}
          onChange={(selected) => setValue("industries", selected)}
          placeholder="Search industries..."
        />
      </div>
    </div>
  );
}
