import React, { useState } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Sliders,
  Palette,
  Sparkles,
  Zap,
  Shield,
  HelpCircle,
  Activity,
  Wind
} from 'lucide-react';
import {
  DangleSettings,
  DEFAULT_PHYSICS,
  DEFAULT_APPEARANCE,
  PHYSICS_PRESETS,
  CHARM_WEIGHT_MULTIPLIERS,
  CharmWeightPreset,
  PhysicsQuality,
  PhysicsPresetKey
} from '../../types';
import { audioSynth } from '../../utils/audioSynth';

interface PhysicsViewProps {
  settings: DangleSettings;
  onUpdateSettings: (updater: (prev: DangleSettings) => DangleSettings) => void;
  onBack: () => void;
}

export const PhysicsView: React.FC<PhysicsViewProps> = ({
  settings,
  onUpdateSettings,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'physics' | 'appearance' | 'advanced'>('physics');

  const { physics, appearance } = settings;

  const handleResetPhysics = () => {
    onUpdateSettings((prev) => ({
      ...prev,
      physics: { ...DEFAULT_PHYSICS },
    }));
    audioSynth.playSnapSound();
  };

  const handleResetAppearance = () => {
    onUpdateSettings((prev) => ({
      ...prev,
      appearance: { ...DEFAULT_APPEARANCE },
    }));
    audioSynth.playSnapSound();
  };

  const handleApplyPreset = (presetKey: string) => {
    const preset = PHYSICS_PRESETS[presetKey as PhysicsPresetKey];
    if (!preset) return;
    onUpdateSettings((prev) => ({
      ...prev,
      physics: {
        ...prev.physics,
        ...preset.config,
      },
    }));
    audioSynth.playSnapSound();
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between sticky top-0 bg-neutral-950/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <button
            id="physics-back-btn"
            onClick={onBack}
            className="p-2 -ml-2 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-white">Physics & Style</h2>
            <p className="text-[11px] text-neutral-400">Fine-tune motion dynamics & rope</p>
          </div>
        </div>

        {activeTab === 'physics' ? (
          <button
            onClick={handleResetPhysics}
            className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-indigo-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        ) : (
          <button
            onClick={handleResetAppearance}
            className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-indigo-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="p-2 flex gap-1 border-b border-white/5 bg-neutral-900/40">
        <button
          onClick={() => setActiveTab('physics')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'physics'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Physics</span>
        </button>

        <button
          onClick={() => setActiveTab('appearance')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'appearance'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Appearance</span>
        </button>

        <button
          onClick={() => setActiveTab('advanced')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'advanced'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Advanced</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4 space-y-5 max-w-lg mx-auto w-full">
        {activeTab === 'physics' && (
          <>
            {/* Quick Physics Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-amber-400" />
                  Physics Dynamics Presets
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {Object.values(PHYSICS_PRESETS).map((p) => {
                  const isActive =
                    Math.abs(physics.gravity - p.config.gravity) < 0.2 &&
                    Math.abs(physics.damping - p.config.damping) < 0.01;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleApplyPreset(p.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isActive
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm'
                          : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                      }`}
                    >
                      <span className="block text-xs font-semibold">{p.name}</span>
                      <span className="block text-[10px] text-neutral-500 line-clamp-1">{p.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Simulation Active Toggle */}
            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>Real-Time Physics Simulation</span>
                </div>
                <div className="text-[11px] text-neutral-400">
                  {physics.simulationActive ? 'Active dynamic pendulum & rope engine' : 'Paused (static charm preview)'}
                </div>
              </div>

              <input
                type="checkbox"
                checked={physics.simulationActive}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    physics: { ...prev.physics, simulationActive: e.target.checked },
                  }))
                }
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            {/* Reduce Motion Toggle */}
            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Reduce Motion (Accessibility)</span>
                </div>
                <div className="text-[11px] text-neutral-400">
                  Keeps charm mostly static; minimizes swinging
                </div>
              </div>

              <input
                type="checkbox"
                checked={physics.reduceMotion}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    physics: { ...prev.physics, reduceMotion: e.target.checked },
                  }))
                }
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            {/* Cord Flexibility */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-300">Cord Flexibility</span>
                <span className="text-amber-400 font-mono font-bold">
                  {physics.cordFlexibility < 0.4 ? 'Rigid Chain' : physics.cordFlexibility > 0.75 ? 'Supple Silk' : 'Braided Cord'} ({(physics.cordFlexibility * 100).toFixed(0)}%)
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={physics.cordFlexibility}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    physics: { ...prev.physics, cordFlexibility: parseFloat(e.target.value) },
                  }))
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
                <span>Stiff (Chain)</span>
                <span>Balanced</span>
                <span>Fluid (Silk Ribbon)</span>
              </div>
            </div>

            {/* Wave Propagation Strength */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-300">Wave & Ripple Propagation</span>
                <span className="text-amber-400 font-mono font-bold">
                  {physics.waveStrength === 0 ? 'Disabled' : `${(physics.waveStrength * 100).toFixed(0)}%`}
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.4"
                step="0.1"
                value={physics.waveStrength}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    physics: { ...prev.physics, waveStrength: parseFloat(e.target.value) },
                  }))
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
                <span>None (Straight)</span>
                <span>Natural ripples</span>
                <span>Dramatic whip</span>
              </div>
            </div>

            {/* Virtual Charm Weight Multiplier */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-300">Global Charm Weight Multiplier</span>
                <span className="text-amber-400 font-mono font-bold">
                  {CHARM_WEIGHT_MULTIPLIERS[physics.charmWeight]?.label || 'Medium'}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {(['very_light', 'light', 'medium', 'heavy', 'very_heavy'] as CharmWeightPreset[]).map((wp) => (
                  <button
                    key={wp}
                    onClick={() =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        physics: { ...prev.physics, charmWeight: wp },
                      }))
                    }
                    className={`p-2 rounded-xl border text-center transition-all ${
                      physics.charmWeight === wp
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                        : 'bg-neutral-900 border-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span className="block text-xs capitalize">{wp.replace('_', ' ')}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Simulation Quality / Segments */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-300">Physics Rope Segments & Quality</span>
                <span className="text-amber-400 font-mono font-bold uppercase">{physics.quality}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as PhysicsQuality[]).map((q) => (
                  <button
                    key={q}
                    onClick={() =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        physics: { ...prev.physics, quality: q },
                      }))
                    }
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                      physics.quality === q
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                        : 'bg-neutral-900 border-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span className="block capitalize">{q}</span>
                    <span className="block text-[9px] text-neutral-500">
                      {q === 'low' ? '4 nodes (Battery Saver)' : q === 'medium' ? '6 nodes (Balanced)' : '8 nodes (Cinematic)'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Swing Intensity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-300">Swing Intensity</span>
                <span className="text-indigo-400 font-mono font-bold">
                  {physics.swingIntensity < 0.8 ? 'Gentle' : physics.swingIntensity > 1.3 ? 'Vigorous' : 'Natural'} ({physics.swingIntensity.toFixed(1)}x)
                </span>
              </div>
              <input
                type="range"
                min="0.4"
                max="2.0"
                step="0.1"
                value={physics.swingIntensity}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    physics: { ...prev.physics, swingIntensity: parseFloat(e.target.value) },
                  }))
                }
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
                <span>Subtle</span>
                <span>Balanced</span>
                <span>Energetic</span>
              </div>
            </div>

            {/* Movement Response (Accelerometer sensitivity) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-300">Phone Motion Response</span>
                <span className="text-indigo-400 font-mono font-bold">{physics.movementResponse.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.5"
                step="0.1"
                value={physics.movementResponse}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    physics: { ...prev.physics, movementResponse: parseFloat(e.target.value) },
                  }))
                }
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
                <span>Gentle tilt</span>
                <span>Reactive</span>
                <span>Hyper-sensitive</span>
              </div>
            </div>

            {/* Swing Damping (Air Friction) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-300">Swing Damping (Decay)</span>
                <span className="text-indigo-400 font-mono font-bold">
                  {physics.damping < 0.95 ? 'Brisk stop' : physics.damping > 0.985 ? 'Long drift' : 'Normal'}
                </span>
              </div>
              <input
                type="range"
                min="0.90"
                max="0.995"
                step="0.005"
                value={physics.damping}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    physics: { ...prev.physics, damping: parseFloat(e.target.value) },
                  }))
                }
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
                <span>Quick rest</span>
                <span>Pendulum</span>
                <span>Endless float</span>
              </div>
            </div>

            {/* Gravity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-300">Virtual Gravity</span>
                <span className="text-indigo-400 font-mono font-bold">{physics.gravity.toFixed(1)} m/s²</span>
              </div>
              <input
                type="range"
                min="4.0"
                max="16.0"
                step="0.5"
                value={physics.gravity}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    physics: { ...prev.physics, gravity: parseFloat(e.target.value) },
                  }))
                }
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
                <span>Moon (Floaty)</span>
                <span>Earth (9.8)</span>
                <span>Jupiter (Heavy)</span>
              </div>
            </div>
          </>
        )}

        {activeTab === 'appearance' && (
          <>
            {/* Charm Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-300">Charm Size</span>
                <span className="text-indigo-400 font-mono font-bold">{appearance.charmSize} dp</span>
              </div>
              <input
                type="range"
                min="36"
                max="84"
                step="2"
                value={appearance.charmSize}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    appearance: { ...prev.appearance, charmSize: parseInt(e.target.value) },
                  }))
                }
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Rope Length */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-300">Rope Length</span>
                <span className="text-indigo-400 font-mono font-bold">{physics.ropeLength} dp</span>
              </div>
              <input
                type="range"
                min="70"
                max="240"
                step="5"
                value={physics.ropeLength}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    physics: { ...prev.physics, ropeLength: parseInt(e.target.value) },
                  }))
                }
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Rope Style */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 block">Rope & Cord Weave Style</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'braided', label: 'Kumihimo Braid' },
                  { key: 'twisted', label: 'Twisted Cord' },
                  { key: 'double_loop', label: 'Netsuke Twin Loop' },
                  { key: 'chain', label: 'Jewelry Chain' },
                  { key: 'ribbon', label: 'Satin Ribbon' },
                  { key: 'thread', label: 'Silk Thread' },
                ].map((st) => (
                  <button
                    key={st.key}
                    onClick={() =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        appearance: { ...prev.appearance, ropeStyle: st.key as any },
                      }))
                    }
                    className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all text-center ${
                      appearance.ropeStyle === st.key
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                        : 'bg-neutral-900 border-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rope Color Palette */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 block">Rope Color</label>
              <div className="flex items-center gap-2">
                {[
                  { name: 'Gold', hex: '#d4af37' },
                  { name: 'Silver', hex: '#94a3b8' },
                  { name: 'Crimson', hex: '#dc2626' },
                  { name: 'Black Cord', hex: '#1c1917' },
                  { name: 'Rose Gold', hex: '#f43f5e' },
                  { name: 'Emerald', hex: '#059669' },
                ].map((col) => (
                  <button
                    key={col.hex}
                    onClick={() =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        appearance: { ...prev.appearance, ropeColor: col.hex },
                      }))
                    }
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      appearance.ropeColor === col.hex ? 'scale-110 border-white shadow-lg' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  />
                ))}
                <input
                  type="color"
                  value={appearance.ropeColor}
                  onChange={(e) =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      appearance: { ...prev.appearance, ropeColor: e.target.value },
                    }))
                  }
                  className="w-8 h-8 rounded-lg bg-neutral-900 border border-white/10 cursor-pointer"
                  title="Custom color"
                />
              </div>
            </div>

            {/* Rope Thickness */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-300">Rope Thickness</span>
                <span className="text-indigo-400 font-mono font-bold">{appearance.ropeThickness} px</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={appearance.ropeThickness}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    appearance: { ...prev.appearance, ropeThickness: parseInt(e.target.value) },
                  }))
                }
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Visual Effects Toggles */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <label className="p-3 rounded-xl bg-neutral-900/60 border border-white/5 flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-neutral-300">Drop Shadow</span>
                <input
                  type="checkbox"
                  checked={appearance.hasShadow}
                  onChange={(e) =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      appearance: { ...prev.appearance, hasShadow: e.target.checked },
                    }))
                  }
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
              </label>

              <label className="p-3 rounded-xl bg-neutral-900/60 border border-white/5 flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-neutral-300">Soft Ambient Glow</span>
                <input
                  type="checkbox"
                  checked={appearance.hasGlow}
                  onChange={(e) =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      appearance: { ...prev.appearance, hasGlow: e.target.checked },
                    }))
                  }
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
              </label>
            </div>
          </>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-indigo-300 text-xs flex items-start gap-2">
              <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
              <span>
                These parameters directly configure the native Android <code className="bg-indigo-950 px-1 py-0.5 rounded font-mono">PendulumPhysicsEngine.kt</code> numerical integration loop.
              </span>
            </div>

            {/* Mass */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-300">Virtual Bob Mass</span>
                <span className="text-indigo-400 font-mono font-bold">{physics.mass.toFixed(1)} kg</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={physics.mass}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    physics: { ...prev.physics, mass: parseFloat(e.target.value) },
                  }))
                }
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Spring Stiffness */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-300">Cord Elasticity / Stiffness</span>
                <span className="text-indigo-400 font-mono font-bold">{physics.stiffness.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.4"
                step="0.01"
                value={physics.stiffness}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    physics: { ...prev.physics, stiffness: parseFloat(e.target.value) },
                  }))
                }
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Max Angle Clamp */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-300">Max Swing Angle Limit</span>
                <span className="text-indigo-400 font-mono font-bold">{physics.maxAngleDeg}°</span>
              </div>
              <input
                type="range"
                min="30"
                max="85"
                step="5"
                value={physics.maxAngleDeg}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    physics: { ...prev.physics, maxAngleDeg: parseInt(e.target.value) },
                  }))
                }
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <span className="text-[10px] text-neutral-500">
                Clamps extreme angular momentum to prevent the charm from spinning 360° or flying off-screen.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
