"use client";

import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Briefcase, CheckCircle, AlertCircle, MapPin } from "lucide-react";

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
  };
  return colors[industry] || "bg-primary/80";
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
    <Card className="card-glow rounded-xl border-border bg-card transition-all">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          {company.logo ? (
            <img
              src={company.logo}
              alt={company.name}
              className="size-10 rounded-lg object-cover"
            />
          ) : (
            <div
              className={`flex size-10 items-center justify-center rounded-lg text-sm font-bold text-white ${getIndustryColor(company.industry)}`}
            >
              {firstLetter}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <Link
              href={`/companies/${company.slug}`}
              className="block truncate font-semibold text-foreground hover:text-primary transition-colors"
            >
              {company.name}
            </Link>
            <Badge variant="secondary" className="mt-1">
              {company.industry}
            </Badge>
          </div>
        </div>

        {firstLocation && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{firstLocation}</span>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border pt-3">
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
          <Badge
            variant={company.status === "VERIFIED" ? "default" : "outline"}
            className="text-[10px]"
          >
            {company.status === "VERIFIED" ? (
              <span className="flex items-center gap-0.5">
                <CheckCircle className="size-3" />
                Verified
              </span>
            ) : (
              <span className="flex items-center gap-0.5">
                <AlertCircle className="size-3" />
                Auto-generated
              </span>
            )}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
