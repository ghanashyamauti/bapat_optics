import { motion } from "motion/react";
import { ScanFace, Ruler, Sparkles, Glasses } from "lucide-react";
import { VideoSlot } from "./VideoSlot";

const steps = [
  {
    icon: ScanFace,
    title: "Measure",
    body: "Zeiss Visufit 1000 captures a 3D representation of the face to take fitting measurements — Bapat Optics hosted its launch in Pune.",
  },
  {
    icon: Ruler,
    title: "Analyse",
    body: "Zeiss i.Profiler digital instruments record the detailed optical measurements a prescription is built on.",
  },
  {
    icon: Sparkles,
    title: "Personalise",
    body: "Lens geometry is matched to the chosen frame, the wearing position and how you actually use your eyes.",
  },
  {
    icon: Glasses,
    title: "Fit",
    body: "Final adjustment happens in store, by hand, until the frame sits where the measurements assumed it would.",
  },
];

export function EyeQ() {
  return (
    <section id="eyeq" className="bg-paper py-16 sm:py-20 md:py-24">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-10">
        {/* Header & Tech Image Section */}
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12 items-center mb-10 sm:mb-12">
          <div className="lg:col-span-6 space-y-4">
            <p className="eyebrow flex items-center gap-3 text-[9px] text-muted-foreground sm:text-[10px]">
              <span className="inline-block h-px w-8 bg-gold sm:w-12" />
              EyeQ · Precision technology
            </p>
            <h2 className="display text-[9vw] text-obsidian sm:text-[6vw] md:text-[3.6vw] leading-tight">
              Fitting, measured to the millimetre.
            </h2>
            <p className="max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
              As a Zeiss partner, Bapat Optics works with digital measurement and fitting
              technology rather than guesswork. Certified optometrists perform comprehensive digital refraction with zero guesswork.
            </p>
            <span className="eyebrow inline-block max-w-full rounded border border-gold/50 bg-gold/10 px-3 py-1.5 text-[8.5px] leading-relaxed text-gold sm:px-3.5 sm:py-2 sm:text-[9px]">
              Zeiss Visufit 1000 · Launched in Pune at Bapat Optics · Free Checkups
            </span>
          </div>

          <div className="lg:col-span-6">
            {/* VIDEO SLOT 3 — eye-testing.mp4 (see VIDEO-GUIDE.md) */}
            <VideoSlot
              slot="eyeTesting"
              className="h-[300px] w-full rounded-2xl border border-obsidian/10 shadow-xs sm:h-[340px]"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-transparent" />
              <p className="eyebrow absolute bottom-4 left-4 text-[9px] text-paper sm:bottom-5 sm:left-5">
                Zeiss digital measurement suite
              </p>
            </VideoSlot>
          </div>
        </div>

        {/* 4 Steps in a Single Horizontal Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-obsidian/10 rounded-2xl overflow-hidden border border-obsidian/10 shadow-xs">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="group bg-paper p-6 sm:p-7 md:p-8 transition-all duration-300 hover:bg-obsidian flex flex-col justify-between"
            >
              <div>
                <s.icon
                  size={22}
                  className="text-gold transition-transform duration-500 group-hover:-translate-y-1"
                />
                <h3 className="display mt-4 text-xl sm:text-2xl text-obsidian transition-colors group-hover:text-paper">
                  {s.title}
                </h3>
                <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground transition-colors group-hover:text-steel">
                  {s.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
