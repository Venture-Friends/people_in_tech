import { Link } from "@/i18n/navigation";

// Featured companies to showcase — curated list of verified partners
const FEATURED_COMPANIES = [
  { name: "Workable", logo: "/logos/workable.svg", slug: "workable" },
  { name: "Hack The Box", logo: "/logos/hack-the-box.svg", slug: "hack-the-box" },
  { name: "Skroutz", logo: "/logos/skroutz.svg", slug: "skroutz" },
];

interface TrustedByTickerProps {
  logos?: { name: string; logo: string; slug: string }[];
}

export function TrustedByTicker({ logos }: TrustedByTickerProps) {
  const items = logos && logos.length > 0 ? logos : FEATURED_COMPANIES;

  return (
    <section className="pt-8 pb-12 overflow-hidden">
      <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-white/20 mb-8">
        Trusted by
      </p>
      <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex shrink-0 animate-marquee items-center gap-16 sm:gap-20">
          {[...items, ...items].map((company, i) => (
            <Link
              key={`${company.slug}-${i}`}
              href={`/companies/${company.slug}`}
              className="transition-all duration-300 opacity-40 grayscale hover:opacity-80 hover:grayscale-0"
            >
              <img
                src={company.logo}
                alt={company.name}
                className="h-12 sm:h-14 w-auto object-contain"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
