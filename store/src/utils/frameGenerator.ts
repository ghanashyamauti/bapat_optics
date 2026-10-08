/**
 * Luxury 3D Eyewear Frame Texture Generator for Bapat Optics
 * Generates photorealistic, transparent SVG textures for frames matching catalog specs
 * when custom PNG cutouts are not uploaded yet.
 */

export interface FrameStyleConfig {
  shape: string;
  colour: string;
  lensMode?: 'CLEAR' | 'BLUEBLOCK' | 'PHOTOFUSION';
}

export function generateFrameSvg(config: FrameStyleConfig): string {
  const shape = (config.shape || 'WAYFARER').toUpperCase();
  const colour = (config.colour || 'SOLID BLACK').toUpperCase();
  const lensMode = config.lensMode || 'CLEAR';

  // Determine frame material color
  let rimColor = '#18181b'; // Default matte/solid black
  let rimHighlight = '#3f3f46';
  let bridgeColor = '#27272a';
  let accentColor = '#e4e4e7';

  if (colour.includes('GOLD') && !colour.includes('ROSE')) {
    rimColor = '#C6A15B';
    rimHighlight = '#E6CA85';
    bridgeColor = '#B89243';
    accentColor = '#FDF0CD';
  } else if (colour.includes('ROSE')) {
    rimColor = '#C48A80';
    rimHighlight = '#E2B1A8';
    bridgeColor = '#B0756B';
    accentColor = '#F7D6D0';
  } else if (colour.includes('GUNMETAL') || colour.includes('SILVER')) {
    rimColor = '#52525b';
    rimHighlight = '#a1a1aa';
    bridgeColor = '#3f3f46';
    accentColor = '#f4f4f5';
  } else if (colour.includes('TORTOISE') || colour.includes('HAVANA') || colour.includes('CARAMEL')) {
    rimColor = '#451a03';
    rimHighlight = '#78350f';
    bridgeColor = '#78350f';
    accentColor = '#d97706';
  } else if (colour.includes('BLUE')) {
    rimColor = '#1e293b';
    rimHighlight = '#334155';
    bridgeColor = '#0f172a';
    accentColor = '#94a3b8';
  } else if (colour.includes('WHITE') || colour.includes('CLEAR')) {
    rimColor = '#e2e8f0';
    rimHighlight = '#ffffff';
    bridgeColor = '#cbd5e1';
    accentColor = '#94a3b8';
  }

  // Determine lens tint based on mode
  let lensFill = 'rgba(255, 255, 255, 0.05)';
  let lensReflection = 'rgba(255, 255, 255, 0.25)';

  if (lensMode === 'BLUEBLOCK') {
    lensFill = 'rgba(92, 124, 250, 0.12)';
    lensReflection = 'rgba(129, 140, 248, 0.35)';
  } else if (lensMode === 'PHOTOFUSION') {
    lensFill = 'rgba(24, 24, 27, 0.72)';
    lensReflection = 'rgba(255, 255, 255, 0.2)';
  }

  // 1. ROUND FRAMES (Ray-Ban Meta Headliner, Round Metal)
  if (shape.includes('ROUND') || shape.includes('OVAL')) {
    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200" width="500" height="200">
  <defs>
    <linearGradient id="rimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${rimHighlight}"/>
      <stop offset="50%" stop-color="${rimColor}"/>
      <stop offset="100%" stop-color="${rimColor}"/>
    </linearGradient>
    <linearGradient id="lensReflect" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${lensReflection}"/>
      <stop offset="40%" stop-color="transparent"/>
    </linearGradient>
  </defs>

  <!-- Left Temple Arm Hinge -->
  <path d="M 45 95 L 15 88 L 15 102 L 45 105 Z" fill="${bridgeColor}"/>
  <circle cx="28" cy="95" r="2.5" fill="${accentColor}"/>

  <!-- Right Temple Arm Hinge -->
  <path d="M 455 95 L 485 88 L 485 102 L 455 105 Z" fill="${bridgeColor}"/>
  <circle cx="472" cy="95" r="2.5" fill="${accentColor}"/>

  <!-- Left Lens -->
  <circle cx="150" cy="100" r="72" fill="${lensFill}"/>
  <path d="M 100 65 Q 150 75 190 120" stroke="url(#lensReflect)" stroke-width="8" stroke-linecap="round" fill="none"/>

  <!-- Left Frame Rim -->
  <circle cx="150" cy="100" r="74" fill="none" stroke="url(#rimGrad)" stroke-width="14"/>

  <!-- Right Lens -->
  <circle cx="350" cy="100" r="72" fill="${lensFill}"/>
  <path d="M 300 65 Q 350 75 390 120" stroke="url(#lensReflect)" stroke-width="8" stroke-linecap="round" fill="none"/>

  <!-- Right Frame Rim -->
  <circle cx="350" cy="100" r="74" fill="none" stroke="url(#rimGrad)" stroke-width="14"/>

  <!-- Keyhole Nose Bridge -->
  <path d="M 220 92 Q 250 78 280 92 Q 250 86 220 92 Z" fill="${bridgeColor}"/>
  <path d="M 222 96 Q 250 82 278 96" stroke="${rimHighlight}" stroke-width="4" fill="none"/>
</svg>`.trim();
  }

  // 2. AVIATOR (Teardrop shape, double bridge)
  if (shape.includes('AVIATOR')) {
    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200" width="500" height="200">
  <defs>
    <linearGradient id="avRim" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${rimHighlight}"/>
      <stop offset="100%" stop-color="${rimColor}"/>
    </linearGradient>
    <linearGradient id="lensReflect" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${lensReflection}"/>
      <stop offset="40%" stop-color="transparent"/>
    </linearGradient>
  </defs>

  <!-- Temples -->
  <rect x="15" y="80" width="35" height="10" rx="4" fill="${bridgeColor}"/>
  <rect x="450" y="80" width="35" height="10" rx="4" fill="${bridgeColor}"/>

  <!-- Top Brow Bar (Iconic Aviator Double Bridge) -->
  <line x1="160" y1="52" x2="340" y2="52" stroke="${bridgeColor}" stroke-width="7" stroke-linecap="round"/>
  <line x1="225" y1="75" x2="275" y2="75" stroke="${bridgeColor}" stroke-width="6" stroke-linecap="round"/>

  <!-- Left Lens Teardrop -->
  <path d="M 75 65 C 130 52 210 55 220 70 C 230 110 215 160 155 165 C 95 165 65 125 75 65 Z" fill="${lensFill}"/>
  <!-- Left Rim -->
  <path d="M 75 65 C 130 52 210 55 220 70 C 230 110 215 160 155 165 C 95 165 65 125 75 65 Z" fill="none" stroke="url(#avRim)" stroke-width="10"/>

  <!-- Right Lens Teardrop -->
  <path d="M 425 65 C 370 52 290 55 280 70 C 270 110 285 160 345 165 C 405 165 435 125 425 65 Z" fill="${lensFill}"/>
  <!-- Right Rim -->
  <path d="M 425 65 C 370 52 290 55 280 70 C 270 110 285 160 345 165 C 405 165 435 125 425 65 Z" fill="none" stroke="url(#avRim)" stroke-width="10"/>
</svg>`.trim();
  }

  // 3. HEXAGON / GEOMETRIC
  if (shape.includes('HEXAGON') || shape.includes('HEXAGONE')) {
    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200" width="500" height="200">
  <defs>
    <linearGradient id="hexRim" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${rimHighlight}"/>
      <stop offset="100%" stop-color="${rimColor}"/>
    </linearGradient>
  </defs>

  <rect x="18" y="90" width="32" height="12" rx="3" fill="${bridgeColor}"/>
  <rect x="450" y="90" width="32" height="12" rx="3" fill="${bridgeColor}"/>

  <!-- Left Hexagon -->
  <polygon points="100,55 190,55 225,100 190,150 100,150 65,100" fill="${lensFill}" stroke="url(#hexRim)" stroke-width="12" stroke-linejoin="round"/>

  <!-- Right Hexagon -->
  <polygon points="310,55 400,55 435,100 400,150 310,150 275,100" fill="${lensFill}" stroke="url(#hexRim)" stroke-width="12" stroke-linejoin="round"/>

  <!-- Bridge -->
  <path d="M 220 95 Q 250 82 280 95" stroke="${bridgeColor}" stroke-width="8" stroke-linecap="round" fill="none"/>
</svg>`.trim();
  }

  // 4. CAT EYE
  if (shape.includes('CAT')) {
    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200" width="500" height="200">
  <defs>
    <linearGradient id="catRim" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${rimHighlight}"/>
      <stop offset="100%" stop-color="${rimColor}"/>
    </linearGradient>
  </defs>

  <!-- Left Cat Eye -->
  <path d="M 50 48 Q 140 55 215 78 C 215 125 185 160 135 160 C 85 160 55 125 50 48 Z" fill="${lensFill}" stroke="url(#catRim)" stroke-width="15" stroke-linejoin="round"/>
  <!-- Right Cat Eye -->
  <path d="M 450 48 Q 360 55 285 78 C 285 125 315 160 365 160 C 415 160 445 125 450 48 Z" fill="${lensFill}" stroke="url(#catRim)" stroke-width="15" stroke-linejoin="round"/>

  <!-- Bridge -->
  <path d="M 210 85 Q 250 70 290 85" stroke="${bridgeColor}" stroke-width="10" stroke-linecap="round" fill="none"/>
</svg>`.trim();
  }

  // 5. WAYFARER / SQUARE / RECTANGLE (Default Classic Luxury Wayfarer)
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200" width="500" height="200">
  <defs>
    <linearGradient id="wfRim" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${rimHighlight}"/>
      <stop offset="50%" stop-color="${rimColor}"/>
      <stop offset="100%" stop-color="${rimColor}"/>
    </linearGradient>
    <linearGradient id="lensReflect" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${lensReflection}"/>
      <stop offset="45%" stop-color="transparent"/>
    </linearGradient>
  </defs>

  <!-- Left Hinge & Silver Stud -->
  <path d="M 45 80 L 15 72 L 15 90 L 45 95 Z" fill="${bridgeColor}"/>
  <ellipse cx="58" cy="74" rx="4" ry="2" fill="${accentColor}"/>

  <!-- Right Hinge & Silver Stud -->
  <path d="M 455 80 L 485 72 L 485 90 L 455 95 Z" fill="${bridgeColor}"/>
  <ellipse cx="442" cy="74" rx="4" ry="2" fill="${accentColor}"/>

  <!-- Left Rim & Lens -->
  <rect x="65" y="62" width="150" height="102" rx="26" fill="${lensFill}" stroke="url(#wfRim)" stroke-width="16"/>
  <path d="M 85 75 Q 140 85 185 130" stroke="url(#lensReflect)" stroke-width="9" stroke-linecap="round" fill="none"/>

  <!-- Right Rim & Lens -->
  <rect x="285" y="62" width="150" height="102" rx="26" fill="${lensFill}" stroke="url(#wfRim)" stroke-width="16"/>
  <path d="M 305 75 Q 360 85 405 130" stroke="url(#lensReflect)" stroke-width="9" stroke-linecap="round" fill="none"/>

  <!-- Heavy Acetate Bridge -->
  <path d="M 210 82 Q 250 68 290 82 Q 250 76 210 82 Z" fill="${bridgeColor}"/>
  <path d="M 214 84 Q 250 72 286 84" stroke="${rimHighlight}" stroke-width="5" fill="none"/>
</svg>`.trim();
}

/**
 * Returns a base64 Data URI from the generated SVG
 */
export function getProceduralFrameDataUrl(config: FrameStyleConfig): string {
  const svg = generateFrameSvg(config);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
