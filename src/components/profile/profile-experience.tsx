import { Briefcase } from "lucide-react";

interface WorkExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string | null;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function ProfileExperience({
  experiences,
}: {
  experiences: WorkExperience[];
}) {
  if (experiences.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-6">
      <h2 className="font-display text-lg font-semibold text-white flex items-center gap-2">
        <Briefcase className="size-5 text-white/40" />
        Work Experience
      </h2>

      <div className="relative mt-4 ml-2.5 border-l border-white/[0.08] pl-6 space-y-6">
        {experiences.map((exp) => (
          <div key={exp.id} className="relative">
            {/* Timeline dot */}
            <div className="absolute -left-[30.5px] top-1.5 size-2.5 rounded-full border-2 border-white/[0.15] bg-background" />

            <p className="text-sm font-medium text-white/80">{exp.role}</p>
            <p className="text-xs text-white/40">{exp.company}</p>
            <p className="mt-0.5 text-[11px] text-white/25">
              {formatDate(exp.startDate)} &mdash;{" "}
              {exp.current ? "Present" : exp.endDate ? formatDate(exp.endDate) : ""}
            </p>
            {exp.description && (
              <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-white/35">
                {exp.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
