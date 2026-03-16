"use client";

import { Link } from "@/i18n/navigation";

export interface CompanyCardData {
  name: string;
  slug: string;
  industry: string;
  logo: string | null;
  locations: string;
  status: string;
  followerCount: number;
  jobCount: number;
  founded?: number;
  technologies?: string;
  size?: string;
}

function parseLocations(locationsJson: string): string[] {
  try {
    const parsed = JSON.parse(locationsJson);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // ignore
  }
  return [locationsJson];
}

function parseTechnologies(tech?: string): string[] {
  if (!tech) return [];
  try {
    const parsed = JSON.parse(tech);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    return tech.split(",").map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

const SIZE_LABELS: Record<string, string> = {
  TINY: "1-10",
  SMALL: "11-50",
  MEDIUM: "51-200",
  LARGE: "200+",
};

export function CompanyCard({ company }: { company: CompanyCardData }) {
  const locations = parseLocations(company.locations);
  const technologies = parseTechnologies(company.technologies);
  const firstLetter = company.name.charAt(0).toUpperCase();

  return (
    <Link href={`/companies/${company.slug}`} className="block">
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-[22px] transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.04] hover:-translate-y-[3px] hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)]">
        {/* Header: Logo + Name + Meta */}
        <div className="flex items-start gap-3">
          {company.logo ? (
            <img
              src={company.logo}
              alt={company.name}
              className="size-11 rounded-[11px] object-cover"
            />
          ) : (
            <div className="flex size-11 items-center justify-center rounded-[11px] bg-white/[0.06] text-sm font-bold text-foreground">
              {firstLetter}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[15px] font-semibold text-foreground">
                {company.name}
              </span>
              {company.status === "VERIFIED" && (
                <svg className="size-4 shrink-0 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="mt-0.5 text-xs text-white/30">
              {company.industry} · {locations[0] || "Greece"}
            </p>
          </div>
        </div>

        {/* Tech tags */}
        {technologies.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {technologies.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="rounded-md bg-white/[0.03] border border-white/[0.04] px-2 py-0.5 text-[11px] text-white/40"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-3">
          <span className="text-xs text-white/30">
            {company.founded ? `Founded ${company.founded}` : ""}
            {company.founded && company.size ? " · " : ""}
            {company.size ? SIZE_LABELS[company.size] || company.size : ""}
          </span>
          <span className={`text-xs font-medium ${company.jobCount > 0 ? "text-primary" : "text-white/30"}`}>
            {company.jobCount} open role{company.jobCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </Link>
  );
}
