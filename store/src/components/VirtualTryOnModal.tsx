import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

// Landmark indices for MediaPipe FaceMesh
const NOSE_BRIDGE = 168;     // Center top of nose bridge
const NOSE_MID = 6;          // Secondary bridge landmark
const RIGHT_EYE_OUTER = 33;  // User's right eye corner (left on raw frame)
const LEFT_EYE_OUTER = 263;  // User's left eye corner (right on raw frame)
const RIGHT_PUPIL = 468;
const LEFT_PUPIL = 473;
const LEFT_TEMPLE = 234;
const RIGHT_TEMPLE = 454;
const FOREHEAD_TOP = 10;
const CHIN_BOTTOM = 152;
const JAW_LEFT = 172;
const JAW_RIGHT = 397;

type LensMode = 'CLEAR' | 'BLUEBLOCK' | 'PHOTOFUSION';

export const VirtualTryOnModal: React.FC = () => {
  const {
    virtualTryOnProduct,
    setVirtualTryOnProduct,
    addToCart,
    showToast
  } = useStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // States
  const [isLoadingModel, setIsLoadingModel] = useState(true);
  const [modelProgressText, setModelProgressText] = useState('Initializing Vision AI...');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Customization & Controls
  const [userScaleOffset, setUserScaleOffset] = useState(1.0);
  const [userYOffset, setUserYOffset] = useState(0);
  const [lensMode, setLensMode] = useState<LensMode>('CLEAR');
  const [showAdjustPanel, setShowAdjustPanel] = useState(false);

  // Optical AI metrics
  const [detectedFaceShape, setDetectedFaceShape] = useState<string>('Detecting Face...');
  const [faceMatchScore, setFaceMatchScore] = useState<number>(96);
  const [detectedIpdMm, setDetectedIpdMm] = useState<number>(63);
  const [isFaceTracked, setIsFaceTracked] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);

  // Tracking refs
  const animFrameIdRef = useRef<number | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const frameImageRef = useRef<HTMLImageElement | null>(null);
  const frameAspectRef = useRef<number>(2.74);
  const lastTimestampRef = useRef<number>(0);

  // Smooth lerp state
  const smoothPoseRef = useRef({
    x: 0,
    y: 0,
    width: 250,
    height: 90,
    angle: 0,
    active: false,
    framesSinceDetection: 0
  });

  // Helper: Detect and remove fake checkerboard (Google Images fake PNGs) & solid white backgrounds, then crop to bounding box
  const processEyewearImage = (img: HTMLImageElement): CanvasImageSource => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx || canvas.width === 0 || canvas.height === 0) return img;

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // 1. Check if the image ALREADY has true alpha transparency (> 15% transparent pixels)
      let transparentPixels = 0;
      const totalPixels = canvas.width * canvas.height;
      const step = Math.max(1, Math.floor(totalPixels / 1000));
      for (let i = 3; i < data.length; i += 4 * step) {
        if (data[i] < 30) transparentPixels++;
      }

      const hasTrueAlpha = (transparentPixels / (totalPixels / step)) > 0.15;

      if (!hasTrueAlpha) {
        // Strip fake checkerboard white (#FFFFFF) and light-gray (#CCCCCC - #E5E5E5)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const isNeutral = Math.abs(r - g) < 22 && Math.abs(g - b) < 22 && Math.abs(r - b) < 22;

          if (isNeutral && r > 175 && g > 175 && b > 175) {
            data[i + 3] = 0; // Turn transparent
          } else if (isNeutral && r > 160 && g > 160 && b > 160) {
            data[i + 3] = Math.round(((175 - r) / 15) * 255);
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      // 2. Auto-crop to bounding box of visible glasses pixels
      let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const a = data[(y * canvas.width + x) * 4 + 3];
          if (a > 30) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (maxX > minX && maxY > minY) {
        const cropW = maxX - minX + 1;
        const cropH = maxY - minY + 1;
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = cropW;
        croppedCanvas.height = cropH;
        const cropCtx = croppedCanvas.getContext('2d');
        if (cropCtx) {
          cropCtx.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
          frameAspectRef.current = cropW / cropH;
          return croppedCanvas;
        }
      }
    } catch (e) {
      console.warn('Auto-clean background warning:', e);
    }
    return img;
  };

  // Load try-on eyewear image
  useEffect(() => {
    if (!virtualTryOnProduct) return;

    const img = new Image();
    const candidateUrl = virtualTryOnProduct.tryon_image_url || '/tryon/rayban_headliner_tryon.png';
    img.crossOrigin = 'anonymous';
    img.src = candidateUrl;

    img.onload = () => {
      const processed = processEyewearImage(img);
      frameImageRef.current = processed as any;
      const w = (processed as any).width || img.naturalWidth || 800;
      const h = (processed as any).height || img.naturalHeight || 292;
      frameAspectRef.current = w / h;
    };

    img.onerror = () => {
      // Fallback to local static tryon asset
      const fallback = new Image();
      fallback.crossOrigin = 'anonymous';
      fallback.src = '/tryon/rayban_headliner_tryon.png';
      fallback.onload = () => {
        frameImageRef.current = fallback;
        if (fallback.naturalWidth && fallback.naturalHeight) {
          frameAspectRef.current = fallback.naturalWidth / fallback.naturalHeight;
        }
      };
    };

    return () => {
      frameImageRef.current = null;
    };
  }, [virtualTryOnProduct]);

  // Close modal cleanup
  const handleClose = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    setCapturedSnapshot(null);
    setVirtualTryOnProduct(null);
  }, [setVirtualTryOnProduct]);

  // Format currency helper
  const formatPrice = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  // 1. Initialize MediaPipe FaceLandmarker with Local Files & Robust Fallbacks
  useEffect(() => {
    if (!virtualTryOnProduct) return;

    let isMounted = true;
    const initLandmarker = async () => {
      try {
        setIsLoadingModel(true);
        setModelProgressText('Loading MediaPipe Vision Engine...');

        // Try local WASM first, fallback to CDN if needed
        let vision: any;
        try {
          vision = await FilesetResolver.forVisionTasks('/mediapipe-wasm');
        } catch {
          vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
          );
        }

        if (!isMounted) return;
        setModelProgressText('Calibrating 478 Facial Landmarks...');

        // Create with CPU delegate first to guarantee 100% stability across all GPUs and platforms
        let landmarker: FaceLandmarker;
        try {
          landmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: '/models/face_landmarker.task',
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numFaces: 1,
            minFaceDetectionConfidence: 0.25,
            minFacePresenceConfidence: 0.25,
            minTrackingConfidence: 0.25,
          });
        } catch (localErr) {
          console.warn('Local model load fallback to remote:', localErr);
          landmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numFaces: 1,
            minFaceDetectionConfidence: 0.25,
            minFacePresenceConfidence: 0.25,
            minTrackingConfidence: 0.25,
          });
        }

        if (!isMounted) return;
        landmarkerRef.current = landmarker;
        setIsLoadingModel(false);
      } catch (err) {
        console.error('Failed to load FaceLandmarker:', err);
        if (isMounted) {
          setCameraError('Failed to initialize 3D Vision AI. Please check browser permissions.');
          setIsLoadingModel(false);
        }
      }
    };

    initLandmarker();

    return () => {
      isMounted = false;
      if (landmarkerRef.current) {
        try {
          landmarkerRef.current.close();
        } catch (e) {
          console.error(e);
        }
        landmarkerRef.current = null;
      }
    };
  }, [virtualTryOnProduct]);

  // 2. Start Camera Feed
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const currentStream = videoRef.current.srcObject as MediaStream;
        currentStream.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera access was denied. Please allow camera permissions in your browser.'
          : 'Unable to access your camera. Please ensure no other application is using it.'
      );
    }
  }, [facingMode]);

  useEffect(() => {
    if (virtualTryOnProduct && !isLoadingModel) {
      startCamera();
    }
  }, [virtualTryOnProduct, isLoadingModel, startCamera]);

  // Calculate Optician Metrics: Face Shape & Pupillary Distance
  const calculateFaceMetrics = (
    landmarks: any[],
    vidW: number,
    vidH: number
  ) => {
    const rPupil = landmarks[RIGHT_PUPIL];
    const lPupil = landmarks[LEFT_PUPIL];

    if (rPupil && lPupil) {
      const dx = (lPupil.x - rPupil.x) * vidW;
      const dy = (lPupil.y - rPupil.y) * vidH;
      const pixelDist = Math.sqrt(dx * dx + dy * dy);
      const estimatedMm = Math.round(Math.min(72, Math.max(56, 63 + (pixelDist - 65) * 0.15)));
      setDetectedIpdMm(estimatedMm);
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

      if (ratio > 1.45) {
        setDetectedFaceShape('Oval Face (Perfect Match)');
        setFaceMatchScore(98);
      } else if (ratio < 1.15) {
        setDetectedFaceShape('Round Face (Angular Frames Suit Best)');
        setFaceMatchScore(92);
      } else if (jawWidth / faceWidth > 0.85) {
        setDetectedFaceShape('Square Face (Curved Rims Soften Features)');
        setFaceMatchScore(96);
      } else {
        setDetectedFaceShape('Diamond / Heart Face');
        setFaceMatchScore(95);
      }
    }
  };

  // 3. Bulletproof 60 FPS Real-Time Canvas 2D Tracking & Render Loop
  useEffect(() => {
    if (!virtualTryOnProduct || isLoadingModel || cameraError) return;

    let isRunning = true;

    const renderLoop = () => {
      if (!isRunning) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const landmarker = landmarkerRef.current;

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

        // Synchronize canvas internal buffer with video
        if (canvas.width !== vidW || canvas.height !== vidH) {
          canvas.width = vidW;
          canvas.height = vidH;
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, vidW, vidH);

          let detectedThisFrame = false;

          if (landmarker) {
            try {
              // Ensure timestamp is strictly monotonically increasing
              let now = performance.now();
              if (now <= lastTimestampRef.current) {
                now = lastTimestampRef.current + 1;
              }
              lastTimestampRef.current = now;

              const detections = landmarker.detectForVideo(video, now);

              if (detections.faceLandmarks && detections.faceLandmarks.length > 0) {
                detectedThisFrame = true;
                const landmarks = detections.faceLandmarks[0];
                setIsFaceTracked(true);

                // Calculate metrics
                calculateFaceMetrics(landmarks, vidW, vidH);

                // Nose bridge anchor point
                const bridge = landmarks[NOSE_BRIDGE] || landmarks[NOSE_MID];
                const lEye = landmarks[LEFT_EYE_OUTER];
                const rEye = landmarks[RIGHT_EYE_OUTER];

                if (bridge && lEye && rEye) {
                  const targetX = bridge.x * vidW;
                  const targetY = bridge.y * vidH + userYOffset;

                  // Distance between eye corners in pixels
                  const eyeSpan = Math.hypot(
                    (lEye.x - rEye.x) * vidW,
                    (lEye.y - rEye.y) * vidH
                  );

                  // Frame width calculation (proportional to eye span)
                  const targetWidth = eyeSpan * 2.25 * userScaleOffset;
                  const aspect = frameAspectRef.current || 2.74;
                  const targetHeight = targetWidth / aspect;

                  // Head tilt / roll angle
                  const targetAngle = Math.atan2(
                    (lEye.y - rEye.y) * vidH,
                    (lEye.x - rEye.x) * vidW
                  );

                  // Smooth lerp interpolation
                  const smooth = smoothPoseRef.current;
                  const alpha = smooth.active ? 0.45 : 1.0;

                  smooth.x += (targetX - smooth.x) * alpha;
                  smooth.y += (targetY - smooth.y) * alpha;
                  smooth.width += (targetWidth - smooth.width) * alpha;
                  smooth.height += (targetHeight - smooth.height) * alpha;
                  smooth.angle += (targetAngle - smooth.angle) * alpha;
                  smooth.active = true;
                  smooth.framesSinceDetection = 0;
                }
              }
            } catch (detectErr) {
              console.warn('Face landmarking warning:', detectErr);
            }
          }

          const smooth = smoothPoseRef.current;

          if (!detectedThisFrame) {
            smooth.framesSinceDetection++;
            if (smooth.framesSinceDetection > 15) {
              smooth.active = false;
              setIsFaceTracked(false);
            }
          }

          // Render Glasses if smooth pose is active
          if (smooth.active) {
            const frameImg = frameImageRef.current;
            ctx.save();
            ctx.translate(smooth.x, smooth.y);
            ctx.rotate(smooth.angle);

            const imgW = (frameImg as any)?.width || (frameImg as any)?.naturalWidth || 0;
            const imgH = (frameImg as any)?.height || (frameImg as any)?.naturalHeight || 0;

            if (frameImg && imgW > 0 && imgH > 0) {
              // Draw realistic photorealistic eyewear frame
              ctx.drawImage(
                frameImg,
                -smooth.width / 2,
                -smooth.height / 2,
                smooth.width,
                smooth.height
              );
            }

            // ZEISS Lens Coating Effects
            if (lensMode === 'BLUEBLOCK') {
              // DuraVision Blue subtle antireflective shimmer
              ctx.fillStyle = 'rgba(92, 124, 250, 0.18)';
              ctx.beginPath();
              ctx.ellipse(-smooth.width * 0.25, 0, smooth.width * 0.18, smooth.height * 0.38, 0, 0, Math.PI * 2);
              ctx.ellipse(smooth.width * 0.25, 0, smooth.width * 0.18, smooth.height * 0.38, 0, 0, Math.PI * 2);
              ctx.fill();

              // Subtle glare highlight
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(-smooth.width * 0.28, -smooth.height * 0.12, smooth.width * 0.08, -0.8, -0.1);
              ctx.arc(smooth.width * 0.22, -smooth.height * 0.12, smooth.width * 0.08, -0.8, -0.1);
              ctx.stroke();
            } else if (lensMode === 'PHOTOFUSION') {
              // PhotoFusion X dynamic transition tint
              ctx.fillStyle = 'rgba(20, 20, 25, 0.45)';
              ctx.beginPath();
              ctx.ellipse(-smooth.width * 0.25, 0, smooth.width * 0.19, smooth.height * 0.40, 0, 0, Math.PI * 2);
              ctx.ellipse(smooth.width * 0.25, 0, smooth.width * 0.19, smooth.height * 0.40, 0, 0, Math.PI * 2);
              ctx.fill();
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
      }
    };
  }, [virtualTryOnProduct, isLoadingModel, cameraError, userScaleOffset, userYOffset, lensMode]);

  // Flip Camera Front / Back
  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // High-Resolution Snapshot Capture
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
      if (!ctx) throw new Error('2D context failed');

      // 1. Draw mirrored video feed
      ctx.save();
      ctx.translate(snapCanvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);
      // 2. Draw mirrored glasses canvas
      ctx.drawImage(canvas, 0, 0, snapCanvas.width, snapCanvas.height);
      ctx.restore();

      // 3. Add luxury Bapat Optics watermark
      ctx.fillStyle = 'rgba(10, 10, 10, 0.75)';
      ctx.fillRect(0, snapCanvas.height - 60, snapCanvas.width, 60);

      ctx.fillStyle = '#C6A15B';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(
        `BAPAT OPTICS PUNE · ZEISS VISION CENTER`,
        24,
        snapCanvas.height - 34
      );

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '13px sans-serif';
      ctx.fillText(
        `${virtualTryOnProduct?.brand?.name || 'Exclusive'} ${virtualTryOnProduct?.name || ''} · PD: ${detectedIpdMm}mm`,
        24,
        snapCanvas.height - 16
      );

      const dataUrl = snapCanvas.toDataURL('image/png');
      setCapturedSnapshot(dataUrl);
      showToast('3D Try-On snapshot captured successfully!');
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
    a.download = `Bapat_Optics_TryOn_${virtualTryOnProduct?.sku || 'frame'}.png`;
    a.click();
    showToast('Snapshot downloaded to your device!');
  };

  // 1-Click WhatsApp Concierge Booking with Try-On specs
  const handleWhatsAppBooking = () => {
    if (!virtualTryOnProduct) return;
    const brand = virtualTryOnProduct.brand?.name || 'Designer';
    const text = encodeURIComponent(
      `Hello Bapat Optics Concierge! 🕶️\n\nI just tried the *${brand} ${virtualTryOnProduct.name}* (SKU: ${virtualTryOnProduct.sku}) using your 3D Virtual Try-On.\n\n• My Estimated PD: *${detectedIpdMm} mm*\n• Face Shape: *${detectedFaceShape}*\n• Frame Dimensions: *${virtualTryOnProduct.dimensions_str}*\n\nPlease reserve this frame for a trial fitting at your *Kothrud ZEISS Center* branch.`
    );
    window.open(`https://wa.me/919175586133?text=${text}`, '_blank');
  };

  if (!virtualTryOnProduct) return null;

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
                  {virtualTryOnProduct.brand?.name || 'Bapat Exclusive'}
                </span>
                <span className="text-[9px] font-mono text-white/50">
                  {virtualTryOnProduct.sku}
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                {virtualTryOnProduct.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-[#C6A15B]">
              {formatPrice(virtualTryOnProduct.price)}
            </span>
            <button
              type="button"
              onClick={handleClose}
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-[#C6A15B] text-white hover:text-black flex items-center justify-center transition-colors cursor-pointer ml-1"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Center: Live Camera Feed & Canvas 2D Glasses Overlay */}
        <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
          {/* Loading MediaPipe Vision AI State */}
          {isLoadingModel && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 space-y-3 p-4 text-center">
              <div className="h-12 w-12 border-3 border-[#C6A15B]/30 border-t-[#C6A15B] rounded-full animate-spin" />
              <p className="text-xs font-semibold text-[#C6A15B] tracking-wide">
                {modelProgressText}
              </p>
              <p className="text-[11px] text-white/50 max-w-xs">
                Calibrating 478 3D facial landmarks for realistic Zeiss fitting...
              </p>
            </div>
          )}

          {/* Camera Access Error State */}
          {cameraError && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 p-6 text-center space-y-4">
              <div className="h-14 w-14 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                <AlertCircle size={28} />
              </div>
              <div className="max-w-md space-y-1">
                <h4 className="text-sm font-bold text-white">Camera Access Required</h4>
                <p className="text-xs text-white/70">{cameraError}</p>
              </div>
              <button
                type="button"
                onClick={startCamera}
                className="px-5 py-2.5 rounded-xl bg-[#C6A15B] hover:bg-[#A4813E] text-black text-xs font-bold transition-all cursor-pointer"
              >
                Retry Camera
              </button>
            </div>
          )}

          {/* Aspect-Locked Viewport Container for 100% Alignment */}
          <div className="relative h-full w-full flex items-center justify-center">
            {/* Video Stream (Mirrored Selfie Mode via CSS) */}
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className="h-full w-full object-contain -scale-x-100"
            />

            {/* Canvas 2D Glasses Overlay (Mirrored via CSS identically) */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 h-full w-full object-contain pointer-events-none -scale-x-100"
            />
          </div>

          {/* Live Optical Intelligence Badges (HUD) */}
          {!isLoadingModel && !cameraError && (
            <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
              {/* Face Shape Badge */}
              <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-lg">
                <span className={`h-2 w-2 rounded-full ${isFaceTracked ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-[10px] text-white font-medium">
                  {detectedFaceShape}
                </span>
                <span className="text-[9px] text-[#C6A15B] font-bold">
                  {faceMatchScore}% Match
                </span>
              </div>

              {/* Pupillary Distance (IPD) HUD */}
              <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-lg">
                <span className="text-[10px] text-white/70 font-mono">PD:</span>
                <span className="text-[10px] text-white font-bold font-mono">
                  {detectedIpdMm} mm
                </span>
                <span className="text-[9px] text-white/50">
                  (Specs: {virtualTryOnProduct.dimensions_str})
                </span>
              </div>
            </div>
          )}

          {/* Captured Snapshot Preview Modal */}
          {capturedSnapshot && (
            <div className="absolute inset-0 z-40 bg-black/90 p-4 flex flex-col items-center justify-center space-y-4 animate-in fade-in">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Check size={16} className="text-emerald-400" />
                Your 3D Try-On Look
              </h4>

              <div className="max-h-[60vh] max-w-sm rounded-xl overflow-hidden border border-[#C6A15B]/40 shadow-2xl">
                <img
                  src={capturedSnapshot}
                  alt="Captured Look"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadSnapshot}
                  className="px-4 py-2 rounded-xl bg-white text-black hover:bg-[#C6A15B] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={14} />
                  Download Photo
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppBooking}
                  className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle size={14} />
                  Send to Bapat WhatsApp
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

          {/* Fine-Tuning Calibration Slide-Over Panel */}
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

        {/* Bottom Bar: Lens Shaders, Capture, and Purchase Actions */}
        <div className="bg-[#0A0A0A] p-3 sm:p-4 border-t border-[#C6A15B]/30 space-y-3 z-20 shrink-0">
          {/* Row 1: ZEISS Lens Coating Mode Switcher */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-[11px]">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] uppercase font-bold text-[#C6A15B] tracking-wider hidden sm:inline">
                ZEISS Lens:
              </span>
              <div className="inline-flex rounded-lg bg-white/5 p-0.5 border border-white/10">
                <button
                  type="button"
                  onClick={() => setLensMode('CLEAR')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${lensMode === 'CLEAR'
                      ? 'bg-[#C6A15B] text-black shadow-xs'
                      : 'text-white/70 hover:text-white'
                    }`}
                >
                  Clear Vision
                </button>
                <button
                  type="button"
                  onClick={() => setLensMode('BLUEBLOCK')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${lensMode === 'BLUEBLOCK'
                      ? 'bg-[#5c7cfa] text-white shadow-xs'
                      : 'text-white/70 hover:text-white'
                    }`}
                >
                  DuraVision Blue
                </button>
                <button
                  type="button"
                  onClick={() => setLensMode('PHOTOFUSION')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${lensMode === 'PHOTOFUSION'
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
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${showAdjustPanel
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

          {/* Row 2: Action Buttons */}
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
                addToCart(virtualTryOnProduct);
                handleClose();
                showToast(`Added ${virtualTryOnProduct.name} to cart!`);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-[#C6A15B] hover:bg-[#A4813E] text-black text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <ShoppingBag size={14} />
              <span>Add to Cart ({formatPrice(virtualTryOnProduct.price)})</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
