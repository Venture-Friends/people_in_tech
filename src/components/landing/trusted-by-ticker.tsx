"use client";

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
    "shrink-0 px-8 py-4 transition-all duration-300 opacity-50 hover:opacity-100 hover:scale-105";

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

  // Repeat logos enough times so the strip is wider than the viewport
  // to create a seamless scroll. Minimum 8 items per set.
  const repeatCount = Math.max(1, Math.ceil(8 / logos.length));
  const set = Array.from({ length: repeatCount }, () => logos).flat();

  return (
    <section className="w-full py-10">
      <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-white/20 mb-8">
        Trusted by
      </p>
      <div
        className="group w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_12%,white_88%,transparent)]"
      >
        <div className="flex w-max items-center gap-16 animate-marquee group-hover:[animation-play-state:paused]">
          {set.map((company, i) => (
            <LogoLink key={`a-${i}`} company={company} />
          ))}
          {set.map((company, i) => (
            <LogoLink key={`b-${i}`} company={company} />
          ))}
        </div>
      </div>
    </section>
  );
}
