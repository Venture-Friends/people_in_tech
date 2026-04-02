"use client";

import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, ExternalLink, ShieldAlert } from "lucide-react";
import type { ProfileFormData } from "./types";

interface SectionVisibilityProps {
  watch: UseFormWatch<ProfileFormData>;
  setValue: UseFormSetValue<ProfileFormData>;
  userId: string | null;
  isAdmin: boolean;
}

export function SectionVisibility({
  watch,
  setValue,
  userId,
  isAdmin,
}: SectionVisibilityProps) {
  const isProfilePublic = watch("isProfilePublic");

  return (
    <div className="space-y-4">
      {/* Toggle */}
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
              setValue("isProfilePublic", !!checked, { shouldDirty: true })
            }
          />
        </div>
      </div>

      {/* Admin note or public link */}
      {isAdmin ? (
        <div className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-white/40">
          <ShieldAlert className="size-4 text-amber-400/60" />
          Admin profiles are internal only and not publicly visible
        </div>
      ) : (
        isProfilePublic &&
        userId && (
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
    </div>
  );
}
