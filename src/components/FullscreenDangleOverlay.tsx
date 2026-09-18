import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  Layers,
  Compass,
  ChevronUp,
  Maximize2
} from 'lucide-react';
import { CharmItem, DangleSettings, RitualState } from '../types';
import { DangleCanvas } from './DangleCanvas';
import { audioSynth } from '../utils/audioSynth';

interface FullscreenDangleOverlayProps {
  settings: DangleSettings;
  currentCharm: CharmItem;
  ritualState: RitualState;
  tiltX: number;
  onTriggerRitual: (actionName?: string) => void;
  onClose: () => void;
  onUpdateSettings: (updater: (prev: DangleSettings) => DangleSettings) => void;
  onSelectCharm: (id: string) => void;
  allCharms: CharmItem[];
}

export const FullscreenDangleOverlay: React.FC<FullscreenDangleOverlayProps> = ({
  settings,
  currentCharm,
  ritualState,
  tiltX,
  onTriggerRitual,
  onClose,
  onUpdateSettings,
  onSelectCharm,
  allCharms,
}) => {
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight : 600,
  });
  const [showControls, setShowControls] = useState<boolean>(true);
  const [showCharmPicker, setShowCharmPicker] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(audioSynth.enabled);
  const [testSwingTrigger, setTestSwingTrigger] = useState<number>(0);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-hide controls after 6 seconds of inactivity for a truly serene talisman feel
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 7000);

    return () => clearTimeout(timer);
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    audioSynth.enabled = next;
    setSoundEnabled(next);
    if (next) audioSynth.playSnapSound();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden select-none bg-neutral-950/80 backdrop-blur-md"
      onPointerDown={() => setShowControls(true)}
    >
      {/* Subtle ambient talisman backdrop glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(245, 158, 11, 0.15) 0%, transparent 65%)',
        }}
      />

      {/* Top Hanging Screen Charm Canvas */}
      <div className="absolute inset-0 z-10">
        <DangleCanvas
          charm={currentCharm}
          physics={settings.physics}
          appearance={settings.appearance}
          horizontalPercent={settings.position.horizontalPercent}
          containerWidth={dimensions.width}
          containerHeight={dimensions.height}
          interactive={true}
          externalTiltX={tiltX}
          testSwingTrigger={testSwingTrigger}
          ritualState={ritualState}
          onRitualTrigger={onTriggerRitual}
          onAnchorMove={(pct) =>
            onUpdateSettings((prev) => ({
              ...prev,
              position: { ...prev.position, horizontalPercent: pct },
            }))
          }
        />
      </div>

      {/* Top Edge Notch Alignment Hint */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/40 backdrop-blur-md rounded-b-xl text-[10px] text-neutral-400 font-medium z-20 pointer-events-none transition-opacity duration-500">
        <span>Hanging from screen top • Drag or flick to sway</span>
      </div>

      {/* Floating Ambient Quick Controls Bar */}
      <div
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-30 transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-30 hover:opacity-100 translate-y-2'
        }`}
      >
        <div className="flex items-center gap-1.5 p-1.5 bg-neutral-900/90 border border-white/10 rounded-full shadow-2xl backdrop-blur-xl">
          {/* Quick Charm Swapper */}
          <button
            onClick={() => setShowCharmPicker((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-xs font-semibold text-amber-300 transition-colors cursor-pointer"
            title="Switch Equipped Charm"
          >
            <span className="text-sm">🎋</span>
            <span className="truncate max-w-[110px]">{currentCharm.name}</span>
          </button>

          {/* Trigger Ritual Button */}
          <button
            onClick={() => onTriggerRitual()}
            className="p-2 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-transform active:scale-90 cursor-pointer shadow-md shadow-amber-500/20"
            title={currentCharm.ritualText || 'Perform Ritual / Bless'}
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Gentle Test Swing */}
          <button
            onClick={() => {
              setTestSwingTrigger((prev) => prev + 1);
            }}
            className="p-2 rounded-full hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Gentle Swing"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-full hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
          </button>

          {/* Exit Fullscreen Dangle */}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer ml-1"
            title="Exit Fullscreen Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Charm Picker Drawer */}
      {showCharmPicker && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 w-[92vw] max-w-md bg-neutral-900/95 border border-white/10 rounded-2xl p-3 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-2">
            <span className="text-xs font-bold text-white">Equip Charm</span>
            <button
              onClick={() => setShowCharmPicker(false)}
              className="text-neutral-400 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
            {allCharms.map((c) => {
              const isSelected = c.id === currentCharm.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectCharm(c.id);
                    setShowCharmPicker(false);
                    audioSynth.playSnapSound();
                  }}
                  className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-white'
                      : 'bg-neutral-950/60 border-white/5 text-neutral-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <span className="text-xl">
                    {c.category === 'cute' ? '🧋' : c.category === 'protection' ? '🧿' : '🎋'}
                  </span>
                  <span className="text-[10px] font-medium leading-tight truncate w-full">
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
