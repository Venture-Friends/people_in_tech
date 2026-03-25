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

export function TrustedByTicker(_props: TrustedByTickerProps) {
  return (
    <section className="pt-8 pb-12">
      <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-white/20 mb-8">
        Trusted by
      </p>
      <div className="flex items-center justify-center gap-16 sm:gap-20">
        {FEATURED_COMPANIES.map((company) => (
          <Link
            key={company.slug}
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
    </section>
  );
}
