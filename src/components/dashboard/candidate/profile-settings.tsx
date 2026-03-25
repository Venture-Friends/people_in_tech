"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { signOut } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { MultiSelectChips } from "@/components/shared/multi-select-chips";
import { SkillPicker } from "@/components/shared/skill-picker";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  EXPERIENCE_LEVELS,
  EXPERIENCE_LABEL_MAP,
  ALL_ROLES,
  INDUSTRY_OPTIONS,
  LOCATION_OPTIONS,
} from "@/lib/constants/onboarding";

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
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      const res = await fetch("/api/candidate/profile", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete account");
      }
      toast.success("Account deleted");
      document.cookie = "pit-active-context=; path=/; max-age=0";
      document.cookie = "next-auth.session-token=; path=/; max-age=0";
      document.cookie = "__Secure-next-auth.session-token=; path=/; max-age=0";
      await signOut({ callbackUrl: "/en/login" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete account");
      setDeleting(false);
    }
  }

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
            <div className="flex flex-wrap gap-2">
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
                  {EXPERIENCE_LABEL_MAP[level.value] || level.value}
                </button>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label className="text-[13px] text-white/50 mb-3">Skills</Label>
            <SkillPicker
              selected={skills || []}
              onChange={(skills) => setValue("skills", skills)}
              placeholder="Search or add a skill..."
            />
          </div>

          <MultiSelectChips
            label="Role Interests"
            options={ALL_ROLES}
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
              onClick={() => setDeleteOpen(true)}
            >
              Delete Account
            </Button>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete your account?</DialogTitle>
                  <DialogDescription>
                    This will permanently delete your account, profile, and all saved data. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>
                    Cancel
                  </DialogClose>
                  <Button
                    variant="destructive"
                    disabled={deleting}
                    onClick={handleDeleteAccount}
                  >
                    {deleting && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Delete Account
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </form>
  );
}
