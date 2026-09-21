import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { usePrefersReducedMotion } from "./hooks";

/* ──────────────────────────────────────────────────────────────────
 * Cinematic Scrollytelling Lines
 * Short, poetic, cinematic single lines — nothing else.
 * ────────────────────────────────────────────────────────────── */

interface CinematicLine {
  range: [number, number];
  text: string;
}

const cinematicLines: CinematicLine[] = [
  {
    range: [0.08, 0.28],
    text: "Every gaze is singular.",
  },
  {
    range: [0.34, 0.54],
    text: "Calibrated to your living eye.",
  },
  {
    range: [0.60, 0.80],
    text: "Vision refined into art.",
  },
];

/* ──────────────────────────────────────────────────────────────────
 * IrisStoryOverlay — Section 1 Opening Transition Overlay
 * Rendered as an overlay layer over the Hero section viewport.
 * Does NOT push the destination section down in normal document flow.
 * ────────────────────────────────────────────────────────────── */

export interface IrisStoryOverlayProps {
  progress: number; // 0.0 to 1.0 (portal scrub progress)
  onSkip?: () => void;
  className?: string;
}

export function IrisStoryOverlay({
  progress,
  onSkip,
  className = "",
}: IrisStoryOverlayProps) {
  const reduced = usePrefersReducedMotion();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const mousePosRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const rafRef = useRef<number | null>(null);

  /* ── Smooth Mouse Parallax ── */
  useEffect(() => {
    if (reduced || typeof window === "undefined") return;
    const onMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      mousePosRef.current.targetX = nx;
      mousePosRef.current.targetY = ny;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    const loop = () => {
      const ref = mousePosRef.current;
      ref.x += (ref.targetX - ref.x) * 0.06;
      ref.y += (ref.targetY - ref.y) * 0.06;
      setMousePos({ x: ref.x, y: ref.y });
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reduced]);

  // If progress completes, unmount to save resources
  if (progress >= 1.0) {
    return null;
  }

  /* ── Computed Animation Values ── */
  const activeLine = cinematicLines.find(
    (l) => progress >= l.range[0] && progress <= l.range[1]
  );

  // Portal transition: 0.82 → 1.0
  const isTransitioning = progress > 0.82;
  const zt = isTransitioning ? Math.min(1, (progress - 0.82) / 0.18) : 0;

  // Iris visual: gentle zoom throughout, then dramatic dive into pupil
  const baseScale = 0.92 + progress * 0.18;
  const irisScale = isTransitioning
    ? baseScale + Math.pow(zt, 2.8) * 14
    : baseScale;

  // Opacity: iris fades into pure obsidian/canvas at the end of the portal
  const irisOpacity = isTransitioning
    ? Math.max(0, 1 - Math.pow(zt, 2.2) * 1.3)
    : 1;

  // Pupil dilates smoothly as you scroll deeper, and zooms massively in portal
  const pupilScale = 1 + progress * 0.35 + Math.pow(zt, 2) * 16;

  // Subtle organic rotation
  const irisRotation = progress * 32;

  // Top/bottom UI elements fade out cleanly before the portal transition
  const uiFade = progress > 0.78
    ? Math.max(0, 1 - (progress - 0.78) / 0.06)
    : 1;

  // Overall overlay container opacity (dissolves to reveal Hero canvas underneath)
  const overlayOpacity = isTransitioning
    ? Math.max(0, 1 - Math.pow(zt, 1.8))
    : 1;

  if (reduced) {
    return null;
  }

  return (
    <div
      className={`absolute inset-0 z-30 select-none overflow-hidden bg-[#0A0A0A] ${
        progress > 0.95 ? "pointer-events-none" : ""
      } ${className}`}
      style={{
        opacity: overlayOpacity,
        willChange: "opacity",
        transition: "opacity 0.1s linear",
      }}
      aria-label="Biometric Iris Opening Portal"
    >
      {/* ══ Solid 100% Opaque Obsidian Background (Zero bleed-through) ══ */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[#0A0A0A]">
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 48%, #121215 0%, #0A0A0A 60%, #0A0A0A 100%)",
            opacity: isTransitioning ? Math.max(0, 1 - zt * 1.4) : 1,
          }}
        />
        <div className="grain absolute inset-0 opacity-30" />
      </div>

      {/* ══ Top Status Bar ══ */}
      <div
        className="relative z-40 flex w-full items-center justify-between px-6 pt-24 sm:px-10 md:px-14 transition-opacity duration-300"
        style={{ opacity: uiFade }}
      >
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
          </span>
          <span className="eyebrow text-[9px] tracking-[0.3em] text-steel">
            BAPAT OPTICS · BIOMETRIC EYEWEAR
          </span>
        </div>

        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            data-cursor="SKIP"
            className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-paper/12 bg-paper/[0.03] px-3.5 py-1.5 text-[9px] uppercase tracking-[0.2em] text-steel/80 transition-all hover:border-gold hover:text-gold hover:bg-gold/10 active:scale-95 backdrop-blur-sm"
          >
            <span>Skip</span>
            <ChevronDown size={10} />
          </button>
        )}
      </div>

      {/* ══ Center: Living Iris with Parallax, Reticles, and Pupil Portal ══ */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <div
          className="relative flex items-center justify-center"
          style={{
            transform: `translate3d(${mousePos.x * 20}px, ${mousePos.y * 14}px, 0) scale(${irisScale}) rotate(${irisRotation}deg)`,
            opacity: irisOpacity,
            willChange: "transform, opacity",
            transition: "transform 0.15s ease-out",
          }}
        >
          {/* SVG Optical Reticle Lines */}
          <svg
            className="absolute -inset-20 h-[calc(100%+10rem)] w-[calc(100%+10rem)] overflow-visible"
            style={{
              opacity: (isTransitioning ? 1 - zt : 0.7) * uiFade,
              transition: "opacity 0.3s",
            }}
            viewBox="0 0 500 500"
            fill="none"
          >
            <defs>
              <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C6A15B" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#C6A15B" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#C6A15B" stopOpacity="0.6" />
              </linearGradient>
            </defs>

            {/* Concentric rings */}
            <circle
              cx="250"
              cy="250"
              r="220"
              stroke="url(#rg)"
              strokeWidth="0.6"
              strokeDasharray="3 7"
              className="animate-[spin_80s_linear_infinite]"
              style={{ transformOrigin: "250px 250px" }}
            />
            <circle cx="250" cy="250" r="195" stroke="#fff" strokeOpacity="0.06" strokeWidth="0.8" />
            <circle cx="250" cy="250" r="170" stroke="url(#rg)" strokeWidth="0.4" strokeDasharray="1 6" />

            {/* Cardinal crosshairs */}
            {[
              { x1: 250, y1: 8, x2: 250, y2: 55 },
              { x1: 250, y1: 445, x2: 250, y2: 492 },
              { x1: 8, y1: 250, x2: 55, y2: 250 },
              { x1: 445, y1: 250, x2: 492, y2: 250 },
            ].map((l, i) => (
              <line key={i} {...l} stroke="#C6A15B" strokeWidth="1" strokeOpacity="0.5" />
            ))}

            {/* 36 perimeter tick marks */}
            {Array.from({ length: 36 }).map((_, i) => {
              const a = (i * 10 * Math.PI) / 180;
              const inner = i % 3 === 0 ? 204 : 210;
              return (
                <line
                  key={i}
                  x1={250 + inner * Math.cos(a)}
                  y1={250 + inner * Math.sin(a)}
                  x2={250 + 220 * Math.cos(a)}
                  y2={250 + 220 * Math.sin(a)}
                  stroke="#C6A15B"
                  strokeWidth={i % 9 === 0 ? "1.2" : "0.5"}
                  strokeOpacity={i % 9 === 0 ? "0.7" : "0.25"}
                />
              );
            })}
          </svg>

          {/* Iris Sphere */}
          <div className="relative flex h-64 w-64 sm:h-80 sm:w-80 md:h-[26rem] md:w-[26rem] items-center justify-center rounded-full shadow-[0_0_120px_rgba(0,0,0,0.98)] overflow-hidden">
            <img
              src="/iris-macro.jpg?v=cosmic"
              alt="Cosmic Fine Art Iris — Bapat Optics"
              className="h-full w-full object-cover rounded-full select-none"
              style={{ filter: "contrast(1.05) saturate(1.05)" }}
            />

            {/* Pupil — dilates on scroll, portal aperture revealing Hero frames */}
            <div
              className="absolute rounded-full bg-[#050507] shadow-[inset_0_0_50px_rgba(0,0,0,0.98)] overflow-hidden flex items-center justify-center"
              style={{
                width: "28%",
                height: "28%",
                transform: `scale(${pupilScale})`,
                transition: "transform 0.15s ease-out",
                opacity: isTransitioning ? Math.max(0, 1 - zt * 1.8) : 1,
              }}
            >
              {/* Inside Pupil Portal: Frame 1 of Eyewear directly emerges from the dark */}
              {isTransitioning && (
                <div
                  className="relative flex items-center justify-center w-full h-full pointer-events-none"
                  style={{
                    opacity: Math.min(1, zt * 1.6),
                    transform: `scale(${0.5 + zt * 0.5})`,
                    transition: "transform 0.1s ease-out, opacity 0.1s ease-out",
                  }}
                >
                  <img
                    src="/frames/hero/frame_001.webp"
                    alt="Bapat Optics Eyewear"
                    className="w-[85%] h-[85%] object-contain filter drop-shadow-[0_0_40px_rgba(198,161,91,0.35)]"
                  />
                </div>
              )}
            </div>

            {/* Caustic light play */}
            <div
              className="absolute inset-0 rounded-full mix-blend-screen pointer-events-none"
              style={{
                background: `conic-gradient(from ${45 + mousePos.x * 30}deg, rgba(198,161,91,0.14) 0deg, transparent 80deg, rgba(120,100,200,0.08) 180deg, transparent 280deg, rgba(198,161,91,0.14) 360deg)`,
                opacity: 0.45 + mousePos.y * 0.15,
              }}
            />

            {/* Corneal catchlight */}
            <div
              className="absolute h-12 w-20 rounded-full bg-gradient-to-b from-white/20 to-transparent blur-[5px] pointer-events-none"
              style={{
                top: "18%",
                left: "22%",
                transform: `translate3d(${mousePos.x * 10}px, ${mousePos.y * 6}px, 0) rotate(-30deg)`,
                transition: "transform 0.15s ease-out",
              }}
            />
          </div>
        </div>
      </div>

      {/* ══ Cinematic Scrollytelling Lines (Pure Cinematic Lines Only) ══ */}
      <div className="absolute inset-0 z-30 flex items-center justify-center px-6 pointer-events-none">
        <div className="mx-auto w-full max-w-4xl text-center">
          <AnimatePresence mode="wait">
            {activeLine && !isTransitioning && (
              <motion.h2
                key={activeLine.text}
                initial={{ opacity: 0, y: 28, filter: "blur(16px)", scale: 0.96 }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
                exit={{ opacity: 0, y: -22, filter: "blur(14px)", scale: 1.02 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="display text-[clamp(2.2rem,6vw,4.6rem)] text-paper font-light tracking-[-0.03em] leading-[1.08] select-none"
                style={{
                  textShadow:
                    "0 4px 35px rgba(0,0,0,0.95), 0 0 70px rgba(0,0,0,0.95), 0 0 25px rgba(198,161,91,0.22)",
                }}
              >
                {activeLine.text}
              </motion.h2>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ══ Bottom Scroll Prompt ══ */}
      <div
        className="absolute bottom-0 left-0 right-0 z-40 flex items-center justify-between px-6 pb-6 sm:px-10 md:px-14 transition-opacity duration-300"
        style={{ opacity: uiFade }}
      >
        <p className="hidden sm:block eyebrow text-[8px] tracking-[0.3em] text-steel/40">
          PUNE · KOTHRUD & SADASHIV PETH
        </p>

        <div className="mx-auto sm:mx-0 flex flex-col items-center gap-1.5 text-steel/50">
          <span className="font-mono text-[7px] tracking-[0.35em] uppercase">Scroll</span>
          <div className="relative h-6 w-3.5 rounded-full border border-paper/15 flex items-start justify-center p-0.5">
            <motion.div
              animate={{ y: [0, 7, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="h-1 w-0.5 rounded-full bg-gold/80"
            />
          </div>
        </div>

        <p className="hidden sm:block font-mono text-[8px] text-steel/40 tracking-widest">
          {Math.round(progress * 360)}°
        </p>
      </div>
    </div>
  );
}

// Backward compatibility export if imported elsewhere
export const IrisStoryIntro = IrisStoryOverlay;
