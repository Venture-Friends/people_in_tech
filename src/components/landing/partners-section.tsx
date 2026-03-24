import Image from "next/image";
import { SectionHeader } from "@/components/shared/section-header";

interface Partner {
  id: string;
  name: string;
  logo: string;
  website: string | null;
}

interface PartnersSectionProps {
  partners: Partner[];
}

export function PartnersSection({ partners }: PartnersSectionProps) {
  if (partners.length === 0) return null;

  return (
    <section className="w-full py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Our Partners" />

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {partners.map((partner) => {
            const content = (
              <div className="group flex flex-col items-center gap-3">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-3 transition-all duration-300 group-hover:border-white/[0.1] group-hover:bg-white/[0.04]">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={56}
                    height={56}
                    className="h-14 w-14 object-contain transition-all duration-300 grayscale group-hover:grayscale-0"
                  />
                </div>
                <span className="text-center text-xs font-medium text-white/40 transition-colors duration-300 group-hover:text-white/70">
                  {partner.name}
                </span>
              </div>
            );

            if (partner.website) {
              return (
                <a
                  key={partner.id}
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex justify-center"
                >
                  {content}
                </a>
              );
            }

            return (
              <div key={partner.id} className="flex justify-center">
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
