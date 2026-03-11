"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FollowButton } from "@/components/shared/follow-button";
import { ClaimCompanyModal } from "@/components/company/claim-company-modal";
import {
  ExternalLink,
  Linkedin,
  CheckCircle,
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

function getIndustryColor(industry: string): string {
  const colors: Record<string, string> = {
    Fintech: "bg-emerald-600",
    "E-commerce": "bg-blue-600",
    SaaS: "bg-violet-600",
    AI: "bg-amber-600",
    Healthtech: "bg-rose-600",
    Edtech: "bg-cyan-600",
    Cybersecurity: "bg-red-600",
    Gaming: "bg-purple-600",
    Logistics: "bg-orange-600",
    Greentech: "bg-green-600",
    "HR Tech": "bg-teal-600",
    PropTech: "bg-indigo-600",
    TravelTech: "bg-sky-600",
    DevTools: "bg-slate-600",
  };
  return colors[industry] || "bg-primary/80";
}

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
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Cover image area */}
      <div className="relative h-32 sm:h-48">
        {coverImage ? (
          <img
            src={coverImage}
            alt={`${name} cover`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/30 via-primary/10 to-card" />
        )}
      </div>

      {/* Content */}
      <div className="relative px-4 pb-6 sm:px-6">
        {/* Logo */}
        <div className="-mt-10 mb-4 sm:-mt-12">
          {logo ? (
            <img
              src={logo}
              alt={name}
              className="size-20 rounded-xl border-4 border-card bg-card object-cover"
            />
          ) : (
            <div
              className={`flex size-20 items-center justify-center rounded-xl border-4 border-card text-2xl font-bold text-white ${getIndustryColor(industry)}`}
            >
              {firstLetter}
            </div>
          )}
        </div>

        {/* Name and tagline */}
        <h1 className="text-3xl font-bold text-foreground">{name}</h1>
        {tagline && (
          <p className="mt-1 text-muted-foreground">{tagline}</p>
        )}

        {/* Badges row */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="bg-teal-500/20 text-teal-400 border-teal-500/30"
          >
            {industry}
          </Badge>
          {locations.map((loc) => (
            <Badge key={loc} variant="secondary" className="gap-1">
              <MapPin className="size-3" />
              {loc}
            </Badge>
          ))}
          {SIZE_LABELS[size] && (
            <Badge variant="secondary" className="gap-1">
              <Users className="size-3" />
              {SIZE_LABELS[size]}
            </Badge>
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
              <Button variant="outline" size="sm" className="gap-1.5">
                {t("website")}
                <ExternalLink className="size-3.5" />
              </Button>
            </a>
          )}
          {linkedinUrl && (
            <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5">
                LinkedIn
                <Linkedin className="size-3.5" />
              </Button>
            </a>
          )}
        </div>

        {/* Status badge */}
        <div className="mt-4">
          {status === "VERIFIED" ? (
            <Badge
              variant="outline"
              className="gap-1 border-green-500/30 bg-green-500/20 text-green-400"
            >
              <CheckCircle className="size-3" />
              {t("verifiedEmployer")}
            </Badge>
          ) : status === "CLAIMED" || userHasPendingClaim ? (
            <Badge variant="secondary" className="gap-1">
              <Clock className="size-3" />
              {t("claimPending")}
            </Badge>
          ) : (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-muted-foreground">
                Auto-generated profile
              </Badge>
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
          )}
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
