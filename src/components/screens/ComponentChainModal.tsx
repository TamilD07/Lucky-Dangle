import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  Plus,
  Trash2,
  Sliders,
  ChevronDown
} from 'lucide-react';
import {
  CharmItem,
  ComponentChainConfig,
  ChainConnectorType,
  ChainFinalDangleType,
  DEFAULT_APPEARANCE,
  DEFAULT_PHYSICS,
} from '../../types';
import { DangleCanvas } from '../DangleCanvas';
import { audioSynth } from '../../utils/audioSynth';

interface ComponentChainModalProps {
  isOpen: boolean;
  charm: CharmItem;
  onClose: () => void;
  onSave: (updatedCharm: CharmItem) => void;
}

const CONNECTOR_TYPES: { id: ChainConnectorType; label: string; desc: string }[] = [
  { id: 'jump_ring', label: 'Split Jump Ring', desc: 'Classic jewelry circular split ring' },
  { id: 'bail', label: 'Cast Metal Bail', desc: 'Sleek jewelry pendant mount' },
  { id: 'kumihimo_knot', label: 'Silk Kumihimo Knot', desc: 'Traditional braided silk tie' },
  { id: 'swivel', label: 'Swivel Barrel', desc: 'Rotating anti-tangle joint' },
];

const CONNECTOR_MATERIALS = [
  { id: 'gold', label: 'Gold', color: '#d4af37' },
  { id: 'silver', label: 'Silver', color: '#cbd5e1' },
  { id: 'bronze', label: 'Bronze', color: '#b45309' },
  { id: 'cord', label: 'Silk Cord', color: '#ef4444' },
];

const FINAL_DANGLES: { id: ChainFinalDangleType; label: string; icon: string; desc: string }[] = [
  { id: 'none', label: 'None', icon: '✕', desc: 'Clean bottom without tail' },
  { id: 'tassel', label: 'Silk Tassel', icon: '🏮', desc: 'Traditional flowing silk fringe' },
  { id: 'bell', label: 'Brass Suzu Bell', icon: '🔔', desc: 'Gentle chiming wind bell' },
  { id: 'crystal', label: 'Prism Crystal', icon: '💎', desc: 'Refractive faceted teardrop' },
  { id: 'teardrop', label: 'Enamel Teardrop', icon: '💧', desc: 'Glossy teardrop pendant' },
  { id: 'coin', label: 'Fortune Coin', icon: '🪙', desc: 'Square-holed prosperity token' },
];

const QUICK_BEAD_PRESETS = [
  { name: 'Gold Sphere', radius: 5, color: '#f59e0b', weight: 0.15 },
  { name: 'Nazar Eye', radius: 6, color: '#1e3a8a', emoji: '🧿', weight: 0.2 },
  { name: 'Red Jade', radius: 5.5, color: '#ef4444', weight: 0.18 },
  { name: 'Emerald', radius: 5, color: '#10b981', weight: 0.16 },
  { name: 'Pearl', radius: 5.5, color: '#f8fafc', weight: 0.17 },
  { name: 'Black Onyx', radius: 5, color: '#18181b', weight: 0.22 },
];

export const ComponentChainModal: React.FC<ComponentChainModalProps> = ({
  isOpen,
  charm,
  onClose,
  onSave,
}) => {
  const currentChain = charm.componentChain || {};

  const [connectorType, setConnectorType] = useState<ChainConnectorType>(
    currentChain.connector?.type || 'jump_ring'
  );
  const [connectorMaterial, setConnectorMaterial] = useState<string>(
    currentChain.connector?.material || 'gold'
  );

  const [afterComponents, setAfterComponents] = useState<any[]>(
    currentChain.afterComponents || [
      { id: 'bead_1', name: 'Gold Bead', radius: 5, color: '#eab308', weight: 0.15 },
    ]
  );

  const [finalDangleType, setFinalDangleType] = useState<ChainFinalDangleType>(
    currentChain.finalDangle?.type || 'tassel'
  );
  const [finalDangleColor, setFinalDangleColor] = useState<string>(
    currentChain.finalDangle?.color || '#dc2626'
  );

  const [testTrigger, setTestTrigger] = useState<number>(0);

  if (!isOpen) return null;

  const previewChain: ComponentChainConfig = {
    beforeComponents: charm.componentChain?.beforeComponents || [],
    connector: {
      type: connectorType,
      material: connectorMaterial,
      color: connectorMaterial === 'gold' ? '#d4af37' : '#94a3b8',
      scale: 1.0,
    },
    afterComponents,
    finalDangle: {
      type: finalDangleType,
      color: finalDangleColor,
      length: 24,
      weight: 0.35,
    },
  };

  const previewCharm: CharmItem = {
    ...charm,
    componentChain: previewChain,
  };

  const handleAddAfterBead = (preset: typeof QUICK_BEAD_PRESETS[0]) => {
    if (afterComponents.length >= 4) {
      alert('Maximum 4 chain beads supported for optimal swing physics.');
      return;
    }
    const newBead = {
      id: `bead_${Date.now()}`,
      name: preset.name,
      radius: preset.radius,
      color: preset.color,
      weight: preset.weight,
      emoji: preset.emoji,
    };
    setAfterComponents([...afterComponents, newBead]);
    audioSynth.playSnapSound();
  };

  const handleRemoveAfterBead = (index: number) => {
    setAfterComponents(afterComponents.filter((_, i) => i !== index));
    audioSynth.playSnapSound();
  };

  const handleSave = () => {
    audioSynth.playSnapSound();
    onSave(previewCharm);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-neutral-950/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col md:flex-row bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Physics Preview */}
        <div className="w-full md:w-5/12 bg-neutral-950/70 border-b md:border-b-0 md:border-r border-neutral-800 flex flex-col items-center justify-between p-4 relative select-none">
          <div className="w-full flex items-center justify-between z-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Chain Physics Preview
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

          <div className="relative w-full h-80 flex items-center justify-center overflow-visible my-2">
            <DangleCanvas
              charm={previewCharm}
              physics={{
                ...DEFAULT_PHYSICS,
                ropeLength: 110,
              }}
              appearance={{
                ...DEFAULT_APPEARANCE,
                charmSize: 56,
              }}
              horizontalPercent={0.5}
              containerWidth={260}
              containerHeight={300}
              interactive={true}
              testSwingTrigger={testTrigger}
            />
          </div>

          <div className="w-full text-center z-10 bg-neutral-900/60 p-2 rounded-xl border border-neutral-800/80">
            <p className="text-xs text-neutral-300 font-medium">Multi-Component Physical Chain</p>
            <span className="text-[11px] text-neutral-500">Every bead & tassel sways with individual inertia</span>
          </div>
        </div>

        {/* Right: Chain Customizer */}
        <div className="w-full md:w-7/12 flex flex-col flex-1 overflow-y-auto max-h-[92vh] p-5 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Customize Component Chain</span>
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Universal Assembly
                </span>
              </h2>
              <p className="text-xs text-neutral-400">Configure top mount bail, bead spacers, and bottom tassel</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 1. Top Connector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wide">
              1. Top Bail / Loop Connector
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CONNECTOR_TYPES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setConnectorType(c.id);
                    audioSynth.playSnapSound();
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    connectorType === c.id
                      ? 'bg-amber-500/15 border-amber-400 shadow-sm'
                      : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <span className="block text-xs font-semibold text-neutral-200">{c.label}</span>
                  <span className="block text-[10px] text-neutral-400 line-clamp-1">{c.desc}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-neutral-400">Connector Material:</span>
              <div className="flex gap-2">
                {CONNECTOR_MATERIALS.map((mat) => (
                  <button
                    key={mat.id}
                    onClick={() => {
                      setConnectorMaterial(mat.id);
                      audioSynth.playSnapSound();
                    }}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-all flex items-center gap-1.5 ${
                      connectorMaterial === mat.id
                        ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                    }`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: mat.color }} />
                    <span>{mat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Tail Chain Beads */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wide">
                2. Lower Pendant Beads ({afterComponents.length}/4)
              </label>
            </div>

            {/* Existing Beads in Chain */}
            <div className="space-y-1.5">
              {afterComponents.length === 0 ? (
                <p className="text-xs text-neutral-500 italic p-3 bg-neutral-950/50 rounded-xl border border-dashed border-neutral-800 text-center">
                  No lower beads attached. Add one below!
                </p>
              ) : (
                afterComponents.map((bead, idx) => (
                  <div
                    key={bead.id || idx}
                    className="flex items-center justify-between p-2 px-3 bg-neutral-950 rounded-xl border border-neutral-800"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-xs shadow-sm"
                        style={{ backgroundColor: bead.color }}
                      >
                        {bead.emoji || ''}
                      </div>
                      <span className="text-xs font-medium text-neutral-200">{bead.name}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveAfterBead(idx)}
                      className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
                      title="Remove bead"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Quick Add Beads */}
            <div className="pt-1">
              <span className="text-[11px] text-neutral-400 block mb-1">Add bead to lower chain:</span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_BEAD_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => handleAddAfterBead(p)}
                    className="px-2.5 py-1 text-xs rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 flex items-center gap-1.5 transition-colors"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    <span>{p.name}</span>
                    <Plus className="w-3 h-3 text-neutral-500" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Final Bottom Dangle */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wide">
              3. Final Bottom Dangle Ornament
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FINAL_DANGLES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setFinalDangleType(d.id);
                    audioSynth.playSnapSound();
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    finalDangleType === d.id
                      ? 'bg-amber-500/15 border-amber-400 shadow-sm'
                      : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <span className="text-base block mb-0.5">{d.icon}</span>
                  <span className="block text-xs font-semibold text-neutral-200">{d.label}</span>
                  <span className="block text-[9px] text-neutral-400 truncate">{d.desc}</span>
                </button>
              ))}
            </div>

            {finalDangleType !== 'none' && (
              <div className="flex items-center justify-between p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 mt-2">
                <span className="text-xs text-neutral-300">Ornament Accent Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={finalDangleColor}
                    onChange={(e) => setFinalDangleColor(e.target.value)}
                    className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono text-neutral-400">{finalDangleColor}</span>
                </div>
              </div>
            )}
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
              Apply Chain to Charm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
