import { motion } from "motion/react";
import { MapPin, Phone, Clock, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { contact, stores, whatsappUrl } from "@/data/site";

export function StoreLocator() {
  return (
    <section id="stores" className="bg-bone py-16 sm:py-20 md:py-28">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-10">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-t border-obsidian/15 pt-6 sm:mb-12 sm:pt-8 md:mb-14">
          <div>
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="inline-block h-px w-8 bg-gold sm:w-10" />
              <p className="eyebrow text-[9px] tracking-[0.18em] text-gold sm:text-[10px] sm:tracking-[0.2em]">Visit Us In Pune</p>
            </div>
            <h2 className="display mt-1.5 text-[10vw] text-obsidian sm:text-[7vw] md:text-[5vw]">Two doors in Pune</h2>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
            Walk into our Kothrud or Sadashiv Peth store for a complimentary digital eye exam, custom frame fitting, and professional lens consultation.
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
          {stores.map((s, i) => (
            <motion.article
              key={s.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="flex flex-col rounded-lg border border-obsidian/10 bg-paper shadow-sm overflow-hidden"
            >
              <iframe
                title={`Map of Bapat Optics ${s.name}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-48 w-full grayscale contrast-125 transition-all hover:grayscale-0 sm:h-56 md:h-64"
                src={`https://www.google.com/maps?q=${encodeURIComponent(s.embedQuery)}&output=embed`}
              />
              <div className="flex flex-1 flex-col justify-between p-6 sm:p-7 md:p-8">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="display text-2xl sm:text-3xl md:text-4xl text-obsidian">{s.name}</h3>
                    <span className="eyebrow rounded border border-gold/40 bg-gold/10 px-2 py-0.5 text-[9px] text-gold">
                      Zeiss Certified
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground font-medium">{s.branchTitle}</p>
                  
                  <div className="hairline my-4 sm:my-5" />

                  <ul className="space-y-3 text-xs leading-relaxed text-muted-foreground">
                    <li className="flex gap-2.5 sm:gap-3">
                      <MapPin size={15} className="mt-0.5 shrink-0 text-gold" />
                      <div>
                        <p className="text-obsidian font-medium">{s.address}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Landmark: {s.landmark}</p>
                      </div>
                    </li>
                    <li className="flex gap-2.5 sm:gap-3 items-center">
                      <Phone size={14} className="shrink-0 text-gold" />
                      <a href={`tel:${contact.phoneRaw}`} className="text-obsidian font-medium hover:text-gold transition-colors">
                        {s.phone}
                      </a>
                    </li>
                    <li className="flex gap-2.5 sm:gap-3 items-center">
                      <Clock size={14} className="shrink-0 text-gold" />
                      <span className="text-obsidian">{s.hours}</span>
                    </li>
                  </ul>

                  <div className="mt-4 flex items-center gap-1.5 text-[11px] text-emerald-700 sm:mt-5">
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
                    className="eyebrow inline-flex items-center gap-1.5 bg-obsidian px-5 py-3 text-[10px] text-paper transition-colors hover:bg-gold hover:text-obsidian"
                  >
                    Get Directions <ArrowUpRight size={12} />
                  </a>
                  <a
                    href={whatsappUrl(`Hello Bapat Optics (${s.name}), I'd like to book an appointment or check frame availability.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="eyebrow inline-flex items-center gap-1.5 border border-obsidian/30 px-5 py-3 text-[10px] text-obsidian transition-colors hover:border-gold hover:text-gold"
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
