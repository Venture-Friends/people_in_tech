"use client";

import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Briefcase, CheckCircle, MapPin } from "lucide-react";

export interface CompanyCardData {
  name: string;
  slug: string;
  industry: string;
  logo: string | null;
  locations: string;
  status: string;
  followerCount: number;
  jobCount: number;
}

function parseFirstLocation(locationsJson: string): string | null {
  try {
    const parsed = JSON.parse(locationsJson);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed[0];
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

export function CompanyCard({ company }: { company: CompanyCardData }) {
  const firstLocation = parseFirstLocation(company.locations);
  const firstLetter = company.name.charAt(0).toUpperCase();

  return (
    <Card className="rounded-xl border-white/[0.06] bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-[oklch(0.16_0.01_260)]">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          {company.logo ? (
            <img
              src={company.logo}
              alt={company.name}
              className="size-10 rounded-lg object-cover"
            />
          ) : (
            <div className="flex size-10 items-center justify-center rounded-lg bg-surface-2 text-sm font-bold text-foreground">
              {firstLetter}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Link
                href={`/companies/${company.slug}`}
                className="block truncate font-semibold text-foreground hover:text-primary transition-colors"
              >
                {company.name}
              </Link>
              {company.status === "VERIFIED" && (
                <CheckCircle className="size-3.5 shrink-0 text-primary" />
              )}
            </div>
            <span className="mt-1 inline-flex items-center rounded-md bg-white/[0.06] border border-white/[0.04] px-2 py-0.5 text-xs text-muted-foreground">
              {company.industry}
            </span>
          </div>
        </div>

        {firstLocation && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{firstLocation}</span>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
          <div className="flex items-center gap-3">
            <span
              className={`flex items-center gap-1 text-xs font-medium ${
                company.jobCount > 0 ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Briefcase className="size-3.5" />
              {company.jobCount} open roles
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Heart className="size-3.5" />
              {company.followerCount}
            </span>
          </div>
          {company.status !== "VERIFIED" && (
            <span className="inline-flex items-center rounded-md bg-white/[0.06] border border-white/[0.04] px-2 py-0.5 text-xs text-muted-foreground">
              Auto-generated
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
