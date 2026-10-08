import { useEffect, useRef, useCallback } from "react";
import { usePrefersReducedMotion } from "./hooks";

const TOTAL_FRAMES = 240;

const getFrameUrl = (index: number) => {
  const padded = String(Math.min(TOTAL_FRAMES, Math.max(1, index))).padStart(3, "0");
  return `/frames/brands/frame_${padded}.webp`;
};

/**
 * Pure Cinematic Brand Filmstrip Canvas Scroll-Scrub.
 * Unobstructed, full-screen, 120fps hardware-accelerated canvas
 * showcasing the 35mm filmstrip unspooling around the Bapat Optics monolith on scroll.
 */
export function BrandFilmScrub() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const loadedFramesRef = useRef<Set<number>>(new Set());
  const loadingQueueRef = useRef<Set<number>>(new Set());
  const currentFrameRef = useRef(1);

  // Smooth lerp physics
  const targetProgressRef = useRef(0);
  const smoothProgressRef = useRef(0);

  // Initialize array
  if (imagesRef.current.length === 0) {
    imagesRef.current = new Array(TOTAL_FRAMES).fill(null);
  }

  // Load a single frame with caching
  const loadFrame = useCallback((frameNum: number, onLoaded?: () => void) => {
    if (frameNum < 1 || frameNum > TOTAL_FRAMES) return;
    if (imagesRef.current[frameNum - 1]) return;
    if (loadingQueueRef.current.has(frameNum)) return;

    loadingQueueRef.current.add(frameNum);
    const img = new Image();
    img.src = getFrameUrl(frameNum);
    img.onload = () => {
      imagesRef.current[frameNum - 1] = img;
      loadedFramesRef.current.add(frameNum);
      loadingQueueRef.current.delete(frameNum);
      onLoaded?.();
    };
    img.onerror = () => {
      loadingQueueRef.current.delete(frameNum);
    };
  }, []);

  // Draw current frame onto canvas with responsive cover fit
  const renderFrame = useCallback(
    (frameIndex: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Resolve exact image or closest loaded frame so canvas never blanks out
      let img = imagesRef.current[frameIndex - 1];
      if (!img || !img.complete || img.naturalWidth === 0) {
        loadFrame(frameIndex);

        let closest: HTMLImageElement | null = null;
        for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
          const prev = imagesRef.current[frameIndex - 1 - offset];
          if (prev && prev.complete && prev.naturalWidth > 0) {
            closest = prev;
            break;
          }
          const next = imagesRef.current[frameIndex - 1 + offset];
          if (next && next.complete && next.naturalWidth > 0) {
            closest = next;
            break;
          }
        }
        if (closest) {
          img = closest;
        } else {
          return;
        }
      }

      const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
      const canvasWidth = canvas.clientWidth;
      const canvasHeight = canvas.clientHeight;
      if (canvasWidth === 0 || canvasHeight === 0) return;

      const targetPxWidth = Math.round(canvasWidth * dpr);
      const targetPxHeight = Math.round(canvasHeight * dpr);

      if (canvas.width !== targetPxWidth || canvas.height !== targetPxHeight) {
        canvas.width = targetPxWidth;
        canvas.height = targetPxHeight;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      const imgRatio = imgWidth / imgHeight;
      const canvasRatio = canvasWidth / canvasHeight;

      let drawWidth: number;
      let drawHeight: number;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasRatio > imgRatio) {
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imgRatio;
        offsetX = 0;
        offsetY = (canvasHeight - drawHeight) / 2;
      } else {
        drawHeight = canvasHeight;
        drawWidth = canvasHeight * imgRatio;
        offsetX = (canvasWidth - drawWidth) / 2;
        offsetY = 0;
      }

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      ctx.restore();

      currentFrameRef.current = frameIndex;
    },
    [loadFrame]
  );

  // Preload initial frames for instant responsiveness
  useEffect(() => {
    // 1. Load first 25 frames immediately
    for (let f = 1; f <= 25; f++) {
      loadFrame(f, () => {
        if (f === 1) renderFrame(1);
      });
    }

    // 2. Progressively preload remaining frames in background
    let f = 26;
    const interval = setInterval(() => {
      for (let chunk = 0; chunk < 5 && f <= TOTAL_FRAMES; chunk++, f++) {
        loadFrame(f);
      }
      if (f > TOTAL_FRAMES) clearInterval(interval);
    }, 35);

    return () => clearInterval(interval);
  }, [loadFrame, renderFrame]);

  // GSAP ScrollTrigger setup
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
          scrub: 0.1,
          onUpdate: (self) => {
            targetProgressRef.current = self.progress;
          },
        });
      }, container);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduced]);

  // Smooth RAF render loop (60-120fps)
  useEffect(() => {
    let animId: number;

    const loop = () => {
      const current = smoothProgressRef.current;
      const target = targetProgressRef.current;
      const next = current + (target - current) * 0.14;
      smoothProgressRef.current = next;

      const frameIndex = Math.min(
        TOTAL_FRAMES,
        Math.max(1, Math.round(next * (TOTAL_FRAMES - 1)) + 1)
      );

      if (frameIndex !== currentFrameRef.current) {
        renderFrame(frameIndex);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [renderFrame]);

  // Touch / Pointer drag support for tactile scrubbing
  const isDraggingRef = useRef(false);
  const startDragYRef = useRef(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    startDragYRef.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaY = e.clientY - startDragYRef.current;
    startDragYRef.current = e.clientY;
    window.scrollBy({ top: -deltaY * 2.2, behavior: "auto" });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  return (
    <section
      ref={containerRef}
      id="brand-film-reel"
      className="relative h-[360vh] bg-[#0E0D0C] select-none"
    >
      {/* Sticky Full-Screen Viewport Stage: Pure Unobstructed Cinema Video Scrub */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="sticky top-0 h-screen w-full overflow-hidden cursor-grab active:cursor-grabbing"
      >
        {/* Hardware-Accelerated High-Performance Canvas (Fills 100% Viewport) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full pointer-events-none"
        />
      </div>
    </section>
  );
}
