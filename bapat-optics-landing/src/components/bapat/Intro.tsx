import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { usePrefersReducedMotion } from "./hooks";
import { VideoSlot } from "./VideoSlot";

/** ~1.5s logotype assembly. Click or press any key to skip. */
export function Intro() {
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (reduced) {
      setOpen(false);
      return;
    }
    const t = setTimeout(() => setOpen(false), 1600);
    const skip = () => setOpen(false);
    window.addEventListener("keydown", skip);
    window.addEventListener("wheel", skip, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("wheel", skip);
    };
  }, [reduced]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="intro"
          onClick={() => setOpen(false)}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[200] flex cursor-pointer flex-col items-center justify-center bg-obsidian"
        >
          {/* VIDEO SLOT 7 — logo-reveal.mp4 */}
          <VideoSlot
            slot="logoReveal"
            priority
            className="pointer-events-none absolute inset-0"
            mediaClassName="opacity-35"
          >
            <div className="absolute inset-0 bg-obsidian/50" />
          </VideoSlot>

          <div className="relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-obsidian p-2 shadow-2xl shadow-gold/20"
          >
            <img src="/bapat-logo.png" alt="Bapat Optics" className="h-full w-full object-contain" />
          </motion.div>

          <div className="overflow-hidden">
            <motion.div
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="display text-[16vw] text-paper sm:text-[8.5vw]"
            >
              BAPAT<span className="text-gold">.</span>
            </motion.div>
          </div>

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="eyebrow mt-2 text-[10px] tracking-[0.3em] text-steel"
          >
            OPTICS · PUNE · SINCE 2011
          </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
