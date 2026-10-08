import { useEffect, useRef } from "react";
import * as THREE from "three";

interface CineLensAperture3DProps {
  progress: number; // 0 (closed f/22) to 1 (wide open f/1.2)
  isDone?: boolean;
  className?: string;
}

const NUM_BLADES = 12;
const BARREL_RADIUS = 1.6;
const PIVOT_RADIUS = 1.35;

/**
 * Creates an authentic curved cine lens iris blade shape.
 * In a professional diaphragm, each blade is a curved scythe that overlaps
 * its neighbors, creating a polygonal/circular aperture opening in the center.
 */
function createBladeGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  
  // Pivot is at local origin (0, 0)
  shape.moveTo(0, 0);
  
  // Outer sweeping edge following the barrel boundary
  shape.bezierCurveTo(0.35, 0.45, 0.85, 0.75, 1.4, 0.65);
  shape.quadraticCurveTo(1.7, 0.55, 1.85, 0.25);
  
  // Cutting edge that forms the inner aperture circle
  shape.bezierCurveTo(1.3, -0.15, 0.7, -0.25, 0.15, -0.15);
  shape.quadraticCurveTo(0.02, -0.08, 0, 0);

  const geometry = new THREE.ShapeGeometry(shape, 24);
  return geometry;
}

export function CineLensAperture3D({
  progress,
  isDone = false,
  className = "",
}: CineLensAperture3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const isDoneRef = useRef(isDone);
  isDoneRef.current = isDone;

  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animId: number;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.4);

    // 3. High-performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 4. Lighting - Dark Luxury Cinema Studio
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // Warm champagne key light
    const keyLight = new THREE.DirectionalLight(0xffeedb, 3.2);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    // Cool Zeiss cyan/blue rim light from behind/side
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    rimLight.position.set(-3, -2, 1.5);
    scene.add(rimLight);

    // Dynamic mouse-driven spotlight for anamorphic flare sweep across glass
    const flareLight = new THREE.PointLight(0xd4af37, 3.5, 8);
    flareLight.position.set(0, 0, 3);
    scene.add(flareLight);

    // 5. Materials
    // Matte Obsidian Titanium Barrel
    const barrelMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x0a0a0c),
      roughness: 0.35,
      metalness: 0.9,
    });

    // 18k Champagne Gold Accent Ring
    const goldAccentMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xd4af37),
      roughness: 0.2,
      metalness: 0.95,
    });

    // Carbonized Titanium Iris Blades
    const bladeMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x131317),
      roughness: 0.38,
      metalness: 0.88,
      side: THREE.DoubleSide,
    });

    // Carl Zeiss T* Multi-Coated Optical Glass Front Element
    const frontGlassMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x060c14),
      transparent: true,
      opacity: 0.22,
      roughness: 0.04,
      metalness: 0.1,
      transmission: 0.88,
      ior: 1.54,
      reflectivity: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      specularColor: new THREE.Color(0x60a5fa), // Zeiss violet/blue specular sheen
    });

    // 6. Construct 3D Cine Lens Structure
    const lensGroup = new THREE.Group();
    scene.add(lensGroup);

    // Outer knurled chassis barrel ring
    const outerBarrelGeo = new THREE.CylinderGeometry(
      BARREL_RADIUS * 1.18,
      BARREL_RADIUS * 1.18,
      0.5,
      64,
      1,
      true
    );
    const outerBarrel = new THREE.Mesh(outerBarrelGeo, barrelMaterial);
    outerBarrel.rotation.x = Math.PI / 2;
    lensGroup.add(outerBarrel);

    // Gold Bevel Inlay Ring
    const goldRingGeo = new THREE.TorusGeometry(BARREL_RADIUS * 1.16, 0.025, 16, 100);
    const goldRing = new THREE.Mesh(goldRingGeo, goldAccentMaterial);
    goldRing.position.z = 0.25;
    lensGroup.add(goldRing);

    // Second Gold Inner Ring
    const innerGoldRingGeo = new THREE.TorusGeometry(BARREL_RADIUS * 0.98, 0.015, 16, 100);
    const innerGoldRing = new THREE.Mesh(innerGoldRingGeo, goldAccentMaterial);
    innerGoldRing.position.z = 0.22;
    lensGroup.add(innerGoldRing);

    // Inner stepped optical barrel (light baffles)
    const baffleGeo = new THREE.CylinderGeometry(
      BARREL_RADIUS * 0.96,
      BARREL_RADIUS * 0.88,
      0.4,
      48,
      1,
      true
    );
    const baffle = new THREE.Mesh(baffleGeo, barrelMaterial);
    baffle.rotation.x = Math.PI / 2;
    baffle.position.z = 0.05;
    lensGroup.add(baffle);

    // Curved Optical Glass Element (Front)
    const glassGeo = new THREE.SphereGeometry(
      BARREL_RADIUS * 1.05,
      48,
      24,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.35
    );
    const frontGlass = new THREE.Mesh(glassGeo, frontGlassMaterial);
    frontGlass.position.z = -0.35;
    lensGroup.add(frontGlass);

    // 7. Assemble 12 Mechanical Aperture Blades
    const bladeGeo = createBladeGeometry();
    const bladeMeshes: THREE.Group[] = [];

    const irisAssembly = new THREE.Group();
    irisAssembly.position.z = 0.02; // Positioned behind the front glass
    lensGroup.add(irisAssembly);

    for (let i = 0; i < NUM_BLADES; i++) {
      const angle = (i / NUM_BLADES) * Math.PI * 2;
      const pivotX = Math.cos(angle) * PIVOT_RADIUS;
      const pivotY = Math.sin(angle) * PIVOT_RADIUS;

      // Pivot container placed at exact pivot coordinate
      const pivotGroup = new THREE.Group();
      pivotGroup.position.set(pivotX, pivotY, (i / NUM_BLADES) * 0.015);
      
      // Orient the blade tangentially toward center
      pivotGroup.rotation.z = angle + Math.PI * 0.52;

      // Blade mesh attached to pivot
      const blade = new THREE.Mesh(bladeGeo, bladeMaterial);
      // Subtle scale for perfect edge closure at f/22
      blade.scale.set(1.05, 1.05, 1);
      pivotGroup.add(blade);

      irisAssembly.add(pivotGroup);
      bladeMeshes.push(pivotGroup);
    }

    // 8. Mouse parallax listeners
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        const x = (touch.clientX / window.innerWidth) * 2 - 1;
        const y = -(touch.clientY / window.innerHeight) * 2 + 1;
        mouseRef.current.targetX = x;
        mouseRef.current.targetY = y;
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    // 9. Render & Animation Loop
    let currentBladeAngle = 0;
    let cameraZ = 4.4;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // 3D Lens tilt based on cursor
      lensGroup.rotation.y = mouseRef.current.x * 0.28;
      lensGroup.rotation.x = -mouseRef.current.y * 0.28;
      lensGroup.position.x = mouseRef.current.x * 0.15;
      lensGroup.position.y = mouseRef.current.y * 0.15;

      // Move flare light to track cursor for realistic glass glint
      flareLight.position.x = mouseRef.current.x * 2.2;
      flareLight.position.y = mouseRef.current.y * 2.2;

      // Calculate Target Blade Angle based on progress
      // Progress 0: closed (angle ~ 0.0 rad)
      // Progress 1: fully dilated (angle ~ 0.98 rad)
      const p = progressRef.current;
      const targetAngle = p * 0.98;
      currentBladeAngle += (targetAngle - currentBladeAngle) * 0.08;

      bladeMeshes.forEach((bladePivot, idx) => {
        const baseAngle = (idx / NUM_BLADES) * Math.PI * 2 + Math.PI * 0.52;
        bladePivot.rotation.z = baseAngle + currentBladeAngle;
      });

      // Subtle atmospheric breathing rotation
      lensGroup.rotation.z = Math.sin(Date.now() * 0.0008) * 0.04;

      // Push-through camera zoom on completion
      if (isDoneRef.current) {
        cameraZ += (0.8 - cameraZ) * 0.08;
        camera.position.z = cameraZ;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 10. Resize observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);

      bladeGeo.dispose();
      outerBarrelGeo.dispose();
      goldRingGeo.dispose();
      innerGoldRingGeo.dispose();
      baffleGeo.dispose();
      glassGeo.dispose();

      barrelMaterial.dispose();
      goldAccentMaterial.dispose();
      bladeMaterial.dispose();
      frontGlassMaterial.dispose();

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`relative h-full w-full overflow-hidden select-none pointer-events-none ${className}`}
    />
  );
}
