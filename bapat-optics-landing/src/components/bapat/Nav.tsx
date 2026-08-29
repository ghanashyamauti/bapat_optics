import { useEffect, useState } from "react";
import { Menu, X, PhoneCall } from "lucide-react";
import { contact, whatsappUrl } from "@/data/site";

const links = [
  { label: "Craftsmanship", href: "#crafted" },
  { label: "Collection", href: "#collection" },
  { label: "Campaign", href: "#campaign" },
  { label: "Zeiss EyeQ", href: "#eyeq" },
  { label: "Stores", href: "#stores" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-paper/10 bg-obsidian/85 py-3.5 backdrop-blur-xl shadow-2xl"
          : "border-b border-transparent py-6"
      }`}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 md:px-10">
        <a
          href="#top"
          data-cursor="TOP"
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 bg-obsidian/80 p-1.5 transition-colors group-hover:border-gold">
            <img
              src="/bapat-logo.png"
              alt="Bapat Optics Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="display text-xl leading-none text-paper md:text-2xl">
              Bapat<span className="text-gold">.</span>
            </span>
            <span className="eyebrow text-[8px] tracking-[0.24em] text-steel">OPTICS · PUNE</span>
          </div>
        </a>

        <nav className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="eyebrow text-[10px] tracking-[0.18em] text-steel transition-colors hover:text-gold"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${contact.phoneRaw}`}
            className="eyebrow hidden items-center gap-1.5 border border-paper/20 px-4 py-2.5 text-[9px] text-steel transition-colors hover:border-gold hover:text-paper lg:inline-flex"
          >
            <PhoneCall size={12} className="text-gold" />
            <span>{contact.phone}</span>
          </a>
          <a
            href={whatsappUrl("Hello Bapat Optics, I would like to book a free Zeiss eye exam.")}
            target="_blank"
            rel="noreferrer"
            data-cursor="BOOK"
            className="eyebrow hidden border border-gold/70 bg-gold/10 px-5 py-2.5 text-[10px] text-gold transition-all hover:bg-gold hover:text-obsidian sm:inline-block"
          >
            Free Eye Exam
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            className="p-1 text-paper md:hidden"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="mt-3 flex flex-col gap-1 border-t border-paper/10 bg-obsidian/95 px-6 py-6 backdrop-blur-xl md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="display py-2 text-3xl text-paper hover:text-gold"
            >
              {l.label}
            </a>
          ))}
          <div className="mt-4 flex flex-col gap-2 border-t border-paper/10 pt-4">
            <a
              href={`tel:${contact.phoneRaw}`}
              className="eyebrow flex items-center justify-center gap-2 border border-paper/20 py-3 text-[10px] text-steel"
            >
              <PhoneCall size={13} className="text-gold" /> Call: {contact.phone}
            </a>
            <a
              href={whatsappUrl("Hello Bapat Optics, I would like to book a free Zeiss eye exam.")}
              target="_blank"
              rel="noreferrer"
              className="eyebrow bg-gold py-3 text-center text-[10px] font-semibold text-obsidian"
            >
              Book Free Eye Exam
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
