import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./hooks";

interface Props {
  src: string;
  poster: string;
  alt: string;
  className?: string;
  /** Marks the poster as the LCP candidate (hero only). */
  priority?: boolean;
}

/**
 * Poster-first cinematic panel.
 * The poster image always renders. The video is only attached once the panel
 * enters the viewport, plays/pauses with visibility, and silently falls back
 * to the poster on error, on slow connections, or with reduced motion.
 */
export function CinematicVideo({ src, poster, alt, className = "", priority }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [attached, setAttached] = useState(false);
  const [playable, setPlayable] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const conn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } })
      .connection;
    if (conn?.saveData || (conn?.effectiveType && /2g/.test(conn.effectiveType))) return;

    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setAttached(true);
          const v = videoRef.current;
          if (!v) continue;
          if (entry.isIntersecting) void v.play().catch(() => undefined);
          else v.pause();
        }
      },
      { rootMargin: "200px", threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <div ref={wrapRef} className={`relative overflow-hidden bg-obsidian ${className}`}>
      <img
        src={poster}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {attached && (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          onCanPlay={() => setPlayable(true)}
          onError={() => setPlayable(false)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            playable ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
