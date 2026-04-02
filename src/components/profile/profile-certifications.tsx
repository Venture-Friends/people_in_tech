import { Award } from "lucide-react";

interface Certification {
  id: string;
  name: string;
  issuer: string | null;
  year: number | null;
}

export function ProfileCertifications({
  certifications,
}: {
  certifications: Certification[];
}) {
  if (certifications.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-6">
      <h2 className="font-display text-lg font-semibold text-white flex items-center gap-2">
        <Award className="size-5 text-white/40" />
        Certifications
      </h2>

      <div className="mt-4 space-y-3">
        {certifications.map((cert) => (
          <div key={cert.id}>
            <p className="text-sm font-medium text-white/80">{cert.name}</p>
            {cert.issuer && (
              <p className="text-xs text-white/40">{cert.issuer}</p>
            )}
            {cert.year && (
              <p className="text-[11px] text-white/25">{cert.year}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
