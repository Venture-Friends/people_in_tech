"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, ExternalLink, MapPin, Briefcase } from "lucide-react";
import { toast } from "sonner";

export interface SavedJobData {
  id: string;
  title: string;
  location: string | null;
  type: string;
  externalUrl: string;
  postedAt: string;
  company: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    industry: string;
  };
}

interface SavedJobsProps {
  jobs: SavedJobData[];
}

function getTypeBadge(type: string) {
  switch (type) {
    case "REMOTE":
      return { label: "Remote", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
    case "HYBRID":
      return { label: "Hybrid", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
    case "ONSITE":
      return { label: "Onsite", className: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30" };
    default:
      return { label: type, className: "bg-muted text-muted-foreground" };
  }
}

function getRelativeTime(date: string): string {
  const postedDate = new Date(date);
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

export function SavedJobs({ jobs: initialJobs }: SavedJobsProps) {
  const [jobs, setJobs] = useState(initialJobs);
  const [removing, setRemoving] = useState<string | null>(null);

  async function handleRemove(jobId: string) {
    setRemoving(jobId);
    try {
      const res = await fetch(`/api/jobs/${jobId}/save`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to unsave job");
      }

      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      toast.success("Job removed from saved");
    } catch {
      toast.error("Failed to remove saved job");
    } finally {
      setRemoving(null);
    }
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-12 text-center">
        <Briefcase className="size-12 text-white/20 mb-4" />
        <h3 className="font-display text-lg font-semibold text-foreground mb-2">
          No saved jobs
        </h3>
        <p className="text-[14px] text-white/[0.35] mb-6">
          Browse job listings and save the ones that interest you.
        </p>
        <Link href="/jobs">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Browse Jobs
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {jobs.map((job) => {
        const typeBadge = getTypeBadge(job.type);
        const firstLetter = job.company.name.charAt(0).toUpperCase();

        return (
          <div key={job.id} className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                {job.company.logo ? (
                  <img
                    src={job.company.logo}
                    alt={job.company.name}
                    className="size-10 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white ${getIndustryColor(job.company.industry)}`}
                  >
                    {firstLetter}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground truncate">
                    {job.title}
                  </h3>
                  <Link
                    href={`/companies/${job.company.slug}`}
                    className="text-sm text-primary/60 hover:text-primary transition-colors"
                  >
                    {job.company.name}
                  </Link>
                </div>
              </div>

              <button
                type="button"
                className="shrink-0 flex items-center justify-center size-8 rounded-lg border border-white/[0.08] bg-white/[0.05] text-primary hover:bg-white/[0.1] transition-colors cursor-pointer disabled:opacity-50"
                onClick={() => handleRemove(job.id)}
                disabled={removing === job.id}
              >
                <Bookmark className="size-4 fill-primary text-primary" />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={typeBadge.className}>
                {typeBadge.label}
              </Badge>

              {job.location && (
                <span className="flex items-center gap-1 text-xs text-white/30">
                  <MapPin className="size-3" />
                  {job.location}
                </span>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-3">
              <span className="text-xs text-white/30">
                {getRelativeTime(job.postedAt)}
              </span>

              <a
                href={job.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                View on Company Site
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
