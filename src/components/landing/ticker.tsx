"use client";

interface TickerProps {
  industries: string[];
  techAndLocations: string[];
}

export function Ticker({ industries, techAndLocations }: TickerProps) {
  return (
    <section className="w-full py-8 overflow-hidden">
      <div className="flex flex-col gap-3">
        {/* Row 1: Industries scrolling right */}
        <div
          className="ticker-mask group"
          style={{ maskImage: "linear-gradient(90deg, transparent, black 6%, black 94%, transparent)" }}
        >
          <div className="flex gap-3 animate-ticker-scroll hover:[animation-play-state:paused]">
            {[...industries, ...industries].map((item, i) => (
              <span
                key={`ind-${i}`}
                className="shrink-0 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-1.5 text-[13px] text-white/40 transition-colors hover:border-primary/30 hover:text-primary"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Row 2: Tech + Locations scrolling left */}
        <div
          className="ticker-mask group"
          style={{ maskImage: "linear-gradient(90deg, transparent, black 6%, black 94%, transparent)" }}
        >
          <div className="flex gap-3 animate-ticker-scroll-reverse hover:[animation-play-state:paused]">
            {[...techAndLocations, ...techAndLocations].map((item, i) => (
              <span
                key={`tech-${i}`}
                className="shrink-0 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-1.5 text-[13px] text-white/40 transition-colors hover:border-primary/30 hover:text-primary"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
