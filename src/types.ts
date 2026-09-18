import { useState } from 'react';

export type CharmCategory = 'lucky' | 'protection' | 'traditional' | 'cute' | 'minimal' | 'custom';

export type CharmType = 'vector' | 'image' | 'composite' | 'emoji' | 'text';

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

export interface PhysicsConfig {
  gravity: number;        // standard 9.8 or scaled
  damping: number;        // air resistance / damping coefficient (0.92 - 0.99)
  stiffness: number;      // spring restitution
  ropeLength: number;     // 80 to 260
  mass: number;           // 1.0 to 3.0
  swingIntensity: number; // 0.5 to 2.0
  movementResponse: number; // sensor multiplier (0.5 to 2.5)
  maxAngleDeg: number;    // clamp angle in degrees (e.g. 75)
  reduceMotion: boolean;  // accessibility
}

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
