import { useEffect, useRef, useState, useMemo } from "react";
import { Volume2, VolumeX, Sparkles } from "lucide-react";

interface CineLensHUDProps {
  progress: number; // 0 to 1
  percentage: number; // 0 to 100
  isReady: boolean;
  onSkip: () => void;
}

const F_STOPS = [
  { val: "f/22", threshold: 0.05 },
  { val: "f/16", threshold: 0.15 },
  { val: "f/11", threshold: 0.28 },
  { val: "f/8", threshold: 0.42 },
  { val: "f/5.6", threshold: 0.56 },
  { val: "f/4", threshold: 0.70 },
  { val: "f/2.8", threshold: 0.82 },
  { val: "f/2", threshold: 0.90 },
  { val: "f/1.4", threshold: 0.96 },
  { val: "f/1.2", threshold: 1.0 },
];

export function CineLensHUD({
  progress,
  percentage,
  isReady,
  onSkip,
}: CineLensHUDProps) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastFStopRef = useRef<string>("");

  // Determine current active f-stop
  const currentFStop = useMemo(() => {
    for (const stop of F_STOPS) {
      if (progress <= stop.threshold) {
        return stop.val;
      }
    }
    return "f/1.2";
  }, [progress]);

  // Play luxury mechanical lens aperture click when f-stop changes
  useEffect(() => {
    if (!soundEnabled) return;
    if (currentFStop !== lastFStopRef.current) {
      lastFStopRef.current = currentFStop;
      playClickSound();
    }
  }, [currentFStop, soundEnabled]);

  const playClickSound = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.025);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch {
      // AudioContext not allowed or unsupported
    }
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSoundEnabled((prev) => !prev);
    if (!soundEnabled) {
      setTimeout(playClickSound, 50);
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-between p-4 sm:p-8 md:p-12 select-none">
      {/* Top Telemetry Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gold/40 bg-obsidian/80 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-ping" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-gold">
              CARL ZEISS VISION CENTRATION
            </span>
            <span className="font-mono text-[8px] text-steel tracking-widest">
              T* ANTI-REFLECTIVE · 50mm f/1.2 MASTER PRIME
            </span>
          </div>
        </div>

        {/* Audio Toggle & Skip indicator */}
        <div className="pointer-events-auto flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSound}
            aria-label={soundEnabled ? "Mute mechanical audio" : "Enable mechanical audio"}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-paper/15 bg-obsidian/60 text-paper/80 backdrop-blur-md transition-colors hover:border-gold hover:text-gold"
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>

          <button
            type="button"
            onClick={onSkip}
            className="hidden sm:flex items-center gap-1.5 rounded-full border border-paper/15 bg-obsidian/60 px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-paper/80 backdrop-blur-md transition-colors hover:border-gold hover:text-gold"
          >
            <span>[ESC] SKIP</span>
          </button>
        </div>
      </div>

      {/* Center Reticle & Optical Crosshair Overlay */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {/* Outer Circular Optical Scale */}
        <div className="relative flex h-[310px] w-[310px] sm:h-[440px] sm:w-[440px] md:h-[540px] md:w-[540px] items-center justify-center">
          {/* Subtle Rotating Compass Ring */}
          <div className="absolute inset-0 rounded-full border border-gold/15 animate-[spin_90s_linear_infinite]" />
          <div className="absolute inset-4 rounded-full border border-dashed border-paper/10 animate-[spin_60s_linear_infinite_reverse]" />
          
          {/* Degree Marks SVG */}
          <svg className="absolute inset-0 h-full w-full pointer-events-none opacity-40" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-gold/40" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="1, 4" className="text-steel" />
            {/* Cardinal axis crosshairs */}
            <line x1="50" y1="2" x2="50" y2="8" stroke="currentColor" strokeWidth="0.5" className="text-gold" />
            <line x1="50" y1="92" x2="50" y2="98" stroke="currentColor" strokeWidth="0.5" className="text-gold" />
            <line x1="2" y1="50" x2="8" y2="50" stroke="currentColor" strokeWidth="0.5" className="text-gold" />
            <line x1="92" y1="50" x2="98" y2="50" stroke="currentColor" strokeWidth="0.5" className="text-gold" />
          </svg>

          {/* Exact Center: The Bapat Logo & Wordmark */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {/* Glowing Logo Container */}
            <div className="relative flex items-center justify-center">
              {/* Outer Golden Glow */}
              <div className="absolute -inset-3 rounded-full bg-gold/20 blur-xl animate-pulse" />
              
              {/* Circular Emblem */}
              <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 items-center justify-center rounded-full border border-gold/45 bg-obsidian/80 p-3 sm:p-4 md:p-5 shadow-[0_0_35px_rgba(212,175,55,0.3)] backdrop-blur-md">
                <img
                  src="/bapat-logo.png"
                  alt="Bapat Optics"
                  className="h-full w-full object-contain filter drop-shadow-[0_2px_12px_rgba(212,175,55,0.5)]"
                />
              </div>
            </div>

            {/* Brand Wordmark */}
            <div className="mt-2.5 sm:mt-3 flex flex-col items-center">
              <span className="display text-xl sm:text-2xl md:text-3xl tracking-wide text-paper drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                BAPAT<span className="text-gold">.</span>
              </span>
              <span className="eyebrow mt-0.5 text-[8px] sm:text-[9px] tracking-[0.3em] text-steel drop-shadow-md">
                OPTICS · PUNE · SINCE 2011
              </span>
            </div>
          </div>

          {/* Aperture Status Badge */}
          <div className="absolute top-4 sm:top-6 flex flex-col items-center">
            <div className="flex items-center gap-1.5 rounded-full border border-gold/30 bg-obsidian/70 px-2.5 py-0.5 backdrop-blur-md">
              <Sparkles size={9} className="text-gold" />
              <span className="font-mono text-[9px] sm:text-[10px] font-semibold text-gold tracking-widest">
                APERTURE {currentFStop}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Aperture Strip & Telemetry */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* F-Stop Scale Bar */}
        <div className="pointer-events-auto flex items-center justify-center gap-1.5 sm:gap-3 rounded-2xl border border-paper/15 bg-obsidian/75 px-3 sm:px-5 py-2 backdrop-blur-md">
          {F_STOPS.map((stop) => {
            const isActive = stop.val === currentFStop;
            const isPassed = progress >= stop.threshold;
            return (
              <div
                key={stop.val}
                className={`flex flex-col items-center transition-all duration-300 ${
                  isActive
                    ? "scale-110 text-gold font-bold"
                    : isPassed
                    ? "text-paper/70"
                    : "text-steel/40"
                }`}
              >
                <span className="font-mono text-[9px] sm:text-[11px]">{stop.val}</span>
                <span
                  className={`mt-1 h-1 w-1 rounded-full transition-all ${
                    isActive
                      ? "bg-gold scale-150 shadow-[0_0_8px_rgba(212,175,55,0.8)]"
                      : isPassed
                      ? "bg-paper/50"
                      : "bg-paper/10"
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Big Counter & Status */}
        <div className="flex w-full max-w-[600px] flex-col items-center text-center">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl sm:text-5xl font-light tracking-tight text-paper">
              {String(percentage).padStart(2, "0")}
            </span>
            <span className="font-mono text-xs sm:text-sm text-gold">%</span>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className="h-px w-6 sm:w-12 bg-gold/40" />
            <p className="font-mono text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-steel">
              {isReady
                ? "OPTICAL AXIS CALIBRATED · 20/20 CLARITY"
                : "CALIBRATING 12-BLADE TITANIUM IRIS"}
            </p>
            <span className="h-px w-6 sm:w-12 bg-gold/40" />
          </div>

          {/* Click to enter prompt */}
          <p className="pointer-events-auto mt-2 cursor-pointer font-mono text-[8px] sm:text-[9px] tracking-widest text-paper/40 hover:text-gold transition-colors">
            TAP OR CLICK ANYWHERE TO ENTER
          </p>
        </div>
      </div>
    </div>
  );
}
