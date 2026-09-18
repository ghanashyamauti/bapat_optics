import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X, PhoneCall, ArrowUpRight } from "lucide-react";
import { contact, whatsappUrl } from "@/data/site";
import { Magnetic } from "./Magnetic";

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

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || open
          ? "border-b border-paper/10 bg-obsidian/85 py-3.5 shadow-2xl backdrop-blur-xl"
          : "border-b border-transparent bg-gradient-to-b from-obsidian/70 via-obsidian/25 to-transparent py-5 md:py-6"
      }`}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 sm:px-6 md:px-10">
        <a
          href="#top"
          data-cursor="TOP"
          onClick={() => setOpen(false)}
          className="group flex items-center gap-3 focus:outline-none"
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
              className="eyebrow group relative text-[10px] tracking-[0.18em] text-steel transition-colors hover:text-gold"
            >
              {l.label}
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gold transition-all duration-500 group-hover:w-full" />
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
          <Magnetic className="hidden sm:inline-block">
            <a
              href={whatsappUrl("Hello Bapat Optics, I would like to book a free Zeiss eye exam.")}
              target="_blank"
              rel="noreferrer"
              data-cursor="BOOK"
              className="eyebrow block border border-gold/70 bg-gold/10 px-5 py-2.5 text-[10px] text-gold transition-all hover:bg-gold hover:text-obsidian"
            >
              Free Eye Exam
            </a>
          </Magnetic>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-paper/15 bg-obsidian/70 text-paper backdrop-blur-md transition-colors hover:border-gold hover:text-gold md:hidden"
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 top-[64px] z-40 flex h-[calc(100svh-64px)] flex-col justify-between overflow-y-auto bg-obsidian/95 px-6 pb-10 pt-8 backdrop-blur-2xl md:hidden"
          >
            <div className="flex flex-col">
              {links.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.06 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className="group flex items-center justify-between border-b border-paper/10 py-4"
                >
                  <span className="display text-3xl text-paper transition-colors group-hover:text-gold">
                    {l.label}
                  </span>
                  <ArrowUpRight size={18} className="text-gold" />
                </motion.a>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.42 }}
              className="mt-8 flex flex-col gap-2.5"
            >
              <a
                href={`tel:${contact.phoneRaw}`}
                className="eyebrow flex items-center justify-center gap-2 border border-paper/20 py-3.5 text-[10px] text-steel"
              >
                <PhoneCall size={13} className="text-gold" /> Call {contact.phone}
              </a>
              <a
                href={whatsappUrl("Hello Bapat Optics, I would like to book a free Zeiss eye exam.")}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="eyebrow bg-gold py-3.5 text-center text-[10px] font-semibold text-obsidian"
              >
                Book Free Eye Exam
              </a>
              <p className="eyebrow mt-1 text-center text-[8px] tracking-[0.22em] text-steel/70">
                Kothrud · Sadashiv Peth · Pune
              </p>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
