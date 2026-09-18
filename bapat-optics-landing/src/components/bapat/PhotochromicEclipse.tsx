import { useEffect, useRef, useState } from "react";
import { Sun, Shield, Sparkles, ArrowDown, Zap } from "lucide-react";
import { usePrefersReducedMotion } from "./hooks";

export interface PhotochromicEclipseProps {
  id?: string;
  className?: string;
}

/**
 * "Photochromic Lens Eclipse" Transition.
 * Bridges the bright New Arrivals storefront (bone) and the dark Millimetre Detail atelier (obsidian).
 * Simulates the rapid UV-activated tinting of Carl Zeiss PhotoFusion X lenses,
 * plunging the screen from clear 0% into deep 85%+ Category 3 obsidian sunglass tint.
 */
export function PhotochromicEclipse({
  id = "photochromic-eclipse",
  className = "",
}: PhotochromicEclipseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  // Scroll scrub progress: 0 (clear / bone) to 1 (full dark obsidian)
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reduced || typeof window === "undefined") return;

    let cancelled = false;
    let ctx: { revert: () => void } | undefined;

    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const container = containerRef.current;
      if (!container) return;

      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          onUpdate: (self) => {
            setProgress(self.progress);
          },
        });
      }, container);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduced]);

  // Reduced motion fallback: elegant static dark transition band
  if (reduced) {
    return (
      <div
        id={id}
        className={`relative w-full bg-obsidian py-14 px-6 border-y border-gold/20 text-center ${className}`}
      >
        <div className="mx-auto max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[9px] uppercase tracking-widest text-gold font-mono mb-3">
            <Sun size={11} className="text-gold" />
            <span>Carl Zeiss PhotoFusion X · UV Eclipse</span>
          </div>
          <h3 className="display text-2xl text-paper">Reactive to Every Ray of Pune Sunlight</h3>
          <p className="mt-2 text-xs text-steel">
            Photochromic precision lenses darkening to Category 3 sun protection within 15 seconds.
          </p>
        </div>
      </div>
    );
  }

  // Calculated photochromic values based on scroll
  const tintDensity = Math.min(85, Math.round(progress * 85));
  const eclipseDarkness = Math.min(1, Math.pow(progress, 1.2) * 1.05);
  const ringCircumference = 2 * Math.PI * 54; // r = 54
  const strokeDashoffset = ringCircumference * (1 - progress);

  // HUD text transitions
  const hudOpacity = Math.max(0, 1 - Math.max(0, (progress - 0.78) / 0.22));

  return (
    <section
      ref={containerRef}
      id={id}
      className={`relative w-full h-[175vh] ${className}`}
      aria-label="Photochromic Lens Eclipse Transition"
    >
      {/* Pinned Viewport Stage */}
      <div
        ref={stickyRef}
        className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-bone flex items-center justify-center select-none"
      >
        {/* Layer 1: Darkening Photochromic Matrix Overlay */}
        <div
          className="absolute inset-0 bg-obsidian pointer-events-none will-change-[opacity]"
          style={{ opacity: eclipseDarkness }}
        />

        {/* Layer 2: Radial UV Lens Flare & Tint Concentration Gradient */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            opacity: Math.min(1, progress * 1.3),
            background: `radial-gradient(circle at 50% 50%, rgba(10,10,10,${0.3 + progress * 0.7}) 0%, rgba(10,10,10,${0.6 + progress * 0.4}) 60%, #0A0A0A 100%)`,
          }}
        />

        {/* Layer 3: Molecular Photochromic Grid Lattice (Subtle gold laser grid reacting to UV) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20 transition-opacity duration-500"
          style={{
            opacity: Math.max(0, Math.min(0.25, (progress - 0.1) * 0.4)),
            backgroundImage: `radial-gradient(circle, rgba(198,161,91,0.3) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Top Header Telemetry */}
        <div
          className="pointer-events-none absolute inset-x-0 top-12 z-20 flex flex-col items-center text-center px-4 transition-opacity duration-200"
          style={{ opacity: hudOpacity }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-obsidian/85 px-3.5 py-1 text-[9px] uppercase tracking-[0.22em] text-gold backdrop-blur-md font-mono shadow-xl">
            <Zap size={11} className="text-gold animate-pulse" />
            <span>Carl Zeiss PhotoFusion X · UV Photochromic Eclipse</span>
          </div>

          <h3 className="display mt-3 text-xl sm:text-2xl md:text-3xl text-paper tracking-tight">
            Reactive to Every Ray of Pune Sunlight<span className="text-gold">.</span>
          </h3>

          <p className="mt-1 text-[11px] sm:text-xs text-steel max-w-md">
            Molecular dyes in the Zeiss lens matrix darken rapidly. Moving from storefront clarity into microscopic atelier craft.
          </p>
        </div>

        {/* Central UV Photochromic Activation Gauge */}
        <div
          className="relative z-10 flex flex-col items-center justify-center text-center px-6 will-change-transform transition-opacity duration-300"
          style={{ opacity: hudOpacity }}
        >
          {/* Circular Photochromic Tint Meter */}
          <div className="relative flex items-center justify-center">
            {/* Outer Orbiting UV Wave */}
            <div className="absolute h-52 w-52 sm:h-64 sm:w-64 rounded-full border border-dashed border-gold/40 animate-[spin_60s_linear_infinite]" />
            <div className="absolute h-44 w-44 sm:h-52 sm:w-52 rounded-full border border-gold/25" />

            {/* Circular SVG Gauge Meter */}
            <svg className="h-40 w-40 sm:h-48 sm:w-48 -rotate-90 transform" viewBox="0 0 120 120">
              {/* Track */}
              <circle
                cx="60"
                cy="60"
                r="54"
                className="stroke-paper/10"
                strokeWidth="4"
                fill="transparent"
              />
              {/* Active Golden Tint Arc */}
              <circle
                cx="60"
                cy="60"
                r="54"
                stroke="#C6A15B"
                strokeWidth="4.5"
                strokeLinecap="round"
                fill="transparent"
                style={{
                  strokeDasharray: ringCircumference,
                  strokeDashoffset,
                  transition: "stroke-dashoffset 0.1s linear",
                }}
              />
            </svg>

            {/* Center Gauge Readout */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="font-mono text-3xl sm:text-4xl font-bold text-paper tracking-tight">
                {tintDensity}%
              </span>
              <span className="text-[8px] uppercase tracking-[0.24em] text-gold font-mono mt-0.5">
                {progress > 0.65 ? "CAT. 3 SUN TINT" : progress > 0.25 ? "ACTIVE UV SHADE" : "CRYSTAL CLEAR"}
              </span>
            </div>
          </div>

          {/* Optical Wavelength Telemetry */}
          <div className="mt-5 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-obsidian/80 px-3 py-1 text-[8px] sm:text-[9px] font-mono tracking-widest text-gold uppercase shadow-md">
              <Sun size={10} className="text-gold" />
              <span>UV400 nm Spectral Absorption</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-paper/15 bg-obsidian/80 px-3 py-1 text-[8px] sm:text-[9px] font-mono tracking-widest text-steel uppercase shadow-md">
              <Shield size={10} className="text-gold" />
              <span>BlueGuard Filtration</span>
            </span>
          </div>
        </div>

        {/* Bottom Optical Metrics Readout */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-10 z-20 flex flex-col items-center text-center px-4 transition-opacity duration-200"
          style={{ opacity: hudOpacity }}
        >
          <div className="flex items-center gap-3 text-[10px] text-gold/80 font-mono tracking-widest uppercase">
            <span className="h-px w-6 bg-gold/40" />
            <span>15 SEC RAPID TINT · DURA-VISION PLATINUM · ATELIER INSPECTION</span>
            <span className="h-px w-6 bg-gold/40" />
          </div>

          <div className="mt-2.5 flex items-center gap-2 text-[9px] text-steel">
            <ArrowDown size={12} className="text-gold animate-bounce" />
            <span className="uppercase tracking-wider">Scroll into Millimetre Detail</span>
          </div>
        </div>
      </div>
    </section>
  );
}
