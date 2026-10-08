import { useEffect, useState } from "react";
import { MessageCircle, PhoneCall } from "lucide-react";
import { contact, whatsappUrl } from "@/data/site";

/**
 * Phone-only sticky action bar. Appears after the hero so a visitor is never
 * more than one tap from booking an eye exam or calling a store.
 */
export function MobileBookBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const update = () => {
      const hero = document.getElementById("top");
      if (hero) {
        const rect = hero.getBoundingClientRect();
        // The hero container is 360vh tall. rect.bottom is <= window.innerHeight * 0.1 only after hero completes and next section is active
        setShow(rect.bottom <= window.innerHeight * 0.1);
      } else {
        setShow(window.scrollY > window.innerHeight * 3.5);
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-paper/10 bg-obsidian/92 px-4 py-3 backdrop-blur-xl transition-all duration-500 md:hidden ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <a
          href={`tel:${contact.phoneRaw}`}
          className="eyebrow flex flex-1 items-center justify-center gap-2 border border-paper/20 py-3 text-[10px] text-paper"
        >
          <PhoneCall size={13} className="text-gold" /> Call
        </a>
        <a
          href={whatsappUrl("Hello Bapat Optics, I would like to book a free eye exam.")}
          target="_blank"
          rel="noreferrer"
          className="eyebrow flex flex-[1.6] items-center justify-center gap-2 bg-gold py-3 text-[10px] font-semibold text-obsidian"
        >
          <MessageCircle size={13} /> Book Free Eye Exam
        </a>
      </div>
    </div>
  );
}
