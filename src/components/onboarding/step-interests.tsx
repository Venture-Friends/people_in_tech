"use client";

import { UseFormWatch, UseFormSetValue, FieldErrors } from "react-hook-form";
import { useTranslations } from "next-intl";
import { MultiSelectChips } from "@/components/shared/multi-select-chips";
import { TagInput } from "@/components/shared/tag-input";
import { Label } from "@/components/ui/label";
import type { OnboardingInput } from "@/lib/validations/onboarding";

interface StepInterestsProps {
  watch: UseFormWatch<OnboardingInput>;
  setValue: UseFormSetValue<OnboardingInput>;
  errors: FieldErrors<OnboardingInput>;
}

const ROLE_OPTIONS = [
  "Frontend",
  "Backend",
  "Full-Stack",
  "Data",
  "Design",
  "Product",
  "DevOps",
  "Marketing",
  "Sales",
  "Operations",
];

const INDUSTRY_OPTIONS = [
  "FinTech",
  "HealthTech",
  "EdTech",
  "SaaS",
  "E-commerce",
  "AI/ML",
  "Cybersecurity",
  "Gaming",
  "IoT",
];

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
          options={ROLE_OPTIONS}
          selected={roleInterests || []}
          onChange={(selected) => setValue("roleInterests", selected, { shouldValidate: true })}
        />
        {errors.roleInterests && (
          <p className="text-sm text-destructive mt-1">
            {errors.roleInterests.message}
          </p>
        )}
      </div>

      <div>
        <Label className="mb-3 text-[13px] font-medium text-white/50">{t("skills")}</Label>
        <TagInput
          tags={skills || []}
          onChange={(tags) => setValue("skills", tags)}
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
