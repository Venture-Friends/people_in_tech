"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { Bookmark, ArrowRight } from "lucide-react";
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
    case "ONSITE": return "On-site";
    default: return type;
  }
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
      const res = await fetch(`/api/jobs/${job.id}/save`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to save job");
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
    <div className="rounded-[14px] border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] flex items-center gap-4 p-[18px_22px] transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.04] hover:-translate-y-[2px]">
      {/* Company logo */}
      {job.company.logo ? (
        <img
          src={job.company.logo}
          alt={job.company.name}
          className="size-10 shrink-0 rounded-[10px] object-cover"
        />
      ) : (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-white/[0.06] text-sm font-bold text-foreground">
          {firstLetter}
        </div>
      )}

      {/* Center: title + company/location */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[14px] font-semibold text-foreground">
          {job.title}
        </h3>
        <p className="mt-0.5 truncate text-xs text-white/30">
          <Link href={`/companies/${job.company.slug}`} className="hover:text-primary transition-colors">
            {job.company.name}
          </Link>
          {job.location && ` · ${job.location}`}
        </p>
      </div>

      {/* Badges */}
      <div className="hidden items-center gap-2 sm:flex">
        <span className="rounded-md bg-white/[0.03] border border-white/[0.04] px-2 py-0.5 text-[11px] text-white/40">
          Full-time
        </span>
        <span className={`rounded-md border px-2 py-0.5 text-[11px] ${
          job.type === "REMOTE"
            ? "border-primary/20 bg-primary/[0.06] text-primary"
            : "border-white/[0.04] bg-white/[0.03] text-white/40"
        }`}>
          {formatJobType(job.type)}
        </span>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="shrink-0 rounded-full p-2 text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-colors"
        aria-label={saved ? "Remove from saved jobs" : "Save job"}
      >
        <Bookmark className={`size-4 ${saved ? "fill-primary text-primary" : ""}`} />
      </button>

      {/* View button */}
      <Link
        href={`/jobs/${job.id}`}
        className="hidden shrink-0 items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-[12px] font-medium text-foreground transition-colors hover:bg-white/[0.06] sm:inline-flex"
      >
        View
        <ArrowRight className="size-3" />
      </Link>
    </div>
  );
}
