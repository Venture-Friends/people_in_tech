import { Link } from "@/i18n/navigation";

interface LogoItem {
  name: string;
  logo: string;
  slug?: string;
  url?: string;
}

// Fallback companies when no partners are configured
const FEATURED_COMPANIES: LogoItem[] = [
  { name: "Workable", logo: "/logos/workable.svg", slug: "workable" },
  { name: "Hack The Box", logo: "/logos/hack-the-box.svg", slug: "hack-the-box" },
  { name: "Skroutz", logo: "/logos/skroutz.svg", slug: "skroutz" },
];

interface TrustedByTickerProps {
  logos?: LogoItem[];
}

function LogoSet({ items }: { items: LogoItem[] }) {
  return (
    <div className="flex shrink-0 min-w-full items-center justify-around gap-12 sm:gap-16">
      {items.map((company, i) => {
        const logoEl = (
          <img
            src={company.logo}
            alt={company.name}
            className="h-10 sm:h-12 w-auto max-w-[140px] object-contain"
          />
        );

        if (company.url) {
          return (
            <a
              key={`${company.name}-${i}`}
              href={company.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 transition-opacity duration-300 opacity-70 hover:opacity-100"
            >
              {logoEl}
            </a>
          );
        }

        if (company.slug) {
          return (
            <Link
              key={`${company.slug}-${i}`}
              href={`/companies/${company.slug}`}
              className="shrink-0 transition-opacity duration-300 opacity-70 hover:opacity-100"
            >
              {logoEl}
            </Link>
          );
        }

        return (
          <span key={`${company.name}-${i}`} className="shrink-0 opacity-70">
            {logoEl}
          </span>
        );
      })}
    </div>
  );
}

export function TrustedByTicker({ logos }: TrustedByTickerProps) {
  const items = logos && logos.length > 0 ? logos : FEATURED_COMPANIES;

  return (
    <section className="pt-8 pb-12 overflow-hidden">
      <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-white/20 mb-8">
        Trusted by
      </p>
      <div
        className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
        aria-hidden="true"
      >
        <div className="flex animate-marquee">
          <LogoSet items={items} />
          <LogoSet items={items} />
        </div>
      </div>
    </section>
  );
}
