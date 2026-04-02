import { Languages } from "lucide-react";

interface SpokenLanguage {
  id: string;
  name: string;
  proficiency: string;
}

const PROFICIENCY_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  NATIVE: {
    label: "Native",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  FLUENT: {
    label: "Fluent",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
  },
  CONVERSATIONAL: {
    label: "Conversational",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  BASIC: {
    label: "Basic",
    color: "text-white/40",
    bg: "bg-white/[0.04]",
  },
};

export function ProfileLanguages({
  languages,
}: {
  languages: SpokenLanguage[];
}) {
  if (languages.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-6">
      <h2 className="font-display text-lg font-semibold text-white flex items-center gap-2">
        <Languages className="size-5 text-white/40" />
        Languages
      </h2>

      <div className="mt-4 flex flex-wrap gap-2">
        {languages.map((lang) => {
          const config = PROFICIENCY_CONFIG[lang.proficiency] ?? {
            label: lang.proficiency,
            color: "text-white/40",
            bg: "bg-white/[0.04]",
          };
          return (
            <span
              key={lang.id}
              className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-sm text-white/60"
            >
              {lang.name}
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${config.bg} ${config.color}`}
              >
                {config.label}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
