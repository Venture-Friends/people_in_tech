"use client";

import { useState, KeyboardEvent } from "react";
import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Code2, X } from "lucide-react";
import type { ProfileFormData } from "./types";

interface SectionSkillsProps {
  watch: UseFormWatch<ProfileFormData>;
  setValue: UseFormSetValue<ProfileFormData>;
}

export function SectionSkills({ watch, setValue }: SectionSkillsProps) {
  const skills = watch("skills") || [];
  const roleInterests = watch("roleInterests") || [];
  const industries = watch("industries") || [];
  const preferredLocations = watch("preferredLocations") || [];

  return (
    <div className="space-y-6">
      <TagField
        label="Skills"
        icon={<Code2 className="mr-1.5 inline size-3.5" />}
        tags={skills}
        onChange={(val) => setValue("skills", val, { shouldDirty: true })}
        placeholder="Type a skill and press Enter"
      />

      <TagField
        label="Role Interests"
        tags={roleInterests}
        onChange={(val) => setValue("roleInterests", val, { shouldDirty: true })}
        placeholder="e.g. Frontend, Backend, DevOps"
      />

      <TagField
        label="Industries"
        tags={industries}
        onChange={(val) => setValue("industries", val, { shouldDirty: true })}
        placeholder="e.g. FinTech, SaaS, E-commerce"
      />

      <TagField
        label="Preferred Locations"
        tags={preferredLocations}
        onChange={(val) =>
          setValue("preferredLocations", val, { shouldDirty: true })
        }
        placeholder="e.g. Athens, Remote, Thessaloniki"
      />
    </div>
  );
}

function TagField({
  label,
  icon,
  tags,
  onChange,
  placeholder,
}: {
  label: string;
  icon?: React.ReactNode;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = input.trim();
      if (value && !tags.includes(value)) {
        onChange([...tags, value]);
      }
      setInput("");
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  function remove(index: number) {
    onChange(tags.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm text-white/50">
        {icon}
        {label}
      </Label>

      {/* Tags display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, i) => (
            <span
              key={`${tag}-${i}`}
              className="inline-flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 text-xs text-white/60"
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(i)}
                className="ml-0.5 rounded-sm p-0.5 text-white/30 hover:text-white/60"
              >
                <X className="size-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="bg-white/[0.04] border-white/[0.06] placeholder:text-white/20"
      />
      <p className="text-[10px] text-white/20">
        Press Enter or comma to add. Backspace to remove last.
      </p>
    </div>
  );
}
