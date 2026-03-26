"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bookmark, MapPin, Briefcase, Calendar, ChevronRight, GraduationCap } from "lucide-react";
import { toast } from "sonner";

interface JobDetailProps {
  job: {
    id: string;
    title: string;
    location: string | null;
    type: string;
    externalUrl: string;
    postedAt: string;
    description: string | null;
    requirements: string | null;
    techStack: string | null;
    experienceLevel: string | null;
  };
  company: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    industry: string;
    website: string | null;
    locations: string;
    technologies: string | null;
    size: string;
    jobCount: number;
  };
  moreJobs: {
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
  }[];
}

function formatJobType(type: string): string {
  switch (type) {
    case "REMOTE": return "Remote";
    case "HYBRID": return "Hybrid";
    case "ONSITE": return "On-site";
    default: return type;
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

export function JobDetail({ job, company, moreJobs }: JobDetailProps) {
  const { data: session } = authClient.useSession();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const firstLetter = company.name.charAt(0).toUpperCase();

  async function handleSave() {
    if (!session?.user) {
      toast.error("Please sign in to save jobs");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}/save`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      setSaved(data.saved);
      toast.success(data.saved ? "Job saved" : "Job removed from saved");
    } catch {
      toast.error("Failed to save job");
    } finally {
      setSaving(false);
    }
  }

  // Parse company website hostname for display
  let websiteHost = "";
  if (company.website) {
    try {
      websiteHost = new URL(company.website).hostname.replace("www.", "");
    } catch {
      websiteHost = company.website;
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-[13px] text-white/30">
        <Link href="/jobs" className="hover:text-white/60 transition-colors">Jobs</Link>
        <ChevronRight className="size-3" />
        <Link href={`/companies/${company.slug}`} className="hover:text-white/60 transition-colors">{company.name}</Link>
        <ChevronRight className="size-3" />
        <span className="text-white/50 truncate">{job.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Main content */}
        <div>
          {/* Header */}
          <div className="flex items-start gap-4">
            {company.logo ? (
              <img src={company.logo} alt={company.name} className="size-14 rounded-2xl object-cover" />
            ) : (
              <div className="flex size-14 items-center justify-center rounded-2xl bg-white/[0.06] text-lg font-bold text-foreground">
                {firstLetter}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-[24px] font-bold text-foreground">
                {job.title}
              </h1>
              <Link
                href={`/companies/${company.slug}`}
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {company.name}
              </Link>
            </div>
          </div>

          {/* Badges */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-white/[0.03] border border-white/[0.04] px-2.5 py-1 text-[12px] text-white/40">
              Full-time
            </span>
            <span className={`rounded-md border px-2.5 py-1 text-[12px] ${
              job.type === "REMOTE"
                ? "border-primary/20 bg-primary/[0.06] text-primary"
                : "border-white/[0.04] bg-white/[0.03] text-white/40"
            }`}>
              {formatJobType(job.type)}
            </span>
            {job.location && (
              <span className="flex items-center gap-1 rounded-md bg-white/[0.03] border border-white/[0.04] px-2.5 py-1 text-[12px] text-white/40">
                <MapPin className="size-3" />
                {job.location}
              </span>
            )}
          </div>

          {/* Job content sections */}
          {(() => {
            let parsedRequirements: string[] = [];
            if (job.requirements) {
              try { parsedRequirements = JSON.parse(job.requirements); } catch { /* ignore */ }
            }
            let parsedTechStack: string[] = [];
            if (job.techStack) {
              try { parsedTechStack = JSON.parse(job.techStack); } catch { /* ignore */ }
            }
            const companyTech = !parsedTechStack.length && company.technologies
              ? company.technologies.split(",").map((t) => t.trim()).filter(Boolean)
              : [];
            const techTags = parsedTechStack.length > 0 ? parsedTechStack : companyTech;
            const hasContent = job.description || parsedRequirements.length > 0 || techTags.length > 0;

            if (!hasContent) {
              return (
                <div className="mt-8 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-6">
                  <p className="text-sm text-white/30 leading-relaxed">
                    Full job description will be available soon. Visit the company&apos;s careers page for complete details.
                  </p>
                </div>
              );
            }

            return (
              <div className="mt-8 flex flex-col gap-6">
                {job.description && (
                  <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-6">
                    <h2 className="font-display text-[16px] font-semibold text-foreground mb-3">About the Role</h2>
                    <p className="text-sm text-white/50 leading-relaxed whitespace-pre-line">{job.description}</p>
                  </div>
                )}
                {parsedRequirements.length > 0 && (
                  <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-6">
                    <h2 className="font-display text-[16px] font-semibold text-foreground mb-3">Requirements</h2>
                    <ul className="flex flex-col gap-1.5">
                      {parsedRequirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/50 leading-relaxed">
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {techTags.length > 0 && (
                  <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-6">
                    <h2 className="font-display text-[16px] font-semibold text-foreground mb-3">Tech Stack</h2>
                    <div className="flex flex-wrap gap-2">
                      {techTags.map((tech, i) => (
                        <span
                          key={i}
                          className="rounded-md border border-primary/20 bg-primary/[0.06] px-2.5 py-1 text-[12px] text-primary"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Apply button */}
          <a
            href={job.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-[#b4f724] hover:shadow-[0_4px_16px_rgba(159,239,0,0.25)]"
          >
            Apply on {websiteHost || "company site"}
            <ArrowRight className="size-4" />
          </a>

          {/* Save button */}
          <Button
            variant="outline"
            className="w-full gap-2 border-white/[0.06] text-white/50 hover:text-white"
            onClick={handleSave}
            disabled={saving}
          >
            <Bookmark className={`size-4 ${saved ? "fill-primary text-primary" : ""}`} />
            {saved ? "Saved" : "Save Job"}
          </Button>

          {/* Info card */}
          <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5">
            <h3 className="mb-4 text-[13px] font-semibold text-foreground">Job Details</h3>
            <div className="flex flex-col gap-3">
              {job.location && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="size-4 shrink-0 text-white/25" />
                  <div>
                    <p className="text-xs text-white/25">Location</p>
                    <p className="text-sm text-foreground">{job.location}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="size-4 shrink-0 text-white/25" />
                <div>
                  <p className="text-xs text-white/25">Type</p>
                  <p className="text-sm text-foreground">{formatJobType(job.type)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="size-4 shrink-0 text-white/25" />
                <div>
                  <p className="text-xs text-white/25">Posted</p>
                  <p className="text-sm text-foreground">{getRelativeTime(job.postedAt)}</p>
                </div>
              </div>
              {job.experienceLevel && (
                <div className="flex items-center gap-3 text-sm">
                  <GraduationCap className="size-4 shrink-0 text-white/25" />
                  <div>
                    <p className="text-xs text-white/25">Experience</p>
                    <p className="text-sm text-foreground">{job.experienceLevel}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Company mini-card */}
          <Link href={`/companies/${company.slug}`} className="block">
            <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5 transition-colors hover:border-white/[0.1] hover:bg-white/[0.04]">
              <div className="flex items-center gap-3">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="size-10 rounded-[10px] object-cover" />
                ) : (
                  <div className="flex size-10 items-center justify-center rounded-[10px] bg-white/[0.06] text-sm font-bold text-foreground">
                    {firstLetter}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{company.name}</h4>
                  <p className="text-xs text-white/30">{company.industry} · {company.jobCount} open roles</p>
                </div>
              </div>
            </div>
          </Link>

          {/* More roles */}
          {moreJobs.length > 0 && (
            <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5">
              <h3 className="mb-3 text-[13px] font-semibold text-foreground">
                More roles at {company.name}
              </h3>
              <div className="flex flex-col gap-2">
                {moreJobs.map((mj) => (
                  <Link
                    key={mj.id}
                    href={`/jobs/${mj.id}`}
                    className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-foreground">{mj.title}</p>
                      <p className="text-[11px] text-white/30">{mj.location || formatJobType(mj.type)}</p>
                    </div>
                    <ArrowRight className="size-3 shrink-0 text-white/30" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
