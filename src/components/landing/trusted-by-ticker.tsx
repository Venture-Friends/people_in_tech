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

function LogoLink({ company }: { company: LogoItem }) {
  const logoEl = (
    <img
      src={company.logo}
      alt={company.name}
      className="max-h-10 w-auto object-contain"
    />
  );

  const className =
    "shrink-0 px-6 py-4 transition-all duration-300 opacity-50 hover:opacity-100 hover:scale-105";

  if (company.url) {
    return (
      <a
        href={company.url}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {logoEl}
      </a>
    );
  }

  if (company.slug) {
    return (
      <Link href={`/companies/${company.slug}`} className={className}>
        {logoEl}
      </Link>
    );
  }

  return <span className={className}>{logoEl}</span>;
}

export function TrustedByTicker({ logos }: TrustedByTickerProps) {
  if (!logos || logos.length === 0) return null;

  return (
    <section className="py-10">
      <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-white/20 mb-8">
        Trusted by
      </p>
      <div
        className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_12%,white_88%,transparent)]"
      >
        <div className="flex w-max items-center gap-16 animate-marquee hover:[animation-play-state:paused]">
          {logos.map((company, i) => (
            <LogoLink key={`a-${company.name}-${i}`} company={company} />
          ))}
          {logos.map((company, i) => (
            <LogoLink key={`b-${company.name}-${i}`} company={company} />
          ))}
        </div>
      </div>
    </section>
  );
}
