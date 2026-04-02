"use client";

import { UseFormRegister, UseFormWatch, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { User, FileText, Linkedin, Globe, Github, Briefcase } from "lucide-react";
import type { ProfileFormData } from "./types";

interface SectionAboutProps {
  register: UseFormRegister<ProfileFormData>;
  watch: UseFormWatch<ProfileFormData>;
  errors: FieldErrors<ProfileFormData>;
}

export function SectionAbout({ register, watch, errors }: SectionAboutProps) {
  const bio = watch("bio");

  return (
    <div className="space-y-6">
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

      {/* Headline */}
      <div className="space-y-2">
        <Label htmlFor="headline" className="text-sm text-white/50">
          <Briefcase className="mr-1.5 inline size-3.5" />
          Headline
        </Label>
        <Input
          id="headline"
          {...register("headline")}
          placeholder="A one-line headline for your profile"
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

      {/* Portfolio URL */}
      <div className="space-y-2">
        <Label htmlFor="portfolioUrl" className="text-sm text-white/50">
          <Globe className="mr-1.5 inline size-3.5" />
          Portfolio URL
        </Label>
        <Input
          id="portfolioUrl"
          {...register("portfolioUrl")}
          placeholder="https://your-portfolio.com"
          className="bg-white/[0.04] border-white/[0.06] placeholder:text-white/20"
        />
      </div>

      {/* GitHub URL */}
      <div className="space-y-2">
        <Label htmlFor="githubUrl" className="text-sm text-white/50">
          <Github className="mr-1.5 inline size-3.5" />
          GitHub URL
        </Label>
        <Input
          id="githubUrl"
          {...register("githubUrl")}
          placeholder="https://github.com/yourusername"
          className="bg-white/[0.04] border-white/[0.06] placeholder:text-white/20"
        />
      </div>
    </div>
  );
}
