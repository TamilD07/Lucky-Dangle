import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Search,
  Check,
  RotateCw,
  Palette,
  Layers,
  Sliders,
  Maximize2
} from 'lucide-react';
import {
  CharmItem,
  EmojiMaterialStyle,
  CharmContainerShape,
  CharmWeightPreset,
  CHARM_WEIGHT_MULTIPLIERS,
  DEFAULT_APPEARANCE,
  DEFAULT_PHYSICS,
} from '../../types';
import { CharmRenderer } from '../CharmRenderer';
import { DangleCanvas } from '../DangleCanvas';
import { audioSynth } from '../../utils/audioSynth';

interface CreateEmojiCharmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (charm: CharmItem) => void;
}

const EMOJI_CATEGORIES: { name: string; icon: string; list: string[] }[] = [
  {
    name: 'Talisman & Mystical',
    icon: '🔮',
    list: ['🧿', '🪬', '🔮', '✨', '💫', '🌟', '📿', '🕉️', '☯️', '☸️', '⚜️', '🕊️', '👑', '☀️', '🌙'],
  },
  {
    name: 'Good Luck & Nature',
    icon: '🍀',
    list: ['🍀', '🎋', '🌸', '🌺', '🌿', '🌾', '🌊', '🍄', '🦋', '🐢', '🐉', '🐯', '🦊', '🦉', '🐞'],
  },
  {
    name: 'Artifacts & Symbols',
    icon: '🔔',
    list: ['🔔', '🪙', '🏮', '⛩️', '💎', '🗝️', '🪞', '🧭', '🛡️', '⚔️', '🪘', '🪭', '🪢', '🪅', '⚡'],
  },
  {
    name: 'Food & Sweets',
    icon: '🌶️',
    list: ['🌶️', '🍋', '🧋', '🍵', '🍡', '🍙', '🥠', '🍯', '🍎', '🍇', '🍑', '🥐'],
  },
  {
    name: 'Smileys & Soul',
    icon: '😊',
    list: ['😊', '😇', '😎', '🥹', '🥰', '💖', '❤️‍🔥', '🔥', '🤍', '🧡', '🌈', '🎭'],
  },
];

const MATERIAL_STYLES: { id: EmojiMaterialStyle; label: string; desc: string }[] = [
  { id: 'original', label: 'Original', desc: 'Standard vibrant emoji glyph' },
  { id: 'sticker', label: 'Sticker', desc: 'Die-cut white contour with crisp drop-shadow' },
  { id: 'metal', label: 'Gilded Metal', desc: 'Warm metallic bronze/gold luster relief' },
  { id: 'crystal', label: 'Crystal Glass', desc: 'Glossy jewel sheen & refraction' },
  { id: 'neon', label: 'Radiant Neon', desc: 'High-intensity glowing aura' },
  { id: 'minimal', label: 'Minimal', desc: 'Flat high-contrast silhouette' },
];

const CONTAINER_SHAPES: { id: CharmContainerShape; label: string; icon: string }[] = [
  { id: 'none', label: 'None', icon: '✕' },
  { id: 'circle', label: 'Circle', icon: '●' },
  { id: 'rounded_square', label: 'Plaque', icon: '■' },
  { id: 'oval', label: 'Oval', icon: '⬭' },
  { id: 'diamond', label: 'Diamond', icon: '◆' },
  { id: 'shield', label: 'Shield', icon: '🛡' },
  { id: 'heart', label: 'Heart', icon: '♥' },
  { id: 'star', label: 'Star', icon: '★' },
];

const WEIGHT_PRESETS: { id: CharmWeightPreset; label: string; desc: string }[] = [
  { id: 'very_light', label: 'Very Light', desc: 'Quick flutter (0.6x mass)' },
  { id: 'light', label: 'Light', desc: 'Agile swing (0.9x mass)' },
  { id: 'medium', label: 'Medium', desc: 'Classic pendulum (1.2x mass)' },
  { id: 'heavy', label: 'Heavy', desc: 'Slow momentum (2.2x mass)' },
  { id: 'very_heavy', label: 'Cast Bronze', desc: 'High inertia (3.5x mass)' },
];

export const CreateEmojiCharmModal: React.FC<CreateEmojiCharmModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [selectedEmoji, setSelectedEmoji] = useState<string>('🧿');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategoryIdx, setActiveCategoryIdx] = useState<number>(0);
  const [name, setName] = useState<string>('Gilded Talisman');
  const [materialStyle, setMaterialStyle] = useState<EmojiMaterialStyle>('sticker');
  const [shape, setShape] = useState<CharmContainerShape>('circle');
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [bgColor, setBgColor] = useState<string>('#18181b');
  const [borderColor, setBorderColor] = useState<string>('#d4af37');
  const [borderWidth, setBorderWidth] = useState<number>(2);
  const [hasGlow, setHasGlow] = useState<boolean>(true);
  const [glowColor, setGlowColor] = useState<string>('rgba(212, 175, 55, 0.55)');
  const [weight, setWeight] = useState<CharmWeightPreset>('medium');
  const [cordColor, setCordColor] = useState<string>('#d4af37');
  const [testTrigger, setTestTrigger] = useState<number>(0);

  if (!isOpen) return null;

  // Filter emojis based on search
  const displayedEmojis = searchQuery.trim()
    ? EMOJI_CATEGORIES.flatMap((c) => c.list).filter((e) => e.includes(searchQuery.trim()))
    : EMOJI_CATEGORIES[activeCategoryIdx].list;

  const previewCharm: CharmItem = {
    id: 'preview_temp',
    name: name || 'Custom Charm',
    origin: 'Custom Emoji Craft',
    category: 'custom',
    type: 'emoji_charm',
    iconName: 'Smile',
    description: `Custom ${materialStyle} emoji charm.`,
    ritualText: 'Tap to flick',
    ritualKind: 'emoji',
    defaultRopeLength: 130,
    defaultScale: 1.0,
    cordColor,
    emoji: selectedEmoji,
    accentColor: borderColor,
    secondaryColor: bgColor,
    weightPreset: weight,
    emojiConfig: {
      emoji: selectedEmoji,
      scale,
      rotation,
      materialStyle,
      shape,
      bgColor: shape === 'none' ? 'transparent' : bgColor,
      borderColor,
      borderWidth: shape === 'none' ? 0 : borderWidth,
      hasGlow,
      glowColor,
    },
  };

  const handleSave = () => {
    const id = `emoji_charm_${Date.now()}`;
    const charmToSave: CharmItem = {
      ...previewCharm,
      id,
      name: name.trim() || `${selectedEmoji} Charm`,
    };
    audioSynth.playSnapSound();
    onSave(charmToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-neutral-950/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col md:flex-row bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left / Top: Interactive Live Physics Stage */}
        <div className="w-full md:w-5/12 bg-neutral-950/70 border-b md:border-b-0 md:border-r border-neutral-800 flex flex-col items-center justify-between p-4 relative select-none">
          <div className="w-full flex items-center justify-between z-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Live Physics Preview
            </span>
            <button
              onClick={() => {
                setTestTrigger((prev) => prev + 1);
                audioSynth.playFlickSound(1.6);
              }}
              className="text-xs px-2.5 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors border border-neutral-700"
            >
              Test Swing
            </button>
          </div>

          {/* Interactive Dangle Simulation Viewport */}
          <div className="relative w-full h-72 flex items-center justify-center overflow-visible my-2">
            <DangleCanvas
              charm={previewCharm}
              physics={{
                ...DEFAULT_PHYSICS,
                charmWeight: weight,
                ropeLength: 125,
              }}
              appearance={{
                ...DEFAULT_APPEARANCE,
                ropeColor: cordColor,
                charmSize: 58,
                glowColor,
              }}
              horizontalPercent={0.5}
              containerWidth={260}
              containerHeight={270}
              interactive={true}
              testSwingTrigger={testTrigger}
            />
          </div>

          <div className="w-full text-center z-10 bg-neutral-900/60 p-2 rounded-xl border border-neutral-800/80">
            <p className="text-xs text-neutral-300 font-medium">Drag or flick the charm to test physical weight</p>
            <span className="text-[11px] text-neutral-500">
              Weight: {CHARM_WEIGHT_MULTIPLIERS[weight].label} ({CHARM_WEIGHT_MULTIPLIERS[weight].desc})
            </span>
          </div>
        </div>

        {/* Right: Customization Controls & Emoji Picker */}
        <div className="w-full md:w-7/12 flex flex-col flex-1 overflow-y-auto max-h-[92vh] p-5 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Craft Emoji Charm</span>
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Universal System
                </span>
              </h2>
              <p className="text-xs text-neutral-400">Convert any emoji into a realistic swinging physical charm</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 1. Emoji Selection Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wide">
                1. Select Emoji
              </label>
              <div className="relative w-44">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search emoji..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-2.5 py-1 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Category tabs */}
            {!searchQuery && (
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {EMOJI_CATEGORIES.map((cat, idx) => (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategoryIdx(idx)}
                    className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors flex items-center gap-1 ${
                      activeCategoryIdx === idx
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-neutral-800/80 text-neutral-400 hover:bg-neutral-800'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Emoji Grid */}
            <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5 p-2 bg-neutral-950 rounded-xl border border-neutral-800 max-h-36 overflow-y-auto">
              {displayedEmojis.map((emoji, idx) => (
                <button
                  key={`${emoji}-${idx}`}
                  onClick={() => {
                    setSelectedEmoji(emoji);
                    audioSynth.playSnapSound();
                  }}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-xl transition-all ${
                    selectedEmoji === emoji
                      ? 'bg-amber-500/30 border-2 border-amber-400 scale-110 shadow-lg'
                      : 'hover:bg-neutral-800 hover:scale-105'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Charm Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wide">
              Charm Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Eye of Horus, Lucky Clover..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* 3. Material Appearance Styles */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wide">
              2. Material Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MATERIAL_STYLES.map((mat) => (
                <button
                  key={mat.id}
                  onClick={() => {
                    setMaterialStyle(mat.id);
                    audioSynth.playSnapSound();
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    materialStyle === mat.id
                      ? 'bg-amber-500/15 border-amber-400/80 shadow-sm'
                      : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <span className="block text-xs font-semibold text-neutral-200">{mat.label}</span>
                  <span className="block text-[10px] text-neutral-400 line-clamp-1">{mat.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Background Container Shapes */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wide">
              3. Background Shape
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {CONTAINER_SHAPES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setShape(s.id);
                    audioSynth.playSnapSound();
                  }}
                  className={`h-11 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    shape === s.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                      : 'bg-neutral-950/70 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <span className="text-sm">{s.icon}</span>
                  <span className="text-[9px] truncate">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 5. Shape Colors & Borders (if shape !== 'none') */}
          {shape !== 'none' && (
            <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <span className="text-xs font-mono text-neutral-400">{bgColor}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                    Border Bezel Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={borderColor}
                      onChange={(e) => setBorderColor(e.target.value)}
                      className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <span className="text-xs font-mono text-neutral-400">{borderColor}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-neutral-400">Border Thickness</span>
                <input
                  type="range"
                  min="0"
                  max="6"
                  step="1"
                  value={borderWidth}
                  onChange={(e) => setBorderWidth(Number(e.target.value))}
                  className="w-32 accent-amber-500"
                />
                <span className="text-xs text-neutral-300 w-6 text-right">{borderWidth}px</span>
              </div>
            </div>
          )}

          {/* 6. Physical Mass & Cord Color */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wide">
              4. Physical Charm Weight
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {WEIGHT_PRESETS.map((wp) => (
                <button
                  key={wp.id}
                  onClick={() => {
                    setWeight(wp.id);
                    audioSynth.playSnapSound();
                  }}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    weight === wp.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-neutral-950/70 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <span className="block text-xs font-semibold">{wp.label}</span>
                  <span className="block text-[9px] text-neutral-500">{wp.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cord Color & Glow */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-950/80 rounded-xl border border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-300">Cord / Ring Metal</span>
              <input
                type="color"
                value={cordColor}
                onChange={(e) => setCordColor(e.target.value)}
                className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-300">Radiant Glow</span>
              <button
                onClick={() => setHasGlow(!hasGlow)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  hasGlow ? 'bg-amber-500' : 'bg-neutral-700'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    hasGlow ? 'left-5' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 text-xs font-bold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Save Emoji Charm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
