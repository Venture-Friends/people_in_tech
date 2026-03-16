"use client";

export function AnimatedBackground() {
  return (
    <>
      {/* Gradient Orbs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
        <div className="orb orb-5" />
        <div className="orb orb-6" />
      </div>

      {/* Perspective Grid */}
      <div className="perspective-grid" aria-hidden="true" />

      {/* Noise Texture */}
      <div className="noise-overlay" aria-hidden="true" />

      {/* Floating Particles */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`} />
        ))}
      </div>
    </>
  );
}
