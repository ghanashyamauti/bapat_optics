import { motion } from "motion/react";
import { Aperture, Ruler, Wrench } from "lucide-react";
import { VideoSlot } from "./VideoSlot";

const notes = [
  {
    icon: Aperture,
    title: "Hinge tension",
    body: "Every hinge is opened, closed and re-tensioned by hand so the temples hold the frame without pinching.",
  },
  {
    icon: Ruler,
    title: "Bridge and pads",
    body: "Nose pads and bridge width are shaped to your face so the lens centre sits where the measurement placed it.",
  },
  {
    icon: Wrench,
    title: "Lifetime tuning",
    body: "Walk in any time for realignment, pad replacement and ultrasonic cleaning — always free at both stores.",
  },
];

/** Macro detail moment. Uses video slot 5 (product-macro). */
export function DetailReel() {
  return (
    <section id="detail" className="relative bg-obsidian py-12 text-paper grain sm:py-18 md:py-24">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-10">
        <div className="grid gap-px bg-paper/10 lg:grid-cols-12">
          <div className="relative bg-obsidian lg:col-span-7">
            <VideoSlot slot="productMacro" className="aspect-[4/3] w-full sm:aspect-[16/10]">
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/75 to-obsidian/15" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2.5 p-5 sm:gap-3 sm:p-7 md:p-8">
                <p className="eyebrow flex items-center gap-3 text-[9px] text-gold sm:text-[10px]">
                  <span className="inline-block h-px w-8 bg-gold sm:w-12" />
                  Millimetre Detail
                </p>
                <h2 className="display max-w-2xl text-[9vw] leading-[1.05] text-paper sm:text-5xl md:text-6xl">
                  The parts nobody photographs.
                </h2>
              </div>
            </VideoSlot>
          </div>

          <div className="flex flex-col justify-between gap-px bg-paper/10 lg:col-span-5">
            {notes.map((note, i) => (
              <motion.div
                key={note.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: i * 0.08 }}
                className="group flex flex-1 flex-col justify-center bg-obsidian p-5 sm:p-7 md:p-8"
              >
                <note.icon
                  size={20}
                  className="text-gold transition-transform duration-500 group-hover:-translate-y-1"
                />
                <h3 className="display mt-3 text-2xl text-paper sm:text-3xl">{note.title}</h3>
                <p className="mt-2 max-w-md text-xs leading-relaxed text-steel sm:text-sm">
                  {note.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
