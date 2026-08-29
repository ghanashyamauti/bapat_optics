// Elegant fallback SVG for luxury eyewear frames
export const FALLBACK_EYEWEAR_IMAGE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none"><rect width="600" height="400" fill="%23F6F5F2"/><circle cx="210" cy="200" r="65" stroke="%230A0A0A" stroke-width="8" fill="white"/><circle cx="390" cy="200" r="65" stroke="%230A0A0A" stroke-width="8" fill="white"/><path d="M275 190 Q300 175 325 190" stroke="%23C6A15B" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M145 195 L90 185" stroke="%230A0A0A" stroke-width="6" stroke-linecap="round"/><path d="M455 195 L510 185" stroke="%230A0A0A" stroke-width="6" stroke-linecap="round"/><text x="300" y="310" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="600" fill="%23A4813E" letter-spacing="3">BAPAT OPTICS · PUNE</text><text x="300" y="335" text-anchor="middle" font-family="sans-serif" font-size="11" fill="%23666666">Carl Zeiss Vision Center</text></svg>`;

export const CATEGORY_FALLBACKS: Record<string, string> = {
  'spectacle-frames': 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=900&q=80',
  'sunglasses': 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80',
  'spectacle-lenses': 'https://images.unsplash.com/photo-1516715094483-75da7dee9758?auto=format&fit=crop&w=900&q=80',
  'contact-lenses': 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=900&q=80',
  'meta': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=80',
  'kids': 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=900&q=80',
  'accessories': 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=900&q=80',
};

export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  categorySlug?: string
) => {
  const target = e.currentTarget;
  // Prevent infinite loop if fallback also fails
  if (target.getAttribute('data-has-fallback') === 'true') {
    target.src = FALLBACK_EYEWEAR_IMAGE;
    return;
  }
  target.setAttribute('data-has-fallback', 'true');
  if (categorySlug && CATEGORY_FALLBACKS[categorySlug]) {
    target.src = CATEGORY_FALLBACKS[categorySlug];
  } else {
    target.src = FALLBACK_EYEWEAR_IMAGE;
  }
};
