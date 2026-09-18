# Bapat Optics — Video Slots Guide

Everything on the site is finished except the video clips.
Each cinematic moment already has a reserved slot that shows a still image
until its clip is added. Nothing breaks while a slot is empty.

## How to add a video (no code changes needed)

1. Export the clip as **MP4 (H.264 + AAC)**, 1920x1080 minimum (4K preferred).
2. Rename it to the **exact file name** in the table below.
3. Drop it into `public/videos/`.
4. Reload the site. The section picks it up automatically.

All slot definitions live in one file: `src/data/videos.ts`.
To change a file name, poster image, or alt text, edit that file only.

## Slot table

| # | File (put in `public/videos/`) | Where it appears | Status |
|---|---|---|---|
| 1 | `frame-assembly.mp4` | Hero background + Motion Showcase reel 1 | Supplied & Live |
| 2 | `model-designer.mp4` | Campaign full-screen background + Motion Showcase reel 2 | Supplied & Live |
| 3 | `eye-testing.mp4` | EyeQ precision-technology panel (right side) | Supplied & Live |
| 4 | `store-interior.mp4` | Store Locator walkthrough band (wide 21:9 banner) | Supplied & Live |
| 5 | `product-macro.mp4` | Detail Reel section, between Collection and Campaign | Supplied & Live |
| 6 | `customer-fitting.mp4` | Book Band booking section background (dimmed behind text) | Supplied & Live |
| 7 | `logo-reveal.mp4` | Intro overlay, soft ambient layer behind the wordmark | Supplied & Live |

## Common specs for every clip

- MP4 or WebM, 1920x1080 minimum, 4K preferred
- 16:9 landscape, 6-10 seconds (logo reveal: 3-5 seconds)
- Slow, steady camera; one continuous move, no cuts
- No text, no logos, no watermarks, no heavy filters
- Dark warm luxury mood: near-black background, champagne-gold highlights, cool steel fill
- Keep the file under ~10 MB where possible so the page stays fast
- The site plays every clip **muted and looping**, so no audio is required
  (the Campaign section has an optional sound toggle if the clip has audio)

## Framing notes per slot

- **Slot 3 (eye-testing)** — vertical-ish crop area, roughly 4:3 visible. Keep the machine
  in the left two-thirds; the bottom strip is covered by a caption.
- **Slot 4 (store-interior)** — very wide 21:9 crop. Keep the action in the middle band;
  the bottom third is darkened for the headline.
- **Slot 5 (product-macro)** — 16:10 crop, headline sits over the lower-left. Keep the frame
  detail in the upper-right half.
- **Slot 6 (customer-fitting)** — full-bleed background at 45% opacity behind text.
  Low-contrast, slow movement works best; avoid busy backgrounds.
- **Slot 7 (logo-reveal)** — plays at 25% opacity behind the intro wordmark, so keep it
  simple: black field, one light sweep.

## Prompts (for AI video generation)

### 1. Hero — frame assembly (supplied)
Extreme macro close-up of premium eyeglass frames being assembled by hand, tiny precision
screws floating gently into the hinge and settling into place, one continuous slow push-in
camera, dark obsidian studio background, champagne gold rim light from the left, shallow
depth of field, polished metal and acetate details catching the light, elegant precision
engineering mood, cinematic slow motion, no text, no logo, no watermark.

### 2. Designer model campaign (supplied)
Sophisticated Indian model wearing designer optical glasses, begins in side profile and
slowly turns toward the camera with a confident expression, one slow cinematic push-in,
warm champagne key light on the face, cool teal rim light on the shoulder, dark luxury
studio background, high-fashion eyewear campaign, shallow depth of field, smooth slow
motion, no text, no logo, no watermark.

### 3. Eye testing / Zeiss technology — `eye-testing.mp4`
Premium optical clinic scene, advanced eye-testing and lens-measurement machine in sharp
focus, patient softly blurred in the background, slow lateral camera slide moving across
the machine's lens so light sweeps over the glass, warm luxury lighting in black and
champagne tones, clean medical precision, cinematic, no text, no logo, no watermark.

### 4. Store interior / boutique — `store-interior.mp4`
Elegant luxury optical boutique interior, slow continuous walkthrough camera moving past
polished shelves of designer eyewear frames, warm spotlights, dark marble floor and brass
details, customers browsing in the background, an optician gently helping a customer try on
glasses, premium retail atmosphere, cinematic depth, no text, no logo, no watermark.

### 5. Product close-up — `product-macro.mp4`
Ultra-close macro shot of a premium eyeglass frame, slow orbiting camera revealing the
hinge, temple arm, nose pads and polished metal accents, lens reflections catching champagne
gold highlights, dark background, shallow depth of field, luxury product commercial,
cinematic slow motion, no text, no logo, no watermark.

### 6. Customer fitting — `customer-fitting.mp4`
Close-up of an optician's hands gently adjusting designer eyeglasses on a customer's face
inside a premium optical store, fingers fitting the frame at the temple, then the customer
smiles looking into a mirror, warm professional lighting, cinematic slow motion, luxury
service experience, shallow depth of field, no text, no logo, no watermark.

### 7. Logo animation (optional) — `logo-reveal.mp4`
Minimal premium logo reveal, near-black background, the wordmark fades in quietly, a single
soft champagne light sweep passes across it like a lens reflection, subtle optical shimmer,
slow refined motion, ends on a clean still logo, luxury eyewear brand identity, no extra
text, no particles, no watermark.

## If shooting on a real camera or phone instead

Shoot these and they map straight onto the slots:

- Store entrance from outside, slow walk-in — slot 4
- Slow pan along the frame shelves (Ray-Ban, Oakley, Versace, Armani) — slot 4 or 5
- Staff helping a customer try frames — slot 4
- Eye-testing machine in use, close on the lens — slot 3
- Hands adjusting a frame at the temple — slot 6
- Customer smiling into the mirror wearing new glasses — slot 6
- Very close shots of a hinge, temple arm and nose pads — slot 5

Tips: rest the phone on something steady, move very slowly, shoot in the darker/warmer
corners of the store, avoid flickering overhead tubelights, and film in 4K 24 or 30 fps.

## Priority if you cannot do all of them

1. `store-interior.mp4` (biggest trust win — the real shop)
2. `eye-testing.mp4`
3. `customer-fitting.mp4`
4. `product-macro.mp4`
5. `logo-reveal.mp4` (nice to have)

## Fallback behaviour (already built in)

- Poster image renders first, always — layout never shifts.
- The clip attaches only when the section scrolls into view, plays while visible and pauses
  when it leaves, so the page stays fast.
- If a file is missing, fails, or the visitor has reduced-motion or a slow connection, the
  poster simply stays. No error, no empty box.

---

# What changed in this update (polish pass, no content changed)

No business details, prices, addresses, phone numbers, brand names or copy were changed,
and the two supplied videos (`frame-assembly.mp4`, `model-designer.mp4`) are untouched.
Only layout, motion and colour behaviour were improved:

1. **Phone navigation** — the menu is now a full-screen dark overlay with blur and a
   staggered reveal, plus a real close button, instead of a short inline list.
2. **Header legibility** — a soft dark gradient sits behind the header at the top of the
   page, so the logo and menu button stay readable over bright video frames.
3. **Reading-progress line** — a thin gold line across the very top fills as you scroll
   (`src/components/bapat/ScrollProgress.tsx`).
4. **Sticky booking bar on phones** — after the first screen, a bottom bar offers *Call* and
   *Book Free Eye Exam* (`src/components/bapat/MobileBookBar.tsx`). Hidden on desktop.
   A matching spacer at the end of the page keeps the footer clear of it.
5. **Snappier craftsmanship scroll** — the pinned frame-assembly track is shorter on phones
   (200vh instead of 300vh), so the scroll-scrub finishes without feeling endless.
6. **No more dead space on phones** — the showcase cards and detail section drop their
   desktop minimum heights and oversized gaps on small screens.
7. **Detail section text fixed** — the "Millimetre Detail" label no longer collides with the
   headline; the poster is 4:3 on phones and the gradient is darker for contrast.
8. **Store section restyled dark** — the two map cards were bright white and clashed with the
   palette. They are now dark charcoal cards with dimmed, desaturated maps that brighten and
   regain colour on hover, gold primary buttons, and a 4:3 walkthrough banner on phones.
9. **Desktop nav underline** — each menu link draws a gold underline on hover.

## Files added in this pass

- `src/components/bapat/ScrollProgress.tsx`
- `src/components/bapat/MobileBookBar.tsx`

## Files edited in this pass

- `src/routes/index.tsx` (mounts the two new components + bottom spacer)
- `src/components/bapat/Nav.tsx`
- `src/components/bapat/StoreLocator.tsx`
- `src/components/bapat/DetailReel.tsx`
- `src/components/bapat/MotionShowcase.tsx`
- `src/components/bapat/Crafted.tsx`

Nothing else was touched. The video slot system and all seven prompts above are unchanged,
so dropping the clips into `public/videos/` still needs no code edits.
