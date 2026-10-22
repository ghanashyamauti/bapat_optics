import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';
import {
  X,
  Camera,
  RefreshCw,
  Download,
  Sparkles,
  Sliders,
  ShoppingBag,
  MessageCircle,
  Check,
  AlertCircle,
  Video,
  ImageOff
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types/store';

// ==============================================================================
// Stable Facial Landmark Indices (MediaPipe FaceMesh 478 landmarks)
// ==============================================================================
const NOSE_BRIDGE = 168;     // Midpoint between eyes on nasal bone (rigid skull anchor)
const NOSE_MID = 6;          // Secondary bridge landmark
const RIGHT_EYE_OUTER = 33;  // Lateral canthus of user's right eye
const LEFT_EYE_OUTER = 263;  // Lateral canthus of user's left eye
const RIGHT_PUPIL = 468;
const LEFT_PUPIL = 473;
const RIGHT_TEMPLE = 234;    // Right zygomatic arch / cheek margin
const LEFT_TEMPLE = 454;     // Left zygomatic arch / cheek margin
const RIGHT_EAR_TRAGUS = 127; // Preauricular notch near right tragus
const LEFT_EAR_TRAGUS = 356;  // Preauricular notch near left tragus
const RIGHT_EAR_TOP = 162;    // Right upper temporal hairline near ear attachment
const LEFT_EAR_TOP = 389;     // Left upper temporal hairline near ear attachment
const FOREHEAD_TOP = 10;     // Frontal bone near trichion
const CHIN_BOTTOM = 152;     // Gnathion
const JAW_LEFT = 172;
const JAW_RIGHT = 397;

type LensMode = 'CLEAR' | 'BLUEBLOCK' | 'PHOTOFUSION';

// Cached singleton for MediaPipe FaceLandmarker to avoid repeated initialization
let cachedLandmarker: FaceLandmarker | null = null;
let landmarkerPromise: Promise<FaceLandmarker | null> | null = null;

async function getOrInitLandmarker(onProgress?: (msg: string) => void): Promise<FaceLandmarker | null> {
  if (cachedLandmarker) return cachedLandmarker;
  if (landmarkerPromise) return landmarkerPromise;

  landmarkerPromise = (async () => {
    try {
      if (onProgress) onProgress('Loading MediaPipe Vision Engine...');

      let vision: any;
      try {
        vision = await FilesetResolver.forVisionTasks('/mediapipe-wasm');
      } catch {
        vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
      }

      if (onProgress) onProgress('Calibrating 478 3D Facial Landmarks...');

      let landmarker: FaceLandmarker;
      const localModelPath = '/models/face_landmarker.task';
      const cdnModelPath = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

      const createLandmarker = async (path: string, delegate: 'GPU' | 'CPU') => {
        return await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: path,
            delegate: delegate,
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          minFaceDetectionConfidence: 0.35,
          minFacePresenceConfidence: 0.35,
          minTrackingConfidence: 0.35,
        });
      };

      try {
        // High-performance hardware acceleration via GPU delegate
        landmarker = await createLandmarker(localModelPath, 'GPU');
      } catch (gpuErr) {
        console.warn('Local GPU delegate fallback to CPU:', gpuErr);
        try {
          landmarker = await createLandmarker(localModelPath, 'CPU');
        } catch (localErr) {
          console.warn('Local model fallback to CDN:', localErr);
          try {
            landmarker = await createLandmarker(cdnModelPath, 'GPU');
          } catch {
            landmarker = await createLandmarker(cdnModelPath, 'CPU');
          }
        }
      }

      cachedLandmarker = landmarker;
      return landmarker;
    } catch (err) {
      console.error('Failed to initialize FaceLandmarker:', err);
      landmarkerPromise = null;
      throw err;
    }
  })();

  return landmarkerPromise;
}

interface ProcessedAsset {
  canvas: CanvasImageSource;
  aspect: number;
  cropBounds?: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    naturalW: number;
    naturalH: number;
  };
}

// In-memory cache for processed transparent eyewear canvases
const processedImageCache = new Map<string, ProcessedAsset>();

// Clean background & detect transparent bounds without changing coordinates
function processEyewearImage(img: HTMLImageElement): ProcessedAsset {
  try {
    const naturalW = img.naturalWidth || img.width;
    const naturalH = img.naturalHeight || img.height;
    if (naturalW === 0 || naturalH === 0) {
      return { canvas: img, aspect: 2.5 };
    }

    const canvas = document.createElement('canvas');
    canvas.width = naturalW;
    canvas.height = naturalH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { canvas: img, aspect: naturalW / naturalH };

    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Check if image already has native transparent alpha (>12% transparent pixels)
    let transparentPixels = 0;
    const totalPixels = canvas.width * canvas.height;
    const step = Math.max(1, Math.floor(totalPixels / 1000));
    for (let i = 3; i < data.length; i += 4 * step) {
      if (data[i] < 30) transparentPixels++;
    }
    const hasTrueAlpha = (transparentPixels / (totalPixels / step)) > 0.12;

    if (!hasTrueAlpha) {
      // Strip neutral solid white or fake checkerboard square pixels
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const isNeutral = Math.abs(r - g) < 22 && Math.abs(g - b) < 22 && Math.abs(r - b) < 22;

        if (isNeutral && r > 185 && g > 185 && b > 185) {
          data[i + 3] = 0; // Transparent
        } else if (isNeutral && r > 165 && g > 165 && b > 165) {
          data[i + 3] = Math.round(((185 - r) / 20) * 255);
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    // Auto-detect tight bounding box of visible eyewear content
    let minX = naturalW;
    let maxX = -1;
    let minY = naturalH;
    let maxY = -1;

    for (let y = 0; y < naturalH; y++) {
      for (let x = 0; x < naturalW; x++) {
        const idx = (y * naturalW + x) * 4;
        if (data[idx + 3] > 25) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // If visible content was found, crop out empty transparent margins
    if (maxX > minX && maxY > minY) {
      const contentW = maxX - minX + 1;
      const contentH = maxY - minY + 1;

      // Only crop if there is meaningful padding (>3% margin) to preserve tight calibration
      const hasMeaningfulPadding =
        contentW < naturalW * 0.97 ||
        contentH < naturalH * 0.97 ||
        minX > naturalW * 0.015 ||
        minY > naturalH * 0.015;

      if (hasMeaningfulPadding) {
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = contentW;
        croppedCanvas.height = contentH;
        const cropCtx = croppedCanvas.getContext('2d');
        if (cropCtx) {
          cropCtx.drawImage(canvas, minX, minY, contentW, contentH, 0, 0, contentW, contentH);
          return {
            canvas: croppedCanvas,
            aspect: contentW / contentH,
            cropBounds: { minX, maxX, minY, maxY, naturalW, naturalH }
          };
        }
      }
    }

    return { canvas, aspect: canvas.width / canvas.height };
  } catch (e) {
    console.warn('Eyewear image processing fallback:', e);
    return { canvas: img, aspect: (img.naturalWidth && img.naturalHeight) ? img.naturalWidth / img.naturalHeight : 2.5 };
  }
}

// Normalize try-on image URL for dev proxy, absolute backend, or relative paths
function normalizeTryonUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // If local backend absolute URL, strip host so Vite proxy handles it smoothly without CORS
  if (trimmed.startsWith('http://127.0.0.1:8000/uploads/') || trimmed.startsWith('http://localhost:8000/uploads/')) {
    return trimmed.replace(/^https?:\/\/(127\.0\.0\.1|localhost):8000/, '');
  }

  // If already relative /uploads/, return as-is
  if (trimmed.startsWith('/uploads/')) {
    return trimmed;
  }

  // If external absolute URL (e.g. S3, Cloudinary, CDN), return as-is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // If bare filename, prefix /uploads/
  if (!trimmed.startsWith('/')) {
    return `/uploads/${trimmed}`;
  }

  return trimmed;
}

// Check whether an asset URL points to a 3D model (GLB or GLTF)
function is3DModelAsset(url?: string | null): boolean {
  if (!url) return false;
  const clean = url.split('?')[0].toLowerCase();
  return clean.endsWith('.glb') || clean.endsWith('.gltf');
}

// Shortest-path angular difference for smooth circular rotation updates
function diffAngle(target: number, current: number): number {
  let diff = (target - current) % (Math.PI * 2);
  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

interface TryOnContentProps {
  product: Product;
}

const VirtualTryOnModalContent: React.FC<TryOnContentProps> = ({ product: initialProduct }) => {
  const {
    virtualTryOnProduct,
    setVirtualTryOnProduct,
    products,
    addToCart,
    showToast
  } = useStore();

  const activeProduct = virtualTryOnProduct || initialProduct;
  const is3D = is3DModelAsset(activeProduct.tryon_image_url) || activeProduct.tryon_asset_type === '3d';

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Three.js 3D Eyewear Model Refs
  const threeRendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const threeSceneRef = useRef<THREE.Scene | null>(null);
  const threeCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const threeModelGroupRef = useRef<THREE.Group | null>(null);
  const modelBoundingWidthRef = useRef<number>(1.0);
  const loadedModelUrlRef = useRef<string | null>(null);

  // Camera & Model State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isLoadingModel, setIsLoadingModel] = useState(true);
  const [modelProgressText, setModelProgressText] = useState('Initializing Vision AI...');

  // Active Eyewear Try-On Asset State (Front View / 3D Model)
  const [isAssetLoading, setIsAssetLoading] = useState(false);
  const [assetLoadError, setAssetLoadError] = useState<string | null>(null);
  const frameImageRef = useRef<CanvasImageSource | null>(null);
  const frameAspectRef = useRef<number>(2.5);
  const frameCropBoundsRef = useRef<ProcessedAsset['cropBounds'] | null>(null);

  // Customization & User Fit Calibration
  const [userScaleOffset, setUserScaleOffset] = useState(1.0);
  const [userYOffset, setUserYOffset] = useState(0);
  const [lensMode, setLensMode] = useState<LensMode>('CLEAR');
  const [showAdjustPanel, setShowAdjustPanel] = useState(false);

  // Optical AI Metrics
  const [detectedFaceShape, setDetectedFaceShape] = useState<string>('Detecting Face...');
  const [faceMatchScore, setFaceMatchScore] = useState<number>(96);
  const [detectedIpdMm, setDetectedIpdMm] = useState<number>(63);
  const [isFaceTracked, setIsFaceTracked] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);

  // High-performance tracking loop refs
  const landmarkerInstanceRef = useRef<FaceLandmarker | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const lastVideoTimeRef = useRef<number>(-1);
  const lastDetectionTimeRef = useRef<number>(0);
  const isDetectingRef = useRef<boolean>(false);
  const isFaceTrackedRef = useRef<boolean>(false);
  const lastMetricsTimeRef = useRef<number>(0);
  const detectedIpdMmRef = useRef<number>(63);
  const detectedFaceShapeRef = useRef<string>('');
  const faceMatchScoreRef = useRef<number>(96);

  // Camera hardware video frame delivery tracking
  const rvfcIdRef = useRef<number | null>(null);
  const hasNewCameraFrameRef = useRef<boolean>(false);

  // Velocity tracking & predictive latency compensation (feed-forward)
  const trackingVelocityRef = useRef({
    vx: 0,
    vy: 0,
    vyaw: 0,
    vroll: 0,
    vpitch: 0,
    lastX: 0,
    lastY: 0,
    lastYaw: 0,
    lastRoll: 0,
    lastPitch: 0,
    lastTime: 0,
    prevVx: 0,
    prevVyaw: 0,
    isReversingX: false,
    isReversingYaw: false,
    initialized: false
  });

  // Cached Three.js lens meshes for zero-traversal 60 FPS rendering
  const threeLensMeshesRef = useRef<THREE.Mesh[]>([]);
  const effectiveAnchorRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.45 });

  // Sync refs to avoid restarting renderLoop on user adjustment or re-renders
  const userScaleOffsetRef = useRef(userScaleOffset);
  const userYOffsetRef = useRef(userYOffset);
  const lensModeRef = useRef(lensMode);
  const activeProductRef = useRef(activeProduct);
  const is3DRef = useRef(is3D);

  useEffect(() => { userScaleOffsetRef.current = userScaleOffset; }, [userScaleOffset]);
  useEffect(() => { userYOffsetRef.current = userYOffset; }, [userYOffset]);
  useEffect(() => { lensModeRef.current = lensMode; }, [lensMode]);
  useEffect(() => { activeProductRef.current = activeProduct; }, [activeProduct]);
  useEffect(() => { is3DRef.current = is3D; }, [is3D]);

  // Pre-allocated Three.js lens coating configurations
  const THREE_LENS_CONFIG = useMemo(() => ({
    BLUEBLOCK: { color: new THREE.Color(0x99bbff), opacity: 0.85 },
    PHOTOFUSION: { color: new THREE.Color(0x222233), opacity: 0.9 },
    CLEAR: { color: new THREE.Color(0xffffff), opacity: 0.65 },
  }), []);

  const apply3DLensMode = useCallback((mode: LensMode) => {
    const conf = THREE_LENS_CONFIG[mode] || THREE_LENS_CONFIG.CLEAR;
    threeLensMeshesRef.current.forEach((mesh) => {
      if (mesh.material) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((mat: any) => {
          mat.color = conf.color;
          mat.opacity = conf.opacity;
          mat.needsUpdate = true;
        });
      }
    });
  }, [THREE_LENS_CONFIG]);

  useEffect(() => {
    apply3DLensMode(lensMode);
  }, [lensMode, apply3DLensMode]);

  // Target pose from latest landmark detection
  const targetPoseRef = useRef({
    x: 0,
    y: 0,
    width: 250,
    height: 100,
    angle: 0,
    yaw: 0,
    pitch: 0,
    hasTarget: false
  });

  // Smooth lerp state (adaptive One-Euro style velocity responsive delta-time filtering)
  const smoothPoseRef = useRef({
    x: 0,
    y: 0,
    width: 250,
    height: 100,
    angle: 0,
    yaw: 0,
    pitch: 0,
    active: false,
    framesSinceDetection: 0
  });

  // Eyewear catalog for quick trial switcher carousel (wearable frames & sunglasses only)
  const eyewearCatalog = useMemo(() => {
    return products.filter((p) => {
      const slug = p.category?.slug;
      const isEyewear = slug === 'spectacle-frames' || slug === 'sunglasses' || slug === 'meta' || slug === 'kids';
      return isEyewear && !!p.tryon_image_url;
    });
  }, [products]);

  // Format currency helper
  const formatPrice = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  // ============================================================================
  // 1. Three.js 3D WebGL Renderer Lifecycle Setup
  // ============================================================================
  useEffect(() => {
    const canvas = threeCanvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(0, 300, 400);
    scene.add(keyLight);

    const fillLeft = new THREE.DirectionalLight(0xe0e7ff, 1.2);
    fillLeft.position.set(-300, 100, 250);
    scene.add(fillLeft);

    const fillRight = new THREE.DirectionalLight(0xffedd5, 1.2);
    fillRight.position.set(300, 100, 250);
    scene.add(fillRight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.7);
    rimLight.position.set(0, -200, 200);
    scene.add(rimLight);

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 5000);

    threeRendererRef.current = renderer;
    threeSceneRef.current = scene;
    threeCameraRef.current = camera;
    threeModelGroupRef.current = modelGroup;

    return () => {
      renderer.dispose();
      threeRendererRef.current = null;
      threeSceneRef.current = null;
      threeCameraRef.current = null;
      threeModelGroupRef.current = null;
    };
  }, []);

  // ============================================================================
  // 2. Load Product-Specific Try-On Cutouts (2D PNG) or 3D Glasses Models (GLB)
  // ============================================================================
  useEffect(() => {
    let isCancelled = false;

    const rawFrontUrl = activeProduct.tryon_image_url;
    const normalizedFrontUrl = normalizeTryonUrl(rawFrontUrl);
    const productIs3D = is3DModelAsset(rawFrontUrl) || activeProduct.tryon_asset_type === '3d';

    if (!normalizedFrontUrl) {
      frameImageRef.current = null;
      if (threeModelGroupRef.current) threeModelGroupRef.current.clear();
      loadedModelUrlRef.current = null;
      setAssetLoadError('No Virtual Try-On asset configured for this product in Admin Portal.');
      setIsAssetLoading(false);
      return;
    }

    // --- CASE A: 3D Glasses Model (.glb / .gltf) ---
    if (productIs3D) {
      frameImageRef.current = null;

      if (loadedModelUrlRef.current === normalizedFrontUrl && threeModelGroupRef.current?.children.length) {
        setAssetLoadError(null);
        setIsAssetLoading(false);
      } else {
        setIsAssetLoading(true);
        setAssetLoadError(null);
        if (threeModelGroupRef.current) threeModelGroupRef.current.clear();

        const loader = new GLTFLoader();
        loader.load(
          normalizedFrontUrl,
          (gltf) => {
            if (isCancelled) return;
            const model = gltf.scene;

            // 1. Identify key eyewear components: front frame, lenses, and frame material
            // Checks mesh, parent node, and material names to support standard FBX/GLTF/Collada models
            let frontMesh: THREE.Mesh | null = null;
            let lensMesh: THREE.Mesh | null = null;
            let frameMat: THREE.Material | null = null;

            model.traverse((child: any) => {
              if (child.isMesh) {
                const names = [
                  child.name || '',
                  child.parent?.name || '',
                  child.parent?.parent?.name || '',
                  child.material?.name || ''
                ].join(' ').toLowerCase();

                const isLens = names.includes('lens') || names.includes('glass') || names.includes('lente') || names.includes('verre') || names.includes('cristal');
                const isFrame = names.includes('frame') || names.includes('main') || names.includes('front') || names.includes('armacao') || names.includes('montura') || names.includes('rim');

                if (isLens) {
                  if (!lensMesh) lensMesh = child;
                } else if (isFrame) {
                  if (!frontMesh) frontMesh = child;
                  if (child.material && !frameMat) frameMat = child.material;
                }
                if (!frameMat && child.material && !isLens) {
                  frameMat = child.material;
                }
              }
            });

            // 2. Detect and correct coordinate orientation:
            // Standard eyewear convention requires width along X, height along Y, and temples extending along -Z.
            // Some GLB files (e.g. FBX/Collada exports) have front frame width along Z and temples along +/-X.
            const rawBox = new THREE.Box3().setFromObject(model);
            const rawSize = rawBox.getSize(new THREE.Vector3());

            const frontRef = frontMesh || lensMesh;
            let needsRotateY = false;
            if (frontRef) {
              const fSize = new THREE.Box3().setFromObject(frontRef).getSize(new THREE.Vector3());
              // A front frame or lens is a wide, flat structure: its width dimension is significantly larger than its thickness.
              // If its Z extent is larger than its X extent, the front frame width is along Z instead of X.
              if (fSize.z > fSize.x * 1.5) {
                needsRotateY = true;
              }
            } else if (rawSize.z > rawSize.x * 1.2) {
              needsRotateY = true;
            }

            if (needsRotateY) {
              // Rotate around Y so width aligns with X and temples align with -Z
              model.rotation.y = -Math.PI / 2;
              model.updateMatrixWorld(true);

              // Verify whether temples extend backward along -Z towards ears or forward towards camera.
              // In standard orientation, front frame is closer to +Z, and temples extend backward towards -Z.
              const checkRef = frontMesh || lensMesh;
              if (checkRef) {
                const testBox = new THREE.Box3().setFromObject(model);
                const testSize = testBox.getSize(new THREE.Vector3());
                const refBox = new THREE.Box3().setFromObject(checkRef);

                const extendsForward = (testBox.max.z - refBox.max.z) > (testSize.z * 0.15);
                const extendsBackward = (refBox.min.z - testBox.min.z) > (testSize.z * 0.15);

                // If temples extend forward (+Z) instead of backward (-Z), flip 180 degrees to +PI/2
                if (extendsForward && !extendsBackward) {
                  model.rotation.y = Math.PI / 2;
                  model.updateMatrixWorld(true);
                }
              }
            }

            // 3. Compute normalized bounding box and nasal bridge center
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            const activeFrontRef = frontMesh || lensMesh;
            const frontCenter = activeFrontRef
              ? new THREE.Box3().setFromObject(activeFrontRef).getCenter(new THREE.Vector3())
              : new THREE.Vector3(center.x, center.y, box.max.z);

            // Nose bridge is horizontally centered on the frame symmetry axis (center.x),
            // vertically aligned with the front frame (frontCenter.y),
            // and anchored at the front frame plane in depth (frontCenter.z).
            const bridgeAnchor = new THREE.Vector3(center.x, frontCenter.y, frontCenter.z);

            // Center horizontally (X) and vertically (Y) on the front bridge,
            // and anchor front frame at Z = 0 so temples rotate naturally back towards the ears
            model.position.x = -bridgeAnchor.x;
            model.position.y = -bridgeAnchor.y;
            model.position.z = -bridgeAnchor.z;

            const pivot = new THREE.Group();
            pivot.rotation.order = 'YXZ';
            pivot.add(model);

            modelBoundingWidthRef.current = Math.max(0.001, size.x);

            // 4. Enhance materials & correct temple material assignments
            const detectedLensMeshes: THREE.Mesh[] = [];
            model.traverse((child: any) => {
              if (child.isMesh && child.material) {
                child.castShadow = false;
                child.receiveShadow = false;

                const names = [
                  child.name || '',
                  child.parent?.name || '',
                  child.material?.name || ''
                ].join(' ').toLowerCase();

                // If a temple arm body is incorrectly using a gold/screw material while the glasses
                // have black/dark temples, assign the product's original frame material
                const isTempleArm = (names.includes('dushka') || names.includes('handle') || names.includes('temple') || names.includes('haste') || names.includes('arm')) &&
                                    !names.includes('vint') && !names.includes('screw') && !names.includes('hinge') && !names.includes('kr');
                const isGoldMat = names.includes('metal_2') || names.includes('gold') || names.includes('brass');

                if (isTempleArm && isGoldMat && frameMat) {
                  child.material = frameMat;
                }

                // Transparent lenses: disable depthWrite and elevate renderOrder to prevent depth-buffer clipping
                if (names.includes('lens') || names.includes('glass') || names.includes('lente') || names.includes('verre') || names.includes('cristal')) {
                  child.material.transparent = true;
                  child.material.depthWrite = false;
                  child.renderOrder = 2;
                  detectedLensMeshes.push(child);
                }

                if (child.material.isMeshStandardMaterial || child.material.isMeshPhysicalMaterial) {
                  child.material.envMapIntensity = 1.3;
                  child.material.needsUpdate = true;
                }
              }
            });

            threeLensMeshesRef.current = detectedLensMeshes;
            apply3DLensMode(lensModeRef.current);

            if (threeModelGroupRef.current) {
              threeModelGroupRef.current.clear();
              threeModelGroupRef.current.add(pivot);
            }
            loadedModelUrlRef.current = normalizedFrontUrl;
            setAssetLoadError(null);
            setIsAssetLoading(false);
          },
          undefined,
          (err) => {
            if (isCancelled) return;
            console.warn('GLTFLoader error:', err);
            if (threeModelGroupRef.current) threeModelGroupRef.current.clear();
            loadedModelUrlRef.current = null;
            setAssetLoadError(`Failed to load 3D glasses model (${normalizedFrontUrl}). Please verify file in Admin Portal.`);
            setIsAssetLoading(false);
          }
        );
      }

      return () => {
        isCancelled = true;
      };
    }

    // --- CASE B: 2D Front & Side View PNG Cutouts ---
    if (threeModelGroupRef.current) threeModelGroupRef.current.clear();
    loadedModelUrlRef.current = null;

    const updateEffectiveAnchor = (crop: ProcessedAsset['cropBounds'] | null) => {
      const rawAnchorX = activeProduct.tryon_bridge_x ?? 0.5;
      const rawAnchorY = activeProduct.tryon_bridge_y ?? 0.45;
      if (crop) {
        const contentW = crop.maxX - crop.minX + 1;
        const contentH = crop.maxY - crop.minY + 1;
        effectiveAnchorRef.current = {
          x: Math.max(0.05, Math.min(0.95, (rawAnchorX * crop.naturalW - crop.minX) / contentW)),
          y: Math.max(0.05, Math.min(0.95, (rawAnchorY * crop.naturalH - crop.minY) / contentH)),
        };
      } else {
        effectiveAnchorRef.current = { x: rawAnchorX, y: rawAnchorY };
      }
    };

    // --- Front View PNG ---
    if (processedImageCache.has(normalizedFrontUrl)) {
      const cached = processedImageCache.get(normalizedFrontUrl)!;
      frameImageRef.current = cached.canvas;
      frameAspectRef.current = cached.aspect;
      frameCropBoundsRef.current = cached.cropBounds || null;
      updateEffectiveAnchor(cached.cropBounds || null);
      setAssetLoadError(null);
      setIsAssetLoading(false);
    } else {
      setIsAssetLoading(true);
      setAssetLoadError(null);
      frameImageRef.current = null;
      frameCropBoundsRef.current = null;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = normalizedFrontUrl;

      img.onload = () => {
        if (isCancelled) return;
        const processed = processEyewearImage(img);
        processedImageCache.set(normalizedFrontUrl, processed);
        frameImageRef.current = processed.canvas;
        frameAspectRef.current = processed.aspect;
        frameCropBoundsRef.current = processed.cropBounds || null;
        updateEffectiveAnchor(processed.cropBounds || null);
        setAssetLoadError(null);
        setIsAssetLoading(false);
      };

      img.onerror = () => {
        if (isCancelled) return;
        frameImageRef.current = null;
        frameCropBoundsRef.current = null;
        setAssetLoadError(`Failed to load front try-on asset (${normalizedFrontUrl}). Please verify file in Admin Portal.`);
        setIsAssetLoading(false);
      };
    }

    return () => {
      isCancelled = true;
    };
  }, [activeProduct, is3D]);

  // ============================================================================
  // 2. Camera Stream Lifecycle Management with Adaptive Fallbacks
  // ============================================================================
  const stopCamera = useCallback(() => {
    if (rvfcIdRef.current !== null && videoRef.current && 'cancelVideoFrameCallback' in videoRef.current) {
      try {
        (videoRef.current as any).cancelVideoFrameCallback(rvfcIdRef.current);
      } catch {}
      rvfcIdRef.current = null;
    }
    hasNewCameraFrameRef.current = false;
    trackingVelocityRef.current.initialized = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Track stop warning:', e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API (getUserMedia) is not supported in this browser or context.');
      return;
    }

    try {
      let stream: MediaStream | null = null;
      try {
        // Preferred HD stream
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (hdErr: any) {
        console.warn('HD stream constraint failed, falling back to basic camera:', hdErr);
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode },
            audio: false,
          });
        } catch {
          // Last resort fallback
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }

      if (!stream) {
        throw new Error('Failed to obtain MediaStream');
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.playsInline = true;
        videoRef.current.muted = true;

        await new Promise<void>((resolve) => {
          if (!videoRef.current) return resolve();
          if (videoRef.current.readyState >= 2) {
            resolve();
          } else {
            videoRef.current.onloadedmetadata = () => resolve();
          }
        });

        await videoRef.current.play();
        setIsCameraActive(true);

        // Hardware video frame delivery hook via requestVideoFrameCallback (bypasses currentTime jitter)
        if ('requestVideoFrameCallback' in videoRef.current) {
          const handleVideoFrame = () => {
            hasNewCameraFrameRef.current = true;
            if (videoRef.current && 'requestVideoFrameCallback' in videoRef.current) {
              rvfcIdRef.current = (videoRef.current as any).requestVideoFrameCallback(handleVideoFrame);
            }
          };
          rvfcIdRef.current = (videoRef.current as any).requestVideoFrameCallback(handleVideoFrame);
        }
      }
    } catch (err: any) {
      console.error('Camera initialization error:', err);
      let userMsg = 'Unable to access your camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        userMsg = 'Camera permission was denied. Please click the lock icon in your address bar and allow camera access.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        userMsg = 'No camera hardware detected on this device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        userMsg = 'Camera is currently in use by another application. Please close other camera tabs or apps and try again.';
      } else if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        userMsg = 'Camera access requires a secure HTTPS connection or localhost.';
      }
      setCameraError(userMsg);
      setIsCameraActive(false);
    }
  }, [facingMode, stopCamera]);

  // Flip Camera Front / Back
  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Close modal cleanup
  const handleClose = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    stopCamera();
    trackingVelocityRef.current.initialized = false;
    setCapturedSnapshot(null);
    setVirtualTryOnProduct(null);
  }, [stopCamera, setVirtualTryOnProduct]);

  // Start camera immediately on mount and on facingMode toggle
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // ============================================================================
  // 3. Initialize MediaPipe FaceLandmarker
  // ============================================================================
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        setIsLoadingModel(true);
        const landmarker = await getOrInitLandmarker(setModelProgressText);
        if (!isMounted) return;
        landmarkerInstanceRef.current = landmarker;
        setIsLoadingModel(false);
      } catch (err) {
        console.error('MediaPipe initialization error:', err);
        if (isMounted) {
          setCameraError('Failed to load FaceLandmarker vision model. Please check network connectivity.');
          setIsLoadingModel(false);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate Optician Metrics: Face Shape & Pupillary Distance (IPD)
  // Throttled & guarded to eliminate 60 FPS re-renders
  const calculateFaceMetrics = (landmarks: any[], vidW: number, vidH: number) => {
    const rPupil = landmarks[RIGHT_PUPIL];
    const lPupil = landmarks[LEFT_PUPIL];

    if (rPupil && lPupil) {
      const dx = (lPupil.x - rPupil.x) * vidW;
      const dy = (lPupil.y - rPupil.y) * vidH;
      const pixelDist = Math.sqrt(dx * dx + dy * dy);
      const estimatedMm = Math.round(Math.min(72, Math.max(56, 63 + (pixelDist - 65) * 0.15)));
      if (Math.abs(estimatedMm - detectedIpdMmRef.current) >= 1) {
        detectedIpdMmRef.current = estimatedMm;
        setDetectedIpdMm(estimatedMm);
      }
    }

    const forehead = landmarks[FOREHEAD_TOP];
    const chin = landmarks[CHIN_BOTTOM];
    const leftCheek = landmarks[LEFT_TEMPLE];
    const rightCheek = landmarks[RIGHT_TEMPLE];
    const jawL = landmarks[JAW_LEFT];
    const jawR = landmarks[JAW_RIGHT];

    if (forehead && chin && leftCheek && rightCheek && jawL && jawR) {
      const faceHeight = Math.abs(chin.y - forehead.y) * vidH;
      const faceWidth = Math.abs(rightCheek.x - leftCheek.x) * vidW;
      const jawWidth = Math.abs(jawR.x - jawL.x) * vidW;

      const ratio = faceHeight / (faceWidth || 1);

      let shape = '';
      let score = 95;
      if (ratio > 1.45) {
        shape = 'Oval Face (Optimal Frame Fit)';
        score = 98;
      } else if (ratio < 1.15) {
        shape = 'Round Face (Angular Rims Suit Best)';
        score = 94;
      } else if (jawWidth / faceWidth > 0.85) {
        shape = 'Square Face (Curved Rims Soften Features)';
        score = 96;
      } else {
        shape = 'Heart / Diamond Face (Classic Proportions)';
        score = 95;
      }

      if (shape !== detectedFaceShapeRef.current) {
        detectedFaceShapeRef.current = shape;
        setDetectedFaceShape(shape);
      }
      if (score !== faceMatchScoreRef.current) {
        faceMatchScoreRef.current = score;
        setFaceMatchScore(score);
      }
    }
  };

  // ============================================================================
  // 4. Real-Time 60 FPS Decoupled Face Tracking & Glasses Render Loop
  // ============================================================================
  useEffect(() => {
    if (isLoadingModel || cameraError) return;

    let isRunning = true;

    const renderLoop = () => {
      if (!isRunning) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const landmarker = landmarkerInstanceRef.current;

      if (
        video &&
        video.readyState >= 2 &&
        video.videoWidth > 0 &&
        video.videoHeight > 0 &&
        canvas &&
        !video.paused
      ) {
        const vidW = video.videoWidth;
        const vidH = video.videoHeight;
        const now = performance.now();

        // Synchronize internal 2D canvas resolution only when changed
        if (canvas.width !== vidW || canvas.height !== vidH) {
          canvas.width = vidW;
          canvas.height = vidH;
        }

        // Precise delta-time calculation normalized to 60 FPS reference (dt = 0.01667s)
        const lastFrameTime = lastFrameTimeRef.current || now;
        const dt = Math.min(0.08, Math.max(0.001, (now - lastFrameTime) / 1000));
        lastFrameTimeRef.current = now;
        const timeFactor = dt / 0.016667;

        // 1. Decoupled Frame Processing: Only run inference when webcam provides a new frame
        const currentVideoTime = video.currentTime;
        const hasNewFrame = hasNewCameraFrameRef.current || (currentVideoTime !== lastVideoTimeRef.current && currentVideoTime > 0);
        hasNewCameraFrameRef.current = false;
        const timeSinceDetection = now - lastDetectionTimeRef.current;
        // Run inference promptly on every newly delivered video frame (fallback to >=25ms for 30-40 FPS webcams)
        const shouldDetect = (hasNewFrame || timeSinceDetection >= 25) && !isDetectingRef.current;

        if (landmarker && shouldDetect) {
          isDetectingRef.current = true;
          lastVideoTimeRef.current = currentVideoTime;
          lastDetectionTimeRef.current = now;

          try {
            let detectionTimestamp = now;
            if (detectionTimestamp <= lastTimestampRef.current) {
              detectionTimestamp = lastTimestampRef.current + 1;
            }
            lastTimestampRef.current = detectionTimestamp;

            const detections = landmarker.detectForVideo(video, detectionTimestamp);

            if (detections.faceLandmarks && detections.faceLandmarks.length > 0) {
              const landmarks = detections.faceLandmarks[0];

              // Mark tracked without triggering duplicate React state re-renders
              if (!isFaceTrackedRef.current) {
                isFaceTrackedRef.current = true;
                setIsFaceTracked(true);
              }

              // Throttle AI optical metrics calculation (every 600ms)
              if (now - lastMetricsTimeRef.current > 600) {
                lastMetricsTimeRef.current = now;
                calculateFaceMetrics(landmarks, vidW, vidH);
              }

              // Stable cranial landmarks
              const bridge = landmarks[NOSE_BRIDGE] || landmarks[NOSE_MID];
              const lEye = landmarks[LEFT_EYE_OUTER];
              const rEye = landmarks[RIGHT_EYE_OUTER];
              const lTemple = landmarks[LEFT_TEMPLE];
              const rTemple = landmarks[RIGHT_TEMPLE];
              const lPupil = landmarks[LEFT_PUPIL];
              const rPupil = landmarks[RIGHT_PUPIL];

              if (bridge && lEye && rEye) {
                // Eye span distance in 3D (rotation-invariant Euclidean distance)
                const eyeDx = (lEye.x - rEye.x) * vidW;
                const eyeDy = (lEye.y - rEye.y) * vidH;
                const eyeDz = ((lEye.z ?? 0) - (rEye.z ?? 0)) * vidW;
                const eyeSpan = Math.sqrt(eyeDx * eyeDx + eyeDy * eyeDy + eyeDz * eyeDz);

                // Pupillary distance in 3D
                let pupilDist = 0;
                if (lPupil && rPupil) {
                  const pDx = (lPupil.x - rPupil.x) * vidW;
                  const pDy = (lPupil.y - rPupil.y) * vidH;
                  const pDz = ((lPupil.z ?? 0) - (rPupil.z ?? 0)) * vidW;
                  pupilDist = Math.sqrt(pDx * pDx + pDy * pDy + pDz * pDz);
                }

                // Temple / zygomatic head width at eye level in 3D
                let templeDist = 0;
                if (lTemple && rTemple) {
                  const tDx = (lTemple.x - rTemple.x) * vidW;
                  const tDy = (lTemple.y - rTemple.y) * vidH;
                  const tDz = ((lTemple.z ?? 0) - (rTemple.z ?? 0)) * vidW;
                  templeDist = Math.sqrt(tDx * tDx + tDy * tDy + tDz * tDz);
                }

                // 1. Head Yaw (horizontal rotation in XZ plane)
                const eyeYaw = Math.atan2(eyeDz, eyeDx);
                const dL = Math.max(1, (lEye.x - bridge.x) * vidW);
                const dR = Math.max(1, (bridge.x - rEye.x) * vidW);
                const asymYaw = Math.atan2((dR - dL) * 1.8, dR + dL);
                const rawTargetYaw = eyeYaw * 0.60 + asymYaw * 0.40;
                const targetYaw = Math.max(-0.95, Math.min(0.95, rawTargetYaw));

                // 2. Head Roll (in-plane tilt in XY plane)
                const targetAngle = Math.atan2(eyeDy, eyeDx);

                // 3. Head Pitch (sagittal nod in YZ plane)
                const forehead = landmarks[FOREHEAD_TOP];
                const chin = landmarks[CHIN_BOTTOM];
                let targetPitch = 0;
                if (forehead && chin) {
                  const fDy = (chin.y - forehead.y) * vidH;
                  const fDz = ((chin.z ?? 0) - (forehead.z ?? 0)) * vidW;
                  targetPitch = Math.max(-0.65, Math.min(0.65, Math.atan2(fDz, Math.max(10, fDy))));
                }

                // Natural frame sizing (3D rotation-invariant)
                let naturalFrameWidth: number;
                if (pupilDist > 15 && templeDist > 20) {
                  const wPupils = pupilDist * 2.18;
                  const wTemples = templeDist * 1.02;
                  const wOuterEyes = eyeSpan * 1.44;
                  naturalFrameWidth = (wPupils * 0.40) + (wTemples * 0.30) + (wOuterEyes * 0.30);
                } else if (pupilDist > 15) {
                  naturalFrameWidth = (pupilDist * 2.18 * 0.60) + (eyeSpan * 1.44 * 0.40);
                } else {
                  naturalFrameWidth = eyeSpan * 1.44;
                }

                const currentProduct = activeProductRef.current;
                const adminScale = currentProduct?.tryon_scale ?? 1.0;
                const targetWidth = naturalFrameWidth * adminScale * userScaleOffsetRef.current;
                const aspect = frameAspectRef.current || 2.5;
                const targetHeight = targetWidth / aspect;

                const rawTargetX = bridge.x * vidW;
                const rawTargetY = bridge.y * vidH + userYOffsetRef.current;

                // Real-time velocity tracking and direction-reversal detection
                const vel = trackingVelocityRef.current;
                if (!vel.initialized) {
                  vel.vx = 0;
                  vel.vy = 0;
                  vel.vyaw = 0;
                  vel.vroll = 0;
                  vel.vpitch = 0;
                  vel.lastX = rawTargetX;
                  vel.lastY = rawTargetY;
                  vel.lastYaw = targetYaw;
                  vel.lastRoll = targetAngle;
                  vel.lastPitch = targetPitch;
                  vel.lastTime = now;
                  vel.prevVx = 0;
                  vel.prevVyaw = 0;
                  vel.isReversingX = false;
                  vel.isReversingYaw = false;
                  vel.initialized = true;
                } else {
                  const detDt = Math.max(0.005, Math.min(0.1, (now - vel.lastTime) / 1000));
                  const instVx = (rawTargetX - vel.lastX) / detDt;
                  const instVy = (rawTargetY - vel.lastY) / detDt;
                  const instVyaw = diffAngle(targetYaw, vel.lastYaw) / detDt;
                  const instVroll = diffAngle(targetAngle, vel.lastRoll) / detDt;
                  const instVpitch = diffAngle(targetPitch, vel.lastPitch) / detDt;

                  // Detect rapid direction reversal (e.g. sharp left-right head turnaround)
                  const isReversingX = (instVx * vel.prevVx < -3600) && (Math.abs(instVx) > 60);
                  const isReversingYaw = (instVyaw * vel.prevVyaw < -0.04) && (Math.abs(instVyaw) > 0.2);

                  vel.isReversingX = isReversingX;
                  vel.isReversingYaw = isReversingYaw;

                  if (isReversingX) {
                    vel.vx = instVx; // Immediately clear previous momentum on turnaround
                  } else {
                    vel.vx += (instVx - vel.vx) * 0.70;
                  }

                  if (isReversingYaw) {
                    vel.vyaw = instVyaw;
                  } else {
                    vel.vyaw += (instVyaw - vel.vyaw) * 0.70;
                  }

                  vel.vy += (instVy - vel.vy) * 0.70;
                  vel.vroll += (instVroll - vel.vroll) * 0.70;
                  vel.vpitch += (instVpitch - vel.vpitch) * 0.70;

                  vel.prevVx = instVx;
                  vel.prevVyaw = instVyaw;
                  vel.lastX = rawTargetX;
                  vel.lastY = rawTargetY;
                  vel.lastYaw = targetYaw;
                  vel.lastRoll = targetAngle;
                  vel.lastPitch = targetPitch;
                  vel.lastTime = now;
                }

                // Predictive Feed-Forward Latency Compensation:
                // Pre-offsets the target by estimated ~28ms hardware capture & inference lag during fast movements.
                // Drops to 0ms when stationary to guarantee exact nose bridge alignment without overshoot or jitter.
                const speed = Math.hypot(vel.vx, vel.vy);
                let leadTime = 0;
                if (speed > 25 && !vel.isReversingX) {
                  leadTime = Math.min(0.028, ((speed - 25) / 250) * 0.028);
                }
                const targetX = rawTargetX + vel.vx * leadTime;
                const targetY = rawTargetY + vel.vy * leadTime;

                let yawLead = 0;
                if (Math.abs(vel.vyaw) > 0.15 && !vel.isReversingYaw) {
                  yawLead = Math.min(0.024, ((Math.abs(vel.vyaw) - 0.15) / 1.0) * 0.024);
                }
                const finalTargetYaw = Math.max(-0.95, Math.min(0.95, targetYaw + vel.vyaw * yawLead));

                targetPoseRef.current = {
                  x: targetX,
                  y: targetY,
                  width: targetWidth,
                  height: targetHeight,
                  angle: targetAngle,
                  yaw: finalTargetYaw,
                  pitch: targetPitch,
                  hasTarget: true
                };

                smoothPoseRef.current.framesSinceDetection = 0;
              }
            } else {
              // No face in current frame
              const smooth = smoothPoseRef.current;
              smooth.framesSinceDetection++;
              if (smooth.framesSinceDetection > 12) {
                smooth.active = false;
                targetPoseRef.current.hasTarget = false;
                trackingVelocityRef.current.initialized = false;
                if (isFaceTrackedRef.current) {
                  isFaceTrackedRef.current = false;
                  setIsFaceTracked(false);
                }
              }
            }
          } catch (detectErr) {
            console.warn('Face landmarking warning:', detectErr);
          } finally {
            isDetectingRef.current = false;
          }
        }

        // 2. Smooth Lerp towards target pose (Adaptive Velocity-Responsive Dual-Regime Filter)
        const smooth = smoothPoseRef.current;
        const target = targetPoseRef.current;

        if (target.hasTarget) {
          if (!smooth.active) {
            smooth.x = target.x;
            smooth.y = target.y;
            smooth.width = target.width;
            smooth.height = target.height;
            smooth.angle = target.angle;
            smooth.yaw = target.yaw;
            smooth.pitch = target.pitch;
            smooth.active = true;
          } else {
            const vel = trackingVelocityRef.current;

            // Position filter: calm noise suppression when still, instantaneous 0.98+ lock when moving or reversing
            const posDelta = Math.hypot(target.x - smooth.x, target.y - smooth.y);
            let basePosAlpha: number;
            if (vel.isReversingX || posDelta > 16.0) {
              basePosAlpha = 0.98; // Instant lock on fast moves or turnaround
            } else if (posDelta <= 1.0) {
              basePosAlpha = 0.38; // Calm noise suppression at rest
            } else {
              const factor = (posDelta - 1.0) / 15.0;
              basePosAlpha = 0.38 + factor * 0.54;
            }

            // Rotation filter: rock-solid forward lock, instant 0.98+ response on head turns & reversals
            const yawDelta = Math.abs(diffAngle(target.yaw, smooth.yaw));
            let baseRotAlpha: number;
            if (vel.isReversingYaw || yawDelta > 0.05) {
              baseRotAlpha = 0.98; // Instant rotation response
            } else if (yawDelta <= 0.008) {
              baseRotAlpha = 0.38; // Jitter suppression
            } else {
              const factor = (yawDelta - 0.008) / 0.042;
              baseRotAlpha = 0.38 + factor * 0.54;
            }

            // Roll & Pitch filter: responsive angular tracking
            const rollDelta = Math.abs(diffAngle(target.angle, smooth.angle));
            const baseRollAlpha = rollDelta > 0.05 ? 0.96 : (rollDelta <= 0.008 ? 0.38 : 0.38 + ((rollDelta - 0.008) / 0.042) * 0.52);

            const pitchDelta = Math.abs(diffAngle(target.pitch, smooth.pitch));
            const basePitchAlpha = pitchDelta > 0.05 ? 0.96 : (pitchDelta <= 0.008 ? 0.38 : 0.38 + ((pitchDelta - 0.008) / 0.042) * 0.52);

            // Size filter: high stability to eliminate breathing/pulsing noise while moving
            const sizeDiff = Math.abs(target.width - smooth.width);
            const sizeFactor = Math.min(1.0, Math.max(0, (sizeDiff - 1.5) / 10.0));
            const baseSizeAlpha = 0.28 + sizeFactor * 0.42;

            // Frame-rate invariant interpolation coefficients normalized to 60 FPS reference
            const posAlpha = Math.min(0.999, Math.max(0.05, 1 - Math.pow(1 - basePosAlpha, timeFactor)));
            const rotAlpha = Math.min(0.999, Math.max(0.05, 1 - Math.pow(1 - baseRotAlpha, timeFactor)));
            const rollAlpha = Math.min(0.999, Math.max(0.05, 1 - Math.pow(1 - baseRollAlpha, timeFactor)));
            const pitchAlpha = Math.min(0.999, Math.max(0.05, 1 - Math.pow(1 - basePitchAlpha, timeFactor)));
            const sizeAlpha = Math.min(0.999, Math.max(0.05, 1 - Math.pow(1 - baseSizeAlpha, timeFactor)));

            smooth.x += (target.x - smooth.x) * posAlpha;
            smooth.y += (target.y - smooth.y) * posAlpha;
            smooth.width += (target.width - smooth.width) * sizeAlpha;
            smooth.height += (target.height - smooth.height) * sizeAlpha;
            smooth.angle += diffAngle(target.angle, smooth.angle) * rollAlpha;
            smooth.yaw += diffAngle(target.yaw, smooth.yaw) * rotAlpha;
            smooth.pitch += diffAngle(target.pitch, smooth.pitch) * pitchAlpha;
          }
        }

        // 3. Render Pipeline (Three.js WebGL or 2D Canvas)
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, vidW, vidH);
        }

        const threeCanvas = threeCanvasRef.current;
        const renderer = threeRendererRef.current;
        const camera = threeCameraRef.current;
        const scene = threeSceneRef.current;
        const modelGroup = threeModelGroupRef.current;

        if (threeCanvas && renderer && camera) {
          if (threeCanvas.width !== vidW || threeCanvas.height !== vidH) {
            threeCanvas.width = vidW;
            threeCanvas.height = vidH;
            renderer.setSize(vidW, vidH, false);
            const fovRad = (camera.fov * Math.PI) / 180;
            const cameraZ = (vidH / 2) / Math.tan(fovRad / 2);
            camera.aspect = vidW / vidH;
            camera.position.set(0, 0, cameraZ);
            camera.lookAt(0, 0, 0);
            camera.updateProjectionMatrix();
          }
        }

        const currentIs3D = is3DRef.current;

        if (currentIs3D) {
          if (smooth.active && modelGroup && modelGroup.children.length > 0 && renderer && scene && camera) {
            const pivot = modelGroup.children[0] as THREE.Group;
            const currentProduct = activeProductRef.current;
            const adminAnchorX = currentProduct?.tryon_bridge_x ?? 0.5;
            const adminAnchorY = currentProduct?.tryon_bridge_y ?? 0.45;

            // Scale glasses model so model outer bounding width exactly matches facial frame width
            const desiredWidth = smooth.width;
            const baseScale = desiredWidth / (modelBoundingWidthRef.current || 1.0);
            pivot.scale.set(baseScale, baseScale, baseScale);

            // Position at nose bridge (screen center = Three.js origin)
            const posX = (smooth.x - vidW / 2) + (0.5 - adminAnchorX) * smooth.width;
            const posY = -(smooth.y - vidH / 2) + (adminAnchorY - 0.45) * smooth.height;
            pivot.position.set(posX, posY, 0);

            // 3D rotations for roll, yaw, pitch with cranial YXZ rotation order (1:1 head-pose tracking)
            pivot.rotation.z = -smooth.angle;
            pivot.rotation.y = smooth.yaw;
            pivot.rotation.x = smooth.pitch;

            pivot.visible = true;
            renderer.render(scene, camera);
          } else if (renderer && scene && camera) {
            if (modelGroup && modelGroup.children[0]) {
              (modelGroup.children[0] as THREE.Group).visible = false;
            }
            renderer.clear();
          }
        } else {
          // Clear Three.js WebGL canvas when rendering 2D PNG
          if (renderer && scene && camera) {
            renderer.clear();
          }

          // 2D Canvas rendering
          if (smooth.active && frameImageRef.current && ctx) {
            const frameImg = frameImageRef.current;
            const { x: adminAnchorX, y: adminAnchorY } = effectiveAnchorRef.current;
            const yawCos = Math.max(0.48, Math.cos(smooth.yaw));

            ctx.save();
            ctx.globalAlpha = 1.0;
            ctx.translate(smooth.x, smooth.y);
            ctx.rotate(smooth.angle);
            ctx.scale(yawCos, 1.0);

            // Position frame using Pre-calculated Bridge Anchor Point
            const drawX = -adminAnchorX * smooth.width;
            const drawY = -adminAnchorY * smooth.height;

            ctx.drawImage(frameImg, drawX, drawY, smooth.width, smooth.height);

            // ZEISS Lens Coating Effects (Clear, BlueBlock, PhotoFusion)
            const currentLensMode = lensModeRef.current;
            if (currentLensMode === 'BLUEBLOCK' || currentLensMode === 'PHOTOFUSION') {
              const lensCenterY = drawY + smooth.height * 0.52;
              const leftLensCenterX = drawX + smooth.width * 0.27;
              const rightLensCenterX = drawX + smooth.width * 0.73;
              const lensRadiusX = smooth.width * 0.17;
              const lensRadiusY = smooth.height * 0.36;

              if (currentLensMode === 'BLUEBLOCK') {
                ctx.fillStyle = 'rgba(92, 124, 250, 0.18)';
                ctx.beginPath();
                ctx.ellipse(leftLensCenterX, lensCenterY, lensRadiusX, lensRadiusY, 0, 0, Math.PI * 2);
                ctx.ellipse(rightLensCenterX, lensCenterY, lensRadiusX, lensRadiusY, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = 'rgba(165, 180, 252, 0.35)';
                ctx.lineWidth = Math.max(2, smooth.width * 0.008);
                ctx.beginPath();
                ctx.arc(leftLensCenterX, lensCenterY - lensRadiusY * 0.25, lensRadiusX * 0.7, -0.9, -0.15);
                ctx.arc(rightLensCenterX, lensCenterY - lensRadiusY * 0.25, lensRadiusX * 0.7, -0.9, -0.15);
                ctx.stroke();
              } else if (currentLensMode === 'PHOTOFUSION') {
                ctx.fillStyle = 'rgba(15, 23, 42, 0.58)';
                ctx.beginPath();
                ctx.ellipse(leftLensCenterX, lensCenterY, lensRadiusX, lensRadiusY, 0, 0, Math.PI * 2);
                ctx.ellipse(rightLensCenterX, lensCenterY, lensRadiusX, lensRadiusY, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
                ctx.lineWidth = Math.max(1.5, smooth.width * 0.006);
                ctx.beginPath();
                ctx.arc(leftLensCenterX, lensCenterY - lensRadiusY * 0.3, lensRadiusX * 0.65, -0.8, -0.2);
                ctx.arc(rightLensCenterX, lensCenterY - lensRadiusY * 0.3, lensRadiusX * 0.65, -0.8, -0.2);
                ctx.stroke();
              }
            }

            ctx.restore();
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [isLoadingModel, cameraError]);

  // ============================================================================
  // 5. High-Resolution Snapshot Capture with Luxury Watermark
  // ============================================================================
  const handleCaptureSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setIsCapturing(true);

    try {
      const snapCanvas = document.createElement('canvas');
      snapCanvas.width = video.videoWidth || 1280;
      snapCanvas.height = video.videoHeight || 720;
      const ctx = snapCanvas.getContext('2d');
      if (!ctx) throw new Error('2D context unavailable');

      // 1. Draw mirrored video feed
      ctx.save();
      ctx.translate(snapCanvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);
      // 2. Draw glasses (3D WebGL model canvas or 2D canvas)
      if (is3D && threeCanvasRef.current) {
        ctx.drawImage(threeCanvasRef.current, 0, 0, snapCanvas.width, snapCanvas.height);
      } else if (canvas) {
        ctx.drawImage(canvas, 0, 0, snapCanvas.width, snapCanvas.height);
      }
      ctx.restore();

      // 3. Add luxury Bapat Optics watermark
      ctx.fillStyle = 'rgba(10, 10, 10, 0.85)';
      ctx.fillRect(0, snapCanvas.height - 65, snapCanvas.width, 65);

      ctx.fillStyle = '#C6A15B';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(
        'BAPAT OPTICS PUNE · ZEISS VISION CENTER',
        24,
        snapCanvas.height - 38
      );

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '13px sans-serif';
      ctx.fillText(
        `${activeProduct?.brand?.name || 'Exclusive'} ${activeProduct?.name || ''} · PD: ${detectedIpdMm}mm · Face: ${detectedFaceShape.split(' ')[0]}`,
        24,
        snapCanvas.height - 18
      );

      const dataUrl = snapCanvas.toDataURL('image/png');
      setCapturedSnapshot(dataUrl);
      showToast('Virtual Try-On snapshot captured successfully!');
    } catch (err) {
      console.error('Capture snapshot error:', err);
      showToast('Failed to capture snapshot.');
    } finally {
      setIsCapturing(false);
    }
  };

  // Download snapshot to device
  const handleDownloadSnapshot = () => {
    if (!capturedSnapshot) return;
    const a = document.createElement('a');
    a.href = capturedSnapshot;
    a.download = `Bapat_Optics_TryOn_${activeProduct?.sku || 'frame'}.png`;
    a.click();
    showToast('Snapshot downloaded to your device!');
  };

  // WhatsApp Concierge In-Store Trial Booking
  const handleWhatsAppBooking = () => {
    const brand = activeProduct.brand?.name || 'Designer';
    const text = encodeURIComponent(
      `Hello Bapat Optics Concierge! 🕶️\n\nI just tried the *${brand} ${activeProduct.name}* (SKU: ${activeProduct.sku}) using your Live Virtual Try-On.\n\n• My Estimated PD: *${detectedIpdMm} mm*\n• Face Shape: *${detectedFaceShape}*\n• Frame Dimensions: *${activeProduct.dimensions_str || 'Standard'}*\n\nPlease reserve this frame for a trial fitting at your *Kothrud ZEISS Center* branch.`
    );
    window.open(`https://wa.me/919175586133?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/90 p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[95vh] sm:h-[90vh] bg-[#0A0A0A] border border-[#C6A15B]/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">

        {/* Top Navigation Bar */}
        <div className="bg-[#0A0A0A]/90 backdrop-blur-md px-4 py-3 border-b border-[#C6A15B]/30 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[#C6A15B]/20 text-[#C6A15B] flex items-center justify-center border border-[#C6A15B]/40">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-[#C6A15B] tracking-wider">
                  {activeProduct.brand?.name || 'Bapat Exclusive'}
                </span>
                <span className="text-[10px] text-white/50 font-mono">
                  {activeProduct.sku}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
                {activeProduct.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close Virtual Try-On"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Video & Tracking Canvas Viewport */}
        <div
          ref={containerRef}
          className="relative flex-1 bg-black flex items-center justify-center overflow-hidden"
        >
          {/* Live Camera Feed */}
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className="w-full h-full object-cover -scale-x-100"
          />

          {/* 60 FPS Transparent Glasses Tracking Overlay (2D Canvas) */}
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full object-cover -scale-x-100 pointer-events-none z-10 ${is3D ? 'hidden' : 'block'}`}
          />

          {/* 60 FPS Three.js 3D Glasses Model Overlay */}
          <canvas
            ref={threeCanvasRef}
            className={`absolute inset-0 w-full h-full object-cover -scale-x-100 pointer-events-none z-10 ${is3D ? 'block' : 'hidden'}`}
          />

          {/* Vision Model Loading Overlay */}
          {isLoadingModel && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-30">
              <div className="h-10 w-10 border-2 border-[#C6A15B] border-t-transparent rounded-full animate-spin" />
              <p className="text-white text-xs font-mono">{modelProgressText}</p>
            </div>
          )}

          {/* Product Asset Loading Badge */}
          {isAssetLoading && !isLoadingModel && (
            <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-md border border-[#C6A15B]/40 rounded-full px-3 py-1 flex items-center gap-2 z-20 shadow-lg">
              <div className="h-3 w-3 border border-[#C6A15B] border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] text-white/90 font-mono">
                {is3D ? 'Loading 3D glasses model...' : 'Loading front frame asset...'}
              </span>
            </div>
          )}

          {/* Missing Asset Notice (No fallback hardcoded image) */}
          {assetLoadError && !isLoadingModel && !cameraError && (
            <div className="absolute top-14 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-amber-950/85 backdrop-blur-md border border-amber-500/50 rounded-xl p-3 flex items-start gap-2.5 z-20 shadow-xl">
              <ImageOff size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="text-[11px] font-bold text-amber-200">Frame Asset Notice</h5>
                <p className="text-[10px] text-amber-300/80 leading-relaxed">
                  {assetLoadError}
                </p>
              </div>
            </div>
          )}

          {/* Camera Error / Permission Fallback with Retry Button */}
          {cameraError && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center z-30 space-y-4">
              <div className="h-14 w-14 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/40">
                <AlertCircle size={28} />
              </div>
              <div className="space-y-1 max-w-md">
                <h4 className="text-base font-bold text-white">Camera Connection Needed</h4>
                <p className="text-xs text-white/70 leading-relaxed">{cameraError}</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-5 py-2.5 rounded-xl bg-[#C6A15B] hover:bg-[#A4813E] text-black text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <RefreshCw size={14} />
                  <span>Retry Camera</span>
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Live Optical Intelligence Badges (HUD) */}
          {!cameraError && (
            <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
              {/* Face Tracking & Alignment Status Badge */}
              <div className="bg-black/65 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-lg">
                <span className={`h-2 w-2 rounded-full ${isFaceTracked ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-ping'}`} />
                <span className="text-[10px] text-white font-medium">
                  {isFaceTracked ? detectedFaceShape : isCameraActive ? 'Position face in camera view' : 'Connecting camera...'}
                </span>
                {isFaceTracked && (
                  <span className="text-[9px] text-[#C6A15B] font-bold">
                    {faceMatchScore}% Match
                  </span>
                )}
              </div>

              {/* Asset Type Status Pill */}
              {is3D ? (
                <div className="bg-black/65 backdrop-blur-md border border-[#C6A15B]/40 rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-lg">
                  <span className="text-[10px] text-[#C6A15B] font-bold">🕶️ 3D Model Active</span>
                  <span className="text-[9px] text-white/60 hidden sm:inline">(Front & Side 360° Tracking)</span>
                </div>
              ) : (
                <div className="bg-black/65 backdrop-blur-md border border-white/20 rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-lg">
                  <span className="text-[10px] text-white/90 font-medium">👓 2D Front View</span>
                </div>
              )}

              {/* Pupillary Distance (IPD) HUD */}
              <div className="bg-black/65 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-lg">
                <span className="text-[10px] text-white/70 font-mono">PD:</span>
                <span className="text-[10px] text-white font-bold font-mono">
                  {detectedIpdMm} mm
                </span>
                <span className="text-[9px] text-white/50">
                  (Specs: {activeProduct.dimensions_str || 'Standard'})
                </span>
              </div>
            </div>
          )}

          {/* Snapshot Capture Modal Review Overlay */}
          {capturedSnapshot && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 z-40 animate-in fade-in">
              <div className="relative max-w-lg w-full rounded-xl overflow-hidden border border-[#C6A15B] shadow-2xl">
                <img src={capturedSnapshot} alt="Captured 3D Try-On" className="w-full object-contain" />
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleDownloadSnapshot}
                  className="px-4 py-2 rounded-xl bg-[#C6A15B] hover:bg-[#A4813E] text-black text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <Download size={14} />
                  <span>Download Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCapturedSnapshot(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  Retake Photo
                </button>
              </div>
            </div>
          )}

          {/* Fine-Tuning Slide-Over Panel */}
          {showAdjustPanel && (
            <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-80 bg-black/85 backdrop-blur-md border border-white/20 rounded-xl p-3.5 space-y-3 z-20 text-xs shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-[11px] flex items-center gap-1">
                  <Sliders size={12} className="text-[#C6A15B]" />
                  Fine-Tune Frame Fit
                </span>
                <button
                  type="button"
                  onClick={() => setShowAdjustPanel(false)}
                  className="text-white/60 hover:text-white"
                >
                  <X size={12} />
                </button>
              </div>

              {/* Scale adjustment slider */}
              <div>
                <div className="flex justify-between text-[10px] text-white/70 mb-1">
                  <span>Frame Width:</span>
                  <span className="font-mono text-[#C6A15B]">{Math.round(userScaleOffset * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.2"
                  step="0.01"
                  value={userScaleOffset}
                  onChange={(e) => setUserScaleOffset(parseFloat(e.target.value))}
                  className="w-full accent-[#C6A15B] cursor-pointer"
                />
              </div>

              {/* Vertical position slider */}
              <div>
                <div className="flex justify-between text-[10px] text-white/70 mb-1">
                  <span>Nose Bridge Height:</span>
                  <span className="font-mono text-[#C6A15B]">{userYOffset > 0 ? `+${userYOffset}` : userYOffset}px</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  step="1"
                  value={userYOffset}
                  onChange={(e) => setUserYOffset(parseInt(e.target.value, 10))}
                  className="w-full accent-[#C6A15B] cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setUserScaleOffset(1.0);
                  setUserYOffset(0);
                }}
                className="w-full py-1 text-[10px] text-white/60 hover:text-white font-mono text-center border-t border-white/10 pt-2 cursor-pointer"
              >
                Reset Calibration
              </button>
            </div>
          )}
        </div>

        {/* Bottom Bar: Lens Shaders, Frame Switcher Carousel, and Actions */}
        <div className="bg-[#0A0A0A] p-3 sm:p-4 border-t border-[#C6A15B]/30 space-y-3 z-20 shrink-0">
          {/* Row 1: ZEISS Lens Coating Mode Switcher & Utilities */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-[11px]">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] uppercase font-bold text-[#C6A15B] tracking-wider hidden sm:inline">
                ZEISS Lens:
              </span>
              <div className="inline-flex rounded-lg bg-white/5 p-0.5 border border-white/10">
                <button
                  type="button"
                  onClick={() => setLensMode('CLEAR')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                    lensMode === 'CLEAR'
                      ? 'bg-[#C6A15B] text-black shadow-xs'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Clear Vision
                </button>
                <button
                  type="button"
                  onClick={() => setLensMode('BLUEBLOCK')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                    lensMode === 'BLUEBLOCK'
                      ? 'bg-[#5c7cfa] text-white shadow-xs'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  DuraVision Blue
                </button>
                <button
                  type="button"
                  onClick={() => setLensMode('PHOTOFUSION')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                    lensMode === 'PHOTOFUSION'
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  PhotoFusion X
                </button>
              </div>
            </div>

            {/* Utility icons: Adjust & Flip Camera */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowAdjustPanel((p) => !p)}
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                  showAdjustPanel
                    ? 'border-[#C6A15B] bg-[#C6A15B]/20 text-[#C6A15B]'
                    : 'border-white/10 bg-white/5 text-white hover:bg-white/15'
                }`}
                title="Fine-tune frame size & position"
              >
                <Sliders size={14} />
              </button>

              <button
                type="button"
                onClick={handleFlipCamera}
                className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/15 text-white transition-colors cursor-pointer"
                title="Flip Camera"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Row 2: Instant Catalog Eyewear Frame Switcher Carousel */}
          {eyewearCatalog.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-white/20">
              <span className="text-[10px] text-white/50 uppercase font-bold shrink-0 hidden sm:inline">
                Frames:
              </span>
              {eyewearCatalog.map((prod) => {
                const isSelected = prod.id === activeProduct.id;
                const thumbUrl = normalizeTryonUrl(prod.tryon_image_url) || prod.primary_image;
                return (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => setVirtualTryOnProduct(prod)}
                    className={`shrink-0 flex items-center gap-2 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#C6A15B] bg-[#C6A15B]/20 text-white shadow-xs scale-102 ring-1 ring-[#C6A15B]'
                        : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {thumbUrl && (
                      <img
                        src={thumbUrl}
                        alt={prod.name}
                        className="h-5 w-8 object-contain rounded bg-black/40"
                      />
                    )}
                    <span className="text-[10px] font-medium max-w-[110px] truncate">
                      {prod.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Row 3: Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Capture Snapshot */}
            <button
              type="button"
              disabled={isCapturing}
              onClick={handleCaptureSnapshot}
              className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Camera size={14} className="text-[#C6A15B]" />
              <span>{isCapturing ? 'Capturing...' : 'Capture Snapshot'}</span>
            </button>

            {/* In-Store WhatsApp Trial */}
            <button
              type="button"
              onClick={handleWhatsAppBooking}
              className="w-full py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <MessageCircle size={14} />
              <span>Reserve in Pune Store</span>
            </button>

            {/* Buy / Add to Cart */}
            <button
              type="button"
              onClick={() => {
                addToCart(activeProduct);
                handleClose();
                showToast(`Added ${activeProduct.name} to cart!`);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-[#C6A15B] hover:bg-[#A4813E] text-black text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <ShoppingBag size={14} />
              <span>Add to Cart ({formatPrice(activeProduct.price)})</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// Top-level modal container: mounts VirtualTryOnModalContent ONLY when virtualTryOnProduct is present
export const VirtualTryOnModal: React.FC = () => {
  const { virtualTryOnProduct } = useStore();

  if (!virtualTryOnProduct) return null;

  return <VirtualTryOnModalContent product={virtualTryOnProduct} />;
};
