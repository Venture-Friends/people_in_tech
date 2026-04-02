import { Code2, Target, Building2 } from "lucide-react";

interface ProfileSkillsProps {
  skills: string[];
  roleInterests: string[];
  industries: string[];
}

export function ProfileSkills({
  skills,
  roleInterests,
  industries,
}: ProfileSkillsProps) {
  const hasContent =
    skills.length > 0 || roleInterests.length > 0 || industries.length > 0;
  if (!hasContent) return null;

  return (
    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-6">
      <h2 className="font-display text-lg font-semibold text-white">
        Skills &amp; Interests
      </h2>

      {skills.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-white/30">
            <Code2 className="size-3.5" />
            Skills
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-lg border border-white/[0.06] bg-white/[0.04] px-2.5 py-1 text-xs text-white/50"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {roleInterests.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-white/30">
            <Target className="size-3.5" />
            Role Interests
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {roleInterests.map((role) => (
              <span
                key={role}
                className="rounded-lg border border-primary/20 bg-primary/[0.06] px-2.5 py-1 text-xs text-primary/70"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      )}

      {industries.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-white/30">
            <Building2 className="size-3.5" />
            Industries
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {industries.map((ind) => (
              <span
                key={ind}
                className="rounded-lg border border-white/[0.06] bg-white/[0.04] px-2.5 py-1 text-xs text-white/50"
              >
                {ind}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
