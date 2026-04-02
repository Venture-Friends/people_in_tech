"use client";

import { UseFormWatch, UseFormSetValue } from "react-hook-form";
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
import type { ProfileFormData } from "./types";

interface SectionSkillsProps {
  watch: UseFormWatch<ProfileFormData>;
  setValue: UseFormSetValue<ProfileFormData>;
}

export function SectionSkills({ watch, setValue }: SectionSkillsProps) {
  const roleInterests = watch("roleInterests") || [];
  const skills = watch("skills") || [];
  const industries = watch("industries") || [];
  const preferredLocations = watch("preferredLocations") || [];

  return (
    <div className="space-y-6">
      <div>
        <ComboboxMultiSelect
          label="Role Interests"
          options={ALL_ROLES}
          groups={ROLE_GROUPS as unknown as Record<string, string[]>}
          selected={roleInterests}
          onChange={(selected) =>
            setValue("roleInterests", selected, { shouldDirty: true })
          }
          max={MAX_ROLE_SELECTIONS}
          placeholder="Search roles..."
        />
      </div>

      <div>
        <Label className="mb-2 text-[13px] font-medium text-white/50">
          Skills
        </Label>
        <SkillPicker
          selected={skills}
          onChange={(s) => setValue("skills", s, { shouldDirty: true })}
          placeholder="Add skill..."
        />
      </div>

      <div>
        <ComboboxMultiSelect
          label="Industries"
          options={INDUSTRY_OPTIONS}
          selected={industries}
          onChange={(selected) =>
            setValue("industries", selected, { shouldDirty: true })
          }
          placeholder="Search industries..."
        />
      </div>

      <div>
        <MultiSelectChips
          label="Preferred Locations"
          options={LOCATION_OPTIONS}
          selected={preferredLocations}
          onChange={(selected) =>
            setValue("preferredLocations", selected, { shouldDirty: true })
          }
        />
      </div>
    </div>
  );
}
