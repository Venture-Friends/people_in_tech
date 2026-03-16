"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FollowButton } from "@/components/shared/follow-button";
import { ClaimCompanyModal } from "@/components/company/claim-company-modal";
import {
  ExternalLink,
  Linkedin,
  MapPin,
  Users,
  ArrowRight,
  Clock,
} from "lucide-react";

interface CompanyHeroProps {
  id: string;
  name: string;
  description: string | null;
  industry: string;
  logo: string | null;
  coverImage: string | null;
  size: string;
  status: string;
  website: string | null;
  linkedinUrl: string | null;
  locations: string[];
  initialFollowed: boolean;
  followerCount: number;
  userHasPendingClaim?: boolean;
}

const SIZE_LABELS: Record<string, string> = {
  TINY: "1-10",
  SMALL: "11-50",
  MEDIUM: "51-200",
  LARGE: "200+",
};

export function CompanyHero({
  id,
  name,
  description,
  industry,
  logo,
  coverImage,
  size,
  status,
  website,
  linkedinUrl,
  locations,
  initialFollowed,
  followerCount,
  userHasPendingClaim = false,
}: CompanyHeroProps) {
  const t = useTranslations("company");
  const [claimModalOpen, setClaimModalOpen] = useState(false);

  const tagline =
    description && description.length > 150
      ? description.slice(0, 150) + "..."
      : description;

  const firstLetter = name.charAt(0).toUpperCase();

  return (
    <div className="overflow-hidden rounded-t-[20px] border border-white/[0.06] bg-gradient-to-b from-card to-surface-2">
      {/* Cover image area */}
      <div className="relative h-40">
        {coverImage ? (
          <img
            src={coverImage}
            alt={`${name} cover`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
        )}
      </div>

      {/* Content */}
      <div className="relative px-4 pb-6 sm:px-6">
        {/* Logo */}
        <div className="-mt-9 mb-4">
          {logo ? (
            <img
              src={logo}
              alt={name}
              className="size-[72px] rounded-2xl border-4 border-background bg-background object-cover"
            />
          ) : (
            <div className="flex size-[72px] items-center justify-center rounded-2xl border-4 border-background bg-surface-2 text-xl font-bold text-white">
              {firstLetter}
            </div>
          )}
        </div>

        {/* Name */}
        <div className="flex items-center gap-2">
          <h1 className="font-display text-[26px] font-bold text-foreground">{name}</h1>
          {status === "VERIFIED" && (
            <svg
              className="size-5 shrink-0"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="10" cy="10" r="10" fill="#22c55e" />
              <path
                d="M6 10.5l2.5 2.5 5.5-5.5"
                stroke="white"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        {/* Description tagline */}
        {tagline && (
          <p className="mt-2 text-sm text-white/40 leading-relaxed max-w-[600px]">
            {tagline}
          </p>
        )}

        {/* Badges row */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/[0.04] border border-white/[0.06] px-3 py-1 text-xs text-white/40">
            {industry}
          </span>
          {locations.map((loc) => (
            <span
              key={loc}
              className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] border border-white/[0.06] px-3 py-1 text-xs text-white/40"
            >
              <MapPin className="size-3" />
              {loc}
            </span>
          ))}
          {SIZE_LABELS[size] && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] border border-white/[0.06] px-3 py-1 text-xs text-white/40">
              <Users className="size-3" />
              {SIZE_LABELS[size]}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <FollowButton
            companyId={id}
            initialFollowed={initialFollowed}
            initialCount={followerCount}
          />
          {website && (
            <a href={website} target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-white/[0.06] text-white/50"
              >
                {t("website")}
                <ExternalLink className="size-3.5" />
              </Button>
            </a>
          )}
          {linkedinUrl && (
            <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-white/[0.06] text-white/50"
              >
                LinkedIn
                <Linkedin className="size-3.5" />
              </Button>
            </a>
          )}
        </div>

        {/* Status / Claim section */}
        <div className="mt-4">
          {status === "CLAIMED" || userHasPendingClaim ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] border border-white/[0.06] px-3 py-1 text-xs text-white/40">
              <Clock className="size-3" />
              {t("claimPending")}
            </span>
          ) : status !== "VERIFIED" ? (
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/[0.04] border border-white/[0.06] px-3 py-1 text-xs text-white/40">
                Auto-generated profile
              </span>
              <Button
                variant="link"
                size="sm"
                className="gap-1 px-0 text-primary"
                onClick={() => setClaimModalOpen(true)}
              >
                {t("claimPage")}
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Claim modal */}
      <ClaimCompanyModal
        companyId={id}
        companyName={name}
        isOpen={claimModalOpen}
        onOpenChange={setClaimModalOpen}
      />
    </div>
  );
}
