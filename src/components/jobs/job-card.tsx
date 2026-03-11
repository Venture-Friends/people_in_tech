"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, MapPin, Building2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export interface JobCardData {
  id: string;
  title: string;
  location: string | null;
  type: string;
  externalUrl: string;
  postedAt: string | Date;
  company: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    industry: string;
  };
}

function formatJobType(type: string): string {
  switch (type) {
    case "REMOTE": return "Remote";
    case "HYBRID": return "Hybrid";
    case "ONSITE": return "Onsite";
    default: return type;
  }
}

function getRelativeTime(date: string | Date): string {
  const postedDate = typeof date === "string" ? new Date(date) : date;
  const days = Math.floor((Date.now() - postedDate.getTime()) / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  }
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

interface JobCardProps {
  job: JobCardData;
  isSaved?: boolean;
}

export function JobCard({ job, isSaved = false }: JobCardProps) {
  const { data: session } = useSession();
  const [saved, setSaved] = useState(isSaved);
  const [saving, setSaving] = useState(false);

  const firstLetter = job.company.name.charAt(0).toUpperCase();

  async function handleSave() {
    if (!session?.user) {
      toast.error("Please sign in to save jobs");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}/save`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to save job");
      }

      const data = await res.json();
      setSaved(data.saved);
      toast.success(data.saved ? "Job saved" : "Job removed from saved");
    } catch {
      toast.error("Failed to save job");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="rounded-xl border-white/[0.06] bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-[oklch(0.16_0.01_260)]">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Company logo / letter avatar */}
            {job.company.logo ? (
              <img
                src={job.company.logo}
                alt={job.company.name}
                className="size-8 shrink-0 rounded-lg object-cover border border-white/[0.08]"
              />
            ) : (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 border border-white/[0.08] text-sm font-bold text-foreground">
                {firstLetter}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground truncate">
                {job.title}
              </h3>
              <Link
                href={`/companies/${job.company.slug}`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {job.company.name}
              </Link>
            </div>
          </div>

          {/* Save button */}
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 hover:bg-white/[0.08] rounded-full"
            onClick={handleSave}
            disabled={saving}
            aria-label={saved ? "Remove from saved jobs" : "Save job"}
          >
            <Bookmark
              className={`size-4 ${saved ? "fill-primary text-primary" : "text-muted-foreground"}`}
            />
          </Button>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-white/[0.06] border border-white/[0.04] px-2 py-0.5 text-xs text-muted-foreground">
            {formatJobType(job.type)}
          </span>

          {job.location && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3.5" />
              {job.location}
            </span>
          )}

          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Building2 className="size-3.5" />
            {job.company.industry}
          </span>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
          <span className="text-xs text-muted-foreground">
            {getRelativeTime(job.postedAt)}
          </span>

          <a
            href={job.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-white/[0.08] hover:border-white/[0.12]"
          >
            Apply
            <ArrowRight className="size-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
