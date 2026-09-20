import { useState } from 'react';

export type CharmCategory = 'lucky' | 'protection' | 'traditional' | 'cute' | 'minimal' | 'custom';

export type CharmType =
  | 'vector'
  | 'image'
  | 'composite'
  | 'emoji'
  | 'text'
  | 'standard'
  | 'emoji_charm'
  | 'image_sigil';

export type CharmWeightPreset = 'very_light' | 'light' | 'medium' | 'heavy' | 'very_heavy';

export const CHARM_WEIGHT_MULTIPLIERS: Record<CharmWeightPreset, { mass: number; dampingMul: number; inertia: number; label: string; desc: string }> = {
  very_light: { mass: 0.6, dampingMul: 0.965, inertia: 0.6, label: 'Very Light', desc: 'Paper / feather talisman: quick fluttering response & rapid settling' },
  light: { mass: 0.9, dampingMul: 0.978, inertia: 0.85, label: 'Light', desc: 'Silk knot / wood: responsive and agile movement' },
  medium: { mass: 1.2, dampingMul: 0.985, inertia: 1.0, label: 'Medium', desc: 'Ceramic / glass bead: classic natural hanging swing' },
  heavy: { mass: 2.2, dampingMul: 0.992, inertia: 1.6, label: 'Heavy', desc: 'Solid brass bell / metal coin: slow momentum and deep arc' },
  very_heavy: { mass: 3.5, dampingMul: 0.996, inertia: 2.4, label: 'Very Heavy', desc: 'Iron / cast bronze talisman: high inertia and sustained pendulum swing' },
};

export type PhysicsPresetKey = 'gentle' | 'natural' | 'windy' | 'bouncy' | 'heavy' | 'light' | 'floating';

export interface PhysicsPresetDefinition {
  id: PhysicsPresetKey;
  name: string;
  description: string;
  icon: string;
  config: Partial<PhysicsConfig>;
}

export type EmojiMaterialStyle = 'original' | 'sticker' | 'metal' | 'crystal' | 'neon' | 'minimal';

export type CharmContainerShape =
  | 'none'
  | 'circle'
  | 'rounded_square'
  | 'heart'
  | 'star'
  | 'diamond'
  | 'shield'
  | 'oval';

export interface EmojiCharmConfig {
  emoji: string;
  scale: number;
  rotation: number;
  materialStyle: EmojiMaterialStyle;
  shape: CharmContainerShape;
  bgColor?: string;
  borderColor?: string;
  borderWidth?: number;
  hasGlow?: boolean;
  glowColor?: string;
  hasShadow?: boolean;
}

export type SigilStyle =
  | 'original'
  | 'silhouette'
  | 'line_art'
  | 'monochrome'
  | 'symbol'
  | 'glow'
  | 'engraved';

export type SigilMaterial =
  | 'gold'
  | 'silver'
  | 'rose_gold'
  | 'black_metal'
  | 'crystal'
  | 'glass'
  | 'neon'
  | 'stone'
  | 'wood';

export interface ImageSigilConfig {
  imageDataUrl: string;
  sigilStyle: SigilStyle;
  material: SigilMaterial;
  shape: CharmContainerShape;
  brightness: number;   // 0 to 200 (100 = default)
  contrast: number;     // 0 to 200 (100 = default)
  threshold: number;    // 0 to 100 (0 = off)
  invert: boolean;
  monochromeColor: string;
  cropZoom: number;
  rotation: number;
  borderWidth: number;
  borderColor: string;
  hasGlow: boolean;
  glowColor: string;
  hasShadow: boolean;
  opacity: number;
}

export interface ComponentChainItem {
  id: string;
  name: string;
  type: 'bead' | 'spacer' | 'crystal' | 'pearl' | 'ball' | 'ring';
  color: string;
  radius: number;
  offset: number; // along string or chain
  material?: string;
  imageUrl?: string;
  emoji?: string;
  mass?: number;
}

export type ChainConnectorType = 'jump_ring' | 'split_ring' | 'bail' | 'kumihimo_knot' | 'swivel';
export type ChainFinalDangleType = 'tassel' | 'bell' | 'crystal' | 'teardrop' | 'coin' | 'none';

export interface ConnectorItem {
  type: ChainConnectorType;
  material: 'gold' | 'silver' | 'bronze' | 'cord';
  size?: number;
  scale?: number;
  color?: string;
}

export interface FinalDangleItem {
  type: ChainFinalDangleType;
  color: string;
  size?: number;
  length?: number;
  weight?: number;
  label?: string;
}

export interface ComponentChainConfig {
  beforeComponents?: ComponentChainItem[];
  connector: ConnectorItem;
  afterComponents: ComponentChainItem[];
  finalDangle?: FinalDangleItem;
}

export type RitualKind =
  | 'daruma'
  | 'ghanta'
  | 'garland'
  | 'drishti'
  | 'knot'
  | 'maneki'
  | 'scarab'
  | 'himmeli'
  | 'boba'
  | 'flick'
  | 'emoji';

export interface CharmBead {
  type: string;
  color?: string;
  radius: number;
  offset: number; // offset along string in px
  imageUrl?: string;
  emoji?: string;
}

export interface RitualState {
  leftEye?: boolean;
  rightEye?: boolean;
  isRinging?: boolean;
  garlandAgeDays?: number; // 0 to 7+ (withers over 7 days)
  isFresh?: boolean;
  drishtiVariant?: number; // 0: Classic, 1: Crimson, 2: Golden, 3: Midnight
  wingsSpread?: boolean;
  isTurning?: boolean;
  isBeckoning?: boolean;
  isCinching?: boolean;
}

export interface CharmItem {
  id: string;
  name: string;
  origin: string;
  category: CharmCategory;
  type: CharmType;
  iconName: string;
  description: string;
  ritualText: string;
  ritualKind: RitualKind;
  defaultRopeLength: number; // in dp / px
  defaultScale: number;
  cordColor: string;
  beads?: CharmBead[];
  imageUrl?: string;
  compositeParts?: {
    chili1?: string;
    chili2?: string;
    chili3?: string;
    chili4?: string;
    chili5?: string;
    chili6?: string;
    chili7?: string;
    lemon?: string;
    coal?: string;
  };
  emoji?: string;
  text?: string;
  textColor?: string;
  accentColor: string;
  secondaryColor?: string;
  emojiConfig?: EmojiCharmConfig;
  sigilConfig?: ImageSigilConfig;
  componentChain?: ComponentChainConfig;
  weightPreset?: CharmWeightPreset;
  physicsOverride?: Partial<PhysicsConfig>;
}

export type RopeStyleKey = 'braided' | 'twisted' | 'double_loop' | 'chain' | 'ribbon' | 'thread';

export type StringMaterialKey = 'gold' | 'redSilk' | 'midnight' | 'jute' | 'indigo' | 'silver' | 'roseGold';

export interface StringMaterial {
  id: StringMaterialKey;
  name: string;
  color: string;
  sheenColor: string;
  shadowColor: string;
  width: number;
  dash: string;
  recommendedStyle: RopeStyleKey;
}

export const STRING_MATERIALS: Record<StringMaterialKey, StringMaterial> = {
  gold: {
    id: 'gold',
    name: 'Gilded Kumihimo',
    color: '#d4af37',
    sheenColor: '#fef08a',
    shadowColor: '#78350f',
    width: 2.4,
    dash: 'none',
    recommendedStyle: 'braided',
  },
  redSilk: {
    id: 'redSilk',
    name: 'Imperial Red Silk',
    color: '#dc2626',
    sheenColor: '#fca5a5',
    shadowColor: '#7f1d1d',
    width: 2.2,
    dash: 'none',
    recommendedStyle: 'braided',
  },
  midnight: {
    id: 'midnight',
    name: 'Obsidian & Onyx',
    color: '#1e293b',
    sheenColor: '#94a3b8',
    shadowColor: '#090d16',
    width: 2.4,
    dash: 'none',
    recommendedStyle: 'twisted',
  },
  jute: {
    id: 'jute',
    name: 'Artisan Flax Twine',
    color: '#b45309',
    sheenColor: '#fde68a',
    shadowColor: '#451a03',
    width: 2.6,
    dash: 'none',
    recommendedStyle: 'twisted',
  },
  indigo: {
    id: 'indigo',
    name: 'Edo Indigo Cord',
    color: '#3730a3',
    sheenColor: '#818cf8',
    shadowColor: '#1e1b4b',
    width: 2.2,
    dash: 'none',
    recommendedStyle: 'double_loop',
  },
  silver: {
    id: 'silver',
    name: 'Sterling Silver Thread',
    color: '#cbd5e1',
    sheenColor: '#ffffff',
    shadowColor: '#475569',
    width: 2.0,
    dash: 'none',
    recommendedStyle: 'chain',
  },
  roseGold: {
    id: 'roseGold',
    name: 'Rose Gold Filigree',
    color: '#e11d48',
    sheenColor: '#fecdd3',
    shadowColor: '#881337',
    width: 2.2,
    dash: 'none',
    recommendedStyle: 'braided',
  },
};

export type PhysicsQuality = 'low' | 'medium' | 'high';

export interface PhysicsConfig {
  enabled?: boolean;      // Physics ON/OFF
  gravity: number;        // standard 9.8 or scaled
  damping: number;        // air resistance / damping coefficient (0.92 - 0.99)
  stiffness: number;      // spring restitution / cord stiffness
  cordFlexibility?: number; // 0.1 to 1.0 (how easily the rope curves)
  waveStrength?: number;  // 0.0 to 2.0 (wave propagation amplitude down rope)
  charmWeight?: CharmWeightPreset; // Virtual weight
  beadWeight?: number;    // 0.2 to 2.0 (mass of attached beads)
  ropeLength: number;     // 80 to 260
  mass: number;           // 1.0 to 3.0
  swingIntensity: number; // 0.5 to 2.0
  movementResponse: number; // sensor multiplier (0.5 to 2.5)
  maxAngleDeg: number;    // clamp angle in degrees (e.g. 75)
  quality?: PhysicsQuality; // Low / Medium / High
  reduceMotion: boolean;  // accessibility
}

export const PHYSICS_PRESETS: Record<PhysicsPresetKey, PhysicsPresetDefinition> = {
  gentle: {
    id: 'gentle',
    name: 'Gentle Breeze',
    description: 'Very subtle, quiet, and calming sway',
    icon: '🍃',
    config: {
      gravity: 8.5,
      damping: 0.945,
      stiffness: 0.18,
      swingIntensity: 0.6,
      cordFlexibility: 0.4,
      waveStrength: 0.4,
      charmWeight: 'light',
    },
  },
  natural: {
    id: 'natural',
    name: 'Natural Hang',
    description: 'Balanced real-world physical hanging object',
    icon: '🌍',
    config: {
      gravity: 9.8,
      damping: 0.982,
      stiffness: 0.15,
      swingIntensity: 1.0,
      cordFlexibility: 0.7,
      waveStrength: 1.0,
      charmWeight: 'medium',
    },
  },
  windy: {
    id: 'windy',
    name: 'Windy Gusts',
    description: 'Noticeable swinging with rich traveling wave propagation',
    icon: '💨',
    config: {
      gravity: 9.2,
      damping: 0.988,
      stiffness: 0.12,
      swingIntensity: 1.5,
      cordFlexibility: 0.9,
      waveStrength: 1.8,
      charmWeight: 'medium',
    },
  },
  bouncy: {
    id: 'bouncy',
    name: 'Bouncy Spring',
    description: 'High elasticity cord with springy snap-back',
    icon: '⚡',
    config: {
      gravity: 12.5,
      damping: 0.970,
      stiffness: 0.35,
      swingIntensity: 1.2,
      cordFlexibility: 0.5,
      waveStrength: 0.8,
      charmWeight: 'light',
    },
  },
  heavy: {
    id: 'heavy',
    name: 'Cast Iron Heavy',
    description: 'Heavy solid metal: slow, stately momentum & deep oscillation',
    icon: '⚓',
    config: {
      gravity: 11.0,
      damping: 0.993,
      stiffness: 0.22,
      swingIntensity: 0.85,
      cordFlexibility: 0.35,
      waveStrength: 0.5,
      charmWeight: 'heavy',
    },
  },
  light: {
    id: 'light',
    name: 'Featherweight',
    description: 'Fast, playful, and hyper-responsive to every swipe',
    icon: '🪶',
    config: {
      gravity: 7.5,
      damping: 0.965,
      stiffness: 0.10,
      swingIntensity: 1.6,
      cordFlexibility: 0.95,
      waveStrength: 1.5,
      charmWeight: 'very_light',
    },
  },
  floating: {
    id: 'floating',
    name: 'Lunar Floating',
    description: 'Dreamy low-gravity floating motion with long hang-time',
    icon: '🌙',
    config: {
      gravity: 4.2,
      damping: 0.994,
      stiffness: 0.08,
      swingIntensity: 1.1,
      cordFlexibility: 0.85,
      waveStrength: 1.2,
      charmWeight: 'very_light',
    },
  },
};

export interface AppearanceConfig {
  ropeColor: string;
  ropeThickness: number;  // 1 to 5
  ropeStyle: RopeStyleKey;
  charmSize: number;      // 36 to 84
  opacity: number;        // 0.4 to 1.0
  hasShadow: boolean;
  hasGlow: boolean;
  glowColor: string;
}

export interface PositionConfig {
  horizontalPercent: number; // 0.1 to 0.9 (0.5 = center)
  topOffset: number;         // 0 to 40 px from top bezel
  touchInteraction: boolean;
  dragInteraction: boolean;
  autoStartOnBoot: boolean;
}

export interface DangleSettings {
  isEnabled: boolean;
  hasOverlayPermission: boolean;
  selectedCharmId: string;
  physics: PhysicsConfig;
  appearance: AppearanceConfig;
  position: PositionConfig;
  customCharms: CharmItem[];
}

export const DEFAULT_PHYSICS: PhysicsConfig = {
  gravity: 9.8,
  damping: 0.982,
  stiffness: 0.15,
  ropeLength: 130,
  mass: 1.2,
  swingIntensity: 1.0,
  movementResponse: 1.2,
  maxAngleDeg: 72,
  reduceMotion: false,
};

export const DEFAULT_APPEARANCE: AppearanceConfig = {
  ropeColor: '#d4af37', // metallic gold
  ropeThickness: 2.2,
  ropeStyle: 'braided',
  charmSize: 56,
  opacity: 1.0,
  hasShadow: true,
  hasGlow: true,
  glowColor: 'rgba(59, 130, 246, 0.4)',
};

export const DEFAULT_POSITION: PositionConfig = {
  horizontalPercent: 0.72, // top-right pleasant location away from camera cutout
  topOffset: 0,
  touchInteraction: true,
  dragInteraction: true,
  autoStartOnBoot: false,
};
