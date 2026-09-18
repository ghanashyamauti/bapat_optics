import { useEffect, useRef, useState } from "react";
import { Sparkles, ArrowUpRight, Volume2, VolumeX, Shield, Eye } from "lucide-react";
import { media, whatsappUrl } from "@/data/site";
import { usePrefersReducedMotion } from "./hooks";
import { Magnetic } from "./Magnetic";

export function Campaign() {
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = Array.from(el.querySelectorAll<HTMLElement>("[data-word]"));
    if (reduced) {
      words.forEach((w) => (w.style.transform = "translateY(0)"));
      return;
    }
    let cancelled = false;
    let ctx: { revert: () => void } | undefined;
    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.to(words, {
          y: 0,
          duration: 1.2,
          ease: "power4.out",
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: "top 60%" },
        });
      }, el);
    })();
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduced]);

  // Video Intersection Observer for smooth autoplay
  useEffect(() => {
    const video = videoRef.current;
    const el = ref.current;
    if (!video || !el || reduced) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            void video.play().catch(() => undefined);
            setIsPlaying(true);
          } else {
            video.pause();
            setIsPlaying(false);
          }
        }
      },
      { threshold: 0.25 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  return (
    <section
      id="campaign"
      ref={ref}
      className="relative min-h-[90svh] w-full overflow-hidden bg-obsidian py-14 sm:py-18 md:py-24"
    >
      {/* Background High Definition Lifestyle Video */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          src={media.modelDesigner}
          muted={muted}
          loop
          playsInline
          preload="auto"
          className="h-full w-full object-cover opacity-90 transition-opacity duration-1000"
        />
        {/* Layered cinematic grading and contrast masks */}
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/95 via-obsidian/45 to-obsidian/85" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-obsidian/60" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[80svh] max-w-[1600px] flex-col justify-between px-5 sm:px-6 md:px-10">
        {/* Top Header Badge & Audio Control */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="inline-block h-px w-8 bg-gold sm:w-10" />
            <p className="eyebrow text-[9px] tracking-[0.18em] text-gold sm:text-[10px] sm:tracking-[0.24em]">
              Editorial Showcase · Haute Optique
            </p>
          </div>

          <button
            onClick={toggleSound}
            aria-label={muted ? "Unmute campaign audio" : "Mute campaign audio"}
            className="flex items-center gap-1.5 rounded-full border border-paper/20 bg-obsidian/75 px-3 py-1.5 text-[9px] uppercase tracking-wider text-paper backdrop-blur-md transition-all hover:border-gold hover:text-gold sm:gap-2 sm:px-4 sm:py-2"
          >
            {muted ? <VolumeX size={12} /> : <Volume2 size={12} className="text-gold" />}
            <span className="hidden sm:inline">{muted ? "Sound Off" : "Sound On"}</span>
          </button>
        </div>

        {/* Center Typography */}
        <div className="my-auto max-w-3xl py-6 sm:py-8 md:py-10">
          <h2 className="display text-paper">
            {["Wear it", "like it was", "measured", "for you."].map((w) => (
              <span key={w} className="reveal-line block overflow-hidden">
                <span
                  data-word
                  className="block translate-y-[110%] text-[11vw] leading-[0.88] will-change-transform sm:text-[9vw] md:text-[6vw]"
                >
                  {w === "for you." ? (
                    <>
                      for you<span className="text-gold">.</span>
                    </>
                  ) : (
                    w
                  )}
                </span>
              </span>
            ))}
          </h2>
          <p className="mt-4 max-w-lg text-xs leading-relaxed text-steel sm:mt-6 sm:text-sm md:text-base">
            Every face is unique. Our master opticians hand-select international designer silhouettes from
            Armani Exchange, Versace, Burberry, and Oakley, measuring each temple angle to sit effortlessly without pressure.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8 sm:gap-4">
            <Magnetic>
              <a
                href={whatsappUrl("Hello Bapat Optics, I want to try the designer frames featured in your campaign.")}
                target="_blank"
                rel="noreferrer"
                data-cursor="BOOK"
                className="eyebrow inline-flex items-center gap-2 bg-gold px-6 py-3.5 text-[10px] font-semibold text-obsidian transition-all hover:bg-gold-soft sm:px-8 sm:py-4"
              >
                Book In-Store Styling <ArrowUpRight size={13} />
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="#stores"
                className="eyebrow inline-flex items-center gap-2 border border-paper/30 bg-obsidian/60 px-6 py-3.5 text-[10px] text-paper backdrop-blur-md transition-colors hover:border-gold hover:text-gold sm:px-8 sm:py-4"
              >
                Visit Pune Stores
              </a>
            </Magnetic>
          </div>
        </div>

        {/* Bottom Floating Value Badges */}
        <div className="grid gap-3 border-t border-paper/15 pt-5 sm:grid-cols-3 sm:gap-4 sm:pt-6">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold sm:h-9 sm:w-9">
              <Sparkles size={14} />
            </div>
            <div>
              <p className="eyebrow text-[9px] text-paper sm:text-[10px]">Curated Luxury Edit</p>
              <p className="text-[10px] text-steel sm:text-[11px]">Authentic international designer brands</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold sm:h-9 sm:w-9">
              <Eye size={14} />
            </div>
            <div>
              <p className="eyebrow text-[9px] text-paper sm:text-[10px]">100% Free Eye Test</p>
              <p className="text-[10px] text-steel sm:text-[11px]">Digital Zeiss refraction at both stores</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold sm:h-9 sm:w-9">
              <Shield size={14} />
            </div>
            <div>
              <p className="eyebrow text-[9px] text-paper sm:text-[10px]">Free Lifetime Service</p>
              <p className="text-[10px] text-steel sm:text-[11px]">In-house repair & servicing guarantee</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
