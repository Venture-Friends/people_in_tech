interface TrustedByTickerProps {
  logos: { name: string; logo: string; slug: string }[];
}

export function TrustedByTicker({ logos }: TrustedByTickerProps) {
  if (logos.length < 8) return null;

  const mid = Math.ceil(logos.length / 2);
  const row1 = logos.slice(0, mid);
  const row2 = logos.slice(mid);

  return (
    <section className="py-16 overflow-hidden">
      <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-white/20 mb-8">
        Trusted by
      </p>

      {/* Row 1 - scrolls left */}
      <div
        className="relative mb-4"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent, black 6%, black 94%, transparent)",
        }}
      >
        <div className="flex animate-logo-scroll-left gap-12 whitespace-nowrap">
          {[...row1, ...row1].map((company, i) => (
            <img
              key={`r1-${i}`}
              src={company.logo}
              alt={company.name}
              className="h-8 w-auto shrink-0 object-contain opacity-30 grayscale hover:opacity-60 hover:grayscale-0 transition-all duration-300"
            />
          ))}
        </div>
      </div>

      {/* Row 2 - scrolls right */}
      <div
        className="relative"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent, black 6%, black 94%, transparent)",
        }}
      >
        <div className="flex animate-logo-scroll-right gap-12 whitespace-nowrap">
          {[...row2, ...row2].map((company, i) => (
            <img
              key={`r2-${i}`}
              src={company.logo}
              alt={company.name}
              className="h-8 w-auto shrink-0 object-contain opacity-30 grayscale hover:opacity-60 hover:grayscale-0 transition-all duration-300"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
