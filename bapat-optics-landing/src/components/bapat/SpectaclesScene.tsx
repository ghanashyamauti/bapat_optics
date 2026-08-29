import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./hooks";

/**
 * Pure CSS 3D spectacles built from layered elements.
 * Rotates in real 3D space with pointer movement, drifts on its own when idle.
 * No WebGL, no external model — architected so a future R3F model can drop in.
 */
export function SpectaclesScene() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 1650);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const loop = (time: number) => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      const drift = Math.sin(time / 2600) * 0.35;
      const bob = Math.sin(time / 2000) * 10;
      if (rigRef.current) {
        rigRef.current.style.transform = `translate3d(0, ${bob}px, 0) rotateX(${
          -cy * 14 + Math.sin(time / 3400) * 2
        }deg) rotateY(${cx * 26 + drift * 8}deg) rotateZ(${cx * -3}deg)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduced]);

  const temple =
    "absolute top-1/2 h-[6px] w-[34%] -translate-y-1/2 rounded-full bg-gradient-to-r from-gold/90 via-gold-soft/70 to-gold/20";

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center -translate-y-[7%]"
      style={{ perspective: "1200px" }}
    >
      {/* halo */}
      <div className="absolute h-[46vmin] w-[32vmin] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--gold)_28%,transparent),transparent_62%)] blur-3xl" />

      {/* orbit rings */}
      <div className="absolute h-[52vmin] w-[52vmin] animate-[bapat-spin_38s_linear_infinite] rounded-full border border-gold/20" />
      <div className="absolute h-[38vmin] w-[38vmin] animate-[bapat-spin_26s_linear_infinite_reverse] rounded-full border border-paper/10" />

      <div
        ref={rigRef}
        className="relative"
        style={{
          transformStyle: "preserve-3d",
          transition: "opacity 1.4s ease, filter 1.4s ease",
          opacity: entered ? 1 : 0,
          filter: entered ? "blur(0px)" : "blur(14px)",
        }}
      >
        <div
          className="relative flex items-center gap-[2.2vmin]"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* left temple */}
          <div
            className={`${temple} left-[-30%] origin-right rotate-y-[38deg]`}
            style={{ transform: "translateZ(-40px) rotateY(52deg)" }}
          />
          {[0, 1].map((i) => (
            <div
              key={i}
              className="relative h-[13vmin] w-[18vmin] rounded-[42%_42%_46%_46%/50%] border-[3px] border-gold/80 shadow-[0_0_60px_-10px_color-mix(in_oklab,var(--gold)_60%,transparent)]"
              style={{ transformStyle: "preserve-3d", transform: "translateZ(12px)" }}
            >
              {/* glass */}
              <div className="absolute inset-[3px] rounded-[42%_42%_46%_46%/50%] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--paper)_16%,transparent),transparent_45%,color-mix(in_oklab,var(--gold)_18%,transparent))] backdrop-blur-[2px]" />
              {/* sheen sweep */}
              <div className="absolute inset-[3px] overflow-hidden rounded-[42%_42%_46%_46%/50%]">
                <div className="absolute -inset-y-10 -left-1/2 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-paper/35 to-transparent animate-[bapat-sheen_5.5s_ease-in-out_infinite]" />
              </div>
            </div>
          ))}
          {/* bridge */}
          <div
            className="absolute left-1/2 top-[34%] h-[4px] w-[5vmin] -translate-x-1/2 rounded-full bg-gold/80"
            style={{ transform: "translate(-50%,0) translateZ(14px)" }}
          />
          {/* right temple */}
          <div
            className={`${temple} right-[-30%] origin-left`}
            style={{ transform: "translateZ(-40px) rotateY(-52deg)" }}
          />
        </div>

        {/* floor shadow */}
        <div
          className="absolute left-1/2 top-[125%] h-[3vmin] w-[32vmin] -translate-x-1/2 rounded-full bg-obsidian/70 blur-2xl"
          style={{ transform: "translateX(-50%) rotateX(78deg)" }}
        />
      </div>
    </div>
  );
}
