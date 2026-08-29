import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { contact, stores, whatsappUrl } from "@/data/site";

export function BookBand() {
  const [storeId, setStoreId] = useState(stores[0]?.id ?? "");
  const store = stores.find((s) => s.id === storeId) ?? stores[0];

  return (
    <section className="bg-obsidian py-14 grain sm:py-18 md:py-24">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-10">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow mb-4 flex items-center gap-2.5 text-[9px] text-gold sm:mb-6 sm:text-[10px]">
              <span className="inline-block h-px w-8 bg-gold sm:w-10" />
              Book a Free Eye Exam
            </p>
            <h2 className="display text-[9vw] text-paper sm:text-[7vw] md:text-[5vw]">
              Come in. We&apos;ll take the measurements.
            </h2>
          </div>

          <div className="lg:col-span-5">
            <label className="eyebrow mb-2 block text-[9px] text-steel" htmlFor="store-select">
              Choose a store location
            </label>
            <select
              id="store-select"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="w-full appearance-none rounded border border-paper/20 bg-transparent px-4 py-3 text-sm text-paper outline-none focus:border-gold"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id} className="bg-obsidian text-paper">
                  Bapat Optics — {s.name} ({s.branchTitle})
                </option>
              ))}
            </select>

            <div className="mt-3.5 flex flex-col gap-2.5 sm:flex-row">
              <a
                href={whatsappUrl(
                  `Hello Bapat Optics, I'd like to book an eye exam at your ${store?.name ?? ""} store.`,
                )}
                target="_blank"
                rel="noreferrer"
                data-cursor="BOOK"
                className="eyebrow inline-flex flex-1 items-center justify-center gap-2 rounded bg-gold px-6 py-3.5 text-[10px] font-semibold text-obsidian transition-opacity hover:opacity-90"
              >
                Book on WhatsApp <ArrowUpRight size={12} />
              </a>
              <a
                href={`mailto:${contact.email}?subject=${encodeURIComponent(
                  `Eye exam booking — ${store?.name ?? ""}`,
                )}`}
                className="eyebrow inline-flex flex-1 items-center justify-center rounded border border-paper/25 px-6 py-3.5 text-[10px] text-paper transition-colors hover:border-gold hover:text-gold"
              >
                Email us
              </a>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-steel">
              Our store optometrist team will confirm your preferred timing and prepare the testing suite.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
