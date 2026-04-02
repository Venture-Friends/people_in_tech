"use client";

import {
  UseFormWatch,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { ComboboxMultiSelect } from "@/components/shared/combobox-multi-select";
import { SkillPicker } from "@/components/shared/skill-picker";
import { MultiSelectChips } from "@/components/shared/multi-select-chips";
import {
  ROLE_GROUPS,
  ALL_ROLES,
  MAX_ROLE_SELECTIONS,
  INDUSTRY_OPTIONS,
  LOCATION_OPTIONS,
} from "@/lib/constants/onboarding";
import type { OnboardingInput } from "@/lib/validations/onboarding";

interface StepInterestsProps {
  watch: UseFormWatch<OnboardingInput>;
  setValue: UseFormSetValue<OnboardingInput>;
  errors: FieldErrors<OnboardingInput>;
}

export function StepInterests({
  watch,
  setValue,
  errors,
}: StepInterestsProps) {
  const t = useTranslations("onboarding");
  const roleInterests = watch("roleInterests");
  const skills = watch("skills");
  const industries = watch("industries");
  const preferredLocations = watch("preferredLocations");

  return (
    <div className="space-y-6">
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

      <div>
        <MultiSelectChips
          label={t("preferredLocation")}
          options={LOCATION_OPTIONS}
          selected={preferredLocations || []}
          onChange={(selected) => setValue("preferredLocations", selected)}
        />
      </div>
    </div>
  );
}
