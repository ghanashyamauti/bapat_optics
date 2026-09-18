import { useEffect, useRef, useState } from "react";
import { Compass, Sparkles, ArrowDown } from "lucide-react";
import { usePrefersReducedMotion } from "./hooks";

export interface GoldenThreadTransitionProps {
  id?: string;
  className?: string;
}

const CAPITALS = [
  { city: "Milano", label: "Prada · Armani", x: 180, y: 190 },
  { city: "Paris", label: "Dior · Cartier", x: 380, y: 120 },
  { city: "London", label: "Burberry", x: 540, y: 220 },
  { city: "Tokyo", label: "Titanium Handcraft", x: 720, y: 140 },
  { city: "Pune", label: "Bapat Optics Atelier", x: 880, y: 240 },
];

/**
 * "The Golden Thread Unfurl" Transition.
 * Bridges Zeiss EyeQ (white paper) and the 3D Brand Spiral (#050507 deep cosmos).
 * A single razor-thin champagne gold thread unfurls and curves in 3D parallax,
 * organically birthing the continuous sculptural ribbon of the 20 Iconic Designer Houses.
 */
export function GoldenThreadTransition({
  id = "golden-thread-transition",
  className = "",
}: GoldenThreadTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  // Scroll scrub progress: 0 (white paper) to 1 (deep cosmos / ready for BrandSpiral)
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

  // Reduced motion fallback: elegant static gold demarcation band
  if (reduced) {
    return (
      <div
        id={id}
        className={`relative w-full bg-[#050507] py-14 px-6 border-y border-gold/20 text-center ${className}`}
      >
        <div className="mx-auto max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[9px] uppercase tracking-widest text-gold font-mono mb-3">
            <Compass size={11} className="text-gold" />
            <span>Curated Brand Lineage · 20 Designer Houses</span>
          </div>
          <h3 className="display text-2xl text-paper">From Bespoke Fitting to Iconic Silhouettes</h3>
          <p className="mt-2 text-xs text-steel">
            Milano · Paris · London · Tokyo · New York · Pune
          </p>
        </div>
      </div>
    );
  }

  // Smooth opacity morph from #FFFFFF to #050507
  const cosmosOpacity = Math.min(1, Math.pow(progress, 1.2) * 1.15);

  // SVG thread drawing calculation: total path length is ~1400px
  const totalPathLength = 1450;
  const strokeDashoffset = totalPathLength * (1 - Math.min(1, progress * 1.15));

  // Dynamic 3D rotation / twist of the spiral thread (0° to 24°)
  const ribbonTwist = progress * 24;

  // Telemetry HUD opacity fades out in the final 22% of scrub
  const hudOpacity = Math.max(0, 1 - Math.max(0, (progress - 0.78) / 0.22));

  return (
    <section
      ref={containerRef}
      id={id}
      className={`relative w-full h-[175vh] ${className}`}
      aria-label="Golden Thread Unfurl Transition"
    >
      {/* Pinned Viewport Stage */}
      <div
        ref={stickyRef}
        className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-paper flex items-center justify-center select-none"
      >
        {/* Layer 1: Darkening Cosmos Layer (#050507 matching BrandSpiral) */}
        <div
          className="absolute inset-0 bg-[#050507] pointer-events-none will-change-[opacity]"
          style={{ opacity: cosmosOpacity }}
        />

        {/* Layer 2: Ambient Gold Stardust Particles (Mirrors BrandSpiral particle field) */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500"
          style={{
            opacity: Math.min(0.35, progress * 0.45),
            backgroundImage: `radial-gradient(circle, rgba(198,161,91,0.5) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Top Telemetry & Title HUD */}
        <div
          className="pointer-events-none absolute inset-x-0 top-12 z-20 flex flex-col items-center text-center px-4 transition-opacity duration-200"
          style={{ opacity: hudOpacity }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-obsidian/85 px-3.5 py-1 text-[9px] uppercase tracking-[0.24em] text-gold backdrop-blur-md font-mono shadow-xl">
            <Sparkles size={11} className="text-gold" />
            <span>From Bespoke Fitting to Iconic Silhouettes</span>
          </div>

          <h3 className="display mt-3 text-xl sm:text-2xl md:text-3xl text-paper tracking-tight">
            The Curated Lineage<span className="text-gold">.</span>
          </h3>

          <p className="mt-1 text-[11px] sm:text-xs text-steel max-w-md">
            Twenty international designer houses, fitted in person to micron precision.
          </p>
        </div>

        {/* Center: The Golden Thread Spiral Ribbon Path */}
        <div
          className="relative z-10 w-full max-w-[1100px] px-6 flex items-center justify-center will-change-transform"
          style={{
            transform: `rotate(${ribbonTwist}deg) scale(${0.9 + progress * 0.2})`,
            transition: "transform 0.05s linear",
          }}
        >
          <svg
            className="w-full h-auto max-h-[55vh] overflow-visible drop-shadow-[0_0_25px_rgba(198,161,91,0.45)]"
            viewBox="0 0 1000 360"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Metallic Champagne Gold Thread Gradient */}
              <linearGradient id="goldThreadGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#C6A15B" stopOpacity="0.3" />
                <stop offset="25%" stopColor="#E2D1A6" />
                <stop offset="50%" stopColor="#FFF8E7" />
                <stop offset="75%" stopColor="#C6A15B" />
                <stop offset="100%" stopColor="#A4813E" />
              </linearGradient>

              {/* Wider Shadow Ribbon Underneath */}
              <linearGradient id="ribbonShadow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C6A15B" stopOpacity="0.05" />
                <stop offset="50%" stopColor="#C6A15B" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#C6A15B" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Ghost Track Guide */}
            <path
              d="M 60,180 C 140,80 240,60 360,140 C 480,220 560,280 680,180 C 800,80 880,140 940,220"
              stroke="rgba(198,161,91,0.12)"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
            />

            {/* Dynamic Unfurling Ribbon Body (Fills out as it uncoils) */}
            <path
              d="M 60,180 C 140,80 240,60 360,140 C 480,220 560,280 680,180 C 800,80 880,140 940,220"
              stroke="url(#ribbonShadow)"
              strokeWidth="24"
              strokeLinecap="round"
              fill="none"
              style={{
                strokeDasharray: totalPathLength,
                strokeDashoffset,
                transition: "stroke-dashoffset 0.08s linear",
              }}
            />

            {/* The Razor-Thin Golden Thread Core */}
            <path
              d="M 60,180 C 140,80 240,60 360,140 C 480,220 560,280 680,180 C 800,80 880,140 940,220"
              stroke="url(#goldThreadGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              style={{
                strokeDasharray: totalPathLength,
                strokeDashoffset,
                transition: "stroke-dashoffset 0.08s linear",
              }}
            />

            {/* Secondary Fine Accent Hairline */}
            <path
              d="M 60,176 C 140,76 240,56 360,136 C 480,216 560,276 680,176 C 800,76 880,136 940,216"
              stroke="#FFF8E7"
              strokeWidth="1"
              strokeOpacity="0.75"
              strokeLinecap="round"
              fill="none"
              style={{
                strokeDasharray: totalPathLength,
                strokeDashoffset,
                transition: "stroke-dashoffset 0.08s linear",
              }}
            />

            {/* Fashion Capitals Along the Curve */}
            {CAPITALS.map((cap, i) => {
              const capProgressThreshold = (i + 1) / (CAPITALS.length + 1);
              const nodeVisible = progress >= capProgressThreshold * 0.75;

              return (
                <g
                  key={cap.city}
                  transform={`translate(${cap.x}, ${cap.y})`}
                  className="transition-opacity duration-300 pointer-events-none"
                  style={{ opacity: nodeVisible ? 1 : 0 }}
                >
                  {/* Glowing Node Halo */}
                  <circle cx="0" cy="0" r="10" fill="#C6A15B" fillOpacity="0.18" />
                  <circle cx="0" cy="0" r="3" fill="#FFF8E7" />
                  <circle cx="0" cy="0" r="1.2" fill="#0A0A0A" />

                  {/* City Label */}
                  <text
                    x="0"
                    y="-16"
                    textAnchor="middle"
                    fill="#F6F5F2"
                    fontSize="10"
                    fontFamily="serif"
                    fontWeight="600"
                    letterSpacing="1.5"
                  >
                    {cap.city}
                  </text>
                  <text
                    x="0"
                    y="-6"
                    textAnchor="middle"
                    fill="#C6A15B"
                    fontSize="7"
                    fontFamily="monospace"
                    letterSpacing="1"
                    opacity="0.85"
                  >
                    {cap.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Bottom Telemetry & Navigation Cue */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-10 z-20 flex flex-col items-center text-center px-4 transition-opacity duration-200"
          style={{ opacity: hudOpacity }}
        >
          <div className="flex items-center gap-3 text-[10px] text-gold/80 font-mono tracking-widest uppercase">
            <span className="h-px w-6 bg-gold/40" />
            <span>MILANO · PARIS · LONDON · TOKYO · NEW YORK · PUNE</span>
            <span className="h-px w-6 bg-gold/40" />
          </div>

          <div className="mt-2.5 flex items-center gap-2 text-[9px] text-steel">
            <ArrowDown size={12} className="text-gold animate-bounce" />
            <span className="uppercase tracking-wider">Scroll into the 3D Brand Spiral</span>
          </div>
        </div>
      </div>
    </section>
  );
}
