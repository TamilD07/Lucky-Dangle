import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  RotateCcw,
  Sliders,
  MoveHorizontal,
  ShieldCheck,
  Info,
  Power,
  Layers,
  ChevronRight,
  HelpCircle,
  Volume2,
  VolumeX,
  RefreshCw,
  Bell,
  Eye,
  Flame,
  Feather,
  Palette,
  Maximize2
} from 'lucide-react';
import {
  CharmItem,
  DangleSettings,
  RitualState,
  STRING_MATERIALS,
  StringMaterialKey,
} from '../../types';
import { DangleCanvas } from '../DangleCanvas';
import { BUILT_IN_CHARMS } from '../../data/charms';
import { audioSynth } from '../../utils/audioSynth';

interface HomeViewProps {
  settings: DangleSettings;
  currentCharm: CharmItem;
  ritualState: RitualState;
  onTriggerRitual: (actionName?: string) => void;
  onSetGarlandAge: (days: number) => void;
  onUpdateSettings: (updater: (prev: DangleSettings) => DangleSettings) => void;
  onNavigate: (screen: 'library' | 'physics' | 'position' | 'privacy' | 'code') => void;
  onRequestPermission: () => void;
  containerWidth?: number;
  containerHeight?: number;
  onOpenFullscreen?: () => void;
  externalTiltX?: number;
}

export const HomeView: React.FC<HomeViewProps> = ({
  settings,
  currentCharm,
  ritualState,
  onTriggerRitual,
  onSetGarlandAge,
  onUpdateSettings,
  onNavigate,
  onRequestPermission,
  containerWidth = 400,
  containerHeight = 260,
  onOpenFullscreen,
  externalTiltX = 0,
}) => {
  const [testSwingCount, setTestSwingCount] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(audioSynth.enabled);
  const canvasCardRef = useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState<number>(containerWidth);

  useEffect(() => {
    if (!canvasCardRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setMeasuredWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(canvasCardRef.current);
    return () => observer.disconnect();
  }, []);

  const handleToggleEnable = () => {
    if (!settings.isEnabled && !settings.hasOverlayPermission) {
      onRequestPermission();
      return;
    }

    onUpdateSettings((prev) => ({
      ...prev,
      isEnabled: !prev.isEnabled,
    }));
  };

  const handleTestSwing = () => {
    setTestSwingCount((prev) => prev + 1);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    audioSynth.enabled = next;
    setSoundEnabled(next);
    if (next) {
      audioSynth.playSnapSound();
    }
  };

  const handleSelectMaterial = (matKey: StringMaterialKey) => {
    const mat = STRING_MATERIALS[matKey];
    audioSynth.playSnapSound();
    onUpdateSettings((prev) => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        ropeColor: mat.color,
        ropeThickness: mat.width,
        ropeStyle: mat.recommendedStyle,
      },
    }));
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100 overflow-y-auto">
      {/* Live Charm Stage Preview Card */}
      <div className="relative w-full bg-gradient-to-b from-neutral-900 to-neutral-950 border-b border-white/5 p-4 flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Current Charm</span>
            <span className="text-xs font-bold text-amber-400 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 truncate max-w-[150px]">
              {currentCharm.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Enter Fullscreen Dangle Mode Button */}
            {onOpenFullscreen && (
              <button
                onClick={onOpenFullscreen}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-colors active:scale-95 cursor-pointer shadow-sm"
                title="Hang charm directly from top of your device screen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Fullscreen Dangle</span>
              </button>
            )}

            {/* Mute/Sound Toggle */}
            <button
              onClick={handleToggleSound}
              className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-neutral-800 border-white/10 text-amber-400'
                  : 'bg-neutral-900 border-white/5 text-neutral-500'
              }`}
              title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* Test Swing Button */}
            <button
              id="home-test-swing-btn"
              onClick={handleTestSwing}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 border border-white/10 transition-colors active:scale-95 cursor-pointer"
              title="Give charm a realistic pendulum swing"
            >
              <RotateCcw className="w-3 h-3 text-indigo-400" />
              <span>Swing</span>
            </button>
          </div>
        </div>

        {/* Live Canvas Area */}
        <div
          ref={canvasCardRef}
          className="relative w-full h-64 sm:h-72 rounded-2xl bg-neutral-950/90 border border-white/10 overflow-hidden shadow-inner flex items-center justify-center"
        >
          {/* Subtle grid lines */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #f59e0b 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          <DangleCanvas
            charm={currentCharm}
            physics={settings.physics}
            appearance={settings.appearance}
            horizontalPercent={settings.position.horizontalPercent}
            containerWidth={measuredWidth > 0 ? measuredWidth : containerWidth}
            containerHeight={280}
            interactive={true}
            externalTiltX={externalTiltX}
            testSwingTrigger={testSwingCount}
            ritualState={ritualState}
            onRitualTrigger={onTriggerRitual}
            onAnchorMove={(pct) =>
              onUpdateSettings((prev) => ({
                ...prev,
                position: { ...prev.position, horizontalPercent: pct },
              }))
            }
          />

          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-neutral-400 pointer-events-none">
            <span className="bg-neutral-900/80 px-2 py-0.5 rounded border border-white/5">
              Drag charm • Touch clamp to slide
            </span>
            <span className="bg-neutral-900/80 px-2 py-0.5 rounded border border-white/5 font-mono">
              {currentCharm.origin}
            </span>
          </div>
        </div>
      </div>

      {/* Main Controls */}
      <div className="p-4 space-y-4 max-w-lg mx-auto w-full">
        {/* Dedicated Charm Ritual Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900/80 to-neutral-950 border border-amber-500/20 shadow-lg space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Charm Ritual & Lore</span>
              </div>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                {currentCharm.description}
              </p>
            </div>
          </div>

          {/* Contextual Ritual Actions based on Charm Type */}
          <div className="pt-2 border-t border-white/5">
            {currentCharm.id === 'daruma' && (
              <div className="space-y-2">
                <div className="text-[11px] text-neutral-400 flex items-center justify-between">
                  <span>Ritual Progress:</span>
                  <span className="font-semibold text-white">
                    {ritualState.leftEye && ritualState.rightEye
                      ? 'Goal Fulfilled! 🎉'
                      : ritualState.leftEye
                      ? 'Wish Active (Left eye inked)'
                      : 'Blank (Ready for your wish)'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onTriggerRitual('leftEye')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      ritualState.leftEye
                        ? 'bg-neutral-800 text-neutral-300 border border-white/10'
                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{ritualState.leftEye ? 'Re-ink Left Eye' : 'Ink Left Eye (Wish)'}</span>
                  </button>
                  <button
                    onClick={() => onTriggerRitual('rightEye')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      ritualState.rightEye
                        ? 'bg-neutral-800 text-neutral-300 border border-white/10'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{ritualState.rightEye ? 'Re-ink Right Eye' : 'Ink Right (Done)'}</span>
                  </button>
                </div>
              </div>
            )}

            {currentCharm.id === 'nimbu-mirchi' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Garland Age:</span>
                  <span className="font-semibold text-emerald-400">
                    {(ritualState.garlandAgeDays ?? 0) === 0
                      ? 'Day 0: Fresh & Potent'
                      : (ritualState.garlandAgeDays ?? 0) < 7
                      ? `Day ${ritualState.garlandAgeDays}: Absorbing energy`
                      : 'Day 7+: Withered (Renew now)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="7"
                  step="1"
                  value={ritualState.garlandAgeDays ?? 0}
                  onChange={(e) => onSetGarlandAge(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <button
                  onClick={() => onTriggerRitual('garland')}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Hang Fresh Garland (Renew Alakshmi Ward)</span>
                </button>
              </div>
            )}

            {currentCharm.id === 'ghanta' && (
              <button
                onClick={() => onTriggerRitual('ghanta')}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-600/20 transition-all active:scale-95"
              >
                <Bell className="w-4 h-4" />
                <span>Ring the Sacred Bell (Clear Energy)</span>
              </button>
            )}

            {currentCharm.id === 'drishti-bommai' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Protective Pigment Variant:</span>
                  <span className="font-semibold text-amber-400">
                    {[
                      'Classic Ochre Terracotta',
                      'Crimson Raksha Vermilion',
                      'Golden Aura Turmeric',
                      'Midnight Shanti Indigo',
                    ][(ritualState.drishtiVariant ?? 0) % 4]}
                  </span>
                </div>
                <button
                  onClick={() => onTriggerRitual('drishti')}
                  className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-red-600/20 transition-all active:scale-95"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Repaint Guardian Mask</span>
                </button>
              </div>
            )}

            {currentCharm.id === 'chinese-knot' && (
              <button
                onClick={() => onTriggerRitual('knot')}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tie In Good Fortune & Longevity</span>
              </button>
            )}

            {currentCharm.id === 'maneki-neko' && (
              <button
                onClick={() => onTriggerRitual('maneki')}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-600/20 transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Beckon Good Fortune & Prosperity</span>
              </button>
            )}

            {currentCharm.id === 'scarab' && (
              <button
                onClick={() => onTriggerRitual('scarab')}
                className="w-full py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 transition-all active:scale-95"
              >
                <Feather className="w-3.5 h-3.5" />
                <span>
                  {ritualState.wingsSpread ? 'Fold Ceremonial Wings' : 'Unfold Sun-God Wings'}
                </span>
              </button>
            )}

            {currentCharm.id === 'himmeli' && (
              <button
                onClick={() => onTriggerRitual('himmeli')}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-600/20 transition-all active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Set Geometric Straw Crown Turning</span>
              </button>
            )}

            {currentCharm.id === 'nazar-boba' && (
              <button
                onClick={() => onTriggerRitual('boba')}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-600/20 transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Shake the Boba Milk Tea</span>
              </button>
            )}

            {['horseshoe', 'hamsa', 'nazar', 'custom_emoji'].includes(currentCharm.id) && (
              <button
                onClick={() => onTriggerRitual('flick')}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{currentCharm.ritualText || 'Give It a Lucky Flick'}</span>
              </button>
            )}
          </div>
        </div>

        {/* String Materials Selection */}
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              String Material & Cord
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">
              {settings.appearance.ropeStyle} • {settings.appearance.ropeThickness}px
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(STRING_MATERIALS) as StringMaterialKey[]).map((matKey) => {
              const mat = STRING_MATERIALS[matKey];
              const isSelected = settings.appearance.ropeColor === mat.color;

              return (
                <button
                  key={matKey}
                  onClick={() => handleSelectMaterial(matKey)}
                  className={`py-2 px-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-neutral-800 border-amber-500 text-white shadow-sm'
                      : 'bg-neutral-950/60 border-white/5 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: mat.color }}
                  />
                  <span className="text-[11px] font-medium truncate">{mat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Cord Weave & Style */}
          <div className="pt-2 border-t border-white/5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                Weave & Structure
              </span>
              <span className="text-[10px] text-amber-400 font-medium capitalize">
                {settings.appearance.ropeStyle.replace('_', ' ')}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { id: 'braided', label: 'Kumihimo', desc: 'Silk Braid' },
                { id: 'twisted', label: 'Twisted', desc: 'Gilded 2-Ply' },
                { id: 'double_loop', label: 'Twin Loop', desc: 'Netsuke' },
                { id: 'chain', label: 'Chain', desc: 'Rolo Link' },
                { id: 'ribbon', label: 'Ribbon', desc: 'Satin' },
              ].map((styleItem) => {
                const isActive = settings.appearance.ropeStyle === styleItem.id;
                return (
                  <button
                    key={styleItem.id}
                    onClick={() => {
                      audioSynth.playSnapSound();
                      onUpdateSettings((prev) => ({
                        ...prev,
                        appearance: {
                          ...prev.appearance,
                          ropeStyle: styleItem.id as any,
                        },
                      }));
                    }}
                    className={`py-1.5 px-1 rounded-lg border text-center transition-all ${
                      isActive
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
                        : 'bg-neutral-950/40 border-white/5 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <div className="text-[10px] font-bold leading-tight truncate">{styleItem.label}</div>
                    <div className="text-[8px] text-neutral-400 leading-tight truncate">{styleItem.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Enable / Disable Card */}
        <div
          id="main-overlay-toggle-card"
          className={`p-4 rounded-2xl border transition-all ${
            settings.isEnabled
              ? 'bg-gradient-to-r from-emerald-950/30 to-neutral-900 border-emerald-500/30 shadow-lg shadow-emerald-950/20'
              : 'bg-neutral-900/60 border-white/5'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  settings.isEnabled
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                <Power className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Screen Dangle Overlay</span>
                  {settings.isEnabled && (
                    <span className="text-[10px] uppercase font-bold text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-500/20 border border-emerald-500/30">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-xs text-neutral-400">
                  {settings.isEnabled
                    ? 'Charm floats over all apps from top bezel'
                    : 'Overlay is off • Sensors idle (0% battery drain)'}
                </div>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              id="overlay-master-switch"
              onClick={handleToggleEnable}
              className={`w-14 h-8 rounded-full p-1 transition-colors relative cursor-pointer ${
                settings.isEnabled ? 'bg-emerald-500' : 'bg-neutral-800'
              }`}
              title="Toggle Screen Dangle overlay"
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                  settings.isEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {!settings.hasOverlayPermission && (
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-amber-300">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Requires SYSTEM_ALERT_WINDOW permission</span>
              </div>
              <button
                onClick={onRequestPermission}
                className="text-xs font-semibold underline hover:text-amber-200"
              >
                Grant Now
              </button>
            </div>
          )}
        </div>

        {/* Quick Customize Button */}
        <button
          id="home-open-library-btn"
          onClick={() => onNavigate('library')}
          className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-between shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4" />
            <span>Browse Charm Library & Studio ({BUILT_IN_CHARMS.length} Charms)</span>
          </div>
          <ChevronRight className="w-4 h-4 text-indigo-200" />
        </button>

        {/* Settings Navigation Menu */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider px-1">
            Configuration & Tuning
          </span>

          <div className="grid grid-cols-2 gap-2">
            {/* Position & Anchor */}
            <button
              id="nav-position-btn"
              onClick={() => onNavigate('position')}
              className="p-3.5 rounded-xl bg-neutral-900/60 hover:bg-neutral-800/80 border border-white/5 text-left transition-colors flex flex-col justify-between"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center mb-2">
                <MoveHorizontal className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-white">Position & Notch</div>
              <div className="text-[11px] text-neutral-400">Horizontal & bezel offset</div>
            </button>

            {/* Physics Tuning */}
            <button
              id="nav-physics-btn"
              onClick={() => onNavigate('physics')}
              className="p-3.5 rounded-xl bg-neutral-900/60 hover:bg-neutral-800/80 border border-white/5 text-left transition-colors flex flex-col justify-between"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2">
                <Sliders className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-white">Physics & Style</div>
              <div className="text-[11px] text-neutral-400">Damping, mass & chain</div>
            </button>
          </div>
        </div>

        {/* Security & System Info Cards */}
        <div className="p-3.5 rounded-xl bg-neutral-900/40 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigate('privacy')}
              className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-medium">Privacy & Permissions Hub</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
            <button
              onClick={() => onNavigate('code')}
              className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <Info className="w-4 h-4" />
              <span className="font-medium">Android Studio Code & ZIP Export</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
