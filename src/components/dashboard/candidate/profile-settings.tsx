"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MultiSelectChips } from "@/components/shared/multi-select-chips";
import { TagInput } from "@/components/shared/tag-input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

const LOCATION_OPTIONS = [
  "Athens",
  "Thessaloniki",
  "Remote",
  "Anywhere in Greece",
];

const EXPERIENCE_LEVELS = [
  { value: "STUDENT", label: "Student" },
  { value: "GRADUATE", label: "Graduate" },
  { value: "JUNIOR", label: "Junior" },
] as const;

export interface ProfileData {
  name: string;
  headline: string;
  linkedinUrl: string;
  experienceLevel: string;
  skills: string[];
  roleInterests: string[];
  industries: string[];
  preferredLocations: string[];
  emailDigest: boolean;
  emailEvents: boolean;
  emailNewsletter: boolean;
}

interface ProfileSettingsProps {
  profile: ProfileData;
}

export function ProfileSettings({ profile }: ProfileSettingsProps) {
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProfileData>({
    defaultValues: profile,
  });

  const experienceLevel = watch("experienceLevel");
  const skills = watch("skills");
  const roleInterests = watch("roleInterests");
  const industries = watch("industries");
  const preferredLocations = watch("preferredLocations");
  const emailDigest = watch("emailDigest");
  const emailEvents = watch("emailEvents");
  const emailNewsletter = watch("emailNewsletter");

  async function onSubmit(data: ProfileData) {
    setSaving(true);
    try {
      const res = await fetch("/api/candidate/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left column: Profile */}
      <div>
        <h3 className="font-display text-lg font-semibold mb-4">Profile</h3>
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[13px] text-white/50">Name</Label>
            <Input
              id="name"
              className="rounded-[14px] border-white/[0.07] bg-white/[0.03]"
              {...register("name", { required: "Name is required", minLength: { value: 2, message: "Name must be at least 2 characters" } })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="headline" className="text-[13px] text-white/50">Headline</Label>
            <Input
              id="headline"
              placeholder="e.g. Full-Stack Developer"
              className="rounded-[14px] border-white/[0.07] bg-white/[0.03]"
              {...register("headline")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedinUrl" className="text-[13px] text-white/50">LinkedIn URL</Label>
            <Input
              id="linkedinUrl"
              placeholder="https://linkedin.com/in/yourprofile"
              className="rounded-[14px] border-white/[0.07] bg-white/[0.03]"
              {...register("linkedinUrl")}
            />
          </div>

          {/* Experience Level */}
          <div className="space-y-3">
            <p className="text-[13px] font-medium text-white/50">Experience Level</p>
            <div className="grid grid-cols-3 gap-3">
              {EXPERIENCE_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setValue("experienceLevel", level.value)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm cursor-pointer transition-all duration-150",
                    experienceLevel === level.value
                      ? "border-primary/[0.25] bg-primary/[0.05] text-primary"
                      : "border-white/[0.06] bg-white/[0.02] text-white/[0.45] hover:border-white/[0.12]"
                  )}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label className="text-[13px] text-white/50 mb-3">Skills</Label>
            <TagInput
              tags={skills || []}
              onChange={(tags) => setValue("skills", tags)}
              placeholder="Add a skill..."
            />
          </div>

          <MultiSelectChips
            label="Role Interests"
            options={ROLE_OPTIONS}
            selected={roleInterests || []}
            onChange={(selected) => setValue("roleInterests", selected)}
          />

          {/* Save Button */}
          <Button type="submit" disabled={saving} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Right column: Preferences */}
      <div>
        <h3 className="font-display text-lg font-semibold mb-4">Preferences</h3>
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-6 space-y-6">
          <MultiSelectChips
            label="Industries"
            options={INDUSTRY_OPTIONS}
            selected={industries || []}
            onChange={(selected) => setValue("industries", selected)}
          />

          <MultiSelectChips
            label="Preferred Locations"
            options={LOCATION_OPTIONS}
            selected={preferredLocations || []}
            onChange={(selected) => setValue("preferredLocations", selected)}
          />

          {/* Email Preferences */}
          <div className="space-y-4">
            <p className="text-[13px] font-medium text-white/50">Email Notifications</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailDigest" className="cursor-pointer text-sm text-white/60">
                  Weekly Digest
                </Label>
                <Switch
                  id="emailDigest"
                  checked={emailDigest}
                  onCheckedChange={(checked: boolean) =>
                    setValue("emailDigest", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="emailEvents" className="cursor-pointer text-sm text-white/60">
                  Event Announcements
                </Label>
                <Switch
                  id="emailEvents"
                  checked={emailEvents}
                  onCheckedChange={(checked: boolean) =>
                    setValue("emailEvents", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="emailNewsletter" className="cursor-pointer text-sm text-white/60">
                  Community Newsletter
                </Label>
                <Switch
                  id="emailNewsletter"
                  checked={emailNewsletter}
                  onCheckedChange={(checked: boolean) =>
                    setValue("emailNewsletter", checked)
                  }
                />
              </div>
            </div>
          </div>

          {/* Danger zone */}
          <div className="pt-4 border-t border-white/[0.05]">
            <Button
              type="button"
              variant="outline"
              className="text-red-400 border-red-400/20 hover:bg-red-400/10 hover:text-red-400"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
