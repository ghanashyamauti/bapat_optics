import { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "motion/react";
import { Sparkles, ChevronLeft, ChevronRight, Compass } from "lucide-react";
import { usePrefersReducedMotion } from "./hooks";

export interface BrandCardData {
  id: string;
  number: string;
  name: string;
  sub: string;
  collection: string;
  origin: string;
  image: string;
  accent: string;
}

const BRAND_CARDS: BrandCardData[] = [
  {
    id: "cartier",
    number: "01",
    name: "CARTIER",
    sub: "HAUTE HORLOGERIE & JOAILLERIE",
    collection: "Panthère de Cartier · 18K Gold Plated",
    origin: "PARIS · 1847",
    image: "/assets/product-2.jpg",
    accent: "#D4AF37",
  },
  {
    id: "dior",
    number: "02",
    name: "DIOR",
    sub: "COUTURE EYEWEAR ATELIER",
    collection: "DiorBlackSuit · Cannage Temple Architecture",
    origin: "PARIS · 1946",
    image: "/assets/product-1.jpg",
    accent: "#E5C378",
  },
  {
    id: "gucci",
    number: "03",
    name: "GUCCI",
    sub: "FLORENTINE LEATHER & GOLD",
    collection: "Horsebit Archive · Havana Gold Acetate",
    origin: "FIRENZE · 1921",
    image: "/assets/product-3.jpg",
    accent: "#D4AF37",
  },
  {
    id: "prada",
    number: "04",
    name: "PRADA",
    sub: "AVANT-GARDE ITALIAN SILHOUETTES",
    collection: "Prada Symbole · Beveled Geometric Rim",
    origin: "MILANO · 1913",
    image: "/assets/product-4.jpg",
    accent: "#E2E8F0",
  },
  {
    id: "tom-ford",
    number: "05",
    name: "TOM FORD",
    sub: "MODERN ICONIC LUXURY",
    collection: "Signature T-Hinge · Vintage Japanese Acetate",
    origin: "NEW YORK · 2005",
    image: "/assets/product-5.jpg",
    accent: "#F1D28C",
  },
  {
    id: "ray-ban",
    number: "06",
    name: "RAY-BAN",
    sub: "TIMELESS OPTICAL HERITAGE",
    collection: "Aviator & Clubmaster · Zeiss Calibrated",
    origin: "GENUINE SINCE 1937",
    image: "/assets/product-1.jpg",
    accent: "#D4AF37",
  },
  {
    id: "oliver-peoples",
    number: "07",
    name: "OLIVER PEOPLES",
    sub: "BESPOKE VINTAGE CRAFTSMANSHIP",
    collection: "Gregory Peck · Filigree Core Wire Titanium",
    origin: "WEST HOLLYWOOD · 1987",
    image: "/assets/product-2.jpg",
    accent: "#E5C378",
  },
  {
    id: "maybach",
    number: "08",
    name: "MAYBACH",
    sub: "THE PINNACLE OF LUXURY",
    collection: "The Diplomat I · Genuine Horn & Solid Titanium",
    origin: "GERMANY · 1909",
    image: "/assets/tech.jpg",
    accent: "#E6CA65",
  },
  {
    id: "saint-laurent",
    number: "09",
    name: "SAINT LAURENT",
    sub: "PARISIAN MONOCHROME REFINEMENT",
    collection: "SL M94 · Monogrammed Obsidian Acetate",
    origin: "PARIS · 1961",
    image: "/assets/product-3.jpg",
    accent: "#FFFFFF",
  },
  {
    id: "versace",
    number: "10",
    name: "VERSACE",
    sub: "BAROQUE MEDUSA ICONOGRAPHY",
    collection: "Medusa Biggie · High-Relief Gilded Emblem",
    origin: "MILANO · 1978",
    image: "/assets/product-4.jpg",
    accent: "#D4AF37",
  },
  {
    id: "lindberg",
    number: "11",
    name: "LINDBERG",
    sub: "DANISH SCREWLESS TITANIUM",
    collection: "Air Titanium Rim · 2.7g Featherweight Frame",
    origin: "DENMARK · 1984",
    image: "/assets/tech.jpg",
    accent: "#94A3B8",
  },
  {
    id: "swarovski",
    number: "12",
    name: "SWAROVSKI",
    sub: "PRECISION FACETED CRYSTALS",
    collection: "Lucent Atelier · Prismatic Pavé Temples",
    origin: "WATTENS · 1895",
    image: "/assets/product-5.jpg",
    accent: "#CBD5E1",
  },
  {
    id: "oakley",
    number: "13",
    name: "OAKLEY",
    sub: "PERFORMANCE HIGH-DEFINITION OPTICS",
    collection: "Carbon Blade · O Matter Industrial Alloy",
    origin: "FOOTHILL RANCH · 1975",
    image: "/assets/product-1.jpg",
    accent: "#38BDF8",
  },
  {
    id: "emporio-armani",
    number: "14",
    name: "EMPORIO ARMANI",
    sub: "CONTEMPORARY ITALIAN TAILORING",
    collection: "Eagle Heritage · Satin Gunmetal Double Bridge",
    origin: "MILANO · 1981",
    image: "/assets/product-2.jpg",
    accent: "#D4AF37",
  },
  {
    id: "burberry",
    number: "15",
    name: "BURBERRY",
    sub: "BRITISH HERITAGE LUXURY",
    collection: "Vintage Check · Bio-Based Italian Cellulose",
    origin: "LONDON · 1856",
    image: "/assets/product-3.jpg",
    accent: "#D4AF37",
  },
  {
    id: "dolce-gabbana",
    number: "16",
    name: "DOLCE & GABBANA",
    sub: "MEDITERRANEAN ARTISAN SPIRIT",
    collection: "Devotion Sacred Heart · Filigree Metalwork",
    origin: "ITALIA · 1985",
    image: "/assets/product-4.jpg",
    accent: "#F59E0B",
  },
  {
    id: "calvin-klein",
    number: "17",
    name: "CALVIN KLEIN",
    sub: "PURIFIED ARCHITECTURAL MINIMALISM",
    collection: "Platinum Monolith · Seamless Matte Titanium",
    origin: "NEW YORK · 1968",
    image: "/assets/product-5.jpg",
    accent: "#E2E8F0",
  },
  {
    id: "montblanc",
    number: "18",
    name: "MONTBLANC",
    sub: "HAMBURG ATELIER EXCELLENCE",
    collection: "Meisterstück Rimless · Floating Snowcap Star",
    origin: "HAMBURG · 1906",
    image: "/assets/tech.jpg",
    accent: "#D4AF37",
  },
  {
    id: "porsche-design",
    number: "19",
    name: "PORSCHE DESIGN",
    sub: "ENGINEERED AEROSPACE PERFORMANCE",
    collection: "Laser-Flex P'8478 · Interchangeable Lens System",
    origin: "STUTTGART · 1972",
    image: "/assets/product-1.jpg",
    accent: "#94A3B8",
  },
  {
    id: "carl-zeiss",
    number: "20",
    name: "CARL ZEISS",
    sub: "175 YEARS OF GERMAN OPTICAL PERFECTION",
    collection: "Zeiss Pure · Precision Freeform Wavefront Lenses",
    origin: "OBERKOCHEN · 1846",
    image: "/assets/tech.jpg",
    accent: "#0066FF",
  },
];

/**
 * 3D Curved Floating Ribbon Carousel.
 * Direct visual implementation of the user's reference image:
 * - Continuous 3D S-curve/arc floating through deep 3D perspective.
 * - Cards sweep from foreground left and recede gracefully into the top-right distance.
 * - Scroll and drag physics glide the cards along the 3D spline.
 */
export function BrandCurvedRibbon() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  // Active floating progress (float index, e.g. 0.0 to 19.0)
  const [scrollProgress, setScrollProgress] = useState(0);
  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const isDraggingRef = useRef(false);
  const startDragXRef = useRef(0);
  const startProgressRef = useRef(0);

  // GSAP ScrollTrigger integration
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
          scrub: 0.8,
          onUpdate: (self) => {
            if (!isDraggingRef.current) {
              targetProgressRef.current = self.progress * (BRAND_CARDS.length - 1);
            }
          },
        });
      }, container);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduced]);

  // Smooth lerp animation loop for 60-120fps fluid glide
  useEffect(() => {
    let animId: number;

    const loop = () => {
      const current = progressRef.current;
      const target = targetProgressRef.current;
      const next = current + (target - current) * 0.12;
      progressRef.current = next;
      setScrollProgress(next);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Pointer Drag (Mouse & Touch) for interactive scrubbing
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    startDragXRef.current = e.clientX;
    startProgressRef.current = progressRef.current;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - startDragXRef.current;
    // Map drag distance into progress change
    const sensitivity = window.innerWidth < 768 ? 0.007 : 0.004;
    const nextTarget = Math.max(
      0,
      Math.min(BRAND_CARDS.length - 1, startProgressRef.current - deltaX * sensitivity)
    );
    targetProgressRef.current = nextTarget;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  // Steppers for quick navigation
  const handlePrev = () => {
    targetProgressRef.current = Math.max(0, Math.round(targetProgressRef.current) - 1);
  };

  const handleNext = () => {
    targetProgressRef.current = Math.min(
      BRAND_CARDS.length - 1,
      Math.round(targetProgressRef.current) + 1
    );
  };

  // Active brand for focal status display
  const activeIndex = Math.min(
    BRAND_CARDS.length - 1,
    Math.max(0, Math.round(scrollProgress))
  );
  const activeBrand = BRAND_CARDS[activeIndex];

  return (
    <section
      ref={containerRef}
      className="relative h-[320vh] bg-[#050507] select-none"
      id="brand-ribbon"
    >
      {/* Sticky Full-Viewport 3D Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between px-5 sm:px-12 py-6 sm:py-10">
        {/* 1. Deep Atmospheric Darkroom & Floating Golden Particles */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 60% 40%, rgba(212,175,55,0.07) 0%, rgba(10,10,14,0.92) 50%, #050507 90%)",
            }}
          />

          {/* Monumental Watermark Typography (Matches the "DESIGN" / "TION" in reference) */}
          <div className="absolute inset-0 flex items-center justify-between px-4 sm:px-16 overflow-hidden pointer-events-none select-none opacity-[0.06] font-display font-light">
            <span className="text-[18vw] leading-none tracking-tighter text-white">
              HOUSES
            </span>
            <span className="text-[18vw] leading-none tracking-tighter text-gold hidden md:inline">
              ATELIER
            </span>
          </div>

          {/* Curving 3D Trajectory Guide Splines (Matching reference wire curve) */}
          <svg
            className="absolute inset-0 h-full w-full opacity-20 pointer-events-none"
            viewBox="0 0 1440 900"
            preserveAspectRatio="none"
          >
            <path
              d="M -100,750 C 350,680 500,420 850,280 C 1150,150 1400,100 1600,60"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="1.25"
              strokeDasharray="4 8"
            />
            <path
              d="M -100,830 C 350,760 500,500 850,360 C 1150,230 1400,180 1600,140"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="0.75"
            />
          </svg>
        </div>

        {/* 2. Top Header Bar */}
        <div className="relative z-20 flex w-full items-start justify-between pointer-events-none">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
              <p className="eyebrow text-[9px] sm:text-[10px] tracking-[0.3em] text-gold uppercase font-mono">
                20 PREMIER DESIGNER HOUSES
              </p>
            </div>
            <h2 className="display mt-1 text-2xl sm:text-4xl md:text-5xl font-light tracking-tight text-paper">
              Bespoke Eyewear Architecture<span className="text-gold">.</span>
            </h2>
            <p className="text-xs sm:text-sm text-steel mt-1 max-w-md hidden sm:block">
              Continuous 3D curved floating ribbon. Scroll down or drag horizontally to traverse each premier atelier.
            </p>
          </div>

          {/* Active Brand Counter & Steppers */}
          <div className="flex items-center gap-3 pointer-events-auto">
            <span className="font-mono text-xs sm:text-sm text-paper/80 tracking-widest">
              <strong className="text-gold font-normal">
                {String(activeIndex + 1).padStart(2, "0")}
              </strong>{" "}
              / 20
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                disabled={activeIndex === 0}
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-paper/15 bg-paper/[0.04] flex items-center justify-center text-paper/70 hover:text-paper hover:border-gold hover:bg-gold/10 disabled:opacity-30 disabled:pointer-events-none transition-all"
                aria-label="Previous brand"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={activeIndex === BRAND_CARDS.length - 1}
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-paper/15 bg-paper/[0.04] flex items-center justify-center text-paper/70 hover:text-paper hover:border-gold hover:bg-gold/10 disabled:opacity-30 disabled:pointer-events-none transition-all"
                aria-label="Next brand"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* 3. The 3D Curved Floating Ribbon Stage (Matches Reference Image Arc) */}
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative z-10 my-auto h-[460px] sm:h-[540px] md:h-[600px] w-full cursor-grab active:cursor-grabbing select-none touch-none"
          style={{
            perspective: "1300px",
            perspectiveOrigin: "42% 48%",
          }}
        >
          <div
            className="relative h-full w-full"
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {BRAND_CARDS.map((brand, i) => {
              // Delta: distance from active focal point
              const delta = i - scrollProgress;

              // Only render cards reasonably close to the viewport to maintain 120fps performance
              if (delta < -3 || delta > 8) return null;

              // ── 3D Spline Formula Matching Reference Arc ──
              // Foreground card (delta = 0) sits at left-center
              // As delta increases, the card swoops to the right, rises slightly, and recedes deep into Z
              let x = 0;
              let y = 0;
              let z = 0;
              let rotateY = 0;
              let rotateX = 0;
              let rotateZ = 0;
              let scale = 1;
              let opacity = 1;

              if (delta >= 0) {
                // Receding curve towards top-right
                x = (delta * 190) - 140; // Starts left, moves right
                y = -(Math.pow(delta, 1.18) * 38) - 10; // Rises into distance
                z = -(delta * 210); // Recedes deep into 3D space
                rotateY = -14 - delta * 6.5; // Angles away along the curve
                rotateX = 5 + delta * 1.2; // Gentle tilt
                rotateZ = -(delta * 1.1); // Organic ribbon roll
                scale = Math.max(0.48, 1 - delta * 0.082);
                opacity = delta > 6 ? Math.max(0, 1 - (delta - 6) * 0.7) : 1;
              } else {
                // Exiting off to the left foreground
                x = delta * 290 - 140;
                y = -delta * 24 - 10;
                z = delta * 90;
                rotateY = -14 + delta * 12;
                rotateX = 5;
                rotateZ = delta * 1.5;
                scale = 1 + delta * 0.04;
                opacity = Math.max(0, 1 + delta * 0.65);
              }

              const isHero = Math.abs(delta) < 0.45;

              return (
                <div
                  key={brand.id}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-shadow duration-300"
                  style={{
                    transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
                    transformStyle: "preserve-3d",
                    zIndex: Math.round(100 - delta * 10),
                    opacity,
                    willChange: "transform, opacity",
                  }}
                >
                  {/* Luxury Editorial Showcase Card */}
                  <div
                    className={`relative w-[280px] xs:w-[320px] sm:w-[380px] md:w-[430px] aspect-[16/11] rounded-2xl overflow-hidden border backdrop-blur-xl transition-all duration-300 ${
                      isHero
                        ? "border-gold/60 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(212,175,55,0.22)] ring-1 ring-gold/40"
                        : "border-paper/15 shadow-[0_20px_50px_rgba(0,0,0,0.85)] bg-[#0C0C10]/95"
                    }`}
                  >
                    {/* Card Background Image with Rich Editorial Tint */}
                    <div className="absolute inset-0">
                      <img
                        src={brand.image}
                        alt={brand.name}
                        className="h-full w-full object-cover opacity-35 filter grayscale contrast-125"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#08080C] via-[#0C0C12]/80 to-[#121218]/60" />
                    </div>

                    {/* Card Header: Number & Origin */}
                    <div className="relative z-10 flex items-center justify-between p-4 sm:p-5 border-b border-paper/10">
                      <span className="font-mono text-[10px] sm:text-xs text-gold tracking-widest font-light">
                        [{brand.number}]
                      </span>
                      <span className="font-mono text-[9px] sm:text-[10px] text-paper/60 tracking-[0.2em] uppercase">
                        {brand.origin}
                      </span>
                    </div>

                    {/* Card Body: Brand Name & Collection */}
                    <div className="relative z-10 flex flex-col justify-end p-5 sm:p-6 h-[calc(100%-60px)]">
                      <p className="eyebrow text-[8px] sm:text-[9.5px] tracking-[0.3em] text-gold uppercase font-mono mb-1">
                        {brand.sub}
                      </p>
                      <h3 className="display text-2xl sm:text-3xl md:text-4xl font-light tracking-wide text-paper">
                        {brand.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-steel/90 mt-1 line-clamp-1">
                        {brand.collection}
                      </p>

                      {/* Micro Spec Bar */}
                      <div className="mt-3 sm:mt-4 flex items-center justify-between border-t border-paper/10 pt-3 text-[9px] sm:text-[10px] text-paper/60 font-mono">
                        <span className="flex items-center gap-1.5 text-gold/90">
                          <Sparkles size={11} />
                          <span>PUNE ATELIER READY</span>
                        </span>
                        <span className="tracking-widest uppercase text-paper/70">
                          ZEISS FITTING
                        </span>
                      </div>
                    </div>

                    {/* Active Golden Edge Sheen on Hero Card */}
                    {isHero && (
                      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-gold/40 shadow-[inset_0_0_35px_rgba(212,175,55,0.15)]" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Bottom Telemetry & Navigation Guide */}
        <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-3 w-full border-t border-paper/10 pt-4 sm:pt-5 pointer-events-none">
          <div className="flex items-center gap-2">
            <Compass size={13} className="text-gold" />
            <p className="eyebrow text-[9px] sm:text-[10px] tracking-[0.25em] text-steel uppercase font-mono">
              CURATED AT BAPAT OPTICS · KOTHRUD & SADASHIV PETH
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.25em] text-steel/70 uppercase">
              SCROLL DOWN OR DRAG TO EXPLORE
            </span>
            <div className="h-1.5 w-1.5 rounded-full bg-gold animate-ping" />
          </div>
        </div>
      </div>
    </section>
  );
}
