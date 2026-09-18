import { useEffect, useRef, useState } from "react";
import { videoSlots, type VideoSlot, type VideoSlotKey } from "@/data/videos";
import { usePrefersReducedMotion } from "./hooks";

interface Props {
  /** Which slot from src/data/videos.ts to render. */
  slot: VideoSlotKey;
  className?: string;
  /** Extra classes applied to both poster and video layer. */
  mediaClassName?: string;
  /** Hero-style eager poster load. */
  priority?: boolean;
  /** Rendered above the media (gradients, copy). */
  children?: React.ReactNode;
}

/**
 * Poster-first video slot.
 *
 * The poster always renders, so the layout is final whether or not the clip
 * exists yet. Once the MP4 named in src/data/videos.ts is dropped into
 * public/videos/, it attaches on scroll, plays while visible, pauses when
 * offscreen, and silently stays hidden on error, reduced motion, or a slow
 * connection.
 */
export function VideoSlot({
  slot,
  className = "",
  mediaClassName = "",
  priority,
  children,
}: Props) {
  const config: VideoSlot = videoSlots[slot];
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [attached, setAttached] = useState(Boolean(priority));
  const [playable, setPlayable] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const conn = (
      navigator as unknown as {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    if (conn?.saveData || (conn?.effectiveType && /2g/.test(conn.effectiveType))) return;

    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setAttached(true);
            const v = videoRef.current;
            if (v) void v.play().catch(() => undefined);
          } else {
            const v = videoRef.current;
            if (v) v.pause();
          }
        }
      },
      { rootMargin: "220px", threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <div
      ref={wrapRef}
      data-video-slot={config.id}
      className={`relative overflow-hidden bg-obsidian ${className}`}
    >
      {config.poster && (
        <img
          src={config.poster}
          alt={config.alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover ${mediaClassName}`}
        />
      )}
      {attached && (
        <video
          ref={videoRef}
          src={config.src}
          poster={config.poster || undefined}
          autoPlay
          muted
          loop
          playsInline
          preload={priority ? "auto" : "metadata"}
          aria-hidden="true"
          onCanPlay={() => {
            setPlayable(true);
            void videoRef.current?.play().catch(() => undefined);
          }}
          onError={() => setPlayable(false)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            playable ? "opacity-100" : "opacity-0"
          } ${mediaClassName}`}
        />
      )}
      {children}
    </div>
  );
}
