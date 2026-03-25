"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Loader2,
  ExternalLink,
  User,
  Globe,
  Linkedin,
  FileText,
  Eye,
  EyeOff,
  Camera,
  ShieldAlert,
} from "lucide-react";

interface ProfileFormData {
  name: string;
  avatarUrl: string;
  bio: string;
  publicTitle: string;
  linkedinUrl: string;
  website: string;
  isProfilePublic: boolean;
}

export function ProfileEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: "",
      avatarUrl: "",
      bio: "",
      publicTitle: "",
      linkedinUrl: "",
      website: "",
      isProfilePublic: false,
    },
  });

  const bio = watch("bio");
  const avatarUrl = watch("avatarUrl");
  const isProfilePublic = watch("isProfilePublic");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        const user = data.user;
        setUserId(user.id);
        reset({
          name: user.name || "",
          avatarUrl: user.avatarUrl || "",
          bio: user.bio || "",
          publicTitle: user.publicTitle || "",
          linkedinUrl: user.linkedinUrl || "",
          website: user.website || "",
          isProfilePublic: user.isProfilePublic || false,
        });
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

      const result = await res.json();
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

    // Reset input so same file can be re-selected
    e.target.value = "";

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Avatar preview + Upload */}
      <div className="space-y-3">
        <Label className="text-sm text-white/50">Avatar</Label>
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
            {/* Hover overlay */}
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
            <Input
              {...register("avatarUrl")}
              placeholder="https://example.com/avatar.jpg"
              className="bg-white/[0.04] border-white/[0.06] placeholder:text-white/20"
            />
            <p className="mt-1 text-xs text-white/25">
              Click the avatar to upload, or paste a URL
            </p>
          </div>
        </div>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm text-white/50">
          <User className="mr-1.5 inline size-3.5" />
          Name
        </Label>
        <Input
          id="name"
          {...register("name", { required: "Name is required" })}
          placeholder="Your full name"
          className="bg-white/[0.04] border-white/[0.06] placeholder:text-white/20"
        />
        {errors.name && (
          <p className="text-xs text-red-400">{errors.name.message}</p>
        )}
      </div>

      {/* Public Title */}
      <div className="space-y-2">
        <Label htmlFor="publicTitle" className="text-sm text-white/50">
          <FileText className="mr-1.5 inline size-3.5" />
          Public Title
        </Label>
        <Input
          id="publicTitle"
          {...register("publicTitle")}
          placeholder="e.g. Frontend Engineer, Product Designer"
          className="bg-white/[0.04] border-white/[0.06] placeholder:text-white/20"
        />
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="bio" className="text-sm text-white/50">
            Bio
          </Label>
          <span
            className={`text-xs tabular-nums ${
              (bio?.length || 0) > 450 ? "text-amber-400" : "text-white/25"
            }`}
          >
            {bio?.length || 0}/500
          </span>
        </div>
        <Textarea
          id="bio"
          {...register("bio", { maxLength: 500 })}
          placeholder="A short bio about yourself"
          rows={4}
          maxLength={500}
          className="bg-white/[0.04] border-white/[0.06] placeholder:text-white/20 resize-none"
        />
      </div>

      {/* LinkedIn URL */}
      <div className="space-y-2">
        <Label htmlFor="linkedinUrl" className="text-sm text-white/50">
          <Linkedin className="mr-1.5 inline size-3.5" />
          LinkedIn URL
        </Label>
        <Input
          id="linkedinUrl"
          {...register("linkedinUrl")}
          placeholder="https://linkedin.com/in/yourname"
          className="bg-white/[0.04] border-white/[0.06] placeholder:text-white/20"
        />
      </div>

      {/* Website */}
      <div className="space-y-2">
        <Label htmlFor="website" className="text-sm text-white/50">
          <Globe className="mr-1.5 inline size-3.5" />
          Website
        </Label>
        <Input
          id="website"
          {...register("website")}
          placeholder="https://yourwebsite.com"
          className="bg-white/[0.04] border-white/[0.06] placeholder:text-white/20"
        />
      </div>

      {/* Profile Visibility Toggle */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isProfilePublic ? (
              <Eye className="size-5 text-emerald-400" />
            ) : (
              <EyeOff className="size-5 text-white/30" />
            )}
            <div>
              <p className="text-sm font-medium text-white/80">
                Make profile public
              </p>
              <p className="text-xs text-white/30">
                {isProfilePublic
                  ? "Your profile is visible to everyone"
                  : "Your profile is private and hidden from search"}
              </p>
            </div>
          </div>
          <Switch
            checked={isProfilePublic}
            onCheckedChange={(checked) =>
              setValue("isProfilePublic", checked, { shouldDirty: true })
            }
          />
        </div>
      </div>

      {/* View Public Profile link / Admin note */}
      {isAdmin ? (
        <div className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-white/40">
          <ShieldAlert className="size-4 text-amber-400/60" />
          Admin profiles are internal only and not publicly visible
        </div>
      ) : (
        isProfilePublic && userId && (
          <a
            href={`/people/${userId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-emerald-400/70 transition-colors hover:text-emerald-400"
          >
            <ExternalLink className="size-3.5" />
            View Public Profile
          </a>
        )
      )}

      {/* Save button */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={saving || !isDirty}>
          {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
          Save Changes
        </Button>
        {isDirty && (
          <span className="text-xs text-amber-400/60">Unsaved changes</span>
        )}
      </div>
    </form>
  );
}
