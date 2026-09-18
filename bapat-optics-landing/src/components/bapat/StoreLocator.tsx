import { motion } from "motion/react";
import { MapPin, Phone, Clock, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { contact, stores, whatsappUrl } from "@/data/site";
import { VideoSlot } from "./VideoSlot";

export function StoreLocator() {
  return (
    <section
      id="stores"
      className="w-full max-w-full overflow-hidden bg-obsidian py-16 text-paper grain sm:py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-10">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-t border-paper/10 pt-6 sm:mb-12 sm:pt-8 md:mb-14">
          <div>
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="inline-block h-px w-8 bg-gold sm:w-10" />
              <p className="eyebrow text-[9px] tracking-[0.18em] text-gold sm:text-[10px] sm:tracking-[0.2em]">
                Visit Us In Pune
              </p>
            </div>
            <h2 className="display mt-1.5 text-[10vw] leading-[1.05] text-paper sm:text-[7vw] md:text-[5vw]">
              Two doors in Pune
            </h2>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-steel">
            Walk into our Kothrud or Sadashiv Peth store for a complimentary digital eye exam, custom frame fitting, and professional lens consultation.
          </p>
        </div>

        {/* VIDEO SLOT 4 — store-interior.mp4 (see VIDEO-GUIDE.md) */}
        <VideoSlot
          slot="storeInterior"
          className="mb-8 aspect-[4/3] w-full rounded-lg border border-paper/10 sm:mb-10 sm:aspect-[21/9] md:mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 md:p-8">
            <p className="eyebrow text-[9px] text-gold sm:text-[10px]">Inside the store</p>
            <p className="display mt-2 max-w-xl text-[8vw] leading-[1.08] text-paper sm:text-3xl md:text-4xl">
              Shelves you can walk along, frames you can actually wear.
            </p>
          </div>
        </VideoSlot>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
          {stores.map((s, i) => (
            <motion.article
              key={s.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="flex flex-col overflow-hidden rounded-lg border border-paper/12 bg-charcoal/60 transition-colors hover:border-gold/40"
            >
              <iframe
                title={`Map of Bapat Optics ${s.name}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-48 w-full grayscale-[0.9] contrast-125 brightness-[0.55] transition-all duration-700 hover:grayscale-0 hover:brightness-100 sm:h-56 md:h-64"
                src={`https://www.google.com/maps?q=${encodeURIComponent(s.embedQuery)}&output=embed`}
              />
              <div className="flex flex-1 flex-col justify-between p-6 sm:p-7 md:p-8">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="display text-2xl text-paper sm:text-3xl md:text-4xl">{s.name}</h3>
                    <span className="eyebrow rounded border border-gold/40 bg-gold/10 px-2 py-0.5 text-[9px] text-gold">
                      Zeiss Certified
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-steel">{s.branchTitle}</p>

                  <div className="my-4 h-px w-full bg-paper/10 sm:my-5" />

                  <ul className="space-y-3 text-xs leading-relaxed text-steel">
                    <li className="flex gap-2.5 sm:gap-3">
                      <MapPin size={15} className="mt-0.5 shrink-0 text-gold" />
                      <div>
                        <p className="font-medium text-paper">{s.address}</p>
                        <p className="mt-0.5 text-[11px] text-steel">Landmark: {s.landmark}</p>
                      </div>
                    </li>
                    <li className="flex items-center gap-2.5 sm:gap-3">
                      <Phone size={14} className="shrink-0 text-gold" />
                      <a
                        href={`tel:${contact.phoneRaw}`}
                        className="font-medium text-paper transition-colors hover:text-gold"
                      >
                        {s.phone}
                      </a>
                    </li>
                    <li className="flex items-center gap-2.5 sm:gap-3">
                      <Clock size={14} className="shrink-0 text-gold" />
                      <span className="text-paper">{s.hours}</span>
                    </li>
                  </ul>

                  <div className="mt-4 flex items-center gap-1.5 text-[11px] text-success sm:mt-5">
                    <CheckCircle2 size={13} className="shrink-0" />
                    <span>Free Walk-in Eye Exams & Frame Adjustments Available</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2.5 sm:mt-8 sm:gap-3">
                  <a
                    href={s.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor="OPEN"
                    className="eyebrow inline-flex items-center gap-1.5 bg-gold px-5 py-3 text-[10px] font-semibold text-obsidian transition-colors hover:bg-gold-soft"
                  >
                    Get Directions <ArrowUpRight size={12} />
                  </a>
                  <a
                    href={whatsappUrl(`Hello Bapat Optics (${s.name}), I'd like to book an appointment or check frame availability.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="eyebrow inline-flex items-center gap-1.5 border border-paper/25 px-5 py-3 text-[10px] text-paper transition-colors hover:border-gold hover:text-gold"
                  >
                    WhatsApp Branch
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
