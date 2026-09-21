import { useRef, useEffect } from "react";
import { motion } from "motion/react";

interface VisionFocusIntroProps {
  progress?: number;
  percentage?: number;
  isReady?: boolean;
  isExiting: boolean;
  onSkip: () => void;
}

/**
 * Pure Cinematic Video Preloader.
 * - Desktop: Fits 100% edge-to-edge full screen as originally designed (object-cover, scale-100).
 * - Mobile / Tablet: Fully responsive (object-contain) so nothing gets cropped or cut off.
 * - Down-middle simple counting percentage & golden progress line.
 * - Minimal "Skip ↵" in bottom-right.
 */
export function VisionFocusIntro({
  percentage = 0,
  isExiting,
  onSkip,
}: VisionFocusIntroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Guarantee seamless muted autoplay across all browsers and devices
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const startPlay = () => {
      video.play().catch(() => {
        video.muted = true;
        video.play().catch(() => {});
      });
    };

    startPlay();

    const onTouchOrClick = () => {
      if (video.paused) {
        video.play().catch(() => {});
      }
    };

    window.addEventListener("touchstart", onTouchOrClick, { once: true, passive: true });
    window.addEventListener("click", onTouchOrClick, { once: true, passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchOrClick);
      window.removeEventListener("click", onTouchOrClick);
    };
  }, []);

  return (
    <motion.div
      onClick={onSkip}
      initial={{ opacity: 1 }}
      animate={{
        opacity: isExiting ? 0 : 1,
        scale: isExiting ? 1.08 : 1,
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[250] flex flex-col items-center justify-center bg-black select-none overflow-hidden cursor-pointer"
      style={{
        willChange: "opacity, transform",
      }}
    >
      {/* 1. Video Player: 100% edge-to-edge on desktop (as it is), responsive on mobile */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={onSkip}
        className="absolute inset-0 h-full w-full object-contain md:object-cover md:scale-100 pointer-events-none"
      >
        <source src="/videos/bapat-brand-portal.mp4" type="video/mp4" />
        <source src="/videos/logo-reveal.mp4" type="video/mp4" />
      </video>

      {/* Subtle bottom gradient vignette for progress bar readability */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 to-transparent" />

      {/* 2. Down Middle: Simple Counting Percentage & Laser Progress Line */}
      <div className="absolute bottom-7 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 pointer-events-none">
        {/* Rolling Percentage */}
        <div className="flex items-baseline gap-1 font-mono text-xs sm:text-sm md:text-base tracking-wider text-paper/90">
          <span>{String(percentage).padStart(2, "0")}</span>
          <span className="text-[10px] sm:text-xs text-gold font-light">%</span>
        </div>

        {/* Simple Laser Progress Bar */}
        <div className="relative h-[2px] w-44 sm:w-56 md:w-64 overflow-hidden rounded-full bg-white/20">
          <motion.div
            className="h-full bg-gradient-to-r from-paper/40 via-gold to-paper shadow-[0_0_8px_rgba(212,175,55,0.7)]"
            style={{
              width: `${percentage}%`,
              transition: "width 0.12s linear",
            }}
          />
        </div>
      </div>

      {/* 3. Bottom-Right: Minimal Skip Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSkip();
        }}
        className="absolute bottom-6 sm:bottom-7 right-6 sm:right-7 z-10 font-mono text-[9px] sm:text-[11px] uppercase tracking-[0.25em] text-white/50 hover:text-gold transition-colors duration-200 cursor-pointer"
      >
        Skip ↵
      </button>
    </motion.div>
  );
}
