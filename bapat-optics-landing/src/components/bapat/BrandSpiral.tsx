import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { ChevronDown } from "lucide-react";

// Curated 20 premier luxury houses carried by Bapat Optics
const TOP_20_BRANDS = [
  "Ray-Ban",
  "Oakley",
  "Persol",
  "Prada",
  "Gucci",
  "Tom Ford",
  "Versace",
  "Dior",
  "Armani Exchange",
  "Emporio Armani",
  "Burberry",
  "Dolce & Gabbana",
  "Calvin Klein",
  "Carl Zeiss",
  "Ferrari",
  "Mont Blanc",
  "Swarovski",
  "Ralph Lauren",
  "Vogue Eyewear",
  "Zeiss",
] as const;

interface BrandStyle {
  font: string;
  spacing: number;
  sub?: string;
}

const BRAND_STYLES: Record<string, BrandStyle> = {
  "Ray-Ban": { font: "italic 700 82px 'Fraunces', Georgia, serif", spacing: 8, sub: "GENUINE SINCE 1937" },
  "Oakley": { font: "800 76px 'Inter', sans-serif", spacing: 18, sub: "PERFORMANCE OPTICS" },
  "Persol": { font: "italic 600 82px 'Fraunces', Georgia, serif", spacing: 6, sub: "HANDMADE IN ITALY" },
  "Prada": { font: "400 84px 'Fraunces', Georgia, serif", spacing: 22, sub: "MILANO" },
  "Gucci": { font: "300 86px 'Fraunces', Georgia, serif", spacing: 24, sub: "FIRENZE 1921" },
  "Tom Ford": { font: "600 74px 'Inter', sans-serif", spacing: 20, sub: "EYEWEAR" },
  "Versace": { font: "700 78px 'Fraunces', Georgia, serif", spacing: 18, sub: "MEDUSA COUTURE" },
  "Dior": { font: "300 88px 'Fraunces', Georgia, serif", spacing: 22, sub: "PARIS" },
  "Armani Exchange": { font: "500 68px 'Inter', sans-serif", spacing: 16, sub: "MILANO" },
  "Emporio Armani": { font: "300 72px 'Fraunces', Georgia, serif", spacing: 18, sub: "MILANO" },
  "Burberry": { font: "600 74px 'Fraunces', Georgia, serif", spacing: 18, sub: "LONDON ENGLAND" },
  "Dolce & Gabbana": { font: "400 72px 'Fraunces', Georgia, serif", spacing: 16, sub: "ITALIA" },
  "Calvin Klein": { font: "300 72px 'Inter', sans-serif", spacing: 16, sub: "NEW YORK" },
  "Carl Zeiss": { font: "600 72px 'Inter', sans-serif", spacing: 16, sub: "PRECISION LENSES" },
  "Ferrari": { font: "italic 700 76px 'Inter', sans-serif", spacing: 14, sub: "MARANELLO" },
  "Mont Blanc": { font: "400 74px 'Fraunces', Georgia, serif", spacing: 16, sub: "HAMBURG" },
  "Swarovski": { font: "300 76px 'Fraunces', Georgia, serif", spacing: 18, sub: "CRYSTAL EYEWEAR" },
  "Ralph Lauren": { font: "300 74px 'Fraunces', Georgia, serif", spacing: 18, sub: "PURPLE LABEL" },
  "Vogue Eyewear": { font: "300 72px 'Fraunces', Georgia, serif", spacing: 16, sub: "STAND OUT" },
  "Zeiss": { font: "700 84px 'Inter', sans-serif", spacing: 20, sub: "PRECISION OPTICS" },
};

function getBrandStyle(name: string): BrandStyle {
  if (BRAND_STYLES[name]) return BRAND_STYLES[name];
  return {
    font: "400 74px 'Fraunces', Georgia, serif",
    spacing: 16,
    sub: "HAUTE EYEWEAR",
  };
}

// Render crystal-clear brand text onto high-resolution 1024x256 offscreen canvas
function createBrandCanvas(name: string, style: BrandStyle): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.clearRect(0, 0, 1024, 256);

  ctx.save();
  ctx.font = style.font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const chars = name.toUpperCase().split("");
  let totalW = 0;
  for (const ch of chars) totalW += ctx.measureText(ch).width;
  totalW += style.spacing * (chars.length - 1);

  // Luminous champagne gold halo
  ctx.shadowColor = "rgba(245, 225, 170, 0.85)";
  ctx.shadowBlur = 18;

  // Brilliant high-contrast white-to-champagne gradient
  const grad = ctx.createLinearGradient(0, 45, 0, 165);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.4, "#fdf8ef");
  grad.addColorStop(0.85, "#eedab0");
  grad.addColorStop(1, "#dfc693");
  ctx.fillStyle = grad;

  const cy = style.sub ? 110 : 128;
  let curX = 512 - totalW / 2;
  for (const ch of chars) {
    const w = ctx.measureText(ch).width;
    ctx.fillText(ch, curX + w / 2, cy);
    curX += w + style.spacing;
  }
  ctx.restore();

  // Subtitle badge
  if (style.sub) {
    ctx.save();
    ctx.font = "600 22px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#e0c594";
    ctx.shadowColor = "rgba(224, 197, 148, 0.55)";
    ctx.shadowBlur = 10;

    const subChars = style.sub.split("");
    let subW = 0;
    for (const c of subChars) subW += ctx.measureText(c).width;
    subW += 10 * (subChars.length - 1);

    let sx = 512 - subW / 2;
    for (const c of subChars) {
      const w = ctx.measureText(c).width;
      ctx.fillText(c, sx + w / 2, 178);
      sx += w + 10;
    }
    ctx.restore();
  }

  return canvas;
}

// Procedural soft luminous gold dust particle texture
function createGoldParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // Soft glowing gold orb with diamond-champagne core and radiant golden falloff
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    grad.addColorStop(0, "rgba(255, 255, 252, 1.0)");
    grad.addColorStop(0.18, "rgba(252, 234, 165, 0.95)");
    grad.addColorStop(0.48, "rgba(228, 184, 88, 0.52)");
    grad.addColorStop(0.8, "rgba(195, 142, 50, 0.14)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

export function BrandSpiral() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const brandList = useMemo(() => Array.from(TOP_20_BRANDS), []);

  useEffect(() => {
    const mount = canvasRef.current;
    const container = containerRef.current;
    if (!mount || !container) return;

    let animId: number;
    let destroyed = false;
    let gsapContext: { revert: () => void } | null = null;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050507); // Pure deep luxury black

    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 300);
    camera.position.set(0, 0.6, 14.8);
    camera.lookAt(0, -0.2, 0);

    // 2. High-Performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.38;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // 3. Studio Lighting (Sculpts the 3D curves & illuminates golden rims)
    const ambLight = new THREE.AmbientLight(0x353540, 1.8);
    scene.add(ambLight);

    const keyLight = new THREE.DirectionalLight(0xfff8ee, 3.5);
    keyLight.position.set(6, 10, 8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf5e1a4, 4.4);
    rimLight.position.set(-8, 5, -6);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xb5c8df, 1.3);
    fillLight.position.set(0, -1, 10);
    scene.add(fillLight);

    const bottomGlow = new THREE.DirectionalLight(0xdfba64, 2.2);
    bottomGlow.position.set(3, -9, 4);
    scene.add(bottomGlow);

    // 4. Mathematical 3D Ribbon Parameters: Elongated with round circular loop depth
    // Lengthened with generous vertical gaps and rounded cylindrical depth
    const totalLoops = 4.8;
    const maxRibbonWidth = 1.18;
    const totalCurveHeight = 9.4; // Lengthened vertically for generous, airy gaps
    const radiusX = 2.55;
    const radiusZ = 1.68; // Rounder 3D circular depth so you can look through the open circular loops!

    // Smooth ribbon width that tapers to an elegant jewel-tip at t=0 and t=1
    function getRibbonWidth(t: number): number {
      const taperIn = Math.min(1, t / 0.055);
      const taperOut = Math.min(1, (1 - t) / 0.055);
      const smoothIn = taperIn * taperIn * (3 - 2 * taperIn);
      const smoothOut = taperOut * taperOut * (3 - 2 * taperOut);
      return maxRibbonWidth * smoothIn * smoothOut;
    }

    function getPointOnCurve(t: number): THREE.Vector3 {
      // theta starts at back (-0.5*PI), loops around top arch, and sweeps forward
      // Finishes at bottom loop by sweeping under and tucking naturally into the back
      const theta = t * totalLoops * Math.PI * 2 - Math.PI * 0.5;
      // Sculpted organic curve width
      const rMod = 0.95 + 0.12 * Math.sin(t * Math.PI);
      const x = Math.sin(theta) * radiusX * rMod;
      const z = Math.cos(theta) * radiusZ;
      // Centered comfortably in the viewport
      const y = (0.5 - t) * totalCurveHeight - 0.45;
      return new THREE.Vector3(x, y, z);
    }

    function getTangentOnCurve(t: number): THREE.Vector3 {
      const dt = 0.0003;
      const p1 = getPointOnCurve(Math.max(0, t - dt));
      const p2 = getPointOnCurve(Math.min(1, t + dt));
      return p2.sub(p1).normalize();
    }

    // 5. Build Smooth Clear Ribbon Mesh & Closed Tapered Gold Borders
    const ribbonGroup = new THREE.Group();
    scene.add(ribbonGroup);

    const segments = 2200;
    const ribbonPositions: number[] = [];
    const ribbonNormals: number[] = [];
    const ribbonUVs: number[] = [];
    const ribbonIndices: number[] = [];

    const topEdgePoints: THREE.Vector3[] = [];
    const bottomEdgePoints: THREE.Vector3[] = [];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const P = getPointOnCurve(t);
      const T = getTangentOnCurve(t);
      const currentWidth = getRibbonWidth(t);

      // Ribbon stays upright along +Y so it never twists upside down
      const worldUp = new THREE.Vector3(0, 1, 0);
      const upVec = worldUp.clone().sub(T.clone().multiplyScalar(worldUp.dot(T))).normalize();
      const normalVec = new THREE.Vector3().crossVectors(T, upVec).normalize();

      const halfW = currentWidth / 2;
      const topPt = P.clone().addScaledVector(upVec, halfW);
      const bottomPt = P.clone().addScaledVector(upVec, -halfW);

      topEdgePoints.push(topPt);
      bottomEdgePoints.push(bottomPt);

      ribbonPositions.push(topPt.x, topPt.y, topPt.z);
      ribbonNormals.push(normalVec.x, normalVec.y, normalVec.z);
      ribbonUVs.push(t, 1);

      ribbonPositions.push(bottomPt.x, bottomPt.y, bottomPt.z);
      ribbonNormals.push(normalVec.x, normalVec.y, normalVec.z);
      ribbonUVs.push(t, 0);

      if (i < segments) {
        const a = i * 2;
        ribbonIndices.push(a, a + 1, a + 2);
        ribbonIndices.push(a + 1, a + 3, a + 2);
      }
    }

    // Ribbon Body: Defined satin charcoal/obsidian with lustrous sheen
    const ribbonGeo = new THREE.BufferGeometry();
    ribbonGeo.setAttribute("position", new THREE.Float32BufferAttribute(ribbonPositions, 3));
    ribbonGeo.setAttribute("normal", new THREE.Float32BufferAttribute(ribbonNormals, 3));
    ribbonGeo.setAttribute("uv", new THREE.Float32BufferAttribute(ribbonUVs, 2));
    ribbonGeo.setIndex(ribbonIndices);

    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0x1c1c23, // Clearly visible charcoal obsidian
      roughness: 0.34, // Lustrous satin finish
      metalness: 0.46,
      side: THREE.DoubleSide,
    });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbonGroup.add(ribbonMesh);

    // Glowing Champagne Gold Edges (Top & Bottom met seamlessly at tapered tips)
    const goldEdgeMat = new THREE.MeshStandardMaterial({
      color: 0xffefc6,
      emissive: 0xc9a456,
      emissiveIntensity: 0.88,
      roughness: 0.18,
      metalness: 0.95,
    });

    const topEdgeCurve = new THREE.CatmullRomCurve3(topEdgePoints);
    const topEdgeGeo = new THREE.TubeGeometry(topEdgeCurve, 800, 0.028, 6, false);
    const topEdgeMesh = new THREE.Mesh(topEdgeGeo, goldEdgeMat);
    ribbonGroup.add(topEdgeMesh);

    const bottomEdgeCurve = new THREE.CatmullRomCurve3(bottomEdgePoints);
    const bottomEdgeGeo = new THREE.TubeGeometry(bottomEdgeCurve, 800, 0.028, 6, false);
    const bottomEdgeMesh = new THREE.Mesh(bottomEdgeGeo, goldEdgeMat);
    ribbonGroup.add(bottomEdgeMesh);

    // Subtle Luxury Floor Reflection (Matching reference image)
    const floorGeo = new THREE.PlaneGeometry(10, 4);
    const floorCanvas = document.createElement("canvas");
    floorCanvas.width = 512;
    floorCanvas.height = 256;
    const fCtx = floorCanvas.getContext("2d");
    if (fCtx) {
      const fGrad = fCtx.createRadialGradient(256, 128, 10, 256, 128, 220);
      fGrad.addColorStop(0, "rgba(223, 196, 145, 0.12)");
      fGrad.addColorStop(0.5, "rgba(28, 28, 35, 0.06)");
      fGrad.addColorStop(1, "rgba(5, 5, 7, 0)");
      fCtx.fillStyle = fGrad;
      fCtx.fillRect(0, 0, 512, 256);
    }
    const floorTex = new THREE.CanvasTexture(floorCanvas);
    const floorMat = new THREE.MeshBasicMaterial({
      map: floorTex,
      transparent: true,
      depthWrite: false,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.set(0, -5.25, -0.2);
    floorMesh.rotation.x = -Math.PI * 0.35;
    scene.add(floorMesh);

    // 5.5 Ambient Luxury Gold Dust Particles
    // Spans the entire section with buoyant floating motion, subtle twinkle, and mouse parallax.
    // Sparsely distributed around the ribbon core so brand names remain crystal-clear.
    const PARTICLE_COUNT = 220;
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    const particleColors = new Float32Array(PARTICLE_COUNT * 3);
    const particleBaseColors: { r: number; g: number; b: number }[] = [];
    const particleSeeds: {
      x: number;
      y: number;
      z: number;
      speedY: number;
      ampX: number;
      freqX: number;
      phaseX: number;
      ampZ: number;
      freqZ: number;
      phaseZ: number;
      twinkleSpeed: number;
      twinklePhase: number;
    }[] = [];

    let pCount = 0;
    while (pCount < PARTICLE_COUNT) {
      // Wide volume covering the entire section viewport
      const px = (Math.random() - 0.5) * 19.0; // [-9.5, 9.5]
      const py = (Math.random() - 0.5) * 15.0; // [-7.5, 7.5]
      const pz = (Math.random() - 0.5) * 11.0; // [-5.5, 5.5]

      // Elliptical exclusion zone: keeps ribbon cylinder clear so brand typography stays sharp
      const ribbonDist = (px * px) / (3.1 * 3.1) + (pz * pz) / (2.2 * 2.2);
      if (ribbonDist < 1.0 && Math.abs(py) < 5.0) {
        // 88% rejection inside the ribbon zone -> only very sparse occasional specks
        if (Math.random() < 0.88) {
          continue;
        }
      }

      particlePositions[pCount * 3] = px;
      particlePositions[pCount * 3 + 1] = py;
      particlePositions[pCount * 3 + 2] = pz;

      // Curated luxury gold palette (champagne, pure 24k gold, and warm amber)
      const rVal = Math.random();
      let pr = 1.0;
      let pg = 0.92;
      let pb = 0.72;
      if (rVal < 0.45) {
        // Luminous champagne
        pr = 1.0;
        pg = 0.94;
        pb = 0.78;
      } else if (rVal < 0.8) {
        // Radiant 24k gold
        pr = 0.94;
        pg = 0.78;
        pb = 0.44;
      } else {
        // Deep warm amber gold
        pr = 0.88;
        pg = 0.65;
        pb = 0.32;
      }

      particleColors[pCount * 3] = pr;
      particleColors[pCount * 3 + 1] = pg;
      particleColors[pCount * 3 + 2] = pb;
      particleBaseColors.push({ r: pr, g: pg, b: pb });

      particleSeeds.push({
        x: px,
        y: py,
        z: pz,
        speedY: 0.0035 + Math.random() * 0.0065,
        ampX: 0.18 + Math.random() * 0.36,
        freqX: 0.35 + Math.random() * 0.65,
        phaseX: Math.random() * Math.PI * 2,
        ampZ: 0.14 + Math.random() * 0.3,
        freqZ: 0.3 + Math.random() * 0.55,
        phaseZ: Math.random() * Math.PI * 2,
        twinkleSpeed: 1.4 + Math.random() * 2.2,
        twinklePhase: Math.random() * Math.PI * 2,
      });

      pCount++;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.Float32BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE.Float32BufferAttribute(particleColors, 3));

    const particleTex = createGoldParticleTexture();
    const particleMat = new THREE.PointsMaterial({
      size: 0.26,
      map: particleTex,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
      sizeAttenuation: true,
    });

    const particlePoints = new THREE.Points(particleGeo, particleMat);
    scene.add(particlePoints);

    // 6. CONTINUOUS BRAND PLACEMENT: ALL 20 BRANDS DISTRIBUTED EVENLY ALONG THE RIBBON
    // Starting with Ray-Ban right on top arch, down to Vogue Eyewear and Zeiss on bottom loop.
    const brandMeshes: THREE.Mesh[] = [];
    const brandTextures: THREE.Texture[] = [];
    const brandPlaneGeo = new THREE.PlaneGeometry(1.95, 0.58, 4, 1);
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    const count = brandList.length;

    brandList.forEach((brandName, idx) => {
      const style = getBrandStyle(brandName);
      const canvas = createBrandCanvas(brandName, style);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = maxAnisotropy;
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      brandTextures.push(texture);

      const brandMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 1.0,
        depthWrite: false,
        side: THREE.FrontSide, // Crucial: only visible from front; hidden from behind so NEVER reversed
      });

      // Distribute evenly along the ribbon from t = 0.06 to t = 0.94
      const t = 0.06 + (idx / (count - 1)) * 0.88;

      const P = getPointOnCurve(t);
      const T = getTangentOnCurve(t);

      const worldUp = new THREE.Vector3(0, 1, 0);
      const upVec = worldUp.clone().sub(T.clone().multiplyScalar(worldUp.dot(T))).normalize();
      const normalVec = new THREE.Vector3().crossVectors(T, upVec).normalize();

      // Position quad slightly in front of ribbon surface
      const brandPos = P.clone().addScaledVector(normalVec, 0.032);

      const brandMesh = new THREE.Mesh(brandPlaneGeo, brandMat);
      brandMesh.position.copy(brandPos);

      // Orient brand mesh with ribbon surface
      const rightVec = T.clone();
      const rotMatrix = new THREE.Matrix4().makeBasis(rightVec, upVec, normalVec);
      brandMesh.setRotationFromMatrix(rotMatrix);

      ribbonGroup.add(brandMesh);
      brandMeshes.push(brandMesh);
    });

    // 7. Scroll & Spin Physics
    let targetProgress = 0;
    let smoothProgress = 0;
    let ambientSpin = 0;
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.position.z = w < 768 ? 15.5 : 13.5;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    // Wheel listener for direct responsive scrub
    const handleWheel = (e: WheelEvent) => {
      window.scrollBy({ top: e.deltaY, behavior: "auto" });
    };
    mount.addEventListener("wheel", handleWheel, { passive: true });

    // Touch & Pointer Drag support
    let isDragging = false;
    let startDragY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      startDragY = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaY = e.clientY - startDragY;
      startDragY = e.clientY;
      window.scrollBy({ top: -deltaY * 2.2, behavior: "auto" });
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    mount.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    // Native scroll calculation
    const updateScrollProgress = () => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const scrollableHeight = container.clientHeight - window.innerHeight;
      if (scrollableHeight > 0) {
        const rawP = -rect.top / scrollableHeight;
        targetProgress = Math.min(1, Math.max(0, rawP));
      }
    };
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    updateScrollProgress();

    // GSAP ScrollTrigger Integration
    void (async () => {
      try {
        const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        if (destroyed) return;
        gsap.registerPlugin(ScrollTrigger);

        gsapContext = gsap.context(() => {
          ScrollTrigger.create({
            trigger: container,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.1,
            onUpdate: (self) => {
              targetProgress = self.progress;
            },
          });
        }, container);
      } catch {
        // Fallback to native scroll
      }
    })();

    // Animation RAF Loop
    const render = () => {
      if (destroyed) return;
      animId = requestAnimationFrame(render);

      // Subtle ambient spin keeps the ribbon alive with golden highlights
      ambientSpin += 0.0035;

      smoothProgress += (targetProgress - smoothProgress) * 0.1;
      mouseX += (targetMouseX - mouseX) * 0.06;
      mouseY += (targetMouseY - mouseY) * 0.06;

      // 1. VERTICAL GLIDE: Ribbon glides smoothly as you scroll
      ribbonGroup.position.y = (smoothProgress - 0.5) * 2.2;

      // 2. 3D SPIN: Continuous 360-degree rotation as you scroll so every brand spins into view
      const scrollSpin = smoothProgress * Math.PI * 2 * 4.5;
      ribbonGroup.rotation.y = scrollSpin + ambientSpin * 0.4 + mouseX * 0.12;
      ribbonGroup.rotation.x = mouseY * 0.06 - 0.02;

      // 3. GOLD DUST DRIFT & TWINKLE: Move particles throughout the section with subtle parallax & air draft
      const time = performance.now() * 0.001;
      const posAttr = particleGeo.getAttribute("position") as THREE.BufferAttribute;
      const colAttr = particleGeo.getAttribute("color") as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;
      const colArr = colAttr.array as Float32Array;

      // Scroll speed influence adds subtle air turbulence
      const scrollDelta = (targetProgress - smoothProgress) * 0.35;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const seed = particleSeeds[i];
        const baseCol = particleBaseColors[i];
        if (!seed || !baseCol) continue;

        // Buoyant upward floating drift + scroll draft
        seed.y += seed.speedY + scrollDelta * 0.12;
        if (seed.y > 7.5) {
          seed.y = -7.5;
        } else if (seed.y < -7.5) {
          seed.y = 7.5;
        }

        // Fluid horizontal and depth drifting
        const swayX = Math.sin(time * seed.freqX + seed.phaseX) * seed.ampX;
        const swayZ = Math.cos(time * seed.freqZ + seed.phaseZ) * seed.ampZ;

        // Subtle 3D stereoscopic parallax with cursor
        const parallaxX = mouseX * 0.45 * (1 + seed.z * 0.08);
        const parallaxY = -mouseY * 0.35 * (1 + seed.z * 0.08);

        posArr[i * 3] = seed.x + swayX + parallaxX;
        posArr[i * 3 + 1] = seed.y + parallaxY;
        posArr[i * 3 + 2] = seed.z + swayZ;

        // Soft gold twinkle / breathing luminescence
        const twinkle = 0.62 + 0.38 * Math.sin(time * seed.twinkleSpeed + seed.twinklePhase);
        colArr[i * 3] = baseCol.r * twinkle;
        colArr[i * 3 + 1] = baseCol.g * twinkle;
        colArr[i * 3 + 2] = baseCol.b * twinkle;
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    render();

    return () => {
      destroyed = true;
      cancelAnimationFrame(animId);
      gsapContext?.revert();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", updateScrollProgress);
      mount.removeEventListener("wheel", handleWheel);
      mount.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);

      ribbonGeo.dispose();
      ribbonMat.dispose();
      topEdgeGeo.dispose();
      bottomEdgeGeo.dispose();
      goldEdgeMat.dispose();
      brandPlaneGeo.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      floorTex.dispose();

      particleGeo.dispose();
      particleMat.dispose();
      particleTex.dispose();
      scene.remove(particlePoints);

      brandTextures.forEach((t) => t.dispose());
      brandMeshes.forEach((m) => {
        (m.material as THREE.Material).dispose();
      });

      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [brandList]);

  return (
    <section
      id="brands"
      ref={containerRef}
      className="relative w-full bg-[#050507]"
      style={{ height: "260vh" }} // Comfortable scroll track
    >
      {/* Pinned Sticky Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between select-none">
        
        {/* 3D WebGL Canvas */}
        <div ref={canvasRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

        {/* Soft Vignette Overlays */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#050507] via-[#050507]/60 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#050507] via-[#050507]/80 to-transparent z-10" />

        {/* Top Minimal Header (Properly spaced so the ribbon starts below it) */}
        <div className="relative z-20 mx-auto max-w-[1600px] px-5 pt-8 sm:px-8 sm:pt-9 md:px-12 md:pt-10 text-center pointer-events-none">
          <div className="inline-flex items-center justify-center gap-3">
            <span className="inline-block h-px w-8 bg-gold sm:w-12 opacity-60" />
            <p className="eyebrow text-[9px] tracking-[0.28em] text-gold uppercase sm:text-[10px]">
              Authorized Luxury Brand Partners · Pune
            </p>
            <span className="inline-block h-px w-8 bg-gold sm:w-12 opacity-60" />
          </div>

          <h2 className="display mt-1.5 text-center text-[7.5vw] leading-none text-paper sm:text-[4.8vw] md:text-[3.4vw] lg:text-[3vw]">
            20 Iconic Designer Houses<span className="text-gold">.</span>
          </h2>

          <p className="mt-2 text-[11px] text-steel/85 max-w-lg mx-auto tracking-wide">
            Continuous sculptural 3D ribbon. Scroll down to spin through each premier eyewear house.
          </p>
        </div>

        {/* Minimal Scroll Cue at Bottom */}
        <div className="relative z-20 pb-6 text-center pointer-events-none">
          <div className="inline-flex items-center justify-center gap-1.5 text-[9px] text-steel/60 tracking-widest uppercase">
            <span>Scroll or drag to spin through houses</span>
            <ChevronDown size={11} className="animate-bounce text-gold" />
          </div>
        </div>

      </div>
    </section>
  );
}
