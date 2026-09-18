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
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-30"
        aria-hidden="true"
      >
        {/* Split jump ring */}
        <div
          className="w-3.5 h-3.5 rounded-full border-2 relative"
          style={{
            borderColor: appearance.ropeColor || '#d4af37',
            background: 'transparent',
            boxShadow: 'inset 0 1px 1.5px rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.45)',
          }}
        >
          {/* Subtle metallic split notch cut in ring */}
          <div
            className="absolute -top-[1px] right-0.5 w-[2px] h-[2px] rounded-full"
            style={{ backgroundColor: '#18181b' }}
          />
        </div>
        {/* Tiny metal bail collar securing charm head */}
        <div
          className="w-1.5 h-1 -mt-0.5 rounded-t-sm"
          style={{
            backgroundColor: appearance.ropeColor || '#d4af37',
            boxShadow: '0 1px 2px rgba(0,0,0,0.35)',
          }}
        />
      </div>

      {/* Render Charm Graphic */}
      {renderCharmGraphic(charm, size, ritualState, onRitualTrigger)}
    </div>
  );
};

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
      if (charm.type === 'emoji' && charm.emoji) {
        return (
          <div
            className="flex items-center justify-center select-none cursor-pointer hover:scale-110 active:scale-95 transition-transform"
            style={{ fontSize: `${size * 0.72}px` }}
            onClick={() => onRitual?.('emoji')}
          >
            {charm.emoji}
          </div>
        );
      }

      if (charm.imageUrl) {
        return (
          <div
            className="w-full h-full flex items-center justify-center cursor-pointer"
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
