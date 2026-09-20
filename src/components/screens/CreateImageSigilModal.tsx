import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  Upload,
  Check,
  RotateCw,
  ZoomIn,
  Sun,
  Contrast,
  Sliders,
  Image as ImageIcon
} from 'lucide-react';
import {
  CharmItem,
  SigilStyle,
  SigilMaterial,
  CharmContainerShape,
  CharmWeightPreset,
  DEFAULT_APPEARANCE,
  DEFAULT_PHYSICS,
} from '../../types';
import { DangleCanvas } from '../DangleCanvas';
import { audioSynth } from '../../utils/audioSynth';

interface CreateImageSigilModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (charm: CharmItem) => void;
}

const SAMPLE_SIGILS = [
  {
    name: 'Sacred Eye',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=60',
  },
  {
    name: 'Dragon Crest',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60',
  },
  {
    name: 'Golden Mandala',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=60',
  },
  {
    name: 'Ancient Rune',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&auto=format&fit=crop&q=60',
  },
];

const SIGIL_STYLES: { id: SigilStyle; label: string; desc: string }[] = [
  { id: 'original', label: 'True Photo', desc: 'Original image with framing' },
  { id: 'silhouette', label: 'Silhouette', desc: 'Pure cutout shadow sigil' },
  { id: 'line_art', label: 'Line Art', desc: 'High-contrast sketched edges' },
  { id: 'monochrome', label: 'Monochrome', desc: 'Tonal duotone finish' },
  { id: 'symbol', label: 'High-Pass Symbol', desc: 'Binary threshold talisman' },
  { id: 'glow', label: 'Radiant Aura', desc: 'Luminous glowing boundary' },
  { id: 'engraved', label: 'Engraved Relief', desc: 'Embossed bas-relief effect' },
];

const SIGIL_MATERIALS: { id: SigilMaterial; label: string; preview: string }[] = [
  { id: 'gold', label: '24K Gold', preview: '#d4af37' },
  { id: 'silver', label: 'Sterling Silver', preview: '#cbd5e1' },
  { id: 'rose_gold', label: 'Rose Gold', preview: '#fb7185' },
  { id: 'black_metal', label: 'Black Metal', preview: '#1e293b' },
  { id: 'crystal', label: 'Crystal Rim', preview: '#38bdf8' },
  { id: 'glass', label: 'Frosted Glass', preview: '#e0e7ff' },
  { id: 'neon', label: 'Neon Circuit', preview: '#c084fc' },
  { id: 'stone', label: 'Slate Stone', preview: '#78716c' },
  { id: 'wood', label: 'Sandalwood', preview: '#b45309' },
];

const SIGIL_SHAPES: { id: CharmContainerShape; label: string; icon: string }[] = [
  { id: 'circle', label: 'Round', icon: '●' },
  { id: 'oval', label: 'Oval', icon: '⬭' },
  { id: 'rounded_square', label: 'Tablet', icon: '■' },
  { id: 'diamond', label: 'Diamond', icon: '◆' },
  { id: 'shield', label: 'Shield', icon: '🛡' },
  { id: 'heart', label: 'Heart', icon: '♥' },
  { id: 'star', label: 'Star', icon: '★' },
];

export const CreateImageSigilModal: React.FC<CreateImageSigilModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageDataUrl, setImageDataUrl] = useState<string>(SAMPLE_SIGILS[0].url);
  const [name, setName] = useState<string>('Sacred Sigil Medallion');
  const [sigilStyle, setSigilStyle] = useState<SigilStyle>('engraved');
  const [material, setMaterial] = useState<SigilMaterial>('gold');
  const [shape, setShape] = useState<CharmContainerShape>('circle');
  const [brightness, setBrightness] = useState<number>(105);
  const [contrast, setContrast] = useState<number>(130);
  const [threshold, setThreshold] = useState<number>(0);
  const [invert, setInvert] = useState<boolean>(false);
  const [monochromeColor, setMonochromeColor] = useState<string>('#d4af37');
  const [cropZoom, setCropZoom] = useState<number>(1.1);
  const [rotation, setRotation] = useState<number>(0);
  const [borderWidth, setBorderWidth] = useState<number>(3);
  const [hasGlow, setHasGlow] = useState<boolean>(true);
  const [glowColor, setGlowColor] = useState<string>('rgba(212, 175, 55, 0.55)');
  const [weight, setWeight] = useState<CharmWeightPreset>('heavy');
  const [cordColor, setCordColor] = useState<string>('#d4af37');
  const [testTrigger, setTestTrigger] = useState<number>(0);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const res = ev.target?.result as string;
      setImageDataUrl(res);
      audioSynth.playSnapSound();
    };
    reader.readAsDataURL(file);
  };

  const previewCharm: CharmItem = {
    id: 'sigil_temp',
    name: name || 'Custom Sigil',
    origin: 'Handcrafted Image Sigil',
    category: 'custom',
    type: 'image_sigil',
    iconName: 'ImageIcon',
    description: `Custom ${sigilStyle} sigil encased in ${material}.`,
    ritualText: 'Give it a flick',
    ritualKind: 'flick',
    defaultRopeLength: 135,
    defaultScale: 1.0,
    cordColor,
    accentColor: '#d4af37',
    weightPreset: weight,
    sigilConfig: {
      imageDataUrl,
      sigilStyle,
      material,
      shape,
      brightness,
      contrast,
      threshold,
      invert,
      monochromeColor,
      cropZoom,
      rotation,
      borderWidth,
      borderColor: '#d4af37',
      hasGlow,
      glowColor,
      hasShadow: true,
      opacity: 1.0,
    },
  };

  const handleSave = () => {
    const id = `sigil_${Date.now()}`;
    const charmToSave: CharmItem = {
      ...previewCharm,
      id,
      name: name.trim() || 'Custom Sigil Charm',
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
        {/* Left: Interactive Live Physics Stage */}
        <div className="w-full md:w-5/12 bg-neutral-950/70 border-b md:border-b-0 md:border-r border-neutral-800 flex flex-col items-center justify-between p-4 relative select-none">
          <div className="w-full flex items-center justify-between z-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Physical Sigil Preview
            </span>
            <button
              onClick={() => {
                setTestTrigger((prev) => prev + 1);
                audioSynth.playFlickSound(1.7);
              }}
              className="text-xs px-2.5 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors border border-neutral-700"
            >
              Test Swing
            </button>
          </div>

          <div className="relative w-full h-72 flex items-center justify-center overflow-visible my-2">
            <DangleCanvas
              charm={previewCharm}
              physics={{
                ...DEFAULT_PHYSICS,
                charmWeight: weight,
                ropeLength: 130,
              }}
              appearance={{
                ...DEFAULT_APPEARANCE,
                ropeColor: cordColor,
                charmSize: 64,
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
            <p className="text-xs text-neutral-300 font-medium">100% Private Local Image Processing</p>
            <span className="text-[11px] text-neutral-500">Your photo stays strictly on your device</span>
          </div>
        </div>

        {/* Right: In-App Image Editor & Customizer */}
        <div className="w-full md:w-7/12 flex flex-col flex-1 overflow-y-auto max-h-[92vh] p-5 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Create From Image</span>
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Sigil Studio
                </span>
              </h2>
              <p className="text-xs text-neutral-400">Convert any photo, tattoo, or symbol into a metallic talisman</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 1. Image Upload & Sample Selection */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wide">
                1. Image Source
              </label>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition-colors font-medium"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Quick Sample Presets */}
            <div className="grid grid-cols-4 gap-2">
              {SAMPLE_SIGILS.map((sample) => (
                <button
                  key={sample.name}
                  onClick={() => {
                    setImageDataUrl(sample.url);
                    audioSynth.playSnapSound();
                  }}
                  className={`h-16 rounded-xl overflow-hidden border relative group transition-all ${
                    imageDataUrl === sample.url
                      ? 'border-amber-400 ring-2 ring-amber-500/30'
                      : 'border-neutral-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={sample.url}
                    alt={sample.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-neutral-950/40 flex items-end p-1">
                    <span className="text-[9px] text-white font-medium truncate">{sample.name}</span>
                  </div>
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
              placeholder="e.g. Aegis of Protection, Solar Sigil..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* 3. Sigil Conversion Styles */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wide">
              2. Sigil Filter & Art Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SIGIL_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => {
                    setSigilStyle(style.id);
                    audioSynth.playSnapSound();
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    sigilStyle === style.id
                      ? 'bg-amber-500/15 border-amber-400/80 shadow-sm'
                      : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <span className="block text-xs font-semibold text-neutral-200">{style.label}</span>
                  <span className="block text-[10px] text-neutral-400 line-clamp-1">{style.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Frame Materials */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wide">
              3. Medallion Bezel Material
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {SIGIL_MATERIALS.map((mat) => (
                <button
                  key={mat.id}
                  onClick={() => {
                    setMaterial(mat.id);
                    audioSynth.playSnapSound();
                  }}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    material === mat.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-neutral-950/70 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full mb-1 border border-white/20"
                    style={{ backgroundColor: mat.preview }}
                  />
                  <span className="text-[10px] truncate">{mat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 5. In-App Image Tuning Controls */}
          <div className="p-3.5 bg-neutral-950/80 rounded-xl border border-neutral-800 space-y-3">
            <span className="text-xs font-semibold text-neutral-300 block mb-1">
              4. In-App Image Editor & Tuning
            </span>

            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Zoom / Crop</span>
                  <span>{cropZoom.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="2.5"
                  step="0.1"
                  value={cropZoom}
                  onChange={(e) => setCropZoom(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Rotation</span>
                  <span>{rotation}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="15"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Brightness</span>
                  <span>{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="180"
                  step="5"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Contrast</span>
                  <span>{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="240"
                  step="10"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                <input
                  type="checkbox"
                  checked={invert}
                  onChange={(e) => setInvert(e.target.checked)}
                  className="accent-amber-500 rounded"
                />
                <span>Invert Colors (Dark/Light Negate)</span>
              </label>

              {sigilStyle === 'monochrome' && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-neutral-400">Tint:</span>
                  <input
                    type="color"
                    value={monochromeColor}
                    onChange={(e) => setMonochromeColor(e.target.value)}
                    className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 6. Shape & Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Shape Mask
              </label>
              <div className="grid grid-cols-4 gap-1">
                {SIGIL_SHAPES.slice(0, 4).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setShape(s.id);
                      audioSynth.playSnapSound();
                    }}
                    className={`py-1.5 rounded-lg border text-center text-xs transition-all ${
                      shape === s.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                        : 'bg-neutral-950/70 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Physical Weight
              </label>
              <select
                value={weight}
                onChange={(e) => setWeight(e.target.value as CharmWeightPreset)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
              >
                <option value="light">Light (0.9x mass)</option>
                <option value="medium">Medium (1.2x mass)</option>
                <option value="heavy">Heavy (2.2x mass - Medallion)</option>
                <option value="very_heavy">Very Heavy (3.5x mass - Cast Solid)</option>
              </select>
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
              Save Sigil Charm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
