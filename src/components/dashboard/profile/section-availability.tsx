"use client";

import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, MapPin, DollarSign } from "lucide-react";
import type { ProfileFormData } from "./types";

interface SectionAvailabilityProps {
  register: UseFormRegister<ProfileFormData>;
  watch: UseFormWatch<ProfileFormData>;
  setValue: UseFormSetValue<ProfileFormData>;
}

const AVAILABILITY_OPTIONS = [
  { value: "NOT_SPECIFIED", label: "Not specified" },
  { value: "OPEN_TO_WORK", label: "Open to work" },
  { value: "NOT_LOOKING", label: "Not looking" },
  { value: "OPEN_TO_FREELANCE", label: "Open to freelance" },
];

const WORK_TYPE_OPTIONS = [
  { value: "NOT_SPECIFIED", label: "Not specified" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "ONSITE", label: "On-site" },
];

const EXPERIENCE_LEVELS = [
  { value: "STUDENT", label: "Student" },
  { value: "JUNIOR", label: "Junior" },
  { value: "MID", label: "Mid-level" },
  { value: "SENIOR", label: "Senior" },
  { value: "LEAD", label: "Lead" },
  { value: "MANAGER", label: "Manager" },
  { value: "DIRECTOR", label: "Director" },
];

export function SectionAvailability({
  register,
  watch,
  setValue,
}: SectionAvailabilityProps) {
  const availability = watch("availability");
  const preferredWorkType = watch("preferredWorkType");
  const experienceLevel = watch("experienceLevel");

  return (
    <div className="space-y-6">
      {/* Availability */}
      <div className="space-y-2">
        <Label className="text-sm text-white/50">
          <Clock className="mr-1.5 inline size-3.5" />
          Availability
        </Label>
        <div className="flex flex-wrap gap-2">
          {AVAILABILITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                setValue("availability", opt.value, { shouldDirty: true })
              }
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                availability === opt.value
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/[0.12] hover:text-white/60"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preferred Work Type */}
      <div className="space-y-2">
        <Label className="text-sm text-white/50">
          <MapPin className="mr-1.5 inline size-3.5" />
          Preferred Work Type
        </Label>
        <div className="flex flex-wrap gap-2">
          {WORK_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                setValue("preferredWorkType", opt.value, { shouldDirty: true })
              }
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                preferredWorkType === opt.value
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/[0.12] hover:text-white/60"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div className="space-y-2">
        <Label className="text-sm text-white/50">Experience Level</Label>
        <div className="flex flex-wrap gap-2">
          {EXPERIENCE_LEVELS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                setValue("experienceLevel", opt.value, { shouldDirty: true })
              }
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                experienceLevel === opt.value
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/[0.12] hover:text-white/60"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Salary Expectation */}
      <div className="space-y-2">
        <Label htmlFor="salaryExpectation" className="text-sm text-white/50">
          <DollarSign className="mr-1.5 inline size-3.5" />
          Salary Expectation
          <span className="ml-1.5 text-[10px] text-white/25">(private)</span>
        </Label>
        <Input
          id="salaryExpectation"
          {...register("salaryExpectation")}
          placeholder="e.g. 50-60k EUR, negotiable"
          className="bg-white/[0.04] border-white/[0.06] placeholder:text-white/20"
        />
        <p className="text-[10px] text-white/20">
          This is private and only visible to you.
        </p>
      </div>
    </div>
  );
}
