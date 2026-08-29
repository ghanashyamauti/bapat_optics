import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, RotateCcw, Wrench, ShieldCheck, Sparkles, Layers } from "lucide-react";
import { usePrefersReducedMotion } from "./hooks";

const TOTAL_FRAMES = 240;

const getFrameUrl = (index: number) => {
  const paddedIndex = String(Math.min(TOTAL_FRAMES, Math.max(1, index))).padStart(3, "0");
  return `/frames/assembly/frame_${paddedIndex}.webp`;
};

const assemblyPhases = [
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

export function Crafted() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const currentFrameRef = useRef<number>(1);
  const rafRef = useRef<number | null>(null);

  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const reduced = usePrefersReducedMotion();

  // Active phase computation
  const activePhase =
    assemblyPhases.find((p) => progress >= p.range[0] && progress <= p.range[1]) ??
    assemblyPhases[assemblyPhases.length - 1];

  // Draw specific frame onto canvas with perfect aspect-ratio cover
  const renderFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imagesRef.current[frameIndex - 1];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;

    if (canvas.width !== canvasWidth * dpr || canvas.height !== canvasHeight * dpr) {
      canvas.width = canvasWidth * dpr;
      canvas.height = canvasHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Calculate "cover" scale
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth: number;
    let drawHeight: number;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imgRatio;
      offsetY = (canvasHeight - drawHeight) / 2;
    } else {
      drawHeight = canvasHeight;
      drawWidth = canvasHeight * imgRatio;
      offsetX = (canvasWidth - drawWidth) / 2;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    ctx.restore();

    currentFrameRef.current = frameIndex;
  }, []);

  // Preload all 240 frames into memory
  useEffect(() => {
    let isCancelled = false;
    imagesRef.current = new Array(TOTAL_FRAMES).fill(null);

    // 1. Immediately load frame 1 for instant first paint
    const firstImg = new Image();
    firstImg.src = getFrameUrl(1);
    firstImg.onload = () => {
      if (isCancelled) return;
      imagesRef.current[0] = firstImg;
      renderFrame(1);
      setLoadedCount((c) => c + 1);

      // 2. Preload remaining frames in background
      for (let i = 2; i <= TOTAL_FRAMES; i++) {
        const img = new Image();
        img.src = getFrameUrl(i);
        img.onload = () => {
          if (isCancelled) return;
          imagesRef.current[i - 1] = img;
          setLoadedCount((c) => c + 1);
        };
      }
    };

    return () => {
      isCancelled = true;
    };
  }, [renderFrame]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      renderFrame(currentFrameRef.current);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [renderFrame]);

  // GSAP ScrollTrigger Integration for 60fps / 120fps hardware-accelerated scrubbing
  useEffect(() => {
    const container = containerRef.current;
    if (!container || reduced) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.15, // Silky smooth response
          onUpdate: (self) => {
            const p = self.progress;

            // Map 0% -> 75% of the scroll track to 0% -> 100% of the assembly animation.
            // This ensures 100% completion (Frame 240) is reached well before the sticky track ends.
            // The remaining 25% of scroll distance firmly holds the 100% completed frame in view before scrolling away.
            const animProgress = Math.min(1, Math.max(0, p / 0.75));
            setProgress(animProgress);

            const targetFrame = Math.max(
              1,
              Math.min(TOTAL_FRAMES, Math.round(animProgress * (TOTAL_FRAMES - 1)) + 1)
            );
            
            if (targetFrame !== currentFrameRef.current) {
              renderFrame(targetFrame);
            }
          },
        });
      }, container);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduced, renderFrame]);

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
    <section id="crafted" ref={containerRef} className="relative bg-obsidian text-paper">
      {/* Pinned Scroll Canvas Track: 360vh on mobile, 440vh on desktop for complete, immersive frame progression */}
      <div className="relative h-[360vh] md:h-[440vh] w-full">
        {/* Sticky Viewport Container */}
        <div className="sticky top-0 flex h-screen w-full flex-col justify-between overflow-hidden">
          {/* Background High-Performance HTML5 Canvas */}
          <div className="absolute inset-0 bg-obsidian">
            <canvas
              ref={canvasRef}
              className="h-full w-full object-cover transition-opacity duration-300"
            />
            {/* Cinematic Gradient Overlays for contrast & elegance */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian/95 via-transparent to-obsidian/70" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(10,10,10,0.5)_100%)]" />
          </div>

          {/* Top Bar HUD / Telemetry */}
          <div className="relative z-20 mx-auto flex w-full max-w-[1600px] items-center justify-between px-5 pt-18 sm:px-6 sm:pt-20 md:px-10 md:pt-22">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="flex h-2 w-2 animate-pulse rounded-full bg-gold sm:h-2.5 sm:w-2.5" />
              <p className="eyebrow text-[9px] tracking-[0.16em] text-gold sm:text-[10px] sm:tracking-[0.2em]">
                Interactive Frame Assembly · 60 FPS Scroll Scrub
              </p>
            </div>

            {/* Quick Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause assembly animation" : "Play assembly animation"}
                className="flex items-center gap-1.5 rounded-full border border-paper/20 bg-obsidian/80 px-3 py-1 text-[9px] uppercase tracking-wider text-paper backdrop-blur-md transition-all hover:border-gold hover:text-gold sm:px-3.5 sm:py-1.5"
              >
                {isPlaying ? <Pause size={10} /> : <Play size={10} />}
                <span>{isPlaying ? "Pause" : "Auto Play"}</span>
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

          {/* Bottom Area: Clean Headline & Anatomy Step Pills placed down to keep center video 100% unobstructed */}
          <div className="relative z-20 mx-auto w-full max-w-[1600px] px-5 pb-5 sm:px-6 sm:pb-7 md:px-10 md:pb-8">
            <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <span className="eyebrow inline-block rounded border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[9px] text-gold">
                  Precision Handcraft · Phase {activePhase.step} of 04
                </span>
                <h2 className="display mt-1.5 text-[6.5vw] leading-tight text-paper sm:text-[4vw] md:text-[2.8vw]">
                  Millimetres decide everything<span className="text-gold">.</span>
                </h2>
              </div>
              <p className="max-w-md text-[11px] leading-relaxed text-steel/90 sm:text-xs">
                {activePhase.body}
              </p>
            </div>

            {/* Step Pills */}
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2.5 md:gap-3">
              {assemblyPhases.map((phase) => {
                const isCurrent = progress >= phase.range[0] && progress <= phase.range[1];
                const isPassed = progress > phase.range[1];
                return (
                  <div
                    key={phase.step}
                    className={`rounded border p-2 sm:p-2.5 md:p-3 backdrop-blur-md transition-all duration-300 ${
                      isCurrent
                        ? "border-gold bg-gold/20 text-paper shadow-lg shadow-gold/10"
                        : isPassed
                        ? "border-paper/25 bg-obsidian/60 text-paper/80"
                        : "border-paper/10 bg-obsidian/40 text-steel/60"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span
                        className={`font-mono text-xs font-bold ${
                          isCurrent ? "text-gold" : "text-steel"
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
