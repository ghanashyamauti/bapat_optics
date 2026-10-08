import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Crosshair, 
  Upload, 
  Trash2, 
  Wand2, 
  Eye, 
  CheckCircle2, 
  HelpCircle,
  RotateCcw
} from 'lucide-react';

interface TryOnCalibratorProps {
  tryonImageUrl: string | null;
  bridgeX: number;
  bridgeY: number;
  scale: number;
  candidateImages: string[];
  onUpdate: (data: {
    tryon_image_url: string | null;
    tryon_bridge_x: number;
    tryon_bridge_y: number;
    tryon_scale: number;
  }) => void;
  onUploadFile: (file: File) => Promise<string>;
}

export const TryOnCalibrator: React.FC<TryOnCalibratorProps> = ({
  tryonImageUrl,
  bridgeX,
  bridgeY,
  scale,
  candidateImages,
  onUpdate,
  onUploadFile,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'calibrate' | 'preview'>('calibrate');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const frameContainerRef = useRef<HTMLDivElement>(null);

  // Default values fallback
  const curX = bridgeX ?? 0.5;
  const curY = bridgeY ?? 0.45;
  const curScale = scale ?? 1.0;

  // Handle clicking on the frame image to position the nose bridge anchor
  const handleFrameClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!frameContainerRef.current) return;
    const rect = frameContainerRef.current.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / rect.width;
    const clickY = (e.clientY - rect.top) / rect.height;

    const clampedX = Math.max(0.1, Math.min(0.9, Number(clickX.toFixed(3))));
    const clampedY = Math.max(0.1, Math.min(0.9, Number(clickY.toFixed(3))));

    onUpdate({
      tryon_image_url: tryonImageUrl,
      tryon_bridge_x: clampedX,
      tryon_bridge_y: clampedY,
      tryon_scale: curScale,
    });
  };

  // Upload custom transparent PNG
  const handleUploadPng = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const url = await onUploadFile(file);
      onUpdate({
        tryon_image_url: url,
        tryon_bridge_x: 0.5,
        bridge_y: 0.45,
        scale: 1.0,
      } as any);
    } catch (err) {
      console.error('Failed to upload try-on asset:', err);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Client-side auto background removal for solid white/light backgrounds
  const handleAutoRemoveBackground = async () => {
    if (!tryonImageUrl) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = tryonImageUrl;
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

      // Detect and strip background:
      // 1. Solid background color (sampled from corners)
      // 2. Fake checkerboard squares (white & light-grey squares from fake Google PNGs)
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

        // Check if neutral grey/white (checkerboard square pattern)
        const isNeutral = Math.abs(r - g) < 22 && Math.abs(g - b) < 22 && Math.abs(r - b) < 22;
        const isCheckerboard = isNeutral && r > 175 && g > 175 && b > 175;

        // Check if matching sampled corner background
        const diff = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
        const isSolidBg = diff < tolerance;

        if (isCheckerboard || isSolidBg) {
          data[i + 3] = 0; // Transparent
        } else if (diff < tolerance + 20 || (isNeutral && r > 160 && g > 160 && b > 160)) {
          // Feather edges
          data[i + 3] = Math.round(((diff - tolerance) / 20) * 255);
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // Convert canvas to Blob
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png')
      );

      if (!blob) throw new Error('Blob generation failed');
      const pngFile = new File([blob], `tryon_clean_${Date.now()}.png`, { type: 'image/png' });
      const newUrl = await onUploadFile(pngFile);

      onUpdate({
        tryon_image_url: newUrl,
        tryon_bridge_x: curX,
        tryon_bridge_y: curY,
        tryon_scale: curScale,
      });
    } catch (err) {
      console.error('Background removal error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-slate-50 border border-[#C6A15B]/30 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#C6A15B]/15 text-[#A4813E] flex items-center justify-center">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>3D Virtual Try-On Asset Studio</span>
              {tryonImageUrl && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] bg-emerald-100 text-emerald-700 font-semibold lowercase">
                  <CheckCircle2 size={10} /> Active
                </span>
              )}
            </h4>
            <p className="text-[11px] text-slate-500">
              Calibrate transparent frame cutout & bridge anchor for live 3D face tracking in store.
            </p>
          </div>
        </div>

        {/* View toggle */}
        {tryonImageUrl && (
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('calibrate')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'calibrate'
                  ? 'bg-[#0A0A0A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Anchor Tool
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
                activeTab === 'preview'
                  ? 'bg-[#0A0A0A] text-white shadow-xs'
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
        accept="image/png,image/webp"
        className="hidden"
        onChange={handleUploadPng}
      />

      {/* No try-on image yet: Picker State */}
      {!tryonImageUrl ? (
        <div className="space-y-3">
          <div className="bg-white border border-dashed border-[#C6A15B] rounded-xl p-5 text-center space-y-2">
            <p className="text-xs font-semibold text-slate-800">
              No Virtual Try-On asset assigned yet for this frame.
            </p>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              Select one of your uploaded catalog photos below to convert, or upload a dedicated front-facing transparent PNG.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-[#0A0A0A] hover:bg-[#C6A15B] text-white hover:text-[#0A0A0A] text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Upload size={14} />
                <span>Upload Front PNG Cutout</span>
              </button>
            </div>
          </div>

          {/* Quick pick from candidate catalog photos */}
          {candidateImages.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-700 block">
                Or pick an uploaded product photo to use for Try-On:
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {candidateImages.map((imgUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onUpdate({
                        tryon_image_url: imgUrl,
                        tryon_bridge_x: 0.5,
                        tryon_bridge_y: 0.45,
                        tryon_scale: 1.0,
                      });
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
        /* Image is selected: Calibration and Face Preview UI */
        <div className="space-y-4">
          {activeTab === 'calibrate' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Interactive Anchor Canvas */}
              <div className="md:col-span-8 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <Crosshair size={13} className="text-[#A4813E]" />
                    Click frame to set Nose Bridge Center:
                  </span>
                  <span className="font-mono text-slate-500">
                    X: {Math.round(curX * 100)}% · Y: {Math.round(curY * 100)}%
                  </span>
                </div>

                <div
                  ref={frameContainerRef}
                  onClick={handleFrameClick}
                  className="relative aspect-[16/9] w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:12px_12px] bg-white border-2 border-slate-300 hover:border-[#C6A15B] rounded-xl overflow-hidden flex items-center justify-center cursor-crosshair select-none shadow-inner"
                  title="Click to place nose bridge anchor"
                >
                  {/* Eyewear frame texture */}
                  <img
                    src={tryonImageUrl}
                    alt="Try-On Asset"
                    className="max-h-[85%] max-w-[90%] object-contain pointer-events-none"
                  />

                  {/* Moveable crosshair indicator */}
                  <div
                    className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-75"
                    style={{
                      left: `${curX * 100}%`,
                      top: `${curY * 100}%`,
                    }}
                  >
                    <div className="relative flex items-center justify-center">
                      <div className="h-6 w-6 rounded-full border-2 border-red-500 bg-red-500/20 animate-ping absolute" />
                      <div className="h-4 w-4 rounded-full border-2 border-red-600 bg-red-600/40 flex items-center justify-center shadow-md">
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      </div>
                      <span className="absolute top-4 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-black/85 text-white font-mono text-[9px] font-bold whitespace-nowrap shadow-xs">
                        Bridge Anchor
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                  <HelpCircle size={11} className="text-slate-400 shrink-0" />
                  <span>Click right between the two lenses where the nose bridge connects.</span>
                </p>
              </div>

              {/* Controls Column */}
              <div className="md:col-span-4 bg-white border border-slate-200 rounded-xl p-3.5 space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Scale adjustment slider */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1 font-semibold text-slate-700">
                      <span>Frame Fit Scale:</span>
                      <span className="font-mono text-[#A4813E]">{Math.round(curScale * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.75"
                      max="1.35"
                      step="0.01"
                      value={curScale}
                      onChange={(e) => {
                        onUpdate({
                          tryon_image_url: tryonImageUrl,
                          tryon_bridge_x: curX,
                          tryon_bridge_y: curY,
                          tryon_scale: parseFloat(e.target.value),
                        });
                      }}
                      className="w-full accent-[#C6A15B] cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-0.5">
                      <span>Narrow (75%)</span>
                      <span>Default</span>
                      <span>Wide (135%)</span>
                    </div>
                  </div>

                  {/* Auto Background Eraser */}
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
                      Use if your image has a white studio background to make it transparent.
                    </p>
                  </div>
                </div>

                {/* Reset & Replace actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdate({
                        tryon_image_url: tryonImageUrl,
                        tryon_bridge_x: 0.5,
                        tryon_bridge_y: 0.45,
                        tryon_scale: 1.0,
                      });
                    }}
                    className="text-[10px] text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={11} />
                    Reset Calibration
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onUpdate({
                        tryon_image_url: null,
                        tryon_bridge_x: 0.5,
                        tryon_bridge_y: 0.45,
                        tryon_scale: 1.0,
                      });
                    }}
                    className="text-[10px] text-red-600 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Trash2 size={11} />
                    Remove Asset
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Face Simulation Tab */
            <div className="relative aspect-[16/9] w-full max-h-72 bg-gradient-to-b from-slate-900 to-black rounded-xl overflow-hidden flex items-center justify-center select-none">
              {/* Silhouette Face Graphics */}
              <div className="relative h-64 w-48 flex items-center justify-center">
                <svg
                  viewBox="0 0 200 260"
                  className="h-full w-full text-slate-800 opacity-60 fill-current"
                >
                  {/* Head oval silhouette */}
                  <path d="M100 20 C 50 20, 30 70, 30 130 C 30 190, 65 240, 100 240 C 135 240, 170 190, 170 130 C 170 70, 150 20, 100 20 Z" />
                  {/* Ears */}
                  <ellipse cx="26" cy="130" rx="6" ry="20" />
                  <ellipse cx="174" cy="130" rx="6" ry="20" />
                  {/* Eyes guidelines */}
                  <circle cx="70" cy="115" r="7" fill="#475569" />
                  <circle cx="130" cy="115" r="7" fill="#475569" />
                  {/* Nose & Lips guidelines */}
                  <path d="M100 115 L 97 145 L 103 145 Z" fill="#475569" />
                  <line x1="88" y1="175" x2="112" y2="175" stroke="#475569" strokeWidth="2" />
                </svg>

                {/* Overlaid Eyewear positioned according to bridge anchor */}
                <div
                  className="absolute pointer-events-none transition-transform duration-150"
                  style={{
                    top: '115px', // Eyeline
                    left: '50%',
                    transform: `translate(-${curX * 100}%, -${curY * 100}%) scale(${curScale * 0.9})`,
                    width: '160px',
                  }}
                >
                  <img
                    src={tryonImageUrl}
                    alt="Frame on Face"
                    className="w-full h-auto object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]"
                  />
                </div>
              </div>

              <div className="absolute bottom-2.5 left-3 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10 text-[10px] text-white">
                <span className="text-[#C6A15B] font-bold">Live Simulation:</span> Frame matches eyes & nose bridge at {Math.round(curScale * 100)}% scale.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
