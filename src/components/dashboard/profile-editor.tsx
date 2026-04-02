"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  User,
  Camera,
  Eye,
  Pencil,
} from "lucide-react";

import type {
  ProfileFormData,
  FullProfileData,
  WorkExperienceEntry,
  EducationEntry,
  CertificationEntry,
  SpokenLanguageEntry,
} from "./profile/types";
import { ProfileCompleteness } from "./profile/profile-completeness";
import { ProfilePreview } from "./profile/profile-preview";
import { SectionAbout } from "./profile/section-about";
import { SectionAvailability } from "./profile/section-availability";
import { SectionExperience } from "./profile/section-experience";
import { SectionEducation } from "./profile/section-education";
import { SectionCertifications } from "./profile/section-certifications";
import { SectionLanguages } from "./profile/section-languages";
import { SectionSkills } from "./profile/section-skills";
import { SectionCvUpload } from "./profile/section-cv-upload";
import { SectionVisibility } from "./profile/section-visibility";

type TabId = "edit" | "preview";

const defaultFormValues: ProfileFormData = {
  name: "",
  avatarUrl: "",
  bio: "",
  publicTitle: "",
  linkedinUrl: "",
  website: "",
  isProfilePublic: false,
  headline: "",
  experienceLevel: "STUDENT",
  skills: [],
  roleInterests: [],
  industries: [],
  preferredLocations: [],
  portfolioUrl: "",
  githubUrl: "",
  availability: "NOT_SPECIFIED",
  preferredWorkType: "NOT_SPECIFIED",
  salaryExpectation: "",
};

export function ProfileEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("edit");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = authClient.useSession();

  // Relation data (managed outside react-hook-form)
  const [workExperiences, setWorkExperiences] = useState<WorkExperienceEntry[]>([]);
  const [educations, setEducations] = useState<EducationEntry[]>([]);
  const [certifications, setCertifications] = useState<CertificationEntry[]>([]);
  const [spokenLanguages, setSpokenLanguages] = useState<SpokenLanguageEntry[]>([]);
  const [cvUrl, setCvUrl] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    getValues,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    defaultValues: defaultFormValues,
  });

  const avatarUrl = watch("avatarUrl");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        const user = data.user;
        const cp = user.candidateProfile;
        setUserId(user.id);

        reset({
          name: user.name || "",
          avatarUrl: user.avatarUrl || "",
          bio: user.bio || "",
          publicTitle: user.publicTitle || "",
          linkedinUrl: user.linkedinUrl || "",
          website: user.website || "",
          isProfilePublic: user.isProfilePublic || false,
          headline: cp?.headline || "",
          experienceLevel: cp?.experienceLevel || "STUDENT",
          skills: cp?.skills || [],
          roleInterests: cp?.roleInterests || [],
          industries: cp?.industries || [],
          preferredLocations: cp?.preferredLocations || [],
          portfolioUrl: cp?.portfolioUrl || "",
          githubUrl: cp?.githubUrl || "",
          availability: cp?.availability || "NOT_SPECIFIED",
          preferredWorkType: cp?.preferredWorkType || "NOT_SPECIFIED",
          salaryExpectation: cp?.salaryExpectation || "",
        });

        // Relation data
        setWorkExperiences(
          (cp?.workExperiences || []).map((we: Record<string, unknown>) => ({
            ...we,
            startDate:
              typeof we.startDate === "string"
                ? we.startDate
                : (we.startDate as Date)?.toISOString?.() || "",
            endDate: we.endDate
              ? typeof we.endDate === "string"
                ? we.endDate
                : (we.endDate as Date)?.toISOString?.() || ""
              : "",
          }))
        );
        setEducations(cp?.educations || []);
        setCertifications(cp?.certifications || []);
        setSpokenLanguages(cp?.spokenLanguages || []);
        setCvUrl(cp?.cvUrl || "");
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [reset]);

  async function onSubmit(data: ProfileFormData) {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save profile");
      }

      reset(data);
      toast.success("Profile saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save profile"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Allowed: PNG, JPG, GIF, WebP");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 2MB.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/profile/upload-avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const { avatarUrl } = await res.json();
      setValue("avatarUrl", avatarUrl, { shouldDirty: true });
      toast.success("Avatar uploaded");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload avatar"
      );
    } finally {
      setUploading(false);
    }
  }

  const isAdmin = session?.user?.role === "ADMIN";

  // Build full profile data for preview & completeness
  function buildFullData(): FullProfileData {
    const values = getValues();
    return {
      ...values,
      id: userId || "",
      email: session?.user?.email || "",
      cvUrl,
      workExperiences,
      educations,
      certifications,
      spokenLanguages,
    };
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Completeness indicator */}
      <ProfileCompleteness data={buildFullData()} />

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg bg-white/[0.03] p-1">
        <button
          type="button"
          onClick={() => setActiveTab("edit")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            activeTab === "edit"
              ? "bg-white/[0.08] text-white/80"
              : "text-white/30 hover:text-white/50"
          }`}
        >
          <Pencil className="size-3" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            activeTab === "preview"
              ? "bg-white/[0.08] text-white/80"
              : "text-white/30 hover:text-white/50"
          }`}
        >
          <Eye className="size-3" />
          Preview
        </button>
      </div>

      {/* ── Preview Tab ────────────────────────────────────────────── */}
      {activeTab === "preview" && (
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-6">
          <ProfilePreview data={buildFullData()} />
        </div>
      )}

      {/* ── Edit Tab ───────────────────────────────────────────────── */}
      {activeTab === "edit" && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Avatar */}
          <div className="space-y-3">
            <label className="text-sm text-white/50">Avatar</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative shrink-0 cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                disabled={uploading}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar preview"
                    className="size-16 rounded-full border-2 border-white/[0.08] object-cover transition-opacity group-hover:opacity-60"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex size-16 items-center justify-center rounded-full border-2 border-white/[0.08] bg-white/[0.04] transition-colors group-hover:border-emerald-500/30 group-hover:bg-white/[0.08]">
                    <User className="size-6 text-white/30" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  {uploading ? (
                    <Loader2 className="size-5 animate-spin text-white/70" />
                  ) : (
                    <Camera className="size-5 text-white/70" />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </button>
              <div className="flex-1">
                <p className="text-xs text-white/25">
                  Click the avatar to upload, or change the URL in the About section
                </p>
              </div>
            </div>
          </div>

          {/* ── About ──────────────────────────────────────────────── */}
          <section className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
            <SectionAbout
              register={register}
              watch={watch}
              errors={errors}
            />
          </section>

          {/* ── Availability & Work Preferences ────────────────────── */}
          <section className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
            <SectionAvailability
              register={register}
              watch={watch}
              setValue={setValue}
            />
          </section>

          {/* ── Skills & Interests ─────────────────────────────────── */}
          <section className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
            <SectionSkills watch={watch} setValue={setValue} />
          </section>

          {/* ── Work Experience ─────────────────────────────────────── */}
          <section className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
            <SectionExperience
              entries={workExperiences}
              onChange={setWorkExperiences}
            />
          </section>

          {/* ── Education ──────────────────────────────────────────── */}
          <section className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
            <SectionEducation
              entries={educations}
              onChange={setEducations}
            />
          </section>

          {/* ── Certifications ─────────────────────────────────────── */}
          <section className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
            <SectionCertifications
              entries={certifications}
              onChange={setCertifications}
            />
          </section>

          {/* ── Languages ──────────────────────────────────────────── */}
          <section className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
            <SectionLanguages
              entries={spokenLanguages}
              onChange={setSpokenLanguages}
            />
          </section>

          {/* ── CV Upload ──────────────────────────────────────────── */}
          <section className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
            <SectionCvUpload cvUrl={cvUrl} onCvChange={setCvUrl} />
          </section>

          {/* ── Visibility ─────────────────────────────────────────── */}
          <section className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
            <SectionVisibility
              watch={watch}
              setValue={setValue}
              userId={userId}
              isAdmin={isAdmin}
            />
          </section>

          {/* Save button */}
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={saving || !isDirty}>
              {saving ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Save className="mr-2 size-4" />
              )}
              Save Changes
            </Button>
            {isDirty && (
              <span className="text-xs text-amber-400/60">Unsaved changes</span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
