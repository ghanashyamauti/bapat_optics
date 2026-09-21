import { useEffect, useState, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import { usePrefersReducedMotion } from "./hooks";
import { useAssetPreloader } from "@/hooks/useAssetPreloader";
import { VisionFocusIntro } from "./VisionFocusIntro";

/**
 * Optical Focus & Crystal Clarity Intro Opener & Preloader.
 * Features an ethereal Zeiss optical calibration lens that de-blurs
 * from soft focus to razor-sharp 20/20 clarity, dissolving with pure
 * silk smoothness into the zero-g floating eyewear hero.
 */
export function Intro() {
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const { progress, percentage, isReady, isDone, skip } = useAssetPreloader({
    minDurationMs: 4800,
    maxDurationMs: 6500,
  });

  const handleComplete = useCallback(() => {
    setIsExiting(true);
    const t = setTimeout(() => {
      setOpen(false);
    }, 750);
    return () => clearTimeout(t);
  }, []);

  const handleSkip = useCallback(() => {
    skip();
    handleComplete();
  }, [skip, handleComplete]);

  // Reduced motion bypass
  useEffect(() => {
    if (reduced) {
      setOpen(false);
    }
  }, [reduced]);

  // Listen for isDone from preloader
  useEffect(() => {
    if (isDone && !isExiting) {
      handleComplete();
    }
  }, [isDone, isExiting, handleComplete]);

  // Keyboard shortcut listeners (ESC, Space, Enter)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleSkip]);

  // Lock scroll while intro is visible
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <VisionFocusIntro
          key="vision-focus-intro"
          progress={progress}
          percentage={percentage}
          isReady={isReady}
          isExiting={isExiting}
          onSkip={handleSkip}
        />
      )}
    </AnimatePresence>
  );
}
