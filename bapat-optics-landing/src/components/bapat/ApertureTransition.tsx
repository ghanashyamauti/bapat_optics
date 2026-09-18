import { useEffect, useRef, useState, type ReactNode } from "react";
import { Crosshair, Compass, Sparkles } from "lucide-react";
import { usePrefersReducedMotion } from "./hooks";

export interface ApertureTransitionProps {
  id?: string;
  theme?: "dark-to-light" | "light-to-dark" | "dark-to-dark";
  badge?: string;
  heading?: string;
  subheading?: string;
  metric?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * Reusable luxury Optical Iris Aperture transition.
 * Simulates a Carl Zeiss camera / phoropter lens diaphragm expanding on scroll,
 * smoothly bridging two distinct sections with authentic optical calibration markings.
 */
export function ApertureTransition({
  id = "aperture-portal",
  theme = "dark-to-light",
  badge = "Carl Zeiss Precision Centration · Optical Diaphragm",
  heading = "Transitioning to Individual Calibration",
  subheading = "From international silhouettes to bespoke Zeiss optical refraction",
  metric = "AXIS 180° · Ø 54mm · APERTURE f/1.4",
  className = "",
  children,
}: ApertureTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  // Scroll progress from 0 (closed aperture) to 1 (fully open)
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

  // Color schemes for flexible reusability
  const themeClasses = {
    "dark-to-light": {
      outerBg: "bg-obsidian",
      innerBg: "bg-bone",
      outerText: "text-paper",
      outerMuted: "text-steel",
      ringColor: "#C6A15B", // gold
      crosshairColor: "rgba(198, 161, 91, 0.7)",
    },
    "light-to-dark": {
      outerBg: "bg-bone",
      innerBg: "bg-obsidian",
      outerText: "text-obsidian",
      outerMuted: "text-muted-foreground",
      ringColor: "#A4813E",
      crosshairColor: "rgba(164, 129, 62, 0.7)",
    },
    "dark-to-dark": {
      outerBg: "bg-obsidian",
      innerBg: "bg-charcoal",
      outerText: "text-paper",
      outerMuted: "text-steel",
      ringColor: "#C6A15B",
      crosshairColor: "rgba(198, 161, 91, 0.7)",
    },
  }[theme];

  // If reduced motion is preferred, render an elegant static optical divider
  if (reduced) {
    return (
      <div
        id={id}
        className={`relative w-full overflow-hidden ${themeClasses.outerBg} py-14 px-6 border-y border-gold/20 text-center ${className}`}
      >
        <div className="mx-auto max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[9px] uppercase tracking-widest text-gold font-mono mb-3">
            <Compass size={11} className="text-gold" />
            <span>{badge}</span>
          </div>
          <h3 className={`display text-2xl ${themeClasses.outerText}`}>{heading}</h3>
          <p className={`mt-2 text-xs ${themeClasses.outerMuted}`}>{subheading}</p>
        </div>
      </div>
    );
  }

  // Calculate aperture radius percentage:
  // Starts at ~3.5% (approx 50-60px circle on desktop), expands to 110% (full screen bleed)
  const apertureRadius = 3.5 + Math.pow(progress, 1.8) * 106.5;

  // Mechanical rotation of the calibration ring during scroll (0 to 35 degrees)
  const ringRotation = progress * 35;

  // Telemetry opacity fades out in the final 20% of the opening
  const hudOpacity = Math.max(0, 1 - progress * 1.3);

  // Aperture ring overlay opacity fades out as it expands past 80%
  const ringOpacity = Math.max(0, 1 - Math.max(0, (progress - 0.7) / 0.3));

  return (
    <section
      ref={containerRef}
      id={id}
      className={`relative w-full h-[175vh] ${className}`}
      aria-label="Optical Transition Section"
    >
      {/* Pinned Viewport Stage */}
      <div
        ref={stickyRef}
        className={`sticky top-0 left-0 w-full h-screen overflow-hidden ${themeClasses.outerBg} flex items-center justify-center select-none`}
      >
        {/* Destination Content Layer (Revealed through the expanding circular aperture) */}
        <div
          className={`absolute inset-0 ${themeClasses.innerBg} flex items-center justify-center will-change-[clip-path]`}
          style={{
            clipPath: `circle(${apertureRadius}% at 50% 50%)`,
          }}
        >
          {/* Subtle optical alignment watermark inside the revealed chamber */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-15">
            <div className="relative flex items-center justify-center">
              <div className="h-[75vmin] w-[75vmin] rounded-full border border-dashed border-gold/60 animate-[spin_120s_linear_infinite]" />
              <div className="absolute h-[50vmin] w-[50vmin] rounded-full border border-gold/40" />
              <div className="absolute h-[25vmin] w-[25vmin] rounded-full border border-gold/50" />
            </div>
          </div>

          {/* Destination Teaser Content (visible inside the lens before full expansion) */}
          <div
            className="relative z-10 flex flex-col items-center text-center px-6 transition-opacity duration-300"
            style={{
              opacity: Math.min(1, Math.max(0, (progress - 0.2) * 1.5)),
            }}
          >
            {children ? (
              children
            ) : (
              <div className="max-w-md">
                <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-obsidian/20 bg-paper/80 px-3 py-1 text-[9px] font-bold tracking-widest text-obsidian backdrop-blur-xs mb-3 shadow-xs">
                  <Sparkles size={11} className="text-gold" />
                  <span>The Bapat Standard · Carl Zeiss</span>
                </span>
                <p className="display text-3xl sm:text-4xl text-obsidian tracking-tight">
                  Vision is Personal<span className="text-gold">.</span>
                </p>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                  Prescription lenses calibrated to 1/100th of a diopter.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Optical Telemetry HUD (Header & Footnotes) */}
        <div
          className="pointer-events-none absolute inset-x-0 top-12 z-20 flex flex-col items-center text-center px-4 transition-opacity duration-200"
          style={{ opacity: hudOpacity }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-obsidian/75 px-3.5 py-1 text-[9px] uppercase tracking-[0.24em] text-gold backdrop-blur-md font-mono shadow-lg">
            <Compass size={11} className="text-gold animate-spin" style={{ animationDuration: "20s" }} />
            <span>{badge}</span>
          </div>

          <h3 className={`display mt-3 text-xl sm:text-2xl md:text-3xl ${themeClasses.outerText} tracking-tight`}>
            {heading}
          </h3>

          <p className={`mt-1 text-[11px] sm:text-xs ${themeClasses.outerMuted} max-w-md`}>
            {subheading}
          </p>
        </div>

        {/* The Precision Optical Iris Reticle Overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center will-change-transform"
          style={{ opacity: ringOpacity }}
        >
          {/* Dynamic Iris Perimeter Ring */}
          <div
            className="relative flex items-center justify-center rounded-full will-change-transform"
            style={{
              width: `calc(${apertureRadius * 2}vmin)`,
              height: `calc(${apertureRadius * 2}vmin)`,
              minWidth: "70px",
              minHeight: "70px",
              maxWidth: "220vmin",
              maxHeight: "220vmin",
              transform: `rotate(${ringRotation}deg)`,
              transition: "transform 0.05s linear",
            }}
          >
            {/* Outer Golden Precision Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-gold/80 shadow-[0_0_20px_rgba(198,161,91,0.3)]" />

            {/* Inner Concentric Fine Line */}
            <div className="absolute inset-1.5 sm:inset-2.5 rounded-full border border-gold/35" />

            {/* 4 Optical Cardinal Alignment Pips (0°, 90°, 180°, 270°) */}
            <div className="absolute -top-3 flex flex-col items-center">
              <div className="h-2.5 w-0.5 bg-gold" />
              <span className="text-[7px] text-gold font-mono mt-0.5">0°</span>
            </div>
            <div className="absolute -bottom-3 flex flex-col items-center">
              <span className="text-[7px] text-gold font-mono mb-0.5">180°</span>
              <div className="h-2.5 w-0.5 bg-gold" />
            </div>
            <div className="absolute -left-3 flex items-center">
              <div className="w-2.5 h-0.5 bg-gold" />
              <span className="text-[7px] text-gold font-mono ml-0.5">270°</span>
            </div>
            <div className="absolute -right-3 flex items-center">
              <span className="text-[7px] text-gold font-mono mr-0.5">90°</span>
              <div className="w-2.5 h-0.5 bg-gold" />
            </div>

            {/* 8 Peripheral Tick Marks */}
            {[45, 135, 225, 315].map((deg) => (
              <div
                key={deg}
                className="absolute h-full w-full pointer-events-none"
                style={{ transform: `rotate(${deg}deg)` }}
              >
                <div className="mx-auto h-1.5 w-px bg-gold/50" />
              </div>
            ))}

            {/* Optical Crosshair (Visible when aperture is in initial/focal state) */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
              style={{ opacity: Math.max(0, 1 - progress * 2.5) }}
            >
              <Crosshair size={22} className="text-gold animate-pulse" />
            </div>
          </div>
        </div>

        {/* Bottom Optical Telemetry Readout */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-10 z-20 flex flex-col items-center text-center px-4 transition-opacity duration-200"
          style={{ opacity: hudOpacity }}
        >
          <div className="flex items-center gap-3 text-[10px] text-gold/80 font-mono tracking-widest uppercase">
            <span className="h-px w-6 bg-gold/40" />
            <span>{metric}</span>
            <span className="h-px w-6 bg-gold/40" />
          </div>

          <div className="mt-2 flex items-center gap-2 text-[9px] text-steel">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold animate-ping" />
            <span className="uppercase tracking-wider">Scroll to open diaphragm</span>
          </div>
        </div>
      </div>
    </section>
  );
}
