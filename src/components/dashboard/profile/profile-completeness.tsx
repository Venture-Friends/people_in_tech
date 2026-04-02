"use client";

import { CheckCircle2, Circle } from "lucide-react";

interface ProfileData {
  name?: string;
  bio?: string;
  publicTitle?: string;
  avatarUrl?: string;
  linkedinUrl?: string;
  candidateProfile?: {
    headline?: string;
    skills?: string[];
    workExperiences?: unknown[];
    educations?: unknown[];
    cvUrl?: string;
    availability?: string;
  } | null;
}

interface CheckItem {
  label: string;
  done: boolean;
}

function computeChecks(data: ProfileData): CheckItem[] {
  const cp = data.candidateProfile;
  return [
    { label: "Name", done: !!data.name },
    { label: "Headline or public title", done: !!(cp?.headline || data.publicTitle) },
    { label: "Bio", done: !!data.bio },
    { label: "Avatar", done: !!data.avatarUrl },
    { label: "At least 1 skill", done: (cp?.skills?.length ?? 0) > 0 },
    { label: "Work experience", done: (cp?.workExperiences?.length ?? 0) > 0 },
    { label: "Education", done: (cp?.educations?.length ?? 0) > 0 },
    { label: "LinkedIn URL", done: !!data.linkedinUrl },
    { label: "CV uploaded", done: !!cp?.cvUrl },
    {
      label: "Availability set",
      done: !!cp?.availability && cp.availability !== "NOT_SPECIFIED",
    },
  ];
}

export function ProfileCompleteness({ data }: { data: ProfileData }) {
  const checks = computeChecks(data);
  const done = checks.filter((c) => c.done).length;
  const total = checks.length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white/70">Profile completeness</h3>
        <span className="text-sm font-semibold tabular-nums text-white/90">
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-white/[0.06] mb-4">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background:
              pct === 100
                ? "linear-gradient(90deg, #10b981, #34d399)"
                : "linear-gradient(90deg, #f59e0b, #f97316)",
          }}
        />
      </div>

      {/* Checklist */}
      <ul className="space-y-1.5">
        {checks.map((c) => (
          <li key={c.label} className="flex items-center gap-2 text-xs">
            {c.done ? (
              <CheckCircle2 className="size-3.5 text-emerald-400" />
            ) : (
              <Circle className="size-3.5 text-white/20" />
            )}
            <span className={c.done ? "text-white/50" : "text-white/30"}>
              {c.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
