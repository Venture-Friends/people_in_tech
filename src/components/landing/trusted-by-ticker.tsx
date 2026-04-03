import { Link } from "@/i18n/navigation";

interface LogoItem {
  name: string;
  logo: string;
  slug?: string;
  url?: string;
}

interface TrustedByTickerProps {
  logos?: LogoItem[];
}

export function TrustedByTicker({ logos }: TrustedByTickerProps) {
  if (!logos || logos.length === 0) return null;

  return (
    <section className="pt-8 pb-12">
      <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-white/20 mb-8">
        Trusted by
      </p>
      <div className="flex items-center justify-center gap-12 sm:gap-16 flex-wrap px-8">
        {logos.map((company) => {
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
                key={company.name}
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
                key={company.slug}
                href={`/companies/${company.slug}`}
                className="shrink-0 transition-opacity duration-300 opacity-70 hover:opacity-100"
              >
                {logoEl}
              </Link>
            );
          }

          return (
            <span key={company.name} className="shrink-0 opacity-70">
              {logoEl}
            </span>
          );
        })}
      </div>
    </section>
  );
}
