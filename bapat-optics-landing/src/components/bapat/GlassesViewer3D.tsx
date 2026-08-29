import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RotateCw, RotateCcw, ZoomIn, ZoomOut, Sparkles } from "lucide-react";

interface GlassesViewer3DProps {
  modelUrl?: string;
  className?: string;
}

export function GlassesViewer3D({
  modelUrl = "/models/Glasses.glb",
  className = "",
}: GlassesViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 2.5);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 1.0;
    controls.maxDistance = 5.0;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.8;
    controlsRef.current = controls;

    // 5. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff3db, 2.5);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd4af37, 1.8);
    fillLight.position.set(-3, 2, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x8ec5fc, 2.0);
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    const bottomLight = new THREE.DirectionalLight(0xd4af37, 0.8);
    bottomLight.position.set(0, -3, 1);
    scene.add(bottomLight);

    // 6. Load GLTF / GLB Model
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;

        // Auto-center and normalize size
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.6 / (maxDim || 1);
        model.scale.setScalar(scale);

        // Re-center model
        box.setFromObject(model);
        box.getCenter(center);
        model.position.sub(center);

        // Polish materials for realistic optical glass and metal/acetate sheen
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.envMapIntensity = 1.5;
              mat.needsUpdate = true;
            }
          }
        });

        scene.add(model);
        setLoading(false);
      },
      undefined,
      (error) => {
        console.error("Error loading GLTF model:", error);
        setLoadError("Failed to load 3D model");
        setLoading(false);
      }
    );

    // 7. Animation loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 8. Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelUrl]);

  // Handle autoRotate state sync
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 0.4, 2.5);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  const handleZoom = (delta: number) => {
    if (cameraRef.current && controlsRef.current) {
      const dir = new THREE.Vector3();
      cameraRef.current.getWorldDirection(dir);
      cameraRef.current.position.addScaledVector(dir, delta);
      controlsRef.current.update();
    }
  };

  return (
    <div className={`relative flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-obsidian ${className}`}>
      {/* Background Radial Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.22)_0%,transparent_70%)]" />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-obsidian/90 backdrop-blur-md">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          <p className="eyebrow mt-3 text-[10px] tracking-widest text-gold">Loading 3D Model...</p>
        </div>
      )}

      {/* Error Fallback */}
      {loadError && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4 text-center text-xs text-red-400">
          {loadError}
        </div>
      )}

      {/* Canvas Mount Target */}
      <div
        ref={containerRef}
        className="h-full w-full cursor-grab active:cursor-grabbing"
      />

      {/* Floating HUD Controls */}
      <div className="pointer-events-auto absolute bottom-3.5 left-3.5 right-3.5 z-10 flex items-center justify-between rounded-xl border border-paper/15 bg-obsidian/80 px-3.5 py-2 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoRotate((prev) => !prev)}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[9px] uppercase tracking-wider transition-colors ${
              autoRotate
                ? "border-gold bg-gold/20 text-gold"
                : "border-paper/20 bg-paper/5 text-paper hover:border-gold hover:text-gold"
            }`}
          >
            <RotateCw size={10} className={autoRotate ? "animate-spin" : ""} style={autoRotate ? { animationDuration: "6s" } : undefined} />
            <span>{autoRotate ? "Auto Spin" : "Orbit Mode"}</span>
          </button>

          <button
            type="button"
            onClick={handleResetCamera}
            title="Reset View"
            aria-label="Reset View"
            className="rounded-md border border-paper/20 bg-paper/5 p-1 text-paper transition-colors hover:border-gold hover:text-gold"
          >
            <RotateCcw size={11} />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleZoom(0.3)}
            title="Zoom In"
            aria-label="Zoom In"
            className="rounded-md border border-paper/20 bg-paper/5 p-1 text-paper transition-colors hover:border-gold hover:text-gold"
          >
            <ZoomIn size={11} />
          </button>
          <button
            type="button"
            onClick={() => handleZoom(-0.3)}
            title="Zoom Out"
            aria-label="Zoom Out"
            className="rounded-md border border-paper/20 bg-paper/5 p-1 text-paper transition-colors hover:border-gold hover:text-gold"
          >
            <ZoomOut size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}
