import techImage from "@/assets/tech.jpg";
import product2 from "@/assets/product-2.jpg";
import product5 from "@/assets/product-5.jpg";

/**
 * VIDEO SLOTS
 * ------------------------------------------------------------------
 * Every cinematic moment on the site reads its clip from this file.
 * Drop the MP4 into `public/videos/` using the exact `file` name below
 * and the section starts using it automatically — no code changes.
 *
 * Full shot briefs / AI prompts: see VIDEO-GUIDE.md at the project root.
 */
export interface VideoSlot {
  /** Stable slot key used by the components. */
  id: string;
  /** Public path the component loads. Put the file here. */
  src: string;
  /** Optional still image shown before/instead of the video. */
  poster?: string;
  /** Accessible description of the visual. */
  alt: string;
  /** Where it appears on the page. */
  section: string;
  /** One-line brief for whoever supplies the clip. */
  brief: string;
  /** Recommended length in seconds. */
  seconds: string;
  /** true = already supplied in this project. */
  ready: boolean;
}

export const videoSlots = {
  /** SLOT 2 — supplied */
  modelDesigner: {
    id: "model-designer",
    src: "/videos/model-designer.mp4",
    alt: "Model wearing designer optical glasses in a cinematic studio",
    section: "Campaign background + Motion Showcase reel 2",
    brief:
      "Model in designer optical glasses, side profile turning slowly to camera, warm champagne key light, cool rim light, one slow push-in.",
    seconds: "8–10",
    ready: true,
  },
  /** SLOT 3 — supplied */
  eyeTesting: {
    id: "eye-testing",
    src: "/videos/eye-testing.mp4",
    poster: techImage,
    alt: "Advanced eye testing and lens measurement equipment in a clinic",
    section: "EyeQ — precision technology panel",
    brief:
      "Premium optical clinic, eye-testing / lens-measurement machine sharp with patient softly blurred behind, slow lateral slide as light sweeps the glass.",
    seconds: "6–10",
    ready: true,
  },
  /** SLOT 4 — supplied */
  storeInterior: {
    id: "store-interior",
    src: "/videos/store-interior.mp4",
    poster: product5,
    alt: "Walkthrough of a luxury optical boutique interior",
    section: "Store Locator — boutique walkthrough band",
    brief:
      "Slow continuous walkthrough past polished shelves of designer frames, warm spotlights, dark marble and brass, an optician helping a customer. No cuts.",
    seconds: "8–12",
    ready: true,
  },
  /** SLOT 5 — supplied */
  productMacro: {
    id: "product-macro",
    src: "/videos/product-macro.mp4",
    poster: product2,
    alt: "Macro orbit around the hinge and temple of a premium frame",
    section: "Detail Reel — between Collection and Campaign",
    brief:
      "Ultra-macro slow orbit around one frame: hinge, temple arm, nose pads, lens reflection catching champagne highlights, dark background.",
    seconds: "6–10",
    ready: true,
  },
  /** SLOT 6 — supplied */
  customerFitting: {
    id: "customer-fitting",
    src: "/videos/customer-fitting.mp4",
    alt: "Optician adjusting designer glasses on a customer",
    section: "Book Band — booking section background",
    brief:
      "Optician's hands gently adjusting glasses at the temple, then the customer smiling into a mirror, warm professional light, slow motion.",
    seconds: "6–10",
    ready: true,
  },
  /** SLOT 7 — supplied */
  logoReveal: {
    id: "logo-reveal",
    src: "/videos/logo-reveal.mp4",
    alt: "Bapat Optics logo reveal",
    section: "Intro overlay (optional — replaces the animated wordmark)",
    brief:
      "Near-black background, wordmark fades in quietly, a single soft champagne light sweep passes across it like a lens reflection, ends on a clean still logo.",
    seconds: "3–5",
    ready: true,
  },
} satisfies Record<string, VideoSlot>;

export type VideoSlotKey = keyof typeof videoSlots;
