import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Crosshair, 
  Upload, 
  Trash2, 
  Wand2, 
  Eye, 
  CheckCircle2, 
  HelpCircle,
  RotateCcw,
  AlertTriangle,
  Layers,
  ArrowRight,
  Box
} from 'lucide-react';

interface TryOnCalibratorProps {
  // Front View / 3D Model
  tryonImageUrl: string | null;
  bridgeX: number;
  bridgeY: number;
  scale: number;
  tryonAssetType?: string | null;

  // Side View (Profile & Temple)
  tryonSideImageUrl?: string | null;
  sideAnchorX?: number;
  sideAnchorY?: number;
  sideScale?: number;

  candidateImages: string[];
  onUpdate: (data: {
    tryon_image_url: string | null;
    tryon_bridge_x: number;
    tryon_bridge_y: number;
    tryon_scale: number;
    tryon_side_image_url?: string | null;
    tryon_side_anchor_x?: number;
    tryon_side_anchor_y?: number;
    tryon_side_scale?: number;
    tryon_asset_type?: string | null;
  }) => void;
  onUploadFile: (file: File) => Promise<string>;
}

export const TryOnCalibrator: React.FC<TryOnCalibratorProps> = ({
  tryonImageUrl,
  bridgeX,
  bridgeY,
  scale,
  tryonAssetType,
  tryonSideImageUrl,
  sideAnchorX,
  sideAnchorY,
  sideScale,
  candidateImages,
  onUpdate,
  onUploadFile,
}) => {
  const [activeView, setActiveView] = useState<'front' | 'side'>('front');
  const [activeTab, setActiveTab] = useState<'calibrate' | 'preview'>('calibrate');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const is3DModel = (url?: string | null) => {
    if (!url) return false;
    const clean = url.split('?')[0].toLowerCase();
    return clean.endsWith('.glb') || clean.endsWith('.gltf');
  };
  const is3D = is3DModel(tryonImageUrl) || tryonAssetType === '3d';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const frameContainerRef = useRef<HTMLDivElement>(null);

  // Normalized values with fallbacks
  const curFrontX = bridgeX ?? 0.5;
  const curFrontY = bridgeY ?? 0.45;
  const curFrontScale = scale ?? 1.0;

  const curSideX = sideAnchorX ?? 0.15;
  const curSideY = sideAnchorY ?? 0.50;
  const curSideScale = sideScale ?? 1.0;

  const isFront = activeView === 'front';
  const activeImageUrl = isFront ? tryonImageUrl : (tryonSideImageUrl || null);
  const activeAnchorX = isFront ? curFrontX : curSideX;
  const activeAnchorY = isFront ? curFrontY : curSideY;
  const activeScale = isFront ? curFrontScale : curSideScale;

  // Click on image container to set anchor point
  const handleFrameClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!frameContainerRef.current) return;
    const rect = frameContainerRef.current.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / rect.width;
    const clickY = (e.clientY - rect.top) / rect.height;

    const clampedX = Math.max(0.05, Math.min(0.95, Number(clickX.toFixed(3))));
    const clampedY = Math.max(0.05, Math.min(0.95, Number(clickY.toFixed(3))));

    if (isFront) {
      onUpdate({
        tryon_image_url: tryonImageUrl,
        tryon_bridge_x: clampedX,
        tryon_bridge_y: clampedY,
        tryon_scale: curFrontScale,
        tryon_side_image_url: tryonSideImageUrl || null,
        tryon_side_anchor_x: curSideX,
        tryon_side_anchor_y: curSideY,
        tryon_side_scale: curSideScale,
      });
    } else {
      onUpdate({
        tryon_image_url: tryonImageUrl,
        tryon_bridge_x: curFrontX,
        tryon_bridge_y: curFrontY,
        tryon_scale: curFrontScale,
        tryon_side_image_url: tryonSideImageUrl || null,
        tryon_side_anchor_x: clampedX,
        tryon_side_anchor_y: clampedY,
        tryon_side_scale: curSideScale,
      });
    }
  };

  // Upload transparent PNG or 3D GLB/GLTF model with validation
  const handleUploadPng = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Supported formats: PNG, WebP, GLB, GLTF
    const isGlb = file.name.toLowerCase().endsWith('.glb') || file.name.toLowerCase().endsWith('.gltf');
    const isPng = file.type === 'image/png';
    const isWebp = file.type === 'image/webp';
    const isPngExt = file.name.toLowerCase().endsWith('.png');

    if (!isGlb && !isPng && !isWebp && !isPngExt) {
      setUploadError('Invalid format: Please upload a transparent PNG image or 3D glasses model (.glb / .gltf).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsProcessing(true);
    try {
      const url = await onUploadFile(file);
      const newAssetType = isGlb ? '3d' : '2d';
      if (isFront || isGlb) {
        onUpdate({
          tryon_image_url: url,
          tryon_bridge_x: 0.5,
          tryon_bridge_y: 0.45,
          tryon_scale: 1.0,
          tryon_side_image_url: isGlb ? null : (tryonSideImageUrl || null),
          tryon_side_anchor_x: curSideX,
          tryon_side_anchor_y: curSideY,
          tryon_side_scale: curSideScale,
          tryon_asset_type: newAssetType,
        });
      } else {
        onUpdate({
          tryon_image_url: tryonImageUrl,
          tryon_bridge_x: curFrontX,
          tryon_bridge_y: curFrontY,
          tryon_scale: curFrontScale,
          tryon_side_image_url: url,
          tryon_side_anchor_x: 0.15,
          tryon_side_anchor_y: 0.50,
          tryon_side_scale: 1.0,
          tryon_asset_type: is3D ? '3d' : '2d',
        });
      }
    } catch (err: any) {
      console.error('Failed to upload try-on asset:', err);
      setUploadError(err.message || 'Failed to upload try-on file');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Client-side auto background removal for solid white/light backgrounds
  const handleAutoRemoveBackground = async () => {
    if (!activeImageUrl) return;
    setIsProcessing(true);
    setUploadError(null);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = activeImageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Sample background color from corners
      const sampleIndices = [0, (canvas.width - 1) * 4, (canvas.height - 1) * canvas.width * 4];
      let bgR = 255, bgG = 255, bgB = 255;
      for (const idx of sampleIndices) {
        if (data[idx + 3] > 0) {
          bgR = data[idx];
          bgG = data[idx + 1];
          bgB = data[idx + 2];
          break;
        }
      }

      const tolerance = 42;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const isNeutral = Math.abs(r - g) < 22 && Math.abs(g - b) < 22 && Math.abs(r - b) < 22;
        const isCheckerboard = isNeutral && r > 175 && g > 175 && b > 175;
        const diff = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
        const isSolidBg = diff < tolerance;

        if (isCheckerboard || isSolidBg) {
          data[i + 3] = 0; // Transparent
        } else if (diff < tolerance + 20 || (isNeutral && r > 160 && g > 160 && b > 160)) {
          data[i + 3] = Math.round(((diff - tolerance) / 20) * 255);
        }
      }

      ctx.putImageData(imgData, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png')
      );

      if (!blob) throw new Error('Blob generation failed');
      const pngFile = new File([blob], `tryon_${activeView}_clean_${Date.now()}.png`, { type: 'image/png' });
      const newUrl = await onUploadFile(pngFile);

      if (isFront) {
        onUpdate({
          tryon_image_url: newUrl,
          tryon_bridge_x: curFrontX,
          tryon_bridge_y: curFrontY,
          tryon_scale: curFrontScale,
          tryon_side_image_url: tryonSideImageUrl || null,
          tryon_side_anchor_x: curSideX,
          tryon_side_anchor_y: curSideY,
          tryon_side_scale: curSideScale,
        });
      } else {
        onUpdate({
          tryon_image_url: tryonImageUrl,
          tryon_bridge_x: curFrontX,
          tryon_bridge_y: curFrontY,
          tryon_scale: curFrontScale,
          tryon_side_image_url: newUrl,
          tryon_side_anchor_x: curSideX,
          tryon_side_anchor_y: curSideY,
          tryon_side_scale: curSideScale,
        });
      }
    } catch (err: any) {
      console.error('Background removal error:', err);
      setUploadError('Failed to auto-remove background: ' + (err.message || 'Error'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset calibration
  const handleReset = () => {
    if (isFront) {
      onUpdate({
        tryon_image_url: tryonImageUrl,
        tryon_bridge_x: 0.5,
        tryon_bridge_y: 0.45,
        tryon_scale: 1.0,
        tryon_side_image_url: tryonSideImageUrl || null,
        tryon_side_anchor_x: curSideX,
        tryon_side_anchor_y: curSideY,
        tryon_side_scale: curSideScale,
        tryon_asset_type: is3D ? '3d' : '2d',
      });
    } else {
      onUpdate({
        tryon_image_url: tryonImageUrl,
        tryon_bridge_x: curFrontX,
        tryon_bridge_y: curFrontY,
        tryon_scale: curFrontScale,
        tryon_side_image_url: tryonSideImageUrl || null,
        tryon_side_anchor_x: 0.15,
        tryon_side_anchor_y: 0.50,
        tryon_side_scale: 1.0,
        tryon_asset_type: is3D ? '3d' : '2d',
      });
    }
  };

  // Remove asset
  const handleRemoveAsset = () => {
    if (isFront) {
      onUpdate({
        tryon_image_url: null,
        tryon_bridge_x: 0.5,
        tryon_bridge_y: 0.45,
        tryon_scale: 1.0,
        tryon_side_image_url: tryonSideImageUrl || null,
        tryon_side_anchor_x: curSideX,
        tryon_side_anchor_y: curSideY,
        tryon_side_scale: curSideScale,
        tryon_asset_type: null,
      });
    } else {
      onUpdate({
        tryon_image_url: tryonImageUrl,
        tryon_bridge_x: curFrontX,
        tryon_bridge_y: curFrontY,
        tryon_scale: curFrontScale,
        tryon_side_image_url: null,
        tryon_side_anchor_x: 0.15,
        tryon_side_anchor_y: 0.50,
        tryon_side_scale: 1.0,
        tryon_asset_type: is3D ? '3d' : '2d',
      });
    }
  };

  return (
    <div className="bg-slate-50 border border-[#C6A15B]/30 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-[#C6A15B]/15 text-[#A4813E] flex items-center justify-center shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>Virtual Try-On Dual-Angle Asset Studio</span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-mono lowercase">
                {is3D ? '3d glb active' : 'png & 3d glb support'}
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">
              {is3D
                ? '3D GLB model uploaded. Automatically tracks head rotation, nose bridge, and front/side angles.'
                : 'Calibrate Front-View (rims & bridge) and Side-View (temple profile), or upload a complete 3D GLB model.'}
            </p>
          </div>
        </div>

        {/* View Switcher: Front View vs Side View */}
        <div className="inline-flex rounded-xl bg-white border border-slate-200 p-1 shadow-xs text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveView('front')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'front'
                ? 'bg-[#0A0A0A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>{is3D ? '1. 3D Model' : '1. Front View'}</span>
            {tryonImageUrl ? (
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-amber-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveView('side')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'side'
                ? 'bg-[#0A0A0A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>{is3D ? '2. Side (3D Built-in)' : '2. Side View'}</span>
            {tryonSideImageUrl || is3D ? (
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-slate-300" />
            )}
          </button>
        </div>
      </div>

      {/* Validation or Upload Error Banner */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle size={15} className="shrink-0 text-red-500" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* View Header Info & Sub-tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white border border-slate-200/80 rounded-xl p-3">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-[#C6A15B]" />
          <div>
            <span className="text-xs font-bold text-slate-800">
              {is3D
                ? '3D GLB/GLTF Eyewear Model'
                : isFront
                ? 'Front-Facing Eyewear Cutout'
                : 'Side-Profile Temple Cutout'}
            </span>
            <span className="text-[11px] text-slate-500 ml-2">
              {is3D
                ? '(Includes full 3D geometry with front frame and temple arms)'
                : isFront
                ? '(Used when customer faces camera)'
                : '(Used when customer turns head left/right)'}
            </span>
          </div>
        </div>

        {activeImageUrl && (
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('calibrate')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'calibrate'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {is3D ? 'Model Details' : 'Anchor Tool'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
                activeTab === 'preview'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye size={12} />
              Face Simulation
            </button>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/png,image/webp,.glb,.gltf,model/gltf-binary,model/gltf+json"
        className="hidden"
        onChange={handleUploadPng}
      />

      {/* State A: No image uploaded for active view */}
      {!activeImageUrl ? (
        <div className="space-y-3">
          <div className="bg-white border-2 border-dashed border-[#C6A15B]/50 rounded-xl p-6 text-center space-y-2">
            <div className="h-10 w-10 mx-auto rounded-full bg-[#C6A15B]/10 text-[#A4813E] flex items-center justify-center">
              <Upload size={18} />
            </div>
            <p className="text-xs font-bold text-slate-800">
              {isFront ? 'No Front-View Cutout or 3D Model Assigned Yet' : 'No Side-View Cutout Assigned Yet (Optional)'}
            </p>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto leading-relaxed">
              {isFront
                ? 'Upload a transparent PNG front frame cutout OR a 3D glasses model (.glb / .gltf) for Virtual Try-On.'
                : 'Upload a transparent PNG showing the glasses from the side profile (hinge and temple arm silhouette).'}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-[#0A0A0A] hover:bg-[#C6A15B] text-white hover:text-[#0A0A0A] text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Upload size={14} />
                <span>Upload {isFront ? 'PNG Cutout or 3D Model (.glb)' : 'Side PNG Cutout'}</span>
              </button>
            </div>
          </div>

          {/* Quick pick from catalog photos */}
          {candidateImages.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-semibold text-slate-700 block">
                Or pick an uploaded product photo to use for {isFront ? 'Front View' : 'Side View'}:
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {candidateImages.map((imgUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (isFront) {
                        onUpdate({
                          tryon_image_url: imgUrl,
                          tryon_bridge_x: 0.5,
                          tryon_bridge_y: 0.45,
                          tryon_scale: 1.0,
                          tryon_side_image_url: tryonSideImageUrl || null,
                          tryon_side_anchor_x: curSideX,
                          tryon_side_anchor_y: curSideY,
                          tryon_side_scale: curSideScale,
                        });
                      } else {
                        onUpdate({
                          tryon_image_url: tryonImageUrl,
                          tryon_bridge_x: curFrontX,
                          tryon_bridge_y: curFrontY,
                          tryon_scale: curFrontScale,
                          tryon_side_image_url: imgUrl,
                          tryon_side_anchor_x: 0.15,
                          tryon_side_anchor_y: 0.50,
                          tryon_side_scale: 1.0,
                        });
                      }
                    }}
                    className="h-16 w-24 bg-white border border-slate-200 hover:border-[#C6A15B] rounded-lg p-1 shrink-0 overflow-hidden group cursor-pointer transition-all hover:scale-105"
                  >
                    <img src={imgUrl} alt="Candidate" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* State B: Active Image is Present - Calibration & Simulation UI */
        <div className="space-y-4">
          {activeTab === 'calibrate' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Asset Display Area */}
              <div className="md:col-span-8 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    {is3D && isFront ? (
                      <>
                        <Box size={14} className="text-[#A4813E]" />
                        <span>3D Eyewear Model (.glb / .gltf)</span>
                      </>
                    ) : (
                      <>
                        <Crosshair size={13} className="text-[#A4813E]" />
                        <span>
                          {isFront
                            ? 'Click frame to set Nose Bridge Center:'
                            : 'Click frame to set Front Hinge Attachment Point:'}
                        </span>
                      </>
                    )}
                  </span>
                  {!is3D && (
                    <span className="font-mono text-slate-500">
                      X: {Math.round(activeAnchorX * 100)}% · Y: {Math.round(activeAnchorY * 100)}%
                    </span>
                  )}
                </div>

                {is3D && isFront ? (
                  <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-slate-950 via-slate-900 to-black rounded-xl overflow-hidden border border-[#C6A15B]/40 flex flex-col items-center justify-center p-6 text-center select-none shadow-inner">
                    <div className="h-14 w-14 rounded-2xl bg-[#C6A15B]/15 border border-[#C6A15B]/30 text-[#C6A15B] flex items-center justify-center mb-3 shadow-lg">
                      <Box size={28} />
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-bold mb-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      3D Glasses Model Active
                    </div>
                    <p className="text-xs font-mono text-white/90 truncate max-w-sm">{tryonImageUrl}</p>
                    <p className="text-[11px] text-slate-400 max-w-md mt-1 leading-relaxed">
                      Complete 3D eyewear mesh with front rims, nose bridge, and temple arms. Auto-aligns to face landmarks in real-time.
                    </p>
                  </div>
                ) : (
                  <div
                    ref={frameContainerRef}
                    onClick={handleFrameClick}
                    className="relative aspect-[16/9] w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:12px_12px] bg-white border-2 border-slate-300 hover:border-[#C6A15B] rounded-xl overflow-hidden flex items-center justify-center cursor-crosshair select-none shadow-inner"
                    title={isFront ? 'Click to place nose bridge anchor' : 'Click to place temple hinge anchor'}
                  >
                    <img
                      src={activeImageUrl!}
                      alt={isFront ? 'Front Asset' : 'Side Asset'}
                      className="max-h-[85%] max-w-[90%] object-contain pointer-events-none"
                    />

                    {/* Moveable crosshair anchor */}
                    <div
                      className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-75"
                      style={{
                        left: `${activeAnchorX * 100}%`,
                        top: `${activeAnchorY * 100}%`,
                      }}
                    >
                      <div className="relative flex items-center justify-center">
                        <div className="h-6 w-6 rounded-full border-2 border-red-500 bg-red-500/20 animate-ping absolute" />
                        <div className="h-4 w-4 rounded-full border-2 border-red-600 bg-red-600/40 flex items-center justify-center shadow-md">
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        </div>
                        <span className="absolute top-4 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-black/85 text-white font-mono text-[9px] font-bold whitespace-nowrap shadow-xs">
                          {isFront ? 'Bridge Anchor' : 'Hinge Anchor'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {!is3D && (
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <HelpCircle size={11} className="text-slate-400 shrink-0" />
                    <span>
                      {isFront
                        ? 'Click directly between the two lenses where the nose bridge connects.'
                        : 'Click at the front hinge where the side arm connects to the eye rim.'}
                    </span>
                  </p>
                )}
              </div>

              {/* Controls Column */}
              <div className="md:col-span-4 bg-white border border-slate-200 rounded-xl p-3.5 space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Scale adjustment slider */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1 font-semibold text-slate-700">
                      <span>{is3D ? '3D Model Scale Multiplier:' : isFront ? 'Front Frame Scale:' : 'Side Profile Scale:'}</span>
                      <span className="font-mono text-[#A4813E]">{Math.round(activeScale * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.75"
                      max="1.35"
                      step="0.01"
                      value={activeScale}
                      onChange={(e) => {
                        const newScale = parseFloat(e.target.value);
                        if (isFront) {
                          onUpdate({
                            tryon_image_url: tryonImageUrl,
                            tryon_bridge_x: curFrontX,
                            tryon_bridge_y: curFrontY,
                            tryon_scale: newScale,
                            tryon_side_image_url: tryonSideImageUrl || null,
                            tryon_side_anchor_x: curSideX,
                            tryon_side_anchor_y: curSideY,
                            tryon_side_scale: curSideScale,
                            tryon_asset_type: is3D ? '3d' : '2d',
                          });
                        } else {
                          onUpdate({
                            tryon_image_url: tryonImageUrl,
                            tryon_bridge_x: curFrontX,
                            tryon_bridge_y: curFrontY,
                            tryon_scale: curFrontScale,
                            tryon_side_image_url: tryonSideImageUrl || null,
                            tryon_side_anchor_x: curSideX,
                            tryon_side_anchor_y: curSideY,
                            tryon_side_scale: newScale,
                            tryon_asset_type: is3D ? '3d' : '2d',
                          });
                        }
                      }}
                      className="w-full accent-[#C6A15B] cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-0.5">
                      <span>75%</span>
                      <span>Default 100%</span>
                      <span>135%</span>
                    </div>
                  </div>

                  {/* Auto Background Eraser (2D PNG only) */}
                  {!is3D && (
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={handleAutoRemoveBackground}
                        className="w-full py-2 px-2.5 rounded-lg border border-[#C6A15B] bg-[#C6A15B]/10 hover:bg-[#C6A15B] text-[#A4813E] hover:text-[#0A0A0A] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                        title="Automatically converts white or light background to transparent PNG"
                      >
                        <Wand2 size={13} />
                        <span>{isProcessing ? 'Removing Background...' : 'Auto-Remove White BG'}</span>
                      </button>
                      <p className="text-[9px] text-slate-500 leading-tight">
                        Use if your {isFront ? 'front' : 'side'} photo has a white studio background.
                      </p>
                    </div>
                  )}

                  {/* Replace Asset */}
                  <div className="pt-1">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Upload size={11} />
                      <span>{is3D ? 'Replace 3D Model (.glb)' : 'Replace with new PNG'}</span>
                    </button>
                  </div>
                </div>

                {/* Reset & Remove actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[10px] text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={11} />
                    Reset Calibration
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveAsset}
                    className="text-[10px] text-red-600 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Trash2 size={11} />
                    Remove {is3D && isFront ? '3D Model' : isFront ? 'Front' : 'Side'} Asset
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Face Simulation Tab */
            <div className="relative aspect-[16/9] w-full max-h-72 bg-gradient-to-b from-slate-900 to-black rounded-xl overflow-hidden flex items-center justify-center select-none">
              {isFront && is3D ? (
                /* 3D Model Live Simulation Card */
                <div className="relative flex flex-col items-center justify-center p-6 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-[#C6A15B]/20 border border-[#C6A15B]/40 text-[#C6A15B] flex items-center justify-center mb-2 shadow-lg">
                    <Box size={28} />
                  </div>
                  <h4 className="text-sm font-bold text-white">3D Model Virtual Try-On Ready</h4>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                    In the customer store, Three.js renders this 3D model with realistic lighting directly onto the live camera stream with full 360° yaw, pitch, and roll tracking.
                  </p>
                  <div className="mt-3 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[10px] text-[#C6A15B] font-mono">
                    Scale Multiplier: {Math.round(curFrontScale * 100)}%
                  </div>
                </div>
              ) : isFront ? (
                /* Front View Simulation */
                <div className="relative h-64 w-48 flex items-center justify-center">
                  <svg
                    viewBox="0 0 200 260"
                    className="h-full w-full text-slate-800 opacity-60 fill-current"
                  >
                    <path d="M100 20 C 50 20, 30 70, 30 130 C 30 190, 65 240, 100 240 C 135 240, 170 190, 170 130 C 170 70, 150 20, 100 20 Z" />
                    <ellipse cx="26" cy="130" rx="6" ry="20" />
                    <ellipse cx="174" cy="130" rx="6" ry="20" />
                    <circle cx="70" cy="115" r="7" fill="#475569" />
                    <circle cx="130" cy="115" r="7" fill="#475569" />
                    <path d="M100 115 L 97 145 L 103 145 Z" fill="#475569" />
                    <line x1="88" y1="175" x2="112" y2="175" stroke="#475569" strokeWidth="2" />
                  </svg>

                  <div
                    className="absolute pointer-events-none transition-transform duration-150"
                    style={{
                      top: '115px',
                      left: '50%',
                      transform: `translate(-${curFrontX * 100}%, -${curFrontY * 100}%) scale(${curFrontScale * 0.9})`,
                      width: '160px',
                    }}
                  >
                    <img
                      src={tryonImageUrl!}
                      alt="Front Frame on Face"
                      className="w-full h-auto object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]"
                    />
                  </div>
                </div>
              ) : (
                /* Side Profile Simulation */
                <div className="relative h-64 w-56 flex items-center justify-center">
                  <svg
                    viewBox="0 0 220 260"
                    className="h-full w-full text-slate-800 opacity-60 fill-current"
                  >
                    {/* Side profile silhouette facing left */}
                    <path d="M 120 25 C 80 25, 60 70, 60 110 C 55 118, 45 130, 48 145 C 50 152, 60 155, 65 165 C 65 175, 58 185, 65 195 C 70 205, 85 240, 130 240 C 165 240, 175 180, 175 130 C 175 70, 160 25, 120 25 Z" />
                    {/* Ear */}
                    <ellipse cx="140" cy="130" rx="9" ry="24" />
                    {/* Eye corner */}
                    <polygon points="68,110 76,105 76,115" fill="#475569" />
                  </svg>

                  <div
                    className="absolute pointer-events-none transition-transform duration-150"
                    style={{
                      top: '110px',
                      left: '70px',
                      transform: `translate(-${curSideX * 100}%, -${curSideY * 100}%) scale(${curSideScale * 0.85})`,
                      width: '140px',
                    }}
                  >
                    <img
                      src={tryonSideImageUrl!}
                      alt="Side Frame on Face"
                      className="w-full h-auto object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]"
                    />
                  </div>
                </div>
              )}

              <div className="absolute bottom-2.5 left-3 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10 text-[10px] text-white">
                <span className="text-[#C6A15B] font-bold">
                  {isFront ? 'Front Live Simulation:' : 'Side Live Simulation:'}
                </span>{' '}
                {isFront && is3D
                  ? `3D GLB model calibrated at ${Math.round(curFrontScale * 100)}% scale.`
                  : isFront
                  ? `Positioned at nose bridge at ${Math.round(curFrontScale * 100)}% scale.`
                  : `Positioned at temple hinge at ${Math.round(curSideScale * 100)}% scale.`}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
