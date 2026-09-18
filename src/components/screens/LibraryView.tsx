import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Sparkles,
  Check,
  Smile,
  Type,
  Image as ImageIcon,
  Trash2,
  Upload,
  Globe
} from 'lucide-react';
import { CharmItem, CharmCategory } from '../../types';
import { BUILT_IN_CHARMS } from '../../data/charms';
import { CharmRenderer } from '../CharmRenderer';
import { DEFAULT_APPEARANCE } from '../../types';
import { audioSynth } from '../../utils/audioSynth';

interface LibraryViewProps {
  currentCharmId: string;
  customCharms: CharmItem[];
  onSelectCharm: (charmId: string) => void;
  onAddCustomCharm: (charm: CharmItem) => void;
  onDeleteCustomCharm: (charmId: string) => void;
  onBack: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  currentCharmId,
  customCharms,
  onSelectCharm,
  onAddCustomCharm,
  onDeleteCustomCharm,
  onBack,
}) => {
  const [activeCategory, setActiveCategory] = useState<CharmCategory | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // Custom creation tab state
  const [createType, setCreateType] = useState<'emoji' | 'text' | 'image'>('emoji');
  const [customEmoji, setCustomEmoji] = useState<string>('🍀');
  const [customName, setCustomName] = useState<string>('My Lucky Charm');
  const [customOrigin, setCustomOrigin] = useState<string>('Personal Talisman');
  const [customText, setCustomText] = useState<string>('LUCKY');
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [accentColor, setAccentColor] = useState<string>('#6366f1');
  const [customImagePreview, setCustomImagePreview] = useState<string | null>(null);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert('File size exceeds 3MB. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCustomImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCustomCharm = () => {
    const id = `custom_${Date.now()}`;
    let newCharm: CharmItem;

    if (createType === 'emoji') {
      newCharm = {
        id,
        name: customName.trim() || 'Emoji Charm',
        origin: customOrigin.trim() || 'Personal Talisman',
        category: 'custom',
        type: 'emoji',
        iconName: 'Smile',
        description: 'Custom user-created emoji charm.',
        ritualText: 'Give it a flick',
        ritualKind: 'emoji',
        defaultRopeLength: 130,
        defaultScale: 1.0,
        cordColor: '#61451f',
        emoji: customEmoji,
        accentColor: '#4f46e5',
      };
    } else if (createType === 'text') {
      newCharm = {
        id,
        name: customName.trim() || 'Text Ribbon',
        origin: customOrigin.trim() || 'Personal Motto',
        category: 'custom',
        type: 'text',
        iconName: 'Type',
        description: 'Custom typography ribbon talisman.',
        ritualText: 'Give it a flick',
        ritualKind: 'flick',
        defaultRopeLength: 135,
        defaultScale: 1.0,
        cordColor: '#61451f',
        text: customText.toUpperCase(),
        textColor,
        accentColor,
        secondaryColor: '#ffffff',
      };
    } else {
      if (!customImagePreview) {
        alert('Please select an image first.');
        return;
      }
      newCharm = {
        id,
        name: customName.trim() || 'Photo Amulet',
        origin: customOrigin.trim() || 'Personal Keepsake',
        category: 'custom',
        type: 'image',
        iconName: 'Image',
        description: 'Local custom image charm loaded securely via Android Photo Picker.',
        ritualText: 'Give it a flick',
        ritualKind: 'flick',
        defaultRopeLength: 140,
        defaultScale: 1.0,
        cordColor: '#61451f',
        imageUrl: customImagePreview,
        accentColor: '#10b981',
      };
    }

    audioSynth.playRitualSound('sparkle');
    onAddCustomCharm(newCharm);
    onSelectCharm(newCharm.id);
    setShowCreateModal(false);
  };

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
            <h2 className="text-base font-bold text-white">Charm Library</h2>
            <p className="text-[11px] text-neutral-400">Authentic world talismans & custom charms</p>
          </div>
        </div>

        <button
          id="open-create-charm-btn"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Charm</span>
        </button>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="px-4 py-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-white/5">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
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
      <div className="p-4 grid grid-cols-2 gap-3 pb-8">
        {filteredCharms.map((charm) => {
          const isSelected = charm.id === currentCharmId;

          return (
            <div
              key={charm.id}
              id={`charm-card-${charm.id}`}
              onClick={() => handleSelectCharmItem(charm.id)}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-between text-center cursor-pointer transition-all relative group min-h-[170px] ${
                isSelected
                  ? 'bg-gradient-to-b from-neutral-900 to-neutral-900/90 border-indigo-500 shadow-md shadow-indigo-500/10 ring-2 ring-indigo-500/40'
                  : 'bg-neutral-900/40 border-white/5 hover:border-white/20 hover:bg-neutral-900/80'
              }`}
            >
              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow">
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

              {/* Visual Charm Graphic Container */}
              <div className="w-18 h-18 my-1 flex items-center justify-center">
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
                <div className="text-[9px] text-neutral-400 truncate">
                  {charm.ritualText}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Creating Custom Charm */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/10 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Create Custom Charm</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Type selector */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-950 rounded-xl border border-white/5">
              <button
                onClick={() => setCreateType('emoji')}
                className={`py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  createType === 'emoji' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Smile className="w-3.5 h-3.5" />
                <span>Emoji</span>
              </button>
              <button
                onClick={() => setCreateType('text')}
                className={`py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  createType === 'text' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Text</span>
              </button>
              <button
                onClick={() => setCreateType('image')}
                className={`py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  createType === 'image' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Photo</span>
              </button>
            </div>

            {/* Charm Name */}
            <div>
              <label className="text-[11px] font-semibold text-neutral-400 block mb-1">Charm Name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. My Lucky Tag"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/10 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Charm Origin */}
            <div>
              <label className="text-[11px] font-semibold text-neutral-400 block mb-1">Origin / Lore</label>
              <input
                type="text"
                value={customOrigin}
                onChange={(e) => setCustomOrigin(e.target.value)}
                placeholder="e.g. Personal Talisman"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/10 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Emoji Type Details */}
            {createType === 'emoji' && (
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-neutral-400 block">Pick or Enter Emoji</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customEmoji}
                    onChange={(e) => setCustomEmoji(e.target.value)}
                    maxLength={3}
                    className="w-14 h-11 text-center text-xl rounded-xl bg-neutral-950 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {['🍀', '🌟', '🧿', '🦊', '🪐', '🧁', '🎀', '💎'].map((em) => (
                      <button
                        key={em}
                        onClick={() => setCustomEmoji(em)}
                        className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-base"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Text Type Details */}
            {createType === 'text' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-400 block mb-1">Text Word (up to 8 chars)</label>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value.slice(0, 8))}
                    maxLength={8}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/10 text-xs text-white uppercase tracking-wider font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[11px] font-semibold text-neutral-400 block mb-1">Badge Color</label>
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-full h-8 rounded-lg bg-neutral-950 border border-white/10 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[11px] font-semibold text-neutral-400 block mb-1">Text Color</label>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full h-8 rounded-lg bg-neutral-950 border border-white/10 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Photo Type Details */}
            {createType === 'image' && (
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-neutral-400 block">Select Image (Photo Picker)</label>
                <div className="p-4 rounded-xl border-2 border-dashed border-white/10 hover:border-indigo-500/50 flex flex-col items-center justify-center cursor-pointer transition-colors relative bg-neutral-950">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {customImagePreview ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/20">
                      <img src={customImagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-neutral-500 mb-1" />
                      <div className="text-xs text-neutral-300 font-medium">Tap to choose photo</div>
                      <div className="text-[10px] text-neutral-500">Processed locally on device only</div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomCharm}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20"
              >
                Save & Use
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
