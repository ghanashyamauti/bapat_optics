import { useEffect, useRef, useState } from "react";
import { useIsFinePointer } from "./hooks";

/** Desktop-only dot cursor that expands with a contextual label. */
export function CustomCursor() {
  const fine = useIsFinePointer();
  const dotRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!fine) return;
    let raf = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let cx = x;
    let cy = y;

    const move = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      setVisible(true);
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor]");
      setLabel(target?.dataset["cursor"] ?? null);
    };
    const leave = () => setVisible(false);

    const loop = () => {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("mousemove", move);
    document.addEventListener("mouseleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
    };
  }, [fine]);

  if (!fine) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden lg:block"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 300ms" }}
    >
      <div
        className={`flex items-center justify-center rounded-full border border-gold/70 bg-gold/10 backdrop-blur-[2px] transition-all duration-300 ${label ? "h-20 w-20" : "h-2.5 w-2.5 bg-gold"
          }`}
      >
        <span
          className={`eyebrow text-[9px] text-gold transition-opacity duration-200 ${label ? "opacity-100" : "opacity-0"
            }`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
