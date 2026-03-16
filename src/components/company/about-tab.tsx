"use client";

import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import { Calendar, Users, MapPin, Factory, Globe, Briefcase, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface JobData {
  id: string;
  title: string;
  location: string | null;
  type: string;
  externalUrl: string;
  postedAt: string;
}

interface AboutTabProps {
  description: string | null;
  technologies: string[];
  founded: number | null;
  size: string;
  locations: string[];
  industry: string;
  website: string | null;
  jobs?: JobData[];
}

const SIZE_MAP: Record<string, string> = {
  TINY: "1-10 employees",
  SMALL: "11-50 employees",
  MEDIUM: "51-200 employees",
  LARGE: "200+ employees",
};

function formatJobType(type: string): string {
  switch (type) {
    case "REMOTE": return "Remote";
    case "HYBRID": return "Hybrid";
    case "ONSITE": return "On-site";
    default: return type;
  }
}

export function AboutTab({
  description,
  technologies,
  founded,
  size,
  locations,
  industry,
  website,
  jobs = [],
}: AboutTabProps) {
  const t = useTranslations("company");

  const paragraphs = description
    ? description.split("\n").filter((p) => p.trim().length > 0)
    : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {/* Main content */}
      <div className="space-y-6">
        {/* Description */}
        {paragraphs.length > 0 && (
          <div className="space-y-4">
            {paragraphs.map((paragraph, i) => (
              <p key={i} className="text-[14px] text-white/40 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        )}

        {/* Technologies */}
        {technologies.length > 0 && (
          <div>
            <Separator className="mb-6" />
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              {t("technologies")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-md bg-white/[0.03] border border-white/[0.04] px-2.5 py-1 text-[12px] text-white/40"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Open Roles */}
        {jobs.length > 0 && (
          <div>
            <Separator className="mb-6" />
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              {t("openRoles")}
            </h3>
            <div className="space-y-2">
              {jobs.slice(0, 5).map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="flex items-center gap-3 rounded-[12px] border border-white/[0.05] bg-white/[0.02] p-3 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.04]"
                >
                  <Briefcase className="size-4 shrink-0 text-white/30" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-foreground">{job.title}</p>
                    <p className="text-[11px] text-white/30">
                      {job.location || "No location"} · {formatJobType(job.type)}
                    </p>
                  </div>
                  <ArrowRight className="size-3.5 shrink-0 text-white/20" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Company Info sidebar */}
      <div className="lg:sticky lg:top-24">
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">{t("companyInfo")}</h3>

          {founded && (
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-white/25">{t("founded")}</p>
                <p className="text-sm font-medium text-foreground">{founded}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm">
            <Users className="size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-white/25">{t("size")}</p>
              <p className="text-sm font-medium text-foreground">
                {SIZE_MAP[size] || size}
              </p>
            </div>
          </div>

          {locations.length > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-white/25">{t("headquarters")}</p>
                <p className="text-sm font-medium text-foreground">{locations[0]}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm">
            <Factory className="size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-white/25">{t("industry")}</p>
              <p className="text-sm font-medium text-foreground">{industry}</p>
            </div>
          </div>

          {website && (
            <div className="flex items-center gap-3 text-sm">
              <Globe className="size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-white/25">{t("website")}</p>
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {new URL(website).hostname.replace("www.", "")}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
