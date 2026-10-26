import type { Product } from '../types/store';

// Known compatible virtual try-on assets for luxury eyewear models
// Ensures 100% reliable try-on even if the backend record had tryon_image_url temporarily unpopulated
export const KNOWN_TRYON_ASSETS: Record<string, string> = {
  // Versace Medusa Biggie Luxury Hexagon (Iconic 3D model with wide acetate temples & Medusa medallions)
  'BPT-VRS-07': '/uploads/model_f886c1e031e9488897b90c524f088510.glb',
  // Ray-Ban Meta Wayfarer AI Smart Audio Glasses (Smart glasses front frame try-on cutout)
  'BPT-RB-02': '/uploads/6af776ff471744939f5c4b19ebe2db22.png',
  // Ray-Ban Meta Skyler Cat-Eye Smart Frames (Smart cat-eye frame try-on cutout)
  'BPT-RB-22': '/uploads/fcc07b27082947debe6e610a04a40263.png',
  // Ray-Ban Meta Headliner Round Smart Glasses
  'BPT-RB-21': '/uploads/56daf89203634d429f844399477a7261.png',
  // Scuderia Ferrari Carbon Fiber Speed Aviator
  'BPT-FER-19': '/uploads/model_4f25aeba283a4ccbb9af20e4a1e361c2.glb',
  // Prada Minimal Baroque Optical Eyeglasses
  'BPT-PRD-17': '/uploads/model_cfe43e8a3f864035979a916a1619bea7.glb',
  // Prada Symbole Cat-Eye Statement Sunglasses
  'BPT-PRD-05': '/uploads/model_bafe233739224fed931b4acfbfd7297f.glb',
  // Armani Exchange Casablanca Acetate Heritage
  'BPT-AX-01': '/uploads/model_4dd166801f3a49a38e119139d882556b.glb',
  // Tom Ford FT5405 T-Icon Optical Classic
  'BPT-TF-04': '/uploads/6e92c2e426f0487c97334fce79430ccf.png',
};

/**
 * Returns the effective try-on asset URL (either from product record or verified asset fallback)
 */
export function getProductTryOnUrl(product: Product): string | null {
  if (product.tryon_image_url && product.tryon_image_url.trim()) {
    return product.tryon_image_url.trim();
  }
  if (product.sku && KNOWN_TRYON_ASSETS[product.sku]) {
    return KNOWN_TRYON_ASSETS[product.sku];
  }
  return null;
}

/**
 * Validates whether a product is eligible for the Live Virtual Try-On button:
 * 1. Must be a wearable eyewear category (spectacle frames, sunglasses, smart glasses, kids frames).
 *    Excludes non-frame items such as cleaning kits (accessories), contact lenses, and prescription lenses (spectacle-lenses).
 * 2. Must have a valid, compatible try-on asset (3D GLB model or 2D front cutout).
 */
export function isVirtualTryOnEligible(product?: Product | null): boolean {
  if (!product) return false;
  const slug = product.category?.slug?.toLowerCase();
  const isEyewearCategory =
    slug === 'spectacle-frames' ||
    slug === 'sunglasses' ||
    slug === 'meta' ||
    slug === 'kids';

  if (!isEyewearCategory) return false;

  const tryOnUrl = getProductTryOnUrl(product);
  return Boolean(tryOnUrl);
}
