import React, { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Check,
  Smile,
  Image as ImageIcon,
  Trash2,
  Globe,
  Link,
  Scale
} from 'lucide-react';
import { CharmItem, CharmCategory, CHARM_WEIGHT_MULTIPLIERS } from '../../types';
import { BUILT_IN_CHARMS } from '../../data/charms';
import { CharmRenderer } from '../CharmRenderer';
import { DEFAULT_APPEARANCE } from '../../types';
import { audioSynth } from '../../utils/audioSynth';
import { CreateEmojiCharmModal } from './CreateEmojiCharmModal';
import { CreateImageSigilModal } from './CreateImageSigilModal';
import { ComponentChainModal } from './ComponentChainModal';

interface LibraryViewProps {
  currentCharmId: string;
  customCharms: CharmItem[];
  onSelectCharm: (charmId: string) => void;
  onAddCustomCharm: (charm: CharmItem) => void;
  onUpdateCharm?: (charm: CharmItem) => void;
  onDeleteCustomCharm: (charmId: string) => void;
  onBack: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  currentCharmId,
  customCharms,
  onSelectCharm,
  onAddCustomCharm,
  onUpdateCharm,
  onDeleteCustomCharm,
  onBack,
}) => {
  const [activeCategory, setActiveCategory] = useState<CharmCategory | 'all'>('all');
  const [showEmojiModal, setShowEmojiModal] = useState<boolean>(false);
  const [showSigilModal, setShowSigilModal] = useState<boolean>(false);
  const [chainModalCharm, setChainModalCharm] = useState<CharmItem | null>(null);

  const allCharms = [...BUILT_IN_CHARMS, ...customCharms];

  const filteredCharms =
    activeCategory === 'all'
      ? allCharms
      : activeCategory === 'custom'
      ? customCharms
      : allCharms.filter((c) => c.category === activeCategory);

  const categories: { key: CharmCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'All Charms' },
    { key: 'traditional', label: 'Traditional' },
    { key: 'protection', label: 'Protection' },
    { key: 'lucky', label: 'Good Luck' },
    { key: 'cute', label: 'Cute & Modern' },
    { key: 'custom', label: 'My Custom' },
  ];

  const handleSelectCharmItem = (id: string) => {
    audioSynth.playSnapSound();
    onSelectCharm(id);
  };

  const handleSaveCreatedCharm = (charm: CharmItem) => {
    onAddCustomCharm(charm);
    onSelectCharm(charm.id);
  };

  const handleSaveChain = (updatedCharm: CharmItem) => {
    if (onUpdateCharm) {
      onUpdateCharm(updatedCharm);
    } else {
      onAddCustomCharm(updatedCharm);
    }
    onSelectCharm(updatedCharm.id);
  };

  const activeCharm = allCharms.find((c) => c.id === currentCharmId) || allCharms[0];

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between sticky top-0 bg-neutral-950/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <button
            id="library-back-btn"
            onClick={onBack}
            className="p-2 -ml-2 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Charm Sanctuary</span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/20">
                {allCharms.length} Charms
              </span>
            </h2>
            <p className="text-[11px] text-neutral-400">Sacred talismans, emoji charms & custom sigils</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Component Chain / Assembly Studio */}
          <button
            onClick={() => setChainModalCharm(activeCharm)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 text-xs font-semibold transition active:scale-95 cursor-pointer"
            title="Customize top bail ring, beads, and bottom tassel"
          >
            <Link className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Chain Assembly</span>
          </button>

          {/* Emoji Charm Studio */}
          <button
            id="open-create-emoji-btn"
            onClick={() => setShowEmojiModal(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition active:scale-95 cursor-pointer"
          >
            <Smile className="w-3.5 h-3.5" />
            <span>+ Emoji</span>
          </button>

          {/* Image Sigil Studio */}
          <button
            id="open-create-sigil-btn"
            onClick={() => setShowSigilModal(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-bold shadow-md shadow-amber-500/20 transition active:scale-95 cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>+ Image Sigil</span>
          </button>
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="px-4 py-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-white/5">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === cat.key
                ? 'bg-neutral-100 text-neutral-900 font-semibold shadow-sm'
                : 'bg-neutral-900/80 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Charms */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-8">
        {filteredCharms.map((charm) => {
          const isSelected = charm.id === currentCharmId;
          const weightLabel =
            charm.weightPreset && CHARM_WEIGHT_MULTIPLIERS[charm.weightPreset]
              ? CHARM_WEIGHT_MULTIPLIERS[charm.weightPreset].label
              : 'Medium';

          return (
            <div
              key={charm.id}
              id={`charm-card-${charm.id}`}
              onClick={() => handleSelectCharmItem(charm.id)}
              className={`p-3.5 rounded-2xl border flex flex-col items-center justify-between text-center cursor-pointer transition-all relative group min-h-[190px] ${
                isSelected
                  ? 'bg-gradient-to-b from-neutral-900 to-neutral-900/90 border-amber-500 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/40'
                  : 'bg-neutral-900/40 border-white/5 hover:border-white/20 hover:bg-neutral-900/80'
              }`}
            >
              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow font-bold">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

              {/* Custom Delete Button */}
              {charm.category === 'custom' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCustomCharm(charm.id);
                  }}
                  className="absolute top-2 left-2 p-1 rounded-md text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                  title="Delete custom charm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Chain Customize Quick Action Icon */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setChainModalCharm(charm);
                }}
                className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-neutral-950/80 text-neutral-400 hover:text-amber-300 hover:bg-neutral-800 border border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Customize chain beads & bottom tassel"
              >
                <Link className="w-3 h-3" />
              </button>

              {/* Visual Charm Graphic Container */}
              <div className="w-20 h-20 my-1 flex items-center justify-center">
                <CharmRenderer
                  charm={charm}
                  angle={0}
                  size={52}
                  appearance={DEFAULT_APPEARANCE}
                />
              </div>

              <div className="w-full mt-1 space-y-0.5">
                <div className="text-xs font-bold text-white truncate">{charm.name}</div>
                <div className="text-[10px] text-amber-400/90 font-medium flex items-center justify-center gap-1">
                  <Globe className="w-2.5 h-2.5" />
                  <span className="truncate">{charm.origin}</span>
                </div>

                {/* Weight & Type Indicator Badges */}
                <div className="flex items-center justify-center gap-1 pt-0.5">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono flex items-center gap-0.5">
                    <Scale className="w-2.5 h-2.5 text-neutral-500" />
                    {weightLabel}
                  </span>
                  {charm.componentChain?.finalDangle && charm.componentChain.finalDangle.type !== 'none' && (
                    <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/15 text-amber-300">
                      +{charm.componentChain.finalDangle.type}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Emoji Charm Modal */}
      <CreateEmojiCharmModal
        isOpen={showEmojiModal}
        onClose={() => setShowEmojiModal(false)}
        onSave={handleSaveCreatedCharm}
      />

      {/* Image Sigil Charm Modal */}
      <CreateImageSigilModal
        isOpen={showSigilModal}
        onClose={() => setShowSigilModal(false)}
        onSave={handleSaveCreatedCharm}
      />

      {/* Universal Component Chain Modal */}
      {chainModalCharm && (
        <ComponentChainModal
          isOpen={!!chainModalCharm}
          charm={chainModalCharm}
          onClose={() => setChainModalCharm(null)}
          onSave={handleSaveChain}
        />
      )}
    </div>
  );
};
