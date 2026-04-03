import {
  User,
  Linkedin,
  Github,
  Globe,
  FileText,
  ExternalLink,
  MapPin,
  Briefcase,
  Mail,
} from "lucide-react";

const AVAILABILITY_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  OPEN_TO_WORK: {
    label: "Open to work",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  NOT_LOOKING: {
    label: "Not looking",
    color: "text-white/40",
    bg: "bg-white/[0.04]",
    border: "border-white/[0.06]",
  },
  OPEN_TO_FREELANCE: {
    label: "Open to freelance",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
  },
};

const WORK_TYPE_LABELS: Record<string, string> = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ONSITE: "On-site",
};

interface ProfileHeroProps {
  name: string;
  email?: string | null;
  avatarUrl: string | null;
  publicTitle: string | null;
  headline: string | null;
  availability: string;
  preferredWorkType: string;
  preferredLocations: string[];
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  website: string | null;
  cvUrl: string | null;
}

export function ProfileHero({
  name,
  email,
  avatarUrl,
  publicTitle,
  headline,
  availability,
  preferredWorkType,
  preferredLocations,
  linkedinUrl,
  githubUrl,
  portfolioUrl,
  website,
  cvUrl,
}: ProfileHeroProps) {
  const availConfig =
    availability !== "NOT_SPECIFIED"
      ? AVAILABILITY_CONFIG[availability]
      : null;
  const workTypeLabel =
    preferredWorkType !== "NOT_SPECIFIED"
      ? WORK_TYPE_LABELS[preferredWorkType]
      : null;

  const hasLinks = linkedinUrl || githubUrl || portfolioUrl || website || cvUrl;

  return (
    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-6 sm:p-8">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        {/* Avatar */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="size-20 rounded-2xl border-2 border-white/[0.08] object-cover"
          />
        ) : (
          <div className="flex size-20 items-center justify-center rounded-2xl border-2 border-white/[0.08] bg-white/[0.04]">
            <User className="size-8 text-white/30" />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="font-display text-2xl font-bold text-white">
            {name}
          </h1>

          {email && (
            <a
              href={`mailto:${email}`}
              className="mt-1 inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-primary transition-colors"
            >
              <Mail className="size-3.5" />
              {email}
            </a>
          )}

          {(publicTitle || headline) && (
            <p className="mt-1 text-base text-white/50">
              {publicTitle || headline}
            </p>
          )}

          {/* Badges row */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            {availConfig && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${availConfig.bg} ${availConfig.border} ${availConfig.color}`}
              >
                <span className="size-1.5 rounded-full bg-current" />
                {availConfig.label}
              </span>
            )}

            {workTypeLabel && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] border border-white/[0.06] px-2.5 py-0.5 text-xs text-white/40">
                <Briefcase className="size-3" />
                {workTypeLabel}
              </span>
            )}

            {preferredLocations.map((loc) => (
              <span
                key={loc}
                className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] border border-white/[0.06] px-2.5 py-0.5 text-xs text-white/40"
              >
                <MapPin className="size-3" />
                {loc}
              </span>
            ))}
          </div>

          {/* Links */}
          {hasLinks && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {linkedinUrl && (
                <LinkBadge
                  href={linkedinUrl}
                  icon={<Linkedin className="size-3.5" />}
                  label="LinkedIn"
                />
              )}
              {githubUrl && (
                <LinkBadge
                  href={githubUrl}
                  icon={<Github className="size-3.5" />}
                  label="GitHub"
                />
              )}
              {portfolioUrl && (
                <LinkBadge
                  href={portfolioUrl}
                  icon={<Globe className="size-3.5" />}
                  label="Portfolio"
                />
              )}
              {website && (
                <LinkBadge
                  href={website}
                  icon={<Globe className="size-3.5" />}
                  label="Website"
                />
              )}
              {cvUrl && (
                <LinkBadge
                  href={cvUrl}
                  icon={<FileText className="size-3.5" />}
                  label="CV"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LinkBadge({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
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
