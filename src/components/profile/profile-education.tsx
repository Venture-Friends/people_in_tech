import { GraduationCap } from "lucide-react";

interface Education {
  id: string;
  institution: string;
  degree: string | null;
  field: string | null;
  startYear: number;
  endYear: number | null;
}

export function ProfileEducation({
  educations,
}: {
  educations: Education[];
}) {
  if (educations.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-6">
      <h2 className="font-display text-lg font-semibold text-white flex items-center gap-2">
        <GraduationCap className="size-5 text-white/40" />
        Education
      </h2>

      <div className="mt-4 space-y-4">
        {educations.map((edu) => (
          <div key={edu.id}>
            <p className="text-sm font-medium text-white/80">
              {edu.institution}
            </p>
            {(edu.degree || edu.field) && (
              <p className="text-xs text-white/40">
                {[edu.degree, edu.field].filter(Boolean).join(" in ")}
              </p>
            )}
            <p className="mt-0.5 text-[11px] text-white/25">
              {edu.startYear}
              {edu.endYear ? ` - ${edu.endYear}` : " - Present"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
