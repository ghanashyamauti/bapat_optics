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
    <section id="manifesto" className="bg-bone py-16 sm:py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-10">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14 lg:items-center">
          
          {/* Left Column: Manifesto Headline & Philosophy */}
          <div className="lg:col-span-7">
            <p className="eyebrow mb-6 flex items-center gap-2.5 text-[9px] text-muted-foreground sm:mb-8 sm:text-[10px]">
              <span className="inline-block h-px w-8 bg-gold sm:w-12" />
              The House View · Pune Heritage
            </p>
            <h2 className="display text-[9vw] text-obsidian sm:text-[7vw] md:text-[4.6vw]">
              {lines.map((line, i) => (
                <span key={line} className="reveal-line block">
                  <span
                    data-line
                    className="block translate-y-[110%] will-change-transform"
                    style={i > 0 ? { color: "oklch(0.42 0.005 260)" } : undefined}
                  >
                    {line}
                  </span>
                </span>
              ))}
            </h2>

            <p className="mt-6 max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
              At Bapat Optics, we believe eyewear is neither a medical chore nor fast fashion.
              For over 14 years across Kothrud and Sadashiv Peth, every pair of glasses is measured with micron-level digital precision, fitted to Indian facial ergonomics, and backed by lifetime in-house servicing.
            </p>

            {/* Core Values Grid */}
            <div className="mt-8 grid gap-4 border-t border-obsidian/10 pt-6 sm:grid-cols-3">
              <div className="flex flex-col gap-1">
                <span className="eyebrow flex items-center gap-1.5 text-[10px] font-semibold text-obsidian">
                  <Eye size={13} className="text-gold" /> 100% Free
                </span>
                <p className="text-[11px] text-muted-foreground">Digital eye examinations at both stores</p>
              </div>

              <div className="flex flex-col gap-1">
                <span className="eyebrow flex items-center gap-1.5 text-[10px] font-semibold text-obsidian">
                  <ShieldCheck size={13} className="text-gold" /> Lifetime Free
                </span>
                <p className="text-[11px] text-muted-foreground">In-house frame servicing & adjustments</p>
              </div>

              <div className="flex flex-col gap-1">
                <span className="eyebrow flex items-center gap-1.5 text-[10px] font-semibold text-obsidian">
                  <Sparkles size={13} className="text-gold" /> Authorized
                </span>
                <p className="text-[11px] text-muted-foreground">Armani, Versace, Line Art & Zeiss partner</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 3D Spectacle GLB Showcase */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-obsidian p-6 sm:p-7 shadow-2xl text-paper">
              
              {/* Header HUD */}
              <div className="relative z-20 flex items-center justify-between border-b border-paper/10 pb-3.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-ping rounded-full bg-gold" />
                  <span className="eyebrow text-[9px] tracking-wider text-gold">3D Interactive Viewer</span>
                </div>

                {/* View Mode Switcher */}
                <div className="flex items-center gap-1.5 rounded-full border border-paper/15 bg-paper/5 p-1 text-[8px]">
                  <button
                    type="button"
                    onClick={() => setViewMode("3d")}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 transition-all ${
                      viewMode === "3d" ? "bg-gold text-obsidian font-semibold" : "text-steel hover:text-paper"
                    }`}
                  >
                    <Box size={10} /> 3D Model
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("photo")}
                    className={`rounded-full px-2.5 py-0.5 transition-all ${
                      viewMode === "photo" ? "bg-gold text-obsidian font-semibold" : "text-steel hover:text-paper"
                    }`}
                  >
                    Studio Shot
                  </button>
                </div>
              </div>

              {/* 3D GLB Model Viewport or Studio Photo */}
              <div className="relative my-4 aspect-[4/3] w-full overflow-hidden rounded-xl bg-obsidian/90">
                {viewMode === "3d" ? (
                  <GlassesViewer3D modelUrl="/models/Glasses.glb" className="h-full w-full" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-4">
                    <img
                      src="/showcase-frame.webp"
                      alt="Actual luxury optical frame at Bapat Optics"
                      className="h-full w-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] transition-all duration-500 hover:scale-105"
                    />
                  </div>
                )}
              </div>

              {/* Footer Tip */}
              <div className="relative z-20 flex items-center justify-between border-t border-paper/10 pt-3 text-[9px]">
                <span className="text-steel">
                  {viewMode === "3d"
                    ? "Drag anywhere to rotate 360° · Pinch or scroll to zoom"
                    : "Studio capture · Italian Mazzucchelli acetate"}
                </span>
                <span className="font-mono text-gold">GLB 3D Ready</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
