import React from 'react';
import { CharmItem, AppearanceConfig, RitualState } from '../types';

interface CharmRendererProps {
  charm: CharmItem;
  angle: number; // in radians
  size: number;
  appearance: AppearanceConfig;
  ritualState?: RitualState;
  onRitualTrigger?: (actionName?: string) => void;
}

export const CharmRenderer: React.FC<CharmRendererProps> = ({
  charm,
  angle,
  size,
  appearance,
  ritualState = {},
  onRitualTrigger,
}) => {
  // Convert angle to degrees for SVG rotation
  const deg = (angle * 180) / Math.PI;

  const glowFilter = appearance.hasGlow
    ? `drop-shadow(0 0 14px ${appearance.glowColor})`
    : 'none';
  const dropShadow = appearance.hasShadow
    ? 'drop-shadow(0 10px 18px rgba(0,0,0,0.45))'
    : 'none';

  return (
    <div
      className="relative select-none origin-top flex items-center justify-center transition-transform duration-75"
      style={{
        transform: `rotate(${deg}deg)`,
        filter: `${dropShadow} ${glowFilter}`,
        opacity: appearance.opacity,
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      {/* Top jewelry bail & split jump ring connecting to string */}
      {renderTopConnector(charm, appearance)}

      {/* Render Charm Graphic */}
      {renderCharmGraphic(charm, size, ritualState, onRitualTrigger)}

      {/* Render Bottom Chain & Final Dangle if configured */}
      {renderBottomChain(charm, size, appearance, onRitualTrigger)}
    </div>
  );
};

function renderTopConnector(charm: CharmItem, appearance: AppearanceConfig) {
  const connectorType = charm.componentChain?.connector?.type || 'jump_ring';
  const connectorMat = charm.componentChain?.connector?.material || 'gold';

  const matColors: Record<string, { border: string; bg: string; sheen: string }> = {
    gold: { border: '#d4af37', bg: '#fef08a', sheen: '#fef9c3' },
    silver: { border: '#94a3b8', bg: '#e2e8f0', sheen: '#ffffff' },
    bronze: { border: '#b45309', bg: '#fde68a', sheen: '#fef3c7' },
    cord: { border: appearance.ropeColor || '#dc2626', bg: appearance.ropeColor || '#dc2626', sheen: 'rgba(255,255,255,0.4)' },
  };
  const c = matColors[connectorMat] || matColors.gold;

  if (connectorType === 'kumihimo_knot') {
    return (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-30" aria-hidden="true">
        <div
          className="w-3.5 h-2.5 rounded-full border border-amber-950/40 shadow-sm"
          style={{ backgroundColor: c.border }}
        />
        <div className="w-1 h-1.5 -mt-0.5 rounded-sm" style={{ backgroundColor: c.border }} />
      </div>
    );
  }

  if (connectorType === 'swivel') {
    return (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-30" aria-hidden="true">
        <div className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: c.border }} />
        <div className="w-1.5 h-2 rounded-sm -mt-0.5" style={{ backgroundColor: c.border }} />
        <div className="w-2.5 h-2 rounded-full border-2 -mt-0.5" style={{ borderColor: c.border }} />
      </div>
    );
  }

  // Default jump ring / bail
  return (
    <div
      className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-30"
      aria-hidden="true"
    >
      {/* Split jump ring */}
      <div
        className="w-3.5 h-3.5 rounded-full border-2 relative"
        style={{
          borderColor: c.border,
          background: 'transparent',
          boxShadow: 'inset 0 1px 1.5px rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.45)',
        }}
      >
        <div
          className="absolute -top-[1px] right-0.5 w-[2px] h-[2px] rounded-full"
          style={{ backgroundColor: '#18181b' }}
        />
      </div>
      {/* Tiny metal bail collar securing charm head */}
      <div
        className="w-1.5 h-1 -mt-0.5 rounded-t-sm"
        style={{
          backgroundColor: c.border,
          boxShadow: '0 1px 2px rgba(0,0,0,0.35)',
        }}
      />
    </div>
  );
}

function renderBottomChain(
  charm: CharmItem,
  size: number,
  appearance: AppearanceConfig,
  onRitual?: (action?: string) => void
) {
  const chain = charm.componentChain;
  const afterComponents = chain?.afterComponents || [];
  const finalDangle = chain?.finalDangle;

  if (afterComponents.length === 0 && (!finalDangle || finalDangle.type === 'none')) {
    return null;
  }

  return (
    <div
      className="absolute -bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto z-20"
      style={{ marginTop: '2px' }}
    >
      {/* Micro link connector ring */}
      <div
        className="w-2 h-2 rounded-full border"
        style={{ borderColor: appearance.ropeColor || '#d4af37' }}
      />

      {/* After Components / Beads */}
      {afterComponents.map((item, idx) => (
        <div
          key={item.id || idx}
          className="my-0.5 rounded-full flex items-center justify-center shadow-sm"
          style={{
            width: `${Math.max(8, item.radius * 2)}px`,
            height: `${Math.max(8, item.radius * 2)}px`,
            backgroundColor: item.color,
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6), 0 2px 3px rgba(0,0,0,0.4)',
          }}
          title={item.name}
        >
          {item.emoji ? (
            <span style={{ fontSize: `${item.radius * 1.2}px` }}>{item.emoji}</span>
          ) : (
            <div className="w-1 h-1 rounded-full bg-white/80 -mt-0.5 -ml-0.5" />
          )}
        </div>
      ))}

      {/* Final Dangle */}
      {finalDangle && finalDangle.type !== 'none' && (
        <div
          className="mt-0.5 flex flex-col items-center cursor-pointer hover:scale-110 active:scale-95 transition-transform"
          onClick={(e) => {
            e.stopPropagation();
            onRitual?.('dangle');
          }}
          title={finalDangle.label || finalDangle.type}
        >
          {finalDangle.type === 'tassel' && (
            <div className="flex flex-col items-center">
              <div
                className="w-2.5 h-2 rounded-sm shadow-sm"
                style={{ backgroundColor: appearance.ropeColor || '#d4af37' }}
              />
              <div
                className="w-3.5 h-6 rounded-b-md shadow-md"
                style={{
                  background: `repeating-linear-gradient(90deg, ${finalDangle.color} 0px, ${finalDangle.color} 1.5px, rgba(0,0,0,0.2) 2px)`,
                }}
              />
            </div>
          )}

          {finalDangle.type === 'bell' && (
            <div
              className="w-4 h-4 rounded-full border flex items-center justify-center shadow-md relative"
              style={{
                backgroundColor: finalDangle.color || '#f59e0b',
                borderColor: '#b45309',
              }}
            >
              <div className="w-1 h-1 rounded-full bg-amber-950 absolute bottom-0.5" />
            </div>
          )}

          {finalDangle.type === 'crystal' && (
            <div
              className="w-3 h-4.5 rotate-45 border shadow-md flex items-center justify-center"
              style={{
                backgroundColor: finalDangle.color || 'rgba(186, 230, 253, 0.8)',
                borderColor: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(2px)',
              }}
            />
          )}

          {finalDangle.type === 'teardrop' && (
            <div
              className="w-3 h-5 rounded-b-full rounded-t-sm shadow-md"
              style={{
                backgroundColor: finalDangle.color || '#ef4444',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.7), 0 2px 4px rgba(0,0,0,0.3)',
              }}
            />
          )}

          {finalDangle.type === 'coin' && (
            <div
              className="w-4 h-4 rounded-full border-2 flex items-center justify-center font-bold text-[8px] text-amber-900 shadow-md"
              style={{
                backgroundColor: '#fde047',
                borderColor: '#ca8a04',
              }}
            >
              <div className="w-1.5 h-1.5 border border-amber-900 bg-amber-200/50" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function renderCharmGraphic(
  charm: CharmItem,
  size: number,
  state: RitualState,
  onRitual?: (action?: string) => void
) {
  switch (charm.id) {
    case 'nimbu-mirchi': {
      // 7 chilies, lemon, and coal
      const ageDays = state.garlandAgeDays ?? 0;
      let filterClass = '';
      if (ageDays >= 7) {
        filterClass = 'sepia-[0.6] brightness-75 contrast-125'; // withered
      } else if (ageDays >= 4) {
        filterClass = 'sepia-[0.3] hue-rotate-15'; // aging
      }

      return (
        <div
          className={`relative flex flex-col items-center select-none cursor-pointer transition-all duration-300 ${filterClass} ${
            state.isFresh ? 'animate-bounce' : ''
          }`}
          style={{ width: `${size * 1.1}px`, height: `${size * 2.2}px`, marginTop: '-6px' }}
          onClick={() => onRitual?.('garland')}
          title="Nimbu-mirchi garland: Click to hang fresh garland"
        >
          {/* Thread holding chilies */}
          <div className="absolute top-0 bottom-6 w-0.5 bg-amber-950/70" />

          {/* Chilies stacked vertically with authentic slight natural twists */}
          <div className="flex flex-col items-center -space-y-4 z-10 w-full pt-1">
            <img
              src="/charms/nimbu-chili-5.png"
              alt="Chili 1"
              referrerPolicy="no-referrer"
              className="h-7 object-contain transform rotate-3"
            />
            <img
              src="/charms/nimbu-chili-2.png"
              alt="Chili 2"
              referrerPolicy="no-referrer"
              className="h-7 object-contain transform -rotate-4 scale-x-[-1]"
            />
            <img
              src="/charms/nimbu-chili-1.png"
              alt="Chili 3"
              referrerPolicy="no-referrer"
              className="h-8 object-contain transform rotate-2"
            />
            <img
              src="/charms/nimbu-chili-3.png"
              alt="Chili 4"
              referrerPolicy="no-referrer"
              className="h-7 object-contain transform -rotate-2"
            />
            <img
              src="/charms/nimbu-chili-7.png"
              alt="Chili 5"
              referrerPolicy="no-referrer"
              className="h-7 object-contain transform rotate-4 scale-x-[-1]"
            />
            <img
              src="/charms/nimbu-chili-4.png"
              alt="Chili 6"
              referrerPolicy="no-referrer"
              className="h-7 object-contain transform -rotate-3 scale-x-[-1]"
            />
            <img
              src="/charms/nimbu-chili-6.png"
              alt="Chili 7"
              referrerPolicy="no-referrer"
              className="h-7 object-contain transform rotate-2"
            />
          </div>

          {/* Lemon and Coal at base */}
          <div className="relative -mt-3 flex flex-col items-center z-20">
            <img
              src="/charms/nimbu-lemon.png"
              alt="Lemon"
              referrerPolicy="no-referrer"
              className="w-11 h-11 object-contain drop-shadow"
            />
            <img
              src="/charms/nimbu-coal.png"
              alt="Coal"
              referrerPolicy="no-referrer"
              className="w-6 h-5 object-contain -mt-2 drop-shadow"
            />
          </div>
        </div>
      );
    }

    case 'daruma': {
      const showLeft = !!state.leftEye;
      const showRight = !!state.rightEye;

      return (
        <div
          className="relative w-full h-full flex items-center justify-center select-none"
          title="Daruma Doll: Click left eye to make a wish, click right eye when achieved!"
        >
          <img
            src="/charms/daruma.png"
            alt="Daruma Doll"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain pointer-events-none drop-shadow-md"
          />

          {/* Interactive Left Eye Click Target */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRitual?.('leftEye');
            }}
            className="absolute cursor-pointer hover:scale-110 active:scale-95 transition-transform"
            style={{
              top: '36%',
              left: '34.5%',
              width: `${size * 0.16}px`,
              height: `${size * 0.16}px`,
            }}
            title={showLeft ? 'Left eye inked (Wish active!)' : 'Click to ink eye & make a wish'}
          >
            {showLeft ? (
              <div className="w-full h-full rounded-full bg-neutral-900 border border-neutral-950 relative shadow-inner">
                <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-white/90" />
              </div>
            ) : (
              <div className="w-full h-full rounded-full bg-white/90 border border-neutral-800/80 hover:bg-neutral-200 transition-colors" />
            )}
          </button>

          {/* Interactive Right Eye Click Target */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRitual?.('rightEye');
            }}
            className="absolute cursor-pointer hover:scale-110 active:scale-95 transition-transform"
            style={{
              top: '36%',
              right: '34.5%',
              width: `${size * 0.16}px`,
              height: `${size * 0.16}px`,
            }}
            title={showRight ? 'Right eye inked (Wish fulfilled!)' : 'Click to ink eye when wish is fulfilled'}
          >
            {showRight ? (
              <div className="w-full h-full rounded-full bg-neutral-900 border border-neutral-950 relative shadow-inner">
                <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-white/90" />
              </div>
            ) : (
              <div className="w-full h-full rounded-full bg-white/90 border border-neutral-800/80 hover:bg-neutral-200 transition-colors" />
            )}
          </button>
        </div>
      );
    }

    case 'ghanta': {
      return (
        <div
          className={`relative w-full h-full flex items-center justify-center cursor-pointer transition-transform ${
            state.isRinging ? 'animate-[spin_0.35s_ease-in-out_infinite_alternate]' : ''
          }`}
          onClick={() => onRitual?.('ghanta')}
          title="Ghanta Bell: Click to ring the bell"
        >
          <img
            src="/charms/ghanta.png"
            alt="Ghanta Temple Bell"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain drop-shadow-md"
          />
          {state.isRinging && (
            <div className="absolute -inset-2 rounded-full border-2 border-amber-400/60 animate-ping pointer-events-none" />
          )}
        </div>
      );
    }

    case 'drishti-bommai': {
      const variant = state.drishtiVariant ?? 0;
      // 0: Classic, 1: Crimson Raksha, 2: Golden Aura, 3: Midnight Shanti
      const filters = [
        'none',
        'sepia(0.6) hue-rotate(-30deg) saturate(1.8)',
        'sepia(0.8) hue-rotate(25deg) saturate(2.2)',
        'hue-rotate(180deg) saturate(1.4) brightness(0.9)',
      ];

      return (
        <div
          className="relative w-full h-full flex items-center justify-center cursor-pointer"
          onClick={() => onRitual?.('drishti')}
          title="Drishti Bommai: Click to repaint guardian with sacred pigments"
        >
          <img
            src="/charms/drishti-bommai.png"
            alt="Drishti Bommai"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain drop-shadow-md transition-all duration-500"
            style={{ filter: filters[variant % filters.length] }}
          />
        </div>
      );
    }

    case 'chinese-knot': {
      return (
        <div
          className={`relative w-full h-full flex items-center justify-center cursor-pointer transition-transform ${
            state.isCinching ? 'scale-110' : ''
          }`}
          onClick={() => onRitual?.('knot')}
          title="Páncháng jié: Click to cinch & tie in good fortune"
        >
          <img
            src="/charms/chinese-knot.png"
            alt="Páncháng jié Chinese Knot"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain drop-shadow-md"
          />
        </div>
      );
    }

    case 'maneki-neko': {
      return (
        <div
          className="relative w-full h-full flex items-center justify-center cursor-pointer"
          onClick={() => onRitual?.('maneki')}
          title="Maneki-neko: Click to beckon good fortune"
        >
          <img
            src="/charms/maneki-neko.png"
            alt="Maneki-neko"
            referrerPolicy="no-referrer"
            className={`w-full h-full object-contain drop-shadow-md ${
              state.isBeckoning ? 'animate-pulse' : ''
            }`}
          />
        </div>
      );
    }

    case 'horseshoe': {
      return (
        <div
          className="relative w-full h-full flex items-center justify-center cursor-pointer"
          onClick={() => onRitual?.('flick')}
          title="Horseshoe: Click to flick for good luck"
        >
          <img
            src="/charms/horseshoe.png"
            alt="Horseshoe"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain drop-shadow-md"
          />
        </div>
      );
    }

    case 'hamsa': {
      return (
        <div
          className="relative w-full h-full flex items-center justify-center cursor-pointer"
          onClick={() => onRitual?.('flick')}
          title="Hamsa: Click to give it a flick"
        >
          <img
            src="/charms/hamsa.png"
            alt="Hand of Hamsa"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain drop-shadow-md"
          />
        </div>
      );
    }

    case 'scarab': {
      return (
        <div
          className={`relative w-full h-full flex items-center justify-center cursor-pointer transition-transform duration-500 ${
            state.wingsSpread ? 'scale-115' : ''
          }`}
          onClick={() => onRitual?.('scarab')}
          title="Scarab: Click to spread ceremonial wings"
        >
          <img
            src="/charms/scarab.png"
            alt="Egyptian Scarab"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain drop-shadow-md"
          />
          {state.wingsSpread && (
            <div className="absolute inset-0 rounded-full border-2 border-teal-400/40 animate-ping pointer-events-none" />
          )}
        </div>
      );
    }

    case 'himmeli': {
      return (
        <div
          className={`relative w-full h-full flex items-center justify-center cursor-pointer transition-transform duration-700 ${
            state.isTurning ? 'rotate-[360deg] scale-105' : ''
          }`}
          onClick={() => onRitual?.('himmeli')}
          title="Himmeli: Click to set it turning"
        >
          <img
            src="/charms/himmeli.png"
            alt="Finnish Himmeli"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain drop-shadow-md"
          />
        </div>
      );
    }

    case 'nazar-boba': {
      return (
        <div
          className="relative w-full h-full flex items-center justify-center cursor-pointer"
          onClick={() => onRitual?.('boba')}
          title="3D Boba Tea Nazar: Click to shake the boba"
        >
          <img
            src="/charms/nazar-boba.png"
            alt="3D Boba Tea Nazar"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain drop-shadow-md hover:scale-105 active:scale-95 transition-transform"
          />
        </div>
      );
    }

    case 'nazar': {
      return (
        <div
          className="relative w-full h-full flex items-center justify-center cursor-pointer"
          onClick={() => onRitual?.('flick')}
          title="Classic Nazar: Click to flick"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <circle cx="50" cy="50" r="46" fill="#1e3a8a" stroke="#172554" strokeWidth="2" />
            <circle cx="50" cy="50" r="34" fill="#38bdf8" />
            <circle cx="50" cy="50" r="23" fill="#ffffff" />
            <circle cx="50" cy="50" r="12" fill="#0f172a" />
            <ellipse cx="40" cy="38" rx="6" ry="3" transform="rotate(-30 40 38)" fill="rgba(255,255,255,0.75)" />
            <circle cx="58" cy="62" r="2" fill="rgba(255,255,255,0.6)" />
          </svg>
        </div>
      );
    }

    default: {
      // 1. Emoji Charm (with material styling & container shapes)
      if (charm.type === 'emoji' || charm.type === 'emoji_charm' || charm.emojiConfig) {
        return renderUniversalEmojiCharm(charm, size, onRitual);
      }

      // 2. Image / Sigil Charm (with image processing styles, shapes & materials)
      if (charm.type === 'image_sigil' || charm.sigilConfig) {
        return renderUniversalImageSigilCharm(charm, size, onRitual);
      }

      // 3. Custom Image URL
      if (charm.imageUrl) {
        return (
          <div
            className="w-full h-full flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            onClick={() => onRitual?.('flick')}
          >
            <img
              src={charm.imageUrl}
              alt={charm.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>
        );
      }

      return (
        <div
          className="w-full h-full rounded-full border-2 flex items-center justify-center font-bold text-white shadow-md cursor-pointer"
          style={{ backgroundColor: charm.accentColor, borderColor: charm.secondaryColor || '#fff' }}
          onClick={() => onRitual?.('flick')}
        >
          {charm.name.slice(0, 2)}
        </div>
      );
    }
  }
}

function getShapeClasses(shape: string): { containerClass: string; clipStyle?: React.CSSProperties } {
  switch (shape) {
    case 'circle':
      return { containerClass: 'rounded-full overflow-hidden' };
    case 'oval':
      return { containerClass: 'rounded-[46%] overflow-hidden' };
    case 'rounded_square':
      return { containerClass: 'rounded-2xl overflow-hidden' };
    case 'diamond':
      return {
        containerClass: 'rotate-45 overflow-hidden',
        clipStyle: { transform: 'rotate(45deg) scale(0.82)' },
      };
    case 'shield':
      return {
        containerClass: 'overflow-hidden',
        clipStyle: { clipPath: 'polygon(0% 0%, 100% 0%, 100% 70%, 50% 100%, 0% 70%)' },
      };
    case 'heart':
      return {
        containerClass: 'overflow-hidden',
        clipStyle: {
          clipPath: 'path("M 50,22 C 36,0 0,16 0,50 C 0,78 50,100 50,100 C 50,100 100,78 100,50 C 100,16 64,0 50,22 Z")',
        },
      };
    case 'star':
      return {
        containerClass: 'overflow-hidden',
        clipStyle: {
          clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
        },
      };
    default:
      return { containerClass: '' };
  }
}

function renderUniversalEmojiCharm(
  charm: CharmItem,
  size: number,
  onRitual?: (action?: string) => void
) {
  const cfg = charm.emojiConfig;
  const emoji = cfg?.emoji || charm.emoji || '🧿';
  const scale = cfg?.scale ?? 1.0;
  const rotation = cfg?.rotation ?? 0;
  const material = cfg?.materialStyle || 'original';
  const shape = cfg?.shape || 'none';
  const bgColor = cfg?.bgColor || 'transparent';
  const borderColor = cfg?.borderColor || charm.accentColor;
  const borderWidth = cfg?.borderWidth ?? 2;
  const hasGlow = cfg?.hasGlow ?? false;
  const glowColor = cfg?.glowColor || 'rgba(234, 179, 8, 0.5)';

  const shapeInfo = getShapeClasses(shape);

  // Material style filters
  let materialFilter = '';
  let stickerBorder = '';
  let overlayGradient: React.ReactNode = null;

  if (material === 'sticker') {
    stickerBorder = 'drop-shadow(0 0 2px #fff) drop-shadow(0 0 3.5px #ffffff) drop-shadow(0 4px 6px rgba(0,0,0,0.35))';
  } else if (material === 'metal') {
    materialFilter = 'sepia(0.85) contrast(1.4) brightness(1.1) hue-rotate(-20deg)';
    overlayGradient = (
      <div
        className="absolute inset-0 pointer-events-none rounded-full mix-blend-overlay opacity-80"
        style={{
          background: 'linear-gradient(135deg, rgba(254,240,138,0.7) 0%, rgba(180,83,9,0.5) 100%)',
        }}
      />
    );
  } else if (material === 'crystal') {
    materialFilter = 'saturate(1.3) contrast(1.2) drop-shadow(0 2px 4px rgba(56,189,248,0.4))';
    overlayGradient = (
      <div
        className="absolute inset-0 pointer-events-none rounded-full mix-blend-soft-light opacity-90"
        style={{
          background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9) 0%, rgba(224,242,254,0.3) 50%, rgba(14,165,233,0.4) 100%)',
        }}
      />
    );
  } else if (material === 'neon') {
    materialFilter = `drop-shadow(0 0 8px ${glowColor}) drop-shadow(0 0 16px ${glowColor}) saturate(1.8)`;
  } else if (material === 'minimal') {
    materialFilter = 'contrast(1.4) saturate(0.8)';
  }

  const hasContainer = shape !== 'none' || bgColor !== 'transparent';

  return (
    <div
      className={`relative flex items-center justify-center select-none cursor-pointer hover:scale-105 active:scale-95 transition-transform ${shapeInfo.containerClass}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: hasContainer ? bgColor : 'transparent',
        border: hasContainer && borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
        boxShadow: hasGlow ? `0 0 16px ${glowColor}` : undefined,
        ...shapeInfo.clipStyle,
      }}
      onClick={() => onRitual?.('emoji')}
      title={`${charm.name}: Click to flick`}
    >
      {/* Emoji glyph with transformations */}
      <div
        className="relative flex items-center justify-center transition-transform"
        style={{
          fontSize: `${size * 0.68 * scale}px`,
          transform: `rotate(${rotation}deg)`,
          filter: [materialFilter, stickerBorder].filter(Boolean).join(' ') || undefined,
        }}
      >
        {emoji}
        {overlayGradient}
      </div>
    </div>
  );
}

function getMaterialFrameStyles(mat: string): { borderBg: string; shadow: string; sheen: string } {
  switch (mat) {
    case 'silver':
      return {
        borderBg: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 45%, #94a3b8 70%, #ffffff 100%)',
        shadow: '0 4px 10px rgba(0,0,0,0.3)',
        sheen: '#ffffff',
      };
    case 'rose_gold':
      return {
        borderBg: 'linear-gradient(135deg, #ffe4e6 0%, #fb7185 45%, #e11d48 70%, #fff1f2 100%)',
        shadow: '0 4px 12px rgba(225,29,72,0.3)',
        sheen: '#fecdd3',
      };
    case 'black_metal':
      return {
        borderBg: 'linear-gradient(135deg, #475569 0%, #1e293b 50%, #0f172a 100%)',
        shadow: '0 4px 12px rgba(0,0,0,0.6)',
        sheen: '#64748b',
      };
    case 'crystal':
      return {
        borderBg: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(224,242,254,0.4) 50%, rgba(255,255,255,0.9) 100%)',
        shadow: '0 4px 14px rgba(56,189,248,0.35)',
        sheen: '#bae6fd',
      };
    case 'glass':
      return {
        borderBg: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 100%)',
        shadow: '0 4px 12px rgba(0,0,0,0.25)',
        sheen: 'rgba(255,255,255,0.9)',
      };
    case 'neon':
      return {
        borderBg: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)',
        shadow: '0 0 16px rgba(129,140,248,0.7)',
        sheen: '#e0e7ff',
      };
    case 'stone':
      return {
        borderBg: 'linear-gradient(135deg, #78716c 0%, #44403c 60%, #292524 100%)',
        shadow: '0 4px 10px rgba(0,0,0,0.45)',
        sheen: '#a8a29e',
      };
    case 'wood':
      return {
        borderBg: 'linear-gradient(135deg, #b45309 0%, #78350f 60%, #451a03 100%)',
        shadow: '0 4px 10px rgba(69,26,3,0.5)',
        sheen: '#fde68a',
      };
    case 'gold':
    default:
      return {
        borderBg: 'linear-gradient(135deg, #fef08a 0%, #d4af37 45%, #ca8a04 70%, #fef9c3 100%)',
        shadow: '0 4px 12px rgba(202,138,4,0.35)',
        sheen: '#fef08a',
      };
  }
}

function renderUniversalImageSigilCharm(
  charm: CharmItem,
  size: number,
  onRitual?: (action?: string) => void
) {
  const cfg = charm.sigilConfig;
  const imgUrl = cfg?.imageDataUrl || charm.imageUrl;
  if (!imgUrl) {
    return (
      <div className="w-full h-full rounded-full border-2 border-dashed border-neutral-400 flex items-center justify-center text-xs text-neutral-400">
        No Image
      </div>
    );
  }

  const sigilStyle = cfg?.sigilStyle || 'original';
  const material = cfg?.material || 'gold';
  const shape = cfg?.shape || 'circle';
  const brightness = cfg?.brightness ?? 100;
  const contrast = cfg?.contrast ?? 100;
  const threshold = cfg?.threshold ?? 0;
  const invert = cfg?.invert ?? false;
  const monochromeColor = cfg?.monochromeColor || '#d4af37';
  const cropZoom = cfg?.cropZoom ?? 1.0;
  const rotation = cfg?.rotation ?? 0;
  const borderWidth = cfg?.borderWidth ?? 3;
  const hasGlow = cfg?.hasGlow ?? true;
  const glowColor = cfg?.glowColor || 'rgba(212, 175, 55, 0.5)';
  const opacity = cfg?.opacity ?? 1.0;

  const shapeInfo = getShapeClasses(shape);
  const frameStyles = getMaterialFrameStyles(material);

  // Compute CSS filter stack based on sigil style
  const filterParts: string[] = [
    `brightness(${brightness}%)`,
    `contrast(${contrast}%)`,
  ];

  if (invert) {
    filterParts.push('invert(100%)');
  }

  if (threshold > 0 || sigilStyle === 'symbol') {
    filterParts.push('contrast(300%) grayscale(100%)');
  }

  if (sigilStyle === 'silhouette') {
    filterParts.push('brightness(0) saturate(100%)');
  } else if (sigilStyle === 'line_art') {
    filterParts.push('grayscale(100%) contrast(250%)');
  } else if (sigilStyle === 'monochrome') {
    filterParts.push('grayscale(100%) sepia(100%)');
  } else if (sigilStyle === 'glow') {
    filterParts.push(`drop-shadow(0 0 6px ${glowColor}) drop-shadow(0 0 12px ${glowColor})`);
  } else if (sigilStyle === 'engraved') {
    filterParts.push('contrast(160%) sepia(40%) drop-shadow(1px 1px 1px #fff) drop-shadow(-1px -1px 1px #000)');
  }

  const imgFilter = filterParts.join(' ');

  return (
    <div
      className={`relative flex items-center justify-center select-none cursor-pointer hover:scale-105 active:scale-95 transition-transform ${shapeInfo.containerClass}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        padding: `${borderWidth}px`,
        background: frameStyles.borderBg,
        boxShadow: hasGlow ? `0 0 18px ${glowColor}, ${frameStyles.shadow}` : frameStyles.shadow,
        opacity,
        ...shapeInfo.clipStyle,
      }}
      onClick={() => onRitual?.('flick')}
      title={`${charm.name}: Custom Sigil Charm`}
    >
      {/* Inner Image Canvas / Tablet */}
      <div className="relative w-full h-full overflow-hidden rounded-inherit flex items-center justify-center bg-neutral-950/80">
        <img
          src={imgUrl}
          alt={charm.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform"
          style={{
            transform: `scale(${cropZoom}) rotate(${rotation}deg)`,
            filter: imgFilter,
          }}
        />

        {/* Monochrome tint overlay if enabled */}
        {sigilStyle === 'monochrome' && (
          <div
            className="absolute inset-0 pointer-events-none mix-blend-color opacity-90"
            style={{ backgroundColor: monochromeColor }}
          />
        )}

        {/* Silhouette color fill if silhouette */}
        {sigilStyle === 'silhouette' && (
          <div
            className="absolute inset-0 pointer-events-none mix-blend-screen opacity-90"
            style={{ backgroundColor: monochromeColor }}
          />
        )}

        {/* Specular glass reflection sweep on top bezel */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.1) 40%, transparent 60%)',
          }}
        />
      </div>
    </div>
  );
}
