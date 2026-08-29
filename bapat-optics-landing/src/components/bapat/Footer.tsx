import { categories, contact, stores, whatsappUrl } from "@/data/site";
import { MapPin, Phone, Mail, Clock, ShieldCheck, Sparkles } from "lucide-react";

const quickLinks = [
  { label: "Craftsmanship Video", href: "#crafted" },
  { label: "Designer Collection", href: "#collection" },
  { label: "Campaign Showcase", href: "#campaign" },
  { label: "The House View", href: "#manifesto" },
  { label: "Zeiss EyeQ Technology", href: "#eyeq" },
  { label: "Store Locations", href: "#stores" },
];

export function Footer() {
  return (
    <footer className="w-full max-w-full overflow-hidden border-t border-paper/10 bg-obsidian pb-10 pt-14 sm:pb-12 sm:pt-16 md:pt-20">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-10">
        {/* Brand Top Bar */}
        <div className="grid gap-10 md:grid-cols-12 md:items-start pb-12 sm:pb-14 border-b border-paper/10">
          <div className="md:col-span-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-gold/40 bg-obsidian p-2 shadow-lg shadow-gold/10">
                <img
                  src="/bapat-logo.png"
                  alt="Bapat Optics"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <p className="display text-2xl sm:text-3xl text-paper">
                  Bapat<span className="text-gold">.</span>
                </p>
                <p className="eyebrow text-[9px] tracking-[0.24em] text-steel">OPTICS · PUNE</p>
              </div>
            </div>
            <p className="mt-4 max-w-[34ch] text-xs leading-relaxed text-steel">
              Elevating optical precision in Pune for {contact.yearsLabel}. Certified Zeiss Partner offering bespoke frame fitting, computerized refraction, and lifetime in-house servicing.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="eyebrow inline-flex items-center gap-1.5 rounded border border-gold/30 bg-gold/5 px-2.5 py-1 text-[9px] text-gold">
                <Sparkles size={11} /> 100% Free Eye Checkup
              </span>
              <span className="eyebrow inline-flex items-center gap-1.5 rounded border border-paper/20 bg-paper/5 px-2.5 py-1 text-[9px] text-steel">
                <ShieldCheck size={11} /> Lifetime Free Service
              </span>
            </div>
          </div>

          <div className="md:col-span-2">
            <p className="eyebrow mb-4 text-[9px] text-gold">Navigation</p>
            <ul className="space-y-2.5 text-xs text-steel">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="transition-colors hover:text-gold">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="eyebrow mb-4 text-[9px] text-gold">Offerings</p>
            <ul className="space-y-2.5 text-xs text-steel">
              {categories.map((c) => (
                <li key={c} className="hover:text-paper transition-colors cursor-default">
                  {c}
                </li>
              ))}
              <li className="text-gold font-medium">Zeiss Digital Centration</li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <p className="eyebrow mb-4 text-[9px] text-gold">Stores & Contact</p>
            <div className="space-y-4 text-xs text-steel">
              <div className="flex items-center gap-2.5">
                <Phone size={14} className="shrink-0 text-gold" />
                <a href={`tel:${contact.phoneRaw}`} className="hover:text-paper transition-colors font-medium text-paper">
                  {contact.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={14} className="shrink-0 text-gold" />
                <a href={`mailto:${contact.email}`} className="hover:text-paper transition-colors">
                  {contact.email}
                </a>
              </div>

              {stores.map((s) => (
                <div key={s.id} className="rounded-lg border border-paper/10 bg-paper/5 p-3 sm:p-3.5">
                  <div className="flex items-center justify-between text-paper font-medium">
                    <span>{s.branchTitle}</span>
                    <a
                      href={s.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="eyebrow text-[9px] text-gold hover:underline"
                    >
                      Map ↗
                    </a>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-steel">{s.address}</p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[10px] text-steel/80">
                    <Clock size={11} className="text-gold" /> {s.hours}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="mt-6 flex flex-col gap-3 text-[10px] text-steel sm:mt-8 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Bapat Optics, Pune. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a
              href={whatsappUrl("Hello Bapat Optics, I would like to make an enquiry.")}
              target="_blank"
              rel="noreferrer"
              className="text-gold hover:underline"
            >
              WhatsApp Support
            </a>
            <a
              href={contact.officialWebsite}
              target="_blank"
              rel="noreferrer"
              className="text-steel hover:text-paper"
            >
              Original: bapatoptics.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
