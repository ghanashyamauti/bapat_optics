import { useRef } from "react";
import { motion } from "motion/react";
import { ArrowDown } from "lucide-react";
import { whatsappUrl } from "@/data/site";
import { Magnetic } from "./Magnetic";

const word = {
  hidden: { y: "110%" },
  show: (i: number) => ({
    y: 0,
    transition: { delay: 1.5 + i * 0.1, duration: 1.1, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function Hero() {
  const ref = useRef<HTMLElement>(null);

  return (
    <section
      ref={ref}
      id="top"
      className="relative min-h-[100svh] w-full overflow-hidden bg-obsidian grain"
    >
      <div className="absolute inset-0 bg-obsidian">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(197,168,128,0.08)_0%,rgba(13,13,15,0.95)_65%,#0d0d0f_100%)]" />
      </div>
      <div className="absolute inset-0 hero-depth opacity-60" />
      <div className="absolute inset-0 hero-grid opacity-[0.13]" />

      {/* kinetic background word */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-hidden">
        <div className="marquee-track flex w-max gap-16 opacity-[0.06]">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="display whitespace-nowrap text-[22vw] text-paper">
              BAPAT OPTICS · PUNE ·
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1600px] flex-col justify-between px-5 pb-10 pt-24 sm:px-6 sm:pb-12 md:px-10 md:pb-14 md:pt-32">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 1 }}
          className="eyebrow flex items-center gap-3 text-[9px] text-steel sm:text-[10px]"
        >
          <span className="inline-block h-px w-8 bg-gold sm:w-12" />
          Pune · Since 2011 · Zeiss Partner
        </motion.p>

        <div className="pointer-events-none my-auto flex flex-col items-center py-6 text-center sm:py-8">
          <h1 className="display text-paper">
            {["SEE", "DIFFERENT."].map((w, i) => (
              <span key={w} className="reveal-line">
                <motion.span
                  custom={i}
                  variants={word}
                  initial="hidden"
                  animate="show"
                  className="block text-[15vw] leading-[0.86] mix-blend-difference sm:text-[13vw] md:text-[10vw] lg:text-[9vw]"
                >
                  {w === "DIFFERENT." ? (
                    <>
                      DIFFERENT<span className="text-gold">.</span>
                    </>
                  ) : (
                    w
                  )}
                </motion.span>
              </span>
            ))}
          </h1>
        </div>

        <div className="flex flex-col gap-6 border-t border-paper/15 pt-6 sm:gap-8 md:flex-row md:items-end md:justify-between md:pt-8">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.9 }}
            className="max-w-sm text-xs leading-relaxed text-steel sm:text-sm"
          >
            Fourteen years of eyewear in Pune. Frames selected by hand, lenses measured by
            Zeiss precision instruments, fitted in person at Kothrud and Sadashiv Peth.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.15, duration: 0.9 }}
            className="flex flex-col gap-2.5 sm:flex-row sm:gap-3"
          >
            <Magnetic>
              <a
                href="#collection"
                data-cursor="VIEW"
                className="eyebrow group relative block overflow-hidden bg-paper px-8 py-3.5 text-center text-[10px] text-obsidian sm:px-9 sm:py-4"
              >
                <span className="relative z-10">Explore Collection</span>
                <span className="absolute inset-0 -translate-x-full bg-gold transition-transform duration-500 group-hover:translate-x-0" />
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href={whatsappUrl("Hello Bapat Optics, I'd like to book an eye exam.")}
                target="_blank"
                rel="noreferrer"
                data-cursor="BOOK"
                className="eyebrow block border border-paper/30 px-8 py-3.5 text-center text-[10px] text-paper transition-colors hover:border-gold hover:text-gold sm:px-9 sm:py-4"
              >
                Book Eye Exam
              </a>
            </Magnetic>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.6 }}
          className="mt-6 flex items-center gap-2.5 text-steel sm:mt-8"
        >
          <ArrowDown size={13} className="animate-bounce" />
          <span className="eyebrow text-[9px]">Scroll to explore</span>
        </motion.div>
      </div>
    </section>
  );
}
