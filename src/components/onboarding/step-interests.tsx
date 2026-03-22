"use client";

import { UseFormWatch, UseFormSetValue, FieldErrors } from "react-hook-form";
import { useTranslations } from "next-intl";
import { MultiSelectChips } from "@/components/shared/multi-select-chips";
import { SkillPicker } from "@/components/shared/skill-picker";
import { Label } from "@/components/ui/label";
import {
  ROLE_GROUPS,
  ALL_ROLES,
  MAX_ROLE_SELECTIONS,
  INDUSTRY_OPTIONS,
} from "@/lib/constants/onboarding";
import type { OnboardingInput } from "@/lib/validations/onboarding";

interface StepInterestsProps {
  watch: UseFormWatch<OnboardingInput>;
  setValue: UseFormSetValue<OnboardingInput>;
  errors: FieldErrors<OnboardingInput>;
}

export function StepInterests({ watch, setValue, errors }: StepInterestsProps) {
  const t = useTranslations("onboarding");
  const roleInterests = watch("roleInterests");
  const skills = watch("skills");
  const industries = watch("industries");

  return (
    <div className="space-y-6">
      <div>
        <MultiSelectChips
          label={t("roleInterests")}
          options={ALL_ROLES}
          groups={ROLE_GROUPS as unknown as Record<string, string[]>}
          selected={roleInterests || []}
          onChange={(selected) => setValue("roleInterests", selected, { shouldValidate: true })}
          max={MAX_ROLE_SELECTIONS}
        />
        {errors.roleInterests && (
          <p className="text-sm text-destructive mt-1">
            {errors.roleInterests.message}
          </p>
        )}
      </div>

      <div>
        <Label className="mb-3 text-[13px] font-medium text-white/50">{t("skills")}</Label>
        <SkillPicker
          selected={skills || []}
          onChange={(skills) => setValue("skills", skills)}
          placeholder={t("addSkill")}
        />
      </div>

      <div>
        <MultiSelectChips
          label={t("industries")}
          options={INDUSTRY_OPTIONS}
          selected={industries || []}
          onChange={(selected) => setValue("industries", selected)}
        />
      </div>
    </div>
  );
}
