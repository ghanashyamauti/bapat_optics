import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Eye, ShieldCheck, ChevronRight } from "lucide-react";
import { whatsappUrl } from "@/data/site";
import { Magnetic } from "./Magnetic";
import { usePrefersReducedMotion } from "./hooks";
import { useLenis } from "./SmoothScroll";
import { IrisStoryOverlay } from "./IrisStoryIntro";

const TOTAL_FRAMES = 240;
const PORTAL_END = 0.45;

const checkIsMobileTier = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
};

const getFrameUrl = (index: number, isMobile: boolean = false) => {
  const paddedIndex = String(Math.min(TOTAL_FRAMES, Math.max(1, index))).padStart(3, "0");
  const folder = isMobile ? "hero-mobile" : "hero";
  return `/frames/${folder}/frame_${paddedIndex}.webp`;
};

interface CalloutPhase {
  range: readonly [number, number];
  badge: string;
  title: string;
  body: string;
  metric: string;
  icon: typeof Sparkles;
  align: "left" | "right";
}

const calloutPhases: CalloutPhase[] = [
  {
    range: [0.18, 0.48],
    badge: "01 · BESPOKE SILHOUETTE",
    title: "Mazzucchelli 1849 Acetate",
    body: "Block-cut Italian dark amber tortoiseshell, cured for six months and hand-beveled for ergonomic weight distribution.",
    metric: "Handcrafted in Cadore, Italy",
    icon: Sparkles,
    align: "left",
  },
  {
    range: [0.49, 0.76],
    badge: "02 · INTERNAL ARCHITECTURE",
    title: "Aerospace Titanium Core",
    body: "Precision-flush 5-barrel hinge assembly engineered with zero mechanical backlash and rated for 50,000+ flex cycles.",
    metric: "0.02 mm Hinge Tolerance",
    icon: ShieldCheck,
    align: "right",
  },
  {
    range: [0.77, 0.94],
    badge: "03 · ZEISS OPTICAL AXIS",
    title: "Carl Zeiss T* Anti-Reflective",
    body: "Bevel-mounted optical lenses calibrated to sub-micron optical centration to eliminate chromatic aberrations.",
    metric: "99.4% Reflection Elimination",
    icon: Eye,
    align: "left",
  },
];

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const loadingQueueRef = useRef<Set<number>>(new Set());
  const currentFrameRef = useRef<number>(1);
  const isMobileRef = useRef<boolean>(false);
  const rafRef = useRef<number | null>(null);

  const [progress, setProgress] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  const reduced = usePrefersReducedMotion();
  const lenis = useLenis();

  // Load a single frame into image cache
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
      if (frameNum === 1) setIsLoaded(true);
      onLoaded?.();
    };
    img.onerror = () => {
      loadingQueueRef.current.delete(frameNum);
    };
  }, []);

  // Draw current frame on canvas with retina sharpness & aspect ratio preservation
  const renderFrame = useCallback((frameNum: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Find the closest available loaded frame to prevent blank frames
    let img = imagesRef.current[frameNum - 1];
    if (!img) {
      for (let offset = 1; offset < 20; offset++) {
        const prev = imagesRef.current[frameNum - 1 - offset];
        const next = imagesRef.current[frameNum - 1 + offset];
        if (prev) {
          img = prev;
          break;
        }
        if (next) {
          img = next;
          break;
        }
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;

    const winW = typeof window !== "undefined" ? window.innerWidth : 1440;
    const isDesktop = winW >= 1024;
    const isTablet = winW >= 768 && winW < 1024;

    let renderW: number;
    let renderH: number;
    let offsetX: number;
    let offsetY: number;

    if (isDesktop) {
      // DESKTOP / LAPTOP / TV: Full majestic cinematic scale (never reduced)
      const scale = Math.max(cw / imgW, ch / imgH);
      renderW = imgW * scale;
      renderH = imgH * scale;
      offsetX = (cw - renderW) / 2;
      offsetY = (ch - renderH) / 2;
    } else if (isTablet) {
      // TABLET RESPONSIVE: Contained upper fit so callout cards comfortably sit below
      const availableW = cw * 0.92;
      const availableH = ch * 0.60;
      const scale = Math.min(availableW / imgW, availableH / imgH);
      renderW = imgW * scale;
      renderH = imgH * scale;
      offsetX = (cw - renderW) / 2;
      offsetY = ch * 0.38 - renderH / 2;
    } else {
      // MOBILE RESPONSIVE: Contained upper fit so callout cards sit cleanly underneath
      const availableW = cw * 0.94;
      const availableH = ch * 0.54;
      const scale = Math.min(availableW / imgW, availableH / imgH);
      renderW = imgW * scale;
      renderH = imgH * scale;
      offsetX = (cw - renderW) / 2;
      offsetY = ch * 0.36 - renderH / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
  }, []);

  // Progressive frame preloading strategy
  useEffect(() => {
    isMobileRef.current = checkIsMobileTier();

    // 1. Immediately load frame 1 for instant display
    loadFrame(1, () => {
      renderFrame(1);
    });

    // 2. Load coarse keyframes first (every 12th frame) for rapid scrub availability
    const keyframes: number[] = [];
    for (let i = 1; i <= TOTAL_FRAMES; i += 12) {
      keyframes.push(i);
    }
    keyframes.forEach((f) => loadFrame(f));

    // 3. Incrementally load remaining frames
    let cur = 2;
    const interval = setInterval(() => {
      if (cur > TOTAL_FRAMES) {
        clearInterval(interval);
        return;
      }
      loadFrame(cur);
      cur += 1;
    }, 15);

    return () => clearInterval(interval);
  }, [loadFrame, renderFrame]);

  // Handle canvas sizing for Retina displays
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      renderFrame(currentFrameRef.current);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [renderFrame]);

  const targetFrameRef = useRef<number>(1);
  const lerpFrameRef = useRef<number>(1);
  const lastDrawnFrameRef = useRef<number>(1);

  // Continuous physics lerp rendering loop (interpolates intermediate frames at 60fps)
  useEffect(() => {
    let animId: number;

    const tick = () => {
      animId = requestAnimationFrame(tick);

      const target = targetFrameRef.current;
      const current = lerpFrameRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.05) {
        // Organic smooth momentum lerp
        const next = current + diff * 0.14;
        lerpFrameRef.current = next;
        const frameToDraw = Math.min(TOTAL_FRAMES, Math.max(1, Math.round(next)));

        if (frameToDraw !== lastDrawnFrameRef.current) {
          lastDrawnFrameRef.current = frameToDraw;
          renderFrame(frameToDraw);
        }
      }
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [renderFrame]);

  const progressRef = useRef(0);

  // GSAP ScrollTrigger setup for butter-smooth scrub
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
            const p = self.progress;

            // Normalized Hero progress (only advances after portal finishes at PORTAL_END)
            const heroProgress = p <= PORTAL_END
              ? 0
              : Math.min(1, Math.max(0, (p - PORTAL_END) / (1 - PORTAL_END)));

            // Target frame index (1 to 240) - rock solid at frame 1 during portal phase
            const target = p <= PORTAL_END
              ? 1
              : Math.min(
                  TOTAL_FRAMES,
                  Math.max(1, Math.round(heroProgress * (TOTAL_FRAMES - 1)) + 1)
                );
            targetFrameRef.current = target;

            // Preload ahead in direction of scroll
            if (target > 1) {
              for (let i = -2; i <= 8; i++) {
                const f = target + i;
                if (f >= 1 && f <= TOTAL_FRAMES) loadFrame(f);
              }
            }

            // Stable throttle for telemetry state without tearing down ScrollTrigger
            if (Math.abs(p - progressRef.current) > 0.008 || p === 0 || p === 1) {
              progressRef.current = p;
              setProgress(p);
              setCurrentFrame(target);
            }
          },
        });
      }, container);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduced, loadFrame, renderFrame]);

  // Computed animation values
  const irisProgress = Math.min(1, Math.max(0, progress / PORTAL_END));
  const heroProgress = progress <= PORTAL_END
    ? 0
    : Math.min(1, Math.max(0, (progress - PORTAL_END) / (1 - PORTAL_END)));

  // Skip Iris Story to jump directly to opened Hero
  const handleSkipToHero = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const targetScroll = container.offsetTop + container.offsetHeight * (PORTAL_END + 0.01);
    if (lenis) {
      lenis.scrollTo(targetScroll, { duration: 1.0 });
    } else {
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
  }, [lenis]);

  // Active callout phase computation (only after portal opens)
  const activeCallout = heroProgress > 0.05
    ? calloutPhases.find(
        (phase) => heroProgress >= phase.range[0] && heroProgress <= phase.range[1]
      )
    : undefined;

  // Degrees calculation for current rotation
  const degrees = Math.round(heroProgress * 360);

  // Gentle UI clearance between 0.92 and 0.98 so the frame is pure for the split-flap transition
  const uiEndFade = Math.max(0, Math.min(1, (heroProgress - 0.92) / 0.06));
  const uiOpacity = Math.max(0, 1 - uiEndFade);

  return (
    <section
      ref={containerRef}
      id="eyewear-hero"
      className="relative w-full bg-obsidian text-paper"
      style={{
        // 660vh: 297vh for the Iris Story & Portal, 363vh for the 360° frame scrub
        height: "660vh",
      }}
    >
      {/* Sticky 100svh Viewport Container */}
      <div
        ref={stickyRef}
        className="sticky top-0 h-[100svh] w-full overflow-hidden flex flex-col justify-between"
      >
        {/* Background Canvas Layer — completely hidden until portal starts opening */}
        <div
          className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden bg-obsidian transition-opacity duration-300"
          style={{
            opacity: progress < PORTAL_END * 0.78
              ? 0
              : Math.min(1, (progress - PORTAL_END * 0.78) / (PORTAL_END * 0.22)),
          }}
        >
          <canvas
            ref={canvasRef}
            className="h-full w-full object-cover select-none pointer-events-none"
          />

          {/* Vignette Gradients so Canvas seamlessly merges into obsidian background */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(9,9,11,0.85)_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-obsidian via-obsidian/40 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-obsidian via-obsidian/60 to-transparent" />
        </div>

        {/* TOP: Header Badge & Eyebrow */}
        <div
          className="relative z-10 mx-auto flex w-full max-w-[1600px] items-center justify-between px-5 pt-24 sm:px-8 md:px-12 md:pt-28 transition-opacity duration-300"
          style={{
            opacity: progress < PORTAL_END * 0.75 ? 0 : uiOpacity,
          }}
        >
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            <p className="eyebrow text-[9px] text-steel sm:text-[10px] tracking-[0.25em]">
              PUNE · SINCE 2011 · ZEISS PARTNER
            </p>
          </div>
        </div>

        {/* CENTER: Headline Phase (Shifted down slightly with elegant breathing space below the glasses) */}
        <div
          className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-1 flex-col items-center justify-center pt-24 sm:pt-28 md:pt-36 px-5 text-center transition-opacity duration-300 pointer-events-none"
          style={{
            opacity: progress < PORTAL_END * 0.75
              ? 0
              : Math.max(0, 1 - heroProgress * 6.5),
            transform: `translateY(${25 - heroProgress * 150}px) scale(${1 - heroProgress * 0.2})`,
            display: heroProgress > 0.18 ? "none" : "flex",
          }}
        >
          <h1 className="display text-paper">
            <span className="block text-[15vw] leading-[0.84] sm:text-[13vw] md:text-[10vw] lg:text-[8.5vw] mix-blend-difference">
              SEE
            </span>
            <span className="block text-[15vw] leading-[0.84] sm:text-[13vw] md:text-[10vw] lg:text-[8.5vw]">
              DIFFERENT<span className="text-gold">.</span>
            </span>
          </h1>
          <p className="eyebrow mt-4 sm:mt-6 text-[9px] sm:text-[11px] tracking-[0.35em] text-steel">
            BESPOKE ITALIAN ACETATE · ZEISS GERMAN OPTICS
          </p>
        </div>

        {/* DYNAMIC SCROLL CALLOUTS: Beneath video on mobile/tablet, flanking sides on desktop/laptop/TV */}
        <div className="pointer-events-none absolute inset-x-0 top-[50%] sm:top-[52%] md:top-[54%] lg:top-1/2 lg:-translate-y-1/2 z-20 mx-auto w-full max-w-[1600px] px-4 sm:px-8 md:px-12">
          <AnimatePresence mode="wait">
            {activeCallout && (
              <motion.div
                key={activeCallout.badge}
                initial={{ opacity: 0, y: 15, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className={`flex w-full ${
                  activeCallout.align === "left"
                    ? "justify-center lg:justify-start"
                    : "justify-center lg:justify-end"
                }`}
              >
                <div className="pointer-events-auto w-full max-w-[340px] sm:max-w-[420px] rounded-xl sm:rounded-2xl border border-paper/15 bg-obsidian/90 p-3.5 sm:p-5 backdrop-blur-xl shadow-2xl shadow-obsidian/95">
                  <div className="flex items-center gap-2">
                    <activeCallout.icon size={11} className="text-gold" />
                    <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-gold">
                      {activeCallout.badge}
                    </span>
                  </div>

                  <h3 className="display mt-1 sm:mt-2 text-base sm:text-2xl text-paper">
                    {activeCallout.title}
                  </h3>

                  <p className="mt-1 sm:mt-1.5 text-[11px] sm:text-xs leading-relaxed text-steel">
                    {activeCallout.body}
                  </p>

                  <div className="mt-2.5 sm:mt-3 flex items-center justify-between border-t border-paper/10 pt-2 sm:pt-2.5">
                    <span className="font-mono text-[8px] sm:text-[9px] tracking-wider text-steel">
                      {activeCallout.metric}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM: Action CTA with Smooth Exit */}
        <div
          className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-col gap-4 border-t border-paper/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 md:px-12 md:py-6 bg-gradient-to-t from-obsidian/90 via-obsidian/60 to-transparent transition-all duration-300"
          style={{
            opacity: progress < PORTAL_END * 0.75 ? 0 : uiOpacity,
            transform: `translateY(${uiEndFade * 20}px)`,
          }}
        >
          <p className="eyebrow text-[9px] sm:text-[10px] tracking-[0.2em] text-steel">
            BESPOKE EYEWEAR · KOTHRUD & SADASHIV PETH
          </p>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Magnetic>
              <a
                href="#collection"
                data-cursor="VIEW"
                className="eyebrow group relative block overflow-hidden bg-paper px-6 py-2.5 sm:px-8 sm:py-3 text-center text-[10px] text-obsidian rounded-lg transition-transform"
              >
                <span className="relative z-10 font-semibold">Explore Collection</span>
                <span className="absolute inset-0 -translate-x-full bg-gold transition-transform duration-500 group-hover:translate-x-0" />
              </a>
            </Magnetic>

            <Magnetic>
              <a
                href={whatsappUrl("Hello Bapat Optics, I'd like to book an eye exam.")}
                target="_blank"
                rel="noreferrer"
                data-cursor="BOOK"
                className="eyebrow flex items-center gap-1.5 border border-paper/20 bg-obsidian/60 px-5 py-2.5 sm:px-7 sm:py-3 text-center text-[10px] text-paper rounded-lg backdrop-blur-md transition-colors hover:border-gold hover:text-gold"
              >
                <span>Book Eye Exam</span>
                <ChevronRight size={12} />
              </a>
            </Magnetic>
          </div>
        </div>

        {/* IRIS STORY & PORTAL OVERLAY */}
        {progress <= PORTAL_END + 0.04 && (
          <IrisStoryOverlay
            progress={irisProgress}
            onSkip={handleSkipToHero}
          />
        )}
      </div>
    </section>
  );
}
