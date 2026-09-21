import { useState, useEffect, useRef, useCallback } from "react";

interface PreloaderOptions {
  minDurationMs?: number;
  maxDurationMs?: number;
}

export function useAssetPreloader({
  minDurationMs = 2000,
  maxDurationMs = 3600,
}: PreloaderOptions = {}) {
  const [progress, setProgress] = useState(0); // 0 to 1
  const [isReady, setIsReady] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const assetsReadyRef = useRef<boolean>(false);
  const rafRef = useRef<number | null>(null);

  // Preload key site assets
  useEffect(() => {
    let cancelled = false;

    async function preloadAll() {
      try {
        const promises: Promise<unknown>[] = [];

        // 1. Preload fonts if available
        if (typeof document !== "undefined" && "fonts" in document) {
          promises.push(document.fonts.ready);
        }

        // 2. Preload logo & critical assets
        const criticalImages = ["/bapat-logo.png", "/favicon.jpg"];
        criticalImages.forEach((src) => {
          promises.push(
            new Promise<void>((resolve) => {
              const img = new Image();
              img.src = src;
              img.onload = () => resolve();
              img.onerror = () => resolve();
            })
          );
        });

        // 3. Preload initial Hero frames so scroll starts butter-smooth
        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
        const folder = isMobile ? "hero-mobile" : "hero";

        // Preload first 25 frames immediately during intro
        for (let f = 1; f <= 25; f++) {
          const padded = String(f).padStart(3, "0");
          promises.push(
            new Promise<void>((resolve) => {
              const img = new Image();
              img.src = `/frames/${folder}/frame_${padded}.webp`;
              img.onload = () => resolve();
              img.onerror = () => resolve();
            })
          );
        }

        // 4. Preload 3D model & portal video in background
        if (typeof window !== "undefined") {
          promises.push(
            fetch("/models/Glasses.glb", { method: "HEAD" }).catch(() => null),
            fetch("/videos/bapat-brand-portal.mp4", { method: "HEAD" }).catch(() => null)
          );
        }

        await Promise.all(promises);
      } catch (err) {
        console.warn("Preloader asset fetch warning:", err);
      } finally {
        if (!cancelled) {
          assetsReadyRef.current = true;
        }
      }
    }

    void preloadAll();

    return () => {
      cancelled = true;
    };
  }, []);

  // Smooth animation loop for progress percentage
  useEffect(() => {
    startTimeRef.current = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const timeRatio = Math.min(1, elapsed / minDurationMs);

      // Luxurious cubic ease-out curve
      // If assets are not ready yet after minDuration, slow down near 95% until maxDuration
      let targetProgress = Math.pow(timeRatio, 0.85);

      if (!assetsReadyRef.current && targetProgress > 0.9) {
        const maxRatio = Math.min(1, elapsed / maxDurationMs);
        targetProgress = 0.9 + 0.08 * maxRatio;
      } else if (assetsReadyRef.current && elapsed >= minDurationMs) {
        targetProgress = 1;
      }

      setProgress(targetProgress);

      if (targetProgress >= 1) {
        setIsReady(true);
        // Small settle delay at 100% before transition out
        setTimeout(() => {
          setIsDone(true);
        }, 400);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [minDurationMs, maxDurationMs]);

  const skip = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setProgress(1);
    setIsReady(true);
    setIsDone(true);
  }, []);

  return {
    progress, // 0 to 1 float
    percentage: Math.round(progress * 100), // 0 to 100 int
    isReady,
    isDone,
    skip,
  };
}
