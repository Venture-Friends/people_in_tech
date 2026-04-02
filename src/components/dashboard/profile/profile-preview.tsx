"use client";

import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  Globe,
  Github,
  Linkedin,
  FileText,
  MapPin,
  Clock,
  Code2,
  ExternalLink,
} from "lucide-react";
import type {
  FullProfileData,
  WorkExperienceEntry,
  EducationEntry,
  CertificationEntry,
  SpokenLanguageEntry,
} from "./types";

interface ProfilePreviewProps {
  data: FullProfileData;
}

const AVAILABILITY_LABELS: Record<string, string> = {
  NOT_SPECIFIED: "Not specified",
  OPEN_TO_WORK: "Open to work",
  NOT_LOOKING: "Not looking",
  OPEN_TO_FREELANCE: "Open to freelance",
};

const WORK_TYPE_LABELS: Record<string, string> = {
  NOT_SPECIFIED: "Not specified",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ONSITE: "On-site",
};

const PROFICIENCY_LABELS: Record<string, string> = {
  NATIVE: "Native",
  FLUENT: "Fluent",
  CONVERSATIONAL: "Conversational",
  BASIC: "Basic",
};

export function ProfilePreview({ data }: ProfilePreviewProps) {
  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="flex items-center gap-4">
        {data.avatarUrl ? (
          <img
            src={data.avatarUrl}
            alt={data.name}
            className="size-16 rounded-full border-2 border-white/[0.08] object-cover"
          />
        ) : (
          <div className="flex size-16 items-center justify-center rounded-full border-2 border-white/[0.08] bg-white/[0.04]">
            <User className="size-6 text-white/30" />
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold text-white/90">{data.name}</h2>
          {(data.publicTitle || data.headline) && (
            <p className="text-sm text-white/50">
              {data.publicTitle || data.headline}
            </p>
          )}
          {data.availability && data.availability !== "NOT_SPECIFIED" && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
              <Clock className="size-2.5" />
              {AVAILABILITY_LABELS[data.availability]}
            </span>
          )}
        </div>
      </div>

      {/* Bio */}
      {data.bio && (
        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
          <p className="text-sm leading-relaxed text-white/50">{data.bio}</p>
        </div>
      )}

      {/* Links */}
      <div className="flex flex-wrap gap-3">
        {data.linkedinUrl && (
          <LinkBadge
            icon={<Linkedin className="size-3" />}
            label="LinkedIn"
            href={data.linkedinUrl}
          />
        )}
        {data.website && (
          <LinkBadge
            icon={<Globe className="size-3" />}
            label="Website"
            href={data.website}
          />
        )}
        {data.portfolioUrl && (
          <LinkBadge
            icon={<Globe className="size-3" />}
            label="Portfolio"
            href={data.portfolioUrl}
          />
        )}
        {data.githubUrl && (
          <LinkBadge
            icon={<Github className="size-3" />}
            label="GitHub"
            href={data.githubUrl}
          />
        )}
        {data.cvUrl && (
          <LinkBadge
            icon={<FileText className="size-3" />}
            label="CV"
            href={data.cvUrl}
          />
        )}
      </div>

      {/* Info pills */}
      {(data.preferredWorkType !== "NOT_SPECIFIED" ||
        data.preferredLocations.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {data.preferredWorkType &&
            data.preferredWorkType !== "NOT_SPECIFIED" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/40">
                <MapPin className="size-2.5" />
                {WORK_TYPE_LABELS[data.preferredWorkType]}
              </span>
            )}
          {data.preferredLocations.map((loc) => (
            <span
              key={loc}
              className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/40"
            >
              <MapPin className="size-2.5" />
              {loc}
            </span>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <PreviewSection
          icon={<Code2 className="size-4" />}
          title="Skills"
        >
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-md border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 text-xs text-white/50"
              >
                {skill}
              </span>
            ))}
          </div>
        </PreviewSection>
      )}

      {/* Work Experience */}
      {data.workExperiences.length > 0 && (
        <PreviewSection
          icon={<Briefcase className="size-4" />}
          title="Work Experience"
        >
          <div className="space-y-3">
            {data.workExperiences.map((we: WorkExperienceEntry) => (
              <div key={we.id}>
                <p className="text-sm font-medium text-white/80">{we.role}</p>
                <p className="text-xs text-white/40">{we.company}</p>
                <p className="text-[10px] text-white/25">
                  {formatDate(we.startDate)} &mdash;{" "}
                  {we.current ? "Present" : formatDate(we.endDate)}
                </p>
                {we.description && (
                  <p className="mt-1 text-xs text-white/30">{we.description}</p>
                )}
              </div>
            ))}
          </div>
        </PreviewSection>
      )}

      {/* Education */}
      {data.educations.length > 0 && (
        <PreviewSection
          icon={<GraduationCap className="size-4" />}
          title="Education"
        >
          <div className="space-y-3">
            {data.educations.map((edu: EducationEntry) => (
              <div key={edu.id}>
                <p className="text-sm font-medium text-white/80">
                  {edu.institution}
                </p>
                {(edu.degree || edu.field) && (
                  <p className="text-xs text-white/40">
                    {[edu.degree, edu.field].filter(Boolean).join(" in ")}
                  </p>
                )}
                <p className="text-[10px] text-white/25">
                  {edu.startYear}
                  {edu.endYear ? ` - ${edu.endYear}` : " - Present"}
                </p>
              </div>
            ))}
          </div>
        </PreviewSection>
      )}

      {/* Certifications */}
      {data.certifications.length > 0 && (
        <PreviewSection
          icon={<Award className="size-4" />}
          title="Certifications"
        >
          <div className="space-y-2">
            {data.certifications.map((cert: CertificationEntry) => (
              <div key={cert.id}>
                <p className="text-sm font-medium text-white/80">{cert.name}</p>
                {cert.issuer && (
                  <p className="text-xs text-white/40">{cert.issuer}</p>
                )}
                {cert.year && (
                  <p className="text-[10px] text-white/25">{cert.year}</p>
                )}
              </div>
            ))}
          </div>
        </PreviewSection>
      )}

      {/* Languages */}
      {data.spokenLanguages.length > 0 && (
        <PreviewSection
          icon={<Languages className="size-4" />}
          title="Languages"
        >
          <div className="flex flex-wrap gap-2">
            {data.spokenLanguages.map((lang: SpokenLanguageEntry) => (
              <span
                key={lang.id}
                className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.04] px-2.5 py-1 text-xs text-white/50"
              >
                {lang.name}
                <span className="text-[10px] text-white/25">
                  {PROFICIENCY_LABELS[lang.proficiency] ?? lang.proficiency}
                </span>
              </span>
            ))}
          </div>
        </PreviewSection>
      )}
    </div>
  );
}

function PreviewSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-white/60">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

function LinkBadge({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-xs text-white/40 transition-colors hover:border-white/[0.12] hover:text-white/60"
    >
      {icon}
      {label}
      <ExternalLink className="size-2.5" />
    </a>
  );
}

function formatDate(date?: string) {
  if (!date) return "";
  try {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return date;
  }
}
