import React from 'react';
import {
  ArrowLeft,
  MoveHorizontal,
  Smartphone,
  Touchpad,
  Camera,
  RotateCcw
} from 'lucide-react';
import { DangleSettings, DEFAULT_POSITION } from '../../types';

interface PositionViewProps {
  settings: DangleSettings;
  onUpdateSettings: (updater: (prev: DangleSettings) => DangleSettings) => void;
  onBack: () => void;
}

export const PositionView: React.FC<PositionViewProps> = ({
  settings,
  onUpdateSettings,
  onBack,
}) => {
  const { position } = settings;

  const handleResetPosition = () => {
    onUpdateSettings((prev) => ({
      ...prev,
      position: { ...DEFAULT_POSITION },
    }));
  };

  const handleSetPreset = (percent: number) => {
    onUpdateSettings((prev) => ({
      ...prev,
      position: { ...prev.position, horizontalPercent: percent },
    }));
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between sticky top-0 bg-neutral-950/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <button
            id="position-back-btn"
            onClick={onBack}
            className="p-2 -ml-2 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-white">Position & Anchor</h2>
            <p className="text-[11px] text-neutral-400">Avoid camera cutouts and status icons</p>
          </div>
        </div>

        <button
          onClick={handleResetPosition}
          className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-indigo-400 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      <div className="p-4 space-y-5 max-w-lg mx-auto w-full">
        {/* Visual Placement Schematic */}
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/5 flex flex-col items-center">
          <div className="text-xs font-semibold text-neutral-300 mb-3 flex items-center gap-2">
            <Camera className="w-3.5 h-3.5 text-neutral-400" />
            <span>Top Bezel Attachment Diagram</span>
          </div>

          <div className="w-full h-20 rounded-xl bg-neutral-950 border border-white/10 relative overflow-hidden flex items-start">
            {/* Center camera punch hole */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black border border-neutral-700 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-900/80" />
            </div>

            {/* Left status icons */}
            <div className="absolute top-2 left-3 text-[9px] font-mono text-neutral-400">
              09:41
            </div>

            {/* Right status icons */}
            <div className="absolute top-2 right-3 text-[9px] font-mono text-neutral-400">
              5G • 98%
            </div>

            {/* Anchor Marker */}
            <div
              className="absolute top-0 flex flex-col items-center transition-all duration-150"
              style={{
                left: `${position.horizontalPercent * 100}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <div className="w-4 h-2 bg-amber-400 rounded-b shadow-sm" />
              <div className="w-0.5 h-6 bg-amber-400/80" />
              <div className="w-3 h-3 rounded-full bg-indigo-500 border border-white shadow-md text-[7px] text-white flex items-center justify-center font-bold">
                ✓
              </div>
            </div>
          </div>
        </div>

        {/* Position Presets */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-300 block">Quick Placement Presets</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleSetPreset(0.24)}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                Math.abs(position.horizontalPercent - 0.24) < 0.05
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                  : 'bg-neutral-900 border-white/5 text-neutral-300 hover:text-white'
              }`}
            >
              Left Wing (24%)
            </button>
            <button
              onClick={() => handleSetPreset(0.5)}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                Math.abs(position.horizontalPercent - 0.5) < 0.05
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                  : 'bg-neutral-900 border-white/5 text-neutral-300 hover:text-white'
              }`}
            >
              Center (50%)
            </button>
            <button
              onClick={() => handleSetPreset(0.74)}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                Math.abs(position.horizontalPercent - 0.74) < 0.05
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                  : 'bg-neutral-900 border-white/5 text-neutral-300 hover:text-white'
              }`}
            >
              Right Wing (74%) ★
            </button>
          </div>
        </div>

        {/* Continuous Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-300">Horizontal Screen Placement</span>
            <span className="text-indigo-400 font-mono font-bold">
              {Math.round(position.horizontalPercent * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.10"
            max="0.90"
            step="0.01"
            value={position.horizontalPercent}
            onChange={(e) =>
              onUpdateSettings((prev) => ({
                ...prev,
                position: { ...prev.position, horizontalPercent: parseFloat(e.target.value) },
              }))
            }
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
            <span>Far Left (10%)</span>
            <span>Camera Notch (50%)</span>
            <span>Far Right (90%)</span>
          </div>
        </div>

        {/* Top Bezel Offset */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-300">Top Bezel Offset</span>
            <span className="text-indigo-400 font-mono font-bold">{position.topOffset} dp</span>
          </div>
          <input
            type="range"
            min="0"
            max="35"
            step="1"
            value={position.topOffset}
            onChange={(e) =>
              onUpdateSettings((prev) => ({
                ...prev,
                position: { ...prev.position, topOffset: parseInt(e.target.value) },
              }))
            }
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <span className="text-[10px] text-neutral-500">
            Pushes the attachment point downward if your phone has a deep teardrop notch.
          </span>
        </div>

        {/* Touch & Interaction Preferences */}
        <div className="space-y-2.5 pt-2">
          <label className="text-xs font-semibold text-neutral-300 block">Gesture & Touch Handling</label>

          <label className="p-3.5 rounded-xl bg-neutral-900/60 border border-white/5 flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-white">Touch Tap Bounce</div>
              <div className="text-[11px] text-neutral-400">Tapping charm gives a playful spring impulse</div>
            </div>
            <input
              type="checkbox"
              checked={position.touchInteraction}
              onChange={(e) =>
                onUpdateSettings((prev) => ({
                  ...prev,
                  position: { ...prev.position, touchInteraction: e.target.checked },
                }))
              }
              className="w-5 h-5 accent-indigo-600 rounded"
            />
          </label>

          <label className="p-3.5 rounded-xl bg-neutral-900/60 border border-white/5 flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-white">Drag & Pull Interaction</div>
              <div className="text-[11px] text-neutral-400">Allows dragging charm to release with pendulum swing</div>
            </div>
            <input
              type="checkbox"
              checked={position.dragInteraction}
              onChange={(e) =>
                onUpdateSettings((prev) => ({
                  ...prev,
                  position: { ...prev.position, dragInteraction: e.target.checked },
                }))
              }
              className="w-5 h-5 accent-indigo-600 rounded"
            />
          </label>

          <label className="p-3.5 rounded-xl bg-neutral-900/60 border border-white/5 flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-white">Start Automatically on Boot</div>
              <div className="text-[11px] text-neutral-400">Restores overlay after phone restart if previously active</div>
            </div>
            <input
              type="checkbox"
              checked={position.autoStartOnBoot}
              onChange={(e) =>
                onUpdateSettings((prev) => ({
                  ...prev,
                  position: { ...prev.position, autoStartOnBoot: e.target.checked },
                }))
              }
              className="w-5 h-5 accent-indigo-600 rounded"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
