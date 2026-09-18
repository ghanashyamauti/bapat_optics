import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, RotateCcw, Wrench, ShieldCheck, Sparkles, Layers } from "lucide-react";
import { usePrefersReducedMotion } from "./hooks";
import { useLenis } from "./SmoothScroll";

const TOTAL_FRAMES = 240;

const checkIsMobileTier = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches;
};

const getFrameUrl = (index: number, isMobile: boolean = false) => {
  const paddedIndex = String(Math.min(TOTAL_FRAMES, Math.max(1, index))).padStart(3, "0");
  const folder = isMobile ? "assembly-mobile" : "assembly";
  return `/frames/${folder}/frame_${paddedIndex}.webp`;
};

type AssemblyPhase = {
  range: readonly [number, number];
  step: string;
  title: string;
  body: string;
  metric: string;
};

const assemblyPhases: AssemblyPhase[] = [
  {
    range: [0, 0.25],
    step: "01",
    title: "Anatomy & Core Milling",
    body: "Block-cut Italian acetate and aerospace titanium are milled to micron-level tolerances before assembly.",
    metric: "0.02 mm Precision",
  },
  {
    range: [0.25, 0.5],
    step: "02",
    title: "5-Barrel Hinge & Riveting",
    body: "Hand-riveted 5-barrel hinges are flush-set so temples glide with silky resistance and zero mechanical play.",
    metric: "50,000+ Cycles Rated",
  },
  {
    range: [0.5, 0.75],
    step: "03",
    title: "Zeiss Lens Calibration",
    body: "Bevel-cut optical lenses are seated with precision centration to eliminate optical aberrations.",
    metric: "100% UV400 / BlueProtect",
  },
  {
    range: [0.75, 1.0],
    step: "04",
    title: "Hand Contouring & Finish",
    body: "Final ultrasonic cleaning, organic wax polishing, and ergonomic bridge adjustment tailored for Indian facial ergonomics.",
    metric: "In-Store Custom Fit",
  },
];

const finalAssemblyPhase: AssemblyPhase = {
  range: [0.75, 1],
  step: "04",
  title: "Hand Contouring & Finish",
  body: "Final ultrasonic cleaning, organic wax polishing, and ergonomic bridge adjustment tailored for Indian facial ergonomics.",
  metric: "In-Store Custom Fit",
};

export function Crafted() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const loadingQueueRef = useRef<Set<number>>(new Set());
  const currentFrameRef = useRef<number>(1);
  const rafRef = useRef<number | null>(null);

  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const reduced = usePrefersReducedMotion();
  const lenis = useLenis();
  const isMobileRef = useRef<boolean>(false);

  // Active phase computation
  const activePhase =
    assemblyPhases.find((p) => progress >= p.range[0] && progress <= p.range[1]) ??
    finalAssemblyPhase;

  // Helper to load a specific frame into memory
  const loadFrame = useCallback((frameNum: number, onLoaded?: () => void) => {
    const idx = frameNum - 1;
    if (imagesRef.current[idx] || loadingQueueRef.current.has(frameNum)) {
      return;
    }

    loadingQueueRef.current.add(frameNum);
    const img = new Image();
    img.src = getFrameUrl(frameNum, isMobileRef.current);
    img.onload = () => {
      imagesRef.current[idx] = img;
      loadingQueueRef.current.delete(frameNum);
      setLoadedCount((c) => c + 1);
      onLoaded?.();
    };
    img.onerror = () => {
      loadingQueueRef.current.delete(frameNum);
    };
  }, []);

  // Draw specific frame onto canvas with responsive cover/contain logic
  const renderFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Resolve image: exact frame or closest loaded frame so canvas never blanks out
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

    // Cover fit for both mobile and desktop.
    // On mobile the canvas container is sized to aspect-[16/9] (matching frame images),
    // so cover fit fills it edge-to-edge with zero letterboxing.
    // On desktop the canvas is absolute full-bleed, cover fills the viewport.
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
  }, [loadFrame]);

  // Frame ratio calculation based on scroll position
  const updateScrollFrame = useCallback((explicitScrollY?: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const scrollY = explicitScrollY ?? (window.scrollY || window.pageYOffset || 0);
    const sectionTop = rect.top + (window.scrollY || window.pageYOffset || 0);
    const containerHeight = container.offsetHeight || rect.height;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
    const totalScrollableHeight = Math.max(1, containerHeight - viewportHeight);

    // Calculate ratio clamped between 0 and 1
    const rawProgress = (scrollY - sectionTop) / totalScrollableHeight;
    const p = Math.max(0, Math.min(1, rawProgress));
    setProgress(p);

    // Map ratio to frame index (0–239), clamped
    const frameIndex = Math.max(
      0,
      Math.min(TOTAL_FRAMES - 1, Math.floor(p * (TOTAL_FRAMES - 1)))
    );
    const targetFrame = frameIndex + 1; // 1 to 240

    if (targetFrame !== currentFrameRef.current) {
      renderFrame(targetFrame);
    }
  }, [renderFrame]);

  // Intelligent preloading: progressive sampling on mobile to avoid network congestion
  useEffect(() => {
    const isMobile = checkIsMobileTier();
    isMobileRef.current = isMobile;
    imagesRef.current = new Array(TOTAL_FRAMES).fill(null);
    loadingQueueRef.current.clear();

    // 1. Instantly load first frame for immediate initial paint
    loadFrame(1, () => {
      renderFrame(1);
    });

    if (isMobile) {
      // Mobile: Tier 1 - Keyframe sampling every 4 frames (60 frames total, ~868 KB from assembly-mobile)
      // Provides instant scrub coverage across the entire 0-100% timeline
      const sampleFrames: number[] = [];
      for (let i = 5; i <= TOTAL_FRAMES; i += 4) {
        sampleFrames.push(i);
      }
      sampleFrames.push(TOTAL_FRAMES);

      let sampleIdx = 0;
      const loadSampleBatch = () => {
        const batch = sampleFrames.slice(sampleIdx, sampleIdx + 4);
        sampleIdx += 4;
        batch.forEach((f) => loadFrame(f));
        if (sampleIdx < sampleFrames.length) {
          setTimeout(loadSampleBatch, 40);
        } else {
          // Tier 2: Fill remaining interstitial frames during idle time
          loadRemainingMobileFrames();
        }
      };
      setTimeout(loadSampleBatch, 60);

      const loadRemainingMobileFrames = () => {
        let current = 2;
        const loadNextBatch = () => {
          let count = 0;
          while (current <= TOTAL_FRAMES && count < 6) {
            if (!imagesRef.current[current - 1]) {
              loadFrame(current);
              count++;
            }
            current++;
          }
          if (current <= TOTAL_FRAMES) {
            setTimeout(loadNextBatch, 80);
          }
        };
        setTimeout(loadNextBatch, 150);
      };
    } else {
      // Desktop: Fast stream in small batches from /frames/assembly/ to preserve 60fps main thread
      let nextFrameToLoad = 2;
      const loadDesktopBatch = () => {
        const batchSize = 10;
        for (let i = 0; i < batchSize && nextFrameToLoad <= TOTAL_FRAMES; i++) {
          loadFrame(nextFrameToLoad++);
        }
        if (nextFrameToLoad <= TOTAL_FRAMES) {
          setTimeout(loadDesktopBatch, 30);
        }
      };
      setTimeout(loadDesktopBatch, 40);
    }
  }, [loadFrame, renderFrame]);

  // Debounced resize and orientationchange listener (~150ms)
  useEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;

    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const currentlyMobile = checkIsMobileTier();
        if (currentlyMobile !== isMobileRef.current) {
          isMobileRef.current = currentlyMobile;
          // Invalidate cache and reload tier if screen crossed mobile/desktop boundary
          imagesRef.current = new Array(TOTAL_FRAMES).fill(null);
          loadingQueueRef.current.clear();
          loadFrame(currentFrameRef.current, () => {
            renderFrame(currentFrameRef.current);
          });
        }
        updateScrollFrame();
        renderFrame(currentFrameRef.current);
      }, 150);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });

    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [loadFrame, renderFrame, updateScrollFrame]);

  // Scroll listener mapped with Lenis or requestAnimationFrame
  useEffect(() => {
    if (reduced || isPlaying) return;

    if (lenis) {
      const onLenisScroll = (e: any) => {
        const currentY = typeof e?.scroll === "number" ? e.scroll : window.scrollY;
        updateScrollFrame(currentY);
      };

      lenis.on("scroll", onLenisScroll);
      updateScrollFrame(typeof lenis.scroll === "number" ? lenis.scroll : undefined);

      return () => {
        lenis.off("scroll", onLenisScroll);
      };
    }

    // Fallback: Native scroll listener mapped with requestAnimationFrame
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateScrollFrame();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduced, isPlaying, lenis, updateScrollFrame]);

  // Auto-play RAF loop
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    let lastTime = performance.now();
    const fpsInterval = 1000 / 24; // 24 fps playback speed

    const animate = (currentTime: number) => {
      const elapsed = currentTime - lastTime;
      if (elapsed > fpsInterval) {
        lastTime = currentTime - (elapsed % fpsInterval);

        let nextFrame = currentFrameRef.current + 1;
        if (nextFrame > TOTAL_FRAMES) {
          nextFrame = 1;
        }

        renderFrame(nextFrame);
        setProgress((nextFrame - 1) / (TOTAL_FRAMES - 1));
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, renderFrame]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleReset = () => {
    setIsPlaying(false);
    renderFrame(1);
    setProgress(0);
  };

  return (
    <section id="crafted" className="relative bg-obsidian text-paper">
      {/* Pinned Scroll Canvas Track: 250vh on mobile, 320vh on desktop */}
      <div ref={containerRef} className="relative h-[250vh] w-full md:h-[320vh]">
        {/* Sticky Viewport Container */}
        <div className="sticky top-0 flex h-[100dvh] min-h-[100svh] w-full flex-col justify-center overflow-hidden bg-obsidian pt-12 pb-14 sm:pt-16 sm:pb-8 md:justify-between md:py-0">
          {/* Top Bar HUD / Telemetry */}
          <div className="absolute inset-x-0 top-[70px] z-30 mx-auto flex w-full max-w-[1600px] items-center justify-between gap-2 px-4 sm:top-20 sm:px-6 md:relative md:top-auto md:z-20 md:px-10 md:pt-22">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <span className="flex h-2 w-2 shrink-0 animate-pulse rounded-full bg-gold sm:h-2.5 sm:w-2.5" />
              <p className="eyebrow truncate text-[9px] tracking-[0.12em] text-gold sm:text-[10px] sm:tracking-[0.2em]">
                <span className="hidden sm:inline">Interactive </span>Frame Assembly<span className="hidden md:inline"> · 60 FPS Scroll Scrub</span>
              </p>
            </div>

            {/* Quick Controls */}
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause assembly animation" : "Play assembly animation"}
                className="flex items-center gap-1.5 rounded-full border border-paper/20 bg-obsidian/80 px-2.5 py-1 text-[9px] uppercase tracking-wider text-paper backdrop-blur-md transition-all hover:border-gold hover:text-gold sm:px-3.5 sm:py-1.5"
              >
                {isPlaying ? <Pause size={10} /> : <Play size={10} />}
                <span>{isPlaying ? "Pause" : "Auto"}</span>
              </button>
              <button
                onClick={handleReset}
                aria-label="Reset assembly"
                className="rounded-full border border-paper/20 bg-obsidian/80 p-1 text-paper backdrop-blur-md transition-all hover:border-gold hover:text-gold sm:p-1.5"
              >
                <RotateCcw size={10} />
              </button>
            </div>
          </div>

          {/*
            Canvas Container — responsive sizing strategy:
            - Mobile (<md): flow-positioned in flex, aspect-[16/9] matching frame images → zero letterboxing.
              Grouped tightly with headline & step pills, centered together in the viewport.
            - Desktop (md+): absolute full-bleed background → cinematic cover fill.
          */}
          <div className="relative z-10 mx-auto w-full max-w-[640px] shrink-0 px-2 md:absolute md:inset-0 md:max-w-none md:px-0">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-obsidian md:aspect-auto md:h-full md:w-full">
              <canvas
                ref={canvasRef}
                className="block h-full w-full transition-opacity duration-300"
              />
              {/* Cinematic Gradient Overlays for contrast & elegance */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-obsidian/50 md:from-obsidian/95 md:to-obsidian/70" />
              <div className="pointer-events-none absolute inset-0 cinematic-vignette opacity-60 md:opacity-100" />
            </div>
          </div>

          {/* Bottom Area: Headline & Anatomy Step Pills — grouped tightly below canvas on mobile, centered together */}
          <div className="relative z-20 mx-auto flex w-full max-w-[1600px] flex-col px-5 pt-3 sm:px-6 sm:pt-4 md:flex-none md:px-10 md:pt-0 md:pb-8">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:mb-4 sm:gap-2 sm:flex-row sm:items-end">
              <div>
                <span className="eyebrow inline-block rounded border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[9px] text-gold">
                  Precision Handcraft · Phase {activePhase.step} of 04
                </span>
                <h2 className="display mt-2.5 text-[6.5vw] leading-tight text-paper sm:mt-1.5 sm:text-[4vw] md:text-[2.8vw]">
                  Millimetres decide everything<span className="text-gold">.</span>
                </h2>
              </div>
              <p className="mt-1 max-w-md text-[11px] leading-relaxed text-steel/90 sm:mt-0 sm:text-xs">
                {activePhase.body}
              </p>
            </div>

            {/* Step Pills */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-4 sm:gap-2.5 md:gap-3">
              {assemblyPhases.map((phase) => {
                const isCurrent = progress >= phase.range[0] && progress <= phase.range[1];
                const isPassed = progress > phase.range[1];
                return (
                  <div
                    key={phase.step}
                    className={`min-w-0 rounded border p-3 sm:p-2.5 md:p-3 backdrop-blur-md transition-all duration-300 ${isCurrent
                        ? "border-gold bg-gold/20 text-paper shadow-lg shadow-gold/10"
                        : isPassed
                          ? "border-paper/25 bg-obsidian/60 text-paper/80"
                          : "border-paper/10 bg-obsidian/40 text-steel/60"
                      }`}
                  >
                    <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                      <span
                        className={`shrink-0 font-mono text-xs font-bold ${isCurrent ? "text-gold" : "text-steel"
                          }`}
                      >
                        {phase.step}
                      </span>
                      <span className="truncate text-[10px] font-medium tracking-wide sm:text-[11px]">
                        {phase.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Callouts Grid */}
      <div className="relative z-20 border-t border-paper/10 bg-obsidian">
        <div className="mx-auto grid max-w-[1600px] gap-px bg-paper/10 sm:grid-cols-2 md:grid-cols-4">
          <div className="bg-obsidian p-6 sm:p-7 md:p-8">
            <Layers className="text-gold" size={20} />
            <span className="eyebrow mt-3 block text-[9px] text-gold">01 · Material</span>
            <h3 className="display mt-1 text-xl sm:text-2xl text-paper">Block-Cut Acetate</h3>
            <p className="mt-2 text-xs leading-relaxed text-steel">
              High-density Italian Mazzucchelli acetate, aged and tumbled in beechwood chips for a silky, warm finish.
            </p>
          </div>
          <div className="bg-obsidian p-6 sm:p-7 md:p-8">
            <Wrench className="text-gold" size={20} />
            <span className="eyebrow mt-3 block text-[9px] text-gold">02 · Mechanics</span>
            <h3 className="display mt-1 text-xl sm:text-2xl text-paper">5-Barrel Hinges</h3>
            <p className="mt-2 text-xs leading-relaxed text-steel">
              Double-pinned German barrel hinges designed to withstand over 50,000 open-close movements without loosening.
            </p>
          </div>
          <div className="bg-obsidian p-6 sm:p-7 md:p-8">
            <Sparkles className="text-gold" size={20} />
            <span className="eyebrow mt-3 block text-[9px] text-gold">03 · Optics</span>
            <h3 className="display mt-1 text-xl sm:text-2xl text-paper">Zeiss Precision</h3>
            <p className="mt-2 text-xs leading-relaxed text-steel">
              Zero-distortion optics calibrated with Zeiss 3D Visufit instruments for pure clarity and eye relaxation.
            </p>
          </div>
          <div className="bg-obsidian p-6 sm:p-7 md:p-8">
            <ShieldCheck className="text-gold" size={20} />
            <span className="eyebrow mt-3 block text-[9px] text-gold">04 · Assurance</span>
            <h3 className="display mt-1 text-xl sm:text-2xl text-paper">Lifetime Service</h3>
            <p className="mt-2 text-xs leading-relaxed text-steel">
              Free lifetime repairs, ultrasonic cleanings, screw resets, and adjustments at both Pune branch locations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
