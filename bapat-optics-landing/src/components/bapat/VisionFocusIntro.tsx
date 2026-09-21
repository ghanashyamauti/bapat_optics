import { useMemo } from "react";
import { motion } from "motion/react";
import { Sparkles, ArrowRight } from "lucide-react";

interface VisionFocusIntroProps {
  progress: number; // 0 to 1
  percentage: number; // 0 to 100
  isReady: boolean;
  isExiting: boolean;
  onSkip: () => void;
}

export function VisionFocusIntro({
  progress,
  percentage,
  isReady,
  isExiting,
  onSkip,
}: VisionFocusIntroProps) {
  // Calibration phase messages reflecting precision optical refraction
  const phaseText = useMemo(() => {
    if (percentage < 28) return "01 · MEASURING CORNEAL WAVEFRONT";
    if (percentage < 60) return "02 · CALIBRATING ZEISS OPTICAL AXIS";
    if (percentage < 88) return "03 · ALIGNING HANDCRAFTED ITALIAN ACETATE";
    return "04 · 20/20 CRYSTAL CLARITY CALIBRATED";
  }, [percentage]);

  // Lens focal blur simulation (from 16px blur down to 0px tack-sharp)
  const blurAmount = Math.max(0, (1 - progress) * 16);

  return (
    <motion.div
      onClick={onSkip}
      initial={{ opacity: 1 }}
      animate={{
        opacity: isExiting ? 0 : 1,
        scale: isExiting ? 1.05 : 1,
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[250] flex flex-col justify-between bg-[#060608] px-5 py-6 sm:px-8 sm:py-8 md:px-12 md:py-10 select-none overflow-hidden cursor-pointer"
      style={{
        // Silk smooth hardware-accelerated opacity dissolve
        willChange: "opacity, transform",
      }}
    >
      {/* 1. Deep Atmospheric Background & Ambient Gold Caustic Field */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            background:
              "radial-gradient(circle at 50% 48%, rgba(212,175,55,0.09) 0%, rgba(18,18,22,0.85) 45%, #060608 80%)",
          }}
        />

        {/* Optical Axis Millimeter Reticle Crosshairs */}
        <svg
          className="absolute inset-0 h-full w-full opacity-15"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="crosshair-fade" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#d4af37" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#d4af37" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
            </radialGradient>
          </defs>
          <line
            x1="50%"
            y1="0"
            x2="50%"
            y2="100%"
            stroke="url(#crosshair-fade)"
            strokeWidth="0.75"
            strokeDasharray="4 8"
          />
          <line
            x1="0"
            y1="50%"
            x2="100%"
            y2="50%"
            stroke="url(#crosshair-fade)"
            strokeWidth="0.75"
            strokeDasharray="4 8"
          />
        </svg>
      </div>

      {/* 2. Top Header Bar */}
      <div className="relative z-10 flex w-full items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
          </span>
          <p className="eyebrow text-[9px] sm:text-[10px] tracking-[0.25em] text-steel uppercase">
            PUNE · EST. 2011 · ZEISS PARTNER
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 font-mono text-[9px] text-steel/80 tracking-widest uppercase">
          <span>AXIS 180°</span>
          <span className="text-gold/60">·</span>
          <span>REFRACTION 0.00</span>
        </div>
      </div>

      {/* 3. Centerpiece — The Crystal Optical Focus Lens & Brand Emblem */}
      <div className="relative z-10 mx-auto my-auto flex flex-col items-center justify-center text-center">
        {/* Dynamic Focus Ring Assembly */}
        <div className="relative flex items-center justify-center">
          {/* Subtle Outer Calibration Ring (Soft continuous rotation) */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute h-52 w-52 sm:h-72 sm:w-72 md:h-80 md:w-80 rounded-full border border-dashed border-gold/20"
          />

          {/* Secondary Optical Reticle Ring with 4 Cardinal Axes */}
          <div className="absolute h-44 w-44 sm:h-60 sm:w-60 md:h-68 md:w-68 rounded-full border border-paper/10">
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 w-[1px] bg-gold" />
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-3 w-[1px] bg-gold" />
            <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 h-[1px] w-3 bg-gold" />
            <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 h-[1px] w-3 bg-gold" />
          </div>

          {/* Luminous Core Lens Element: Expands smoothly on exit */}
          <motion.div
            animate={{
              scale: isExiting ? 1.4 : 1,
              opacity: isExiting ? 0 : 1,
            }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex h-36 w-36 sm:h-48 sm:w-48 md:h-56 md:w-56 items-center justify-center rounded-full bg-gradient-to-b from-paper/[0.04] via-obsidian/60 to-obsidian/90 backdrop-blur-md border border-paper/20 shadow-2xl shadow-gold/10"
          >
            {/* Anti-Reflective Optical Multi-Coating Caustic Glow */}
            <div
              className="absolute inset-0 rounded-full opacity-40 mix-blend-screen transition-all duration-700"
              style={{
                background:
                  "conic-gradient(from 0deg, rgba(212,175,55,0.2) 0deg, rgba(147,112,219,0.15) 120deg, rgba(30,144,255,0.15) 240deg, rgba(212,175,55,0.2) 360deg)",
                filter: `blur(${Math.max(2, blurAmount * 0.5)}px)`,
              }}
            />

            {/* Bapat Brand Monogram & Luxury Emblem */}
            <div
              className="relative z-10 flex flex-col items-center justify-center transition-all duration-500"
              style={{
                filter: `blur(${blurAmount}px)`,
              }}
            >
              <img
                src="/bapat-logo.png"
                alt="Bapat Optics"
                className="h-10 w-10 sm:h-14 sm:w-14 object-contain rounded-full border border-paper/25 p-1 bg-obsidian/80 shadow-lg"
              />
              <h2 className="display mt-2 sm:mt-2.5 text-lg sm:text-2xl tracking-wide text-paper font-normal">
                Bapat<span className="text-gold">.</span>
              </h2>
              <p className="eyebrow text-[8px] sm:text-[9px] tracking-[0.35em] text-steel uppercase mt-0.5">
                Optics · Pune
              </p>
            </div>
          </motion.div>
        </div>

        {/* 4. Large Precision Numerical Telemetry (Rolling progress) */}
        <div className="mt-8 sm:mt-10 flex flex-col items-center">
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-3xl sm:text-5xl font-light tracking-tight text-paper">
              {String(percentage).padStart(2, "0")}
            </span>
            <span className="text-xs sm:text-sm font-light text-gold tracking-wider">%</span>
          </div>

          {/* Smooth Golden Thread Progress Bar */}
          <div className="relative mt-3 h-[2px] w-48 sm:w-64 overflow-hidden rounded-full bg-paper/10">
            <motion.div
              className="h-full bg-gradient-to-r from-paper/40 via-gold to-paper"
              style={{
                width: `${percentage}%`,
                transition: "width 0.12s linear",
              }}
            />
          </div>

          {/* Dynamic Calibration Phase Line */}
          <p className="eyebrow mt-3.5 text-[8.5px] sm:text-[10px] tracking-[0.25em] text-steel transition-all duration-300">
            {phaseText}
          </p>
        </div>
      </div>

      {/* 5. Bottom Interactive Controls (Skip affordance) */}
      <div className="relative z-10 flex w-full items-center justify-between border-t border-paper/10 pt-4 sm:pt-5">
        <p className="hidden sm:block eyebrow text-[9px] tracking-[0.2em] text-steel/70 uppercase">
          BESPOKE EYEWEAR · KOTHRUD & SADASHIV PETH
        </p>

        {/* Action button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSkip();
          }}
          className="group ml-auto flex items-center gap-2 rounded-full border border-paper/20 bg-paper/[0.04] px-4 py-2 sm:px-5 sm:py-2.5 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-paper/90 transition-all hover:border-gold hover:bg-gold hover:text-obsidian active:scale-95 backdrop-blur-md"
        >
          <Sparkles size={11} className="text-gold transition-colors group-hover:text-obsidian" />
          <span>{isReady ? "Enter Flagship" : "Skip Intro"}</span>
          <ArrowRight
            size={11}
            className="transition-transform duration-300 group-hover:translate-x-0.5"
          />
        </button>
      </div>
    </motion.div>
  );
}
