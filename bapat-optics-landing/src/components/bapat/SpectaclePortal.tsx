import { useEffect, useRef, useState } from "react";
import { Sparkles, Compass, Eye, ArrowDown } from "lucide-react";
import { usePrefersReducedMotion } from "./hooks";

export interface SpectaclePortalProps {
  id?: string;
  className?: string;
}

/**
 * "Through the Lens" Spectacle Portal transition.
 * Connects the Crafted frame-assembly section to the New Arrivals (Collection) storefront.
 * Zooms through the twin optical lenses of a designer eyewear piece with Zeiss AR watermarks,
 * transitioning the viewer from dark workshop assembly into the bright curated collection.
 */
export function SpectaclePortal({
  id = "spectacle-portal",
  className = "",
}: SpectaclePortalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  // Scroll scrub progress: 0 (viewing glasses) to 1 (passed through lenses)
  const [progress, setProgress] = useState(0);

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
          scrub: 0.5,
          onUpdate: (self) => {
            setProgress(self.progress);
          },
        });
      }, container);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduced]);

  // If user prefers reduced motion, render a clean, non-pinned optical separator
  if (reduced) {
    return (
      <div
        id={id}
        className={`relative w-full bg-obsidian py-14 px-6 border-y border-gold/20 text-center ${className}`}
      >
        <div className="mx-auto max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[9px] uppercase tracking-widest text-gold font-mono mb-3">
            <Eye size={11} className="text-gold" />
            <span>Carl Zeiss Vision · The New Arrivals</span>
          </div>
          <h3 className="display text-2xl text-paper">Through These Lenses, Pune Sees Differently</h3>
          <p className="mt-2 text-xs text-steel">
            Hand-assembled titanium frames fitted with precision Zeiss prescription lenses.
          </p>
        </div>
      </div>
    );
  }

  // 3D zoom scale: accelerates smoothly from 1.0 to 8.5
  const zoomScale = 1.0 + Math.pow(progress, 2.2) * 7.5;

  // Frame opacity fades out in the final 25% as the viewer passes through the glass
  const frameOpacity = Math.max(0, 1 - Math.max(0, (progress - 0.72) / 0.28));

  // Telemetry HUD fades out earlier (between 0% and 50% scroll)
  const hudOpacity = Math.max(0, 1 - progress * 2.2);

  // Background destination opacity (warm bone paper fills the view as progress completes)
  const destRevealOpacity = Math.min(1, Math.pow(progress, 1.5) * 1.2);

  return (
    <section
      ref={containerRef}
      id={id}
      className={`relative w-full h-[180vh] ${className}`}
      aria-label="Through the Lens Spectacle Transition"
    >
      {/* Pinned Viewport Container */}
      <div
        ref={stickyRef}
        className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-obsidian flex items-center justify-center select-none"
      >
        {/* Background Fullscreen Destination Layer (Revealed as we pass through the lenses) */}
        <div
          className="absolute inset-0 bg-bone pointer-events-none transition-opacity duration-150"
          style={{ opacity: destRevealOpacity }}
        >
          {/* Subtle optical convergence pattern in the bone chamber */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="h-[80vmin] w-[80vmin] rounded-full border border-dashed border-gold/50 animate-[spin_100s_linear_infinite]" />
            <div className="absolute h-[55vmin] w-[55vmin] rounded-full border border-gold/35" />
          </div>
        </div>

        {/* Top HUD Telemetry */}
        <div
          className="pointer-events-none absolute inset-x-0 top-10 z-20 flex flex-col items-center text-center px-4 transition-opacity duration-200"
          style={{ opacity: hudOpacity }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-obsidian/85 px-3.5 py-1 text-[9px] uppercase tracking-[0.22em] text-gold backdrop-blur-md font-mono shadow-xl">
            <Sparkles size={11} className="text-gold" />
            <span>Assembly Complete · Optical Centration</span>
          </div>

          <h3 className="display mt-3 text-xl sm:text-2xl md:text-3xl text-paper tracking-tight">
            Through These Lenses, Pune Sees Differently<span className="text-gold">.</span>
          </h3>

          <p className="mt-1 text-[11px] sm:text-xs text-steel max-w-md">
            Scroll forward to look through the assembled Zeiss optical glass into New Arrivals
          </p>
        </div>

        {/* Eyewear Zooming Rig (The Spectacle Frame in 3D Perspective) */}
        <div
          className="relative z-10 flex items-center justify-center will-change-transform"
          style={{
            transform: `scale(${zoomScale})`,
            opacity: frameOpacity,
            transformOrigin: "center center",
          }}
        >
          {/* SVG Vector Glasses Frame with Dual Optical Lenses */}
          <svg
            className="w-[88vw] max-w-[820px] h-auto drop-shadow-[0_0_35px_rgba(198,161,91,0.25)]"
            viewBox="0 0 900 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Defs: Lens Masks & Anti-Reflective Gradients */}
            <defs>
              {/* Left Lens Clip Mask */}
              <clipPath id="leftLensClip">
                <path d="M 120,130 C 120,80 170,55 270,55 C 370,55 400,85 400,140 C 400,240 370,330 260,330 C 150,330 120,240 120,130 Z" />
              </clipPath>

              {/* Right Lens Clip Mask */}
              <clipPath id="rightLensClip">
                <path d="M 500,140 C 500,85 530,55 630,55 C 730,55 780,80 780,130 C 780,240 750,330 640,330 C 530,330 500,240 500,140 Z" />
              </clipPath>

              {/* Zeiss DuraVision AR Coating Sheen Gradient (Cyan/Gold Luxury Glare) */}
              <linearGradient id="arSheen" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C6A15B" stopOpacity="0.25" />
                <stop offset="45%" stopColor="#4FD1C5" stopOpacity="0.12" />
                <stop offset="55%" stopColor="#63B3ED" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#C6A15B" stopOpacity="0.20" />
              </linearGradient>

              {/* Brushed Titanium Rim Gradient */}
              <linearGradient id="rimMetal" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E2D1A6" />
                <stop offset="30%" stopColor="#C6A15B" />
                <stop offset="50%" stopColor="#FFF8E7" />
                <stop offset="70%" stopColor="#A4813E" />
                <stop offset="100%" stopColor="#C6A15B" />
              </linearGradient>
            </defs>

            {/* ================= LEFT OPTICAL LENS CHAMBER ================= */}
            <g clipPath="url(#leftLensClip)">
              {/* Interior Bone Background Visible Inside Lens */}
              <rect x="100" y="40" width="320" height="300" fill="#F6F5F2" />

              {/* Interior Preview Teaser Content */}
              <g transform="translate(260, 190)">
                <circle cx="0" cy="0" r="85" stroke="#C6A15B" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                <line x1="-30" y1="0" x2="30" y2="0" stroke="#C6A15B" strokeWidth="1.5" opacity="0.6" />
                <line x1="0" y1="-30" x2="0" y2="30" stroke="#C6A15B" strokeWidth="1.5" opacity="0.6" />
                <circle cx="0" cy="0" r="3" fill="#C6A15B" />
                <text x="0" y="42" textAnchor="middle" fill="#0A0A0A" fontSize="11" fontFamily="sans-serif" fontWeight="700" letterSpacing="1">
                  NEW ARRIVALS
                </text>
                <text x="0" y="58" textAnchor="middle" fill="#666666" fontSize="8" fontFamily="sans-serif" letterSpacing="2">
                  PUNE STOREFRONT
                </text>
              </g>

              {/* Iconic Zeiss Laser Watermark 'Z' on Temporal Side */}
              <g transform="translate(145, 120) scale(0.65)" opacity="0.7">
                <path d="M 0,0 L 22,0 L 0,26 L 22,26" stroke="#C6A15B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </g>

              {/* Anti-Reflective Glare Sheen Layer */}
              <rect x="100" y="40" width="320" height="300" fill="url(#arSheen)" />

              {/* Pupillary Distance Coordinate O.D. */}
              <text x="260" y="115" textAnchor="middle" fill="#C6A15B" fontSize="9" fontFamily="monospace" opacity="0.8" letterSpacing="1">
                O.D. · PD 31.5mm
              </text>
            </g>

            {/* ================= RIGHT OPTICAL LENS CHAMBER ================= */}
            <g clipPath="url(#rightLensClip)">
              {/* Interior Bone Background Visible Inside Lens */}
              <rect x="480" y="40" width="320" height="300" fill="#F6F5F2" />

              {/* Interior Preview Teaser Content */}
              <g transform="translate(640, 190)">
                <circle cx="0" cy="0" r="85" stroke="#C6A15B" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                <line x1="-30" y1="0" x2="30" y2="0" stroke="#C6A15B" strokeWidth="1.5" opacity="0.6" />
                <line x1="0" y1="-30" x2="0" y2="30" stroke="#C6A15B" strokeWidth="1.5" opacity="0.6" />
                <circle cx="0" cy="0" r="3" fill="#C6A15B" />
                <text x="0" y="42" textAnchor="middle" fill="#0A0A0A" fontSize="11" fontFamily="sans-serif" fontWeight="700" letterSpacing="1">
                  65+ BRANDS
                </text>
                <text x="0" y="58" textAnchor="middle" fill="#666666" fontSize="8" fontFamily="sans-serif" letterSpacing="2">
                  CARL ZEISS VISION
                </text>
              </g>

              {/* Iconic Zeiss Laser Watermark 'Z' on Temporal Side */}
              <g transform="translate(735, 120) scale(0.65)" opacity="0.7">
                <path d="M 0,0 L 22,0 L 0,26 L 22,26" stroke="#C6A15B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </g>

              {/* Anti-Reflective Glare Sheen Layer */}
              <rect x="480" y="40" width="320" height="300" fill="url(#arSheen)" />

              {/* Pupillary Distance Coordinate O.S. */}
              <text x="640" y="115" textAnchor="middle" fill="#C6A15B" fontSize="9" fontFamily="monospace" opacity="0.8" letterSpacing="1">
                O.S. · PD 31.5mm
              </text>
            </g>

            {/* ================= DESIGNER EYEWEAR WIREFRAME ================= */}
            {/* Left Eye Rim (Outer & Inner Bevel) */}
            <path
              d="M 120,130 C 120,80 170,55 270,55 C 370,55 400,85 400,140 C 400,240 370,330 260,330 C 150,330 120,240 120,130 Z"
              stroke="url(#rimMetal)"
              strokeWidth="10"
              strokeLinejoin="round"
            />
            <path
              d="M 123,130 C 123,83 172,58 270,58 C 368,58 397,87 397,140 C 397,237 368,327 260,327 C 152,327 123,237 123,130 Z"
              stroke="#0A0A0A"
              strokeWidth="2"
              opacity="0.6"
            />

            {/* Right Eye Rim (Outer & Inner Bevel) */}
            <path
              d="M 500,140 C 500,85 530,55 630,55 C 730,55 780,80 780,130 C 780,240 750,330 640,330 C 530,330 500,240 500,140 Z"
              stroke="url(#rimMetal)"
              strokeWidth="10"
              strokeLinejoin="round"
            />
            <path
              d="M 503,140 C 503,87 532,58 630,58 C 728,58 777,83 777,130 C 777,237 748,327 640,327 C 532,327 503,237 503,140 Z"
              stroke="#0A0A0A"
              strokeWidth="2"
              opacity="0.6"
            />

            {/* Precision Bridge (Connecting the dual rims) */}
            <path
              d="M 400,125 C 425,105 475,105 500,125"
              stroke="url(#rimMetal)"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d="M 402,130 C 427,112 473,112 498,130"
              stroke="#FFF8E7"
              strokeWidth="1.5"
              opacity="0.8"
            />

            {/* Lower Keyhole Arch on Bridge */}
            <path
              d="M 415,160 C 430,135 470,135 485,160"
              stroke="url(#rimMetal)"
              strokeWidth="4"
              fill="none"
            />

            {/* Left & Right Silicone Nose Pads */}
            <ellipse cx="418" cy="185" rx="6" ry="14" fill="#C6A15B" opacity="0.75" />
            <ellipse cx="482" cy="185" rx="6" ry="14" fill="#C6A15B" opacity="0.75" />

            {/* Left Endpiece & Temple Hinge Rivets */}
            <path d="M 120,115 L 75,120" stroke="url(#rimMetal)" strokeWidth="12" strokeLinecap="round" />
            <circle cx="95" cy="118" r="2.5" fill="#0A0A0A" />
            <circle cx="80" cy="120" r="2.5" fill="#0A0A0A" />

            {/* Right Endpiece & Temple Hinge Rivets */}
            <path d="M 780,115 L 825,120" stroke="url(#rimMetal)" strokeWidth="12" strokeLinecap="round" />
            <circle cx="805" cy="118" r="2.5" fill="#0A0A0A" />
            <circle cx="820" cy="120" r="2.5" fill="#0A0A0A" />
          </svg>
        </div>

        {/* Bottom Telemetry & Dimensions HUD */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-10 z-20 flex flex-col items-center text-center px-4 transition-opacity duration-200"
          style={{ opacity: hudOpacity }}
        >
          <div className="flex items-center gap-3 text-[10px] text-gold/80 font-mono tracking-widest uppercase">
            <span className="h-px w-6 bg-gold/40" />
            <span>52 □ 18 - 145 · ZEISS BLUEGUARD · DURA-VISION PLATINUM</span>
            <span className="h-px w-6 bg-gold/40" />
          </div>

          <div className="mt-2.5 flex items-center gap-2 text-[9px] text-steel">
            <ArrowDown size={12} className="text-gold animate-bounce" />
            <span className="uppercase tracking-wider">Scroll to enter New Arrivals</span>
          </div>
        </div>
      </div>
    </section>
  );
}
