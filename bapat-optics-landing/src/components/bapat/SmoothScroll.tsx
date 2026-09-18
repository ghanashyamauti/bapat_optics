import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { usePrefersReducedMotion } from "./hooks";

const LenisContext = createContext<Lenis | null>(null);

/**
 * Hook to access the active Lenis instance for programmatic scrolling or listening.
 */
export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    // Respect user's reduced motion preference (native instant scroll)
    if (reduced || typeof window === "undefined") return;

    let cancelled = false;
    let tickerHandler: ((time: number) => void) | null = null;
    let gsapInstance: any = null;

    // 1. Initialize Lenis with luxury inertia settings
    const instance = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential easeOut
      smoothWheel: true,
      touchMultiplier: 1.5,
      wheelMultiplier: 1.0,
      autoRaf: false, // Driven by GSAP ticker for unified 120fps sync
    });

    if (cancelled) {
      instance.destroy();
      return;
    }

    setLenis(instance);

    // 2. Connect Lenis with GSAP ScrollTrigger & unified ticker
    void Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]).then(([{ default: gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsapInstance = gsap;
      gsap.registerPlugin(ScrollTrigger);

      // Notify ScrollTrigger whenever Lenis scrolls
      instance.on("scroll", ScrollTrigger.update);

      // Drive Lenis RAF from GSAP's high-precision ticker
      tickerHandler = (time: number) => {
        instance.raf(time * 1000);
      };
      gsap.ticker.add(tickerHandler);
      gsap.ticker.lagSmoothing(0);
    });

    // 3. Smooth anchor-link scrolling for internal hash links (#crafted, #collection, etc.)
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[href*='#']");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href || href === "#" || href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:")) {
        return;
      }

      const hashIndex = href.indexOf("#");
      if (hashIndex === -1) return;

      const hash = href.slice(hashIndex);
      const targetEl = document.querySelector<HTMLElement>(hash);
      if (targetEl) {
        e.preventDefault();
        instance.scrollTo(targetEl, {
          offset: -20,
          duration: 1.2,
        });
        if (window.history.pushState) {
          window.history.pushState(null, "", hash);
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);

    // Fallback RAF if GSAP has not loaded yet
    let fallbackRafId = 0;
    const fallbackLoop = (time: number) => {
      if (!tickerHandler) {
        instance.raf(time);
      }
      fallbackRafId = requestAnimationFrame(fallbackLoop);
    };
    fallbackRafId = requestAnimationFrame(fallbackLoop);

    return () => {
      cancelled = true;
      cancelAnimationFrame(fallbackRafId);
      document.removeEventListener("click", handleAnchorClick);

      if (gsapInstance && tickerHandler) {
        gsapInstance.ticker.remove(tickerHandler);
      }

      instance.destroy();
      setLenis(null);
    };
  }, [reduced]);

  return (
    <LenisContext.Provider value={lenis}>
      {children}
    </LenisContext.Provider>
  );
}
