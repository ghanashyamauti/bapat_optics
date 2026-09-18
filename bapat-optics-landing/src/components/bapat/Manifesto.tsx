import { useEffect, useRef, useState } from "react";
import { Sparkles, ShieldCheck, Eye, Compass, Layers, CheckCircle2, RotateCw, Box } from "lucide-react";
import { usePrefersReducedMotion } from "./hooks";
import { GlassesViewer3D } from "./GlassesViewer3D";
import product2 from "@/assets/product-2.jpg";

const lines = [
  "Vision is personal.",
  "So a frame should be chosen,",
  "not sold. Measured, not guessed.",
  "Worn for years, not seasons.",
];

export function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [viewMode, setViewMode] = useState<"3d" | "photo">("3d");

  // GSAP Text Line Reveal
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const spans = Array.from(el.querySelectorAll<HTMLElement>("[data-line]"));
    let ctx: { revert: () => void } | undefined;

    if (reduced) {
      spans.forEach((s) => (s.style.transform = "translateY(0)"));
      return;
    }

    let cancelled = false;
    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.to(spans, {
          y: 0,
          duration: 1.1,
          ease: "power4.out",
          stagger: 0.12,
          scrollTrigger: { trigger: el, start: "top 75%" },
        });
      }, el);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduced]);

  return (
    <section id="manifesto" className="w-full max-w-full overflow-hidden bg-bone py-12 sm:py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-[1600px] px-4 sm:px-6 md:px-10">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-14 lg:items-center">
          
          {/* Left Column: Manifesto Headline & Philosophy */}
          <div className="min-w-0 w-full lg:col-span-7">
            <p className="eyebrow mb-3 sm:mb-6 flex items-center gap-2 text-[9px] text-muted-foreground sm:text-[10px]">
              <span className="inline-block h-px w-6 sm:w-12 bg-gold" />
              The House View · Pune Heritage
            </p>
            <h2 className="display text-[1.45rem] xs:text-2xl sm:text-4xl md:text-5xl lg:text-[3.8vw] leading-[1.12] sm:leading-[1.08] text-obsidian tracking-tight">
              {lines.map((line, i) => (
                <span key={line} className="reveal-line block overflow-hidden">
                  <span
                    data-line
                    className={`block translate-y-[110%] will-change-transform break-words ${i > 0 ? "text-muted-foreground" : ""}`}
                  >
                    {line}
                  </span>
                </span>
              ))}
            </h2>

            <p className="mt-3 sm:mt-6 max-w-xl text-xs sm:text-sm leading-relaxed text-muted-foreground">
              At Bapat Optics, we believe eyewear is neither a medical chore nor fast fashion.
              For over 14 years across Kothrud and Sadashiv Peth, every pair of glasses is measured with micron-level digital precision, fitted to Indian facial ergonomics, and backed by lifetime in-house servicing.
            </p>

            {/* Core Values Grid */}
            <div className="mt-5 sm:mt-8 grid gap-3 sm:gap-4 border-t border-obsidian/10 pt-4 sm:pt-6 grid-cols-1 sm:grid-cols-3">
              <div className="flex flex-col gap-0.5 sm:gap-1">
                <span className="eyebrow flex items-center gap-1.5 text-[10px] font-semibold text-obsidian">
                  <Eye size={13} className="shrink-0 text-gold" /> 100% Free
                </span>
                <p className="text-[11px] text-muted-foreground">Digital eye examinations at both stores</p>
              </div>

              <div className="flex flex-col gap-0.5 sm:gap-1">
                <span className="eyebrow flex items-center gap-1.5 text-[10px] font-semibold text-obsidian">
                  <ShieldCheck size={13} className="shrink-0 text-gold" /> Lifetime Free
                </span>
                <p className="text-[11px] text-muted-foreground">In-house frame servicing & adjustments</p>
              </div>

              <div className="flex flex-col gap-0.5 sm:gap-1">
                <span className="eyebrow flex items-center gap-1.5 text-[10px] font-semibold text-obsidian">
                  <Sparkles size={13} className="shrink-0 text-gold" /> Authorized
                </span>
                <p className="text-[11px] text-muted-foreground">Armani, Versace, Line Art & Zeiss partner</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 3D Spectacle GLB Showcase */}
          <div className="min-w-0 w-full lg:col-span-5">
            <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-obsidian p-3.5 sm:p-6 md:p-7 shadow-2xl text-paper">
              
              {/* Header HUD */}
              <div className="relative z-20 flex items-center justify-between gap-2 border-b border-paper/10 pb-2.5 sm:pb-3">
                <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                  <span className="h-2 w-2 shrink-0 animate-ping rounded-full bg-gold" />
                  <span className="eyebrow truncate text-[8.5px] sm:text-[9px] tracking-wider text-gold">3D Interactive Viewer</span>
                </div>

                {/* View Mode Switcher */}
                <div className="flex shrink-0 items-center gap-1 rounded-full border border-paper/15 bg-paper/5 p-0.5 sm:p-1 text-[8px] sm:text-[9px]">
                  <button
                    type="button"
                    onClick={() => setViewMode("3d")}
                    className={`flex items-center gap-1 rounded-full px-2 sm:px-2.5 py-0.5 transition-all ${
                      viewMode === "3d" ? "bg-gold text-obsidian font-semibold" : "text-steel hover:text-paper"
                    }`}
                  >
                    <Box size={10} /> 3D Model
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("photo")}
                    className={`rounded-full px-2 sm:px-2.5 py-0.5 transition-all ${
                      viewMode === "photo" ? "bg-gold text-obsidian font-semibold" : "text-steel hover:text-paper"
                    }`}
                  >
                    Studio Shot
                  </button>
                </div>
              </div>

              {/* 3D GLB Model Viewport or Studio Photo */}
              <div className="relative my-2.5 sm:my-4 aspect-[4/3] sm:aspect-[16/11] md:aspect-[4/3] min-h-[190px] sm:min-h-[220px] w-full overflow-hidden rounded-xl bg-obsidian/90">
                {viewMode === "3d" ? (
                  <GlassesViewer3D modelUrl="/models/Glasses.glb" className="h-full w-full" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-4">
                    <img
                      src={product2}
                      alt="Actual luxury optical frame at Bapat Optics"
                      className="h-full w-full object-contain shadow-product transition-all duration-500 hover:scale-105"
                    />
                  </div>
                )}
              </div>

              {/* Footer Tip */}
              <div className="relative z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 border-t border-paper/10 pt-2 sm:pt-2.5 text-[9px]">
                <span className="text-steel text-[8px] sm:text-[9px]">
                  {viewMode === "3d"
                    ? "Drag anywhere to rotate 360° · Pinch to zoom"
                    : "Studio capture · Italian Mazzucchelli acetate"}
                </span>
                <span className="shrink-0 font-mono text-[8px] sm:text-[9px] text-gold">GLB 3D Ready</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
