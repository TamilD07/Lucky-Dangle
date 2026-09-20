import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Download,
  Maximize2,
  Layers,
  Sliders,
  MoveHorizontal,
  ShieldCheck,
  Compass,
  Palette,
  Eye,
  Bell,
  Smartphone
} from 'lucide-react';
import {
  DangleSettings,
  CharmItem,
  RitualState,
  DEFAULT_PHYSICS,
  DEFAULT_APPEARANCE,
  DEFAULT_POSITION,
} from './types';
import { BUILT_IN_CHARMS } from './data/charms';
import { HomeView } from './components/screens/HomeView';
import { LibraryView } from './components/screens/LibraryView';
import { PhysicsView } from './components/screens/PhysicsView';
import { PositionView } from './components/screens/PositionView';
import { PrivacyView } from './components/screens/PrivacyView';
import { CodeExportModal } from './components/screens/CodeExportModal';
import { FullscreenDangleOverlay } from './components/FullscreenDangleOverlay';
import { PermissionDialog } from './components/screens/PermissionDialog';
import { InstallModal } from './components/InstallModal';
import { AndroidOverlayGuideView } from './components/screens/AndroidOverlayGuideView';
import { audioSynth } from './utils/audioSynth';
import { useDeviceTilt } from './hooks/useDeviceTilt';

const STORAGE_KEY = 'screen_dangle_settings_v3';

const INITIAL_SETTINGS: DangleSettings = {
  isEnabled: true,
  hasOverlayPermission: true,
  selectedCharmId: 'daruma',
  physics: { ...DEFAULT_PHYSICS },
  appearance: { ...DEFAULT_APPEARANCE },
  position: { ...DEFAULT_POSITION },
  customCharms: [],
};

type ActiveTab = 'talisman' | 'sanctuary' | 'physics' | 'position' | 'overlay' | 'privacy' | 'code';

export default function App() {
  const [settings, setSettings] = useState<DangleSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const exists = BUILT_IN_CHARMS.some((c) => c.id === parsed.selectedCharmId);
        if (!exists && !parsed.customCharms?.some((c: CharmItem) => c.id === parsed.selectedCharmId)) {
          parsed.selectedCharmId = 'daruma';
        }
        return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_SETTINGS;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('talisman');
  const [isFullscreenDangle, setIsFullscreenDangle] = useState<boolean>(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState<boolean>(false);
  const [installModalOpen, setInstallModalOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Real device gyro tilt
  const { tiltX, isSupported: hasGyro, requestOrientationPermission } = useDeviceTilt();

  // Dynamic ritual state
  const [ritualState, setRitualState] = useState<RitualState>({
    leftEye: false,
    rightEye: false,
    isRinging: false,
    garlandAgeDays: 0,
    isFresh: false,
    drishtiVariant: 0,
    wingsSpread: false,
    isTurning: false,
    isBeckoning: false,
    isCinching: false,
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Safe ignore
    }
  }, [settings]);

  // Determine current charm
  const allCharms = [...BUILT_IN_CHARMS, ...settings.customCharms];
  const currentCharm =
    allCharms.find((c) => c.id === settings.selectedCharmId) || BUILT_IN_CHARMS[0];

  // Ritual trigger dispatcher
  const handleTriggerRitual = useCallback((actionName?: string) => {
    const action = actionName || currentCharm.ritualKind;

    switch (action) {
      case 'leftEye':
        setRitualState((prev) => ({ ...prev, leftEye: !prev.leftEye }));
        audioSynth.playRitualSound('sparkle');
        break;

      case 'rightEye':
        setRitualState((prev) => ({ ...prev, rightEye: !prev.rightEye }));
        audioSynth.playRitualSound('sparkle');
        break;

      case 'ghanta':
        setRitualState((prev) => ({ ...prev, isRinging: true }));
        audioSynth.playBellSound();
        setTimeout(() => {
          setRitualState((prev) => ({ ...prev, isRinging: false }));
        }, 1800);
        break;

      case 'garland':
        setRitualState((prev) => ({ ...prev, garlandAgeDays: 0, isFresh: true }));
        audioSynth.playRitualSound('garland');
        setTimeout(() => {
          setRitualState((prev) => ({ ...prev, isFresh: false }));
        }, 1400);
        break;

      case 'drishti':
        setRitualState((prev) => ({
          ...prev,
          drishtiVariant: ((prev.drishtiVariant ?? 0) + 1) % 4,
        }));
        audioSynth.playRitualSound('sparkle');
        break;

      case 'knot':
        setRitualState((prev) => ({ ...prev, isCinching: true }));
        audioSynth.playRitualSound('knot');
        setTimeout(() => {
          setRitualState((prev) => ({ ...prev, isCinching: false }));
        }, 800);
        break;

      case 'maneki':
        setRitualState((prev) => ({ ...prev, isBeckoning: true }));
        audioSynth.playRitualSound('sparkle');
        setTimeout(() => {
          setRitualState((prev) => ({ ...prev, isBeckoning: false }));
        }, 1500);
        break;

      case 'scarab':
        setRitualState((prev) => ({ ...prev, wingsSpread: !prev.wingsSpread }));
        audioSynth.playRitualSound('scarab');
        break;

      case 'himmeli':
        setRitualState((prev) => ({ ...prev, isTurning: true }));
        audioSynth.playRitualSound('sparkle');
        setTimeout(() => {
          setRitualState((prev) => ({ ...prev, isTurning: false }));
        }, 1500);
        break;

      case 'boba':
        audioSynth.playFlickSound(2.5);
        break;

      default:
        audioSynth.playFlickSound(2.0);
        break;
    }
  }, [currentCharm.ritualKind]);

  const handleSetGarlandAge = useCallback((days: number) => {
    setRitualState((prev) => ({ ...prev, garlandAgeDays: days }));
  }, []);

  const handleAddCustomCharm = (charm: CharmItem) => {
    setSettings((prev) => ({
      ...prev,
      customCharms: [charm, ...prev.customCharms],
      selectedCharmId: charm.id,
    }));
    setActiveTab('talisman');
  };

  const handleUpdateCharm = (updatedCharm: CharmItem) => {
    setSettings((prev) => {
      const existsInCustom = prev.customCharms.some((c) => c.id === updatedCharm.id);
      const newCustom = existsInCustom
        ? prev.customCharms.map((c) => (c.id === updatedCharm.id ? updatedCharm : c))
        : [updatedCharm, ...prev.customCharms];
      return {
        ...prev,
        customCharms: newCustom,
        selectedCharmId: updatedCharm.id,
      };
    });
  };

  const handleDeleteCustomCharm = (charmId: string) => {
    setSettings((prev) => {
      const remaining = prev.customCharms.filter((c) => c.id !== charmId);
      const newSelected =
        prev.selectedCharmId === charmId ? BUILT_IN_CHARMS[0].id : prev.selectedCharmId;
      return {
        ...prev,
        customCharms: remaining,
        selectedCharmId: newSelected,
      };
    });
  };

  const handleSelectCharm = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      selectedCharmId: id,
    }));
  };

  const handleGrantPermission = () => {
    setSettings((prev) => ({
      ...prev,
      hasOverlayPermission: true,
      isEnabled: true,
    }));
    setPermissionDialogOpen(false);
  };

  const toggleGlobalSound = () => {
    const next = !soundEnabled;
    audioSynth.enabled = next;
    setSoundEnabled(next);
    if (next) audioSynth.playSnapSound();
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-amber-500 selection:text-neutral-950 font-sans">
      {/* Fullscreen Floating Screen Dangle Overlay */}
      {isFullscreenDangle && (
        <FullscreenDangleOverlay
          settings={settings}
          currentCharm={currentCharm}
          ritualState={ritualState}
          tiltX={tiltX}
          onTriggerRitual={handleTriggerRitual}
          onClose={() => setIsFullscreenDangle(false)}
          onUpdateSettings={setSettings}
          onSelectCharm={handleSelectCharm}
          allCharms={allCharms}
        />
      )}

      {/* Modern Top App Header */}
      <header className="border-b border-white/5 bg-neutral-950/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between">
          {/* Brand & Active Charm */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('talisman')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-lg shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                🎋
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white tracking-tight">Lucky Dangle</span>
                  <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-medium">
                    Talisman
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                  <span className="text-amber-400 font-medium">{currentCharm.name}</span>
                  <span>•</span>
                  <span>{currentCharm.origin}</span>
                </div>
              </div>
            </button>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Fullscreen Dangle Mode */}
            <button
              onClick={() => setIsFullscreenDangle(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-sm"
              title="Hang charm directly from top of your device screen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Fullscreen Dangle</span>
            </button>

            {/* Sound Synthesizer Toggle */}
            <button
              onClick={toggleGlobalSound}
              className={`p-2 rounded-full border text-xs flex items-center gap-1.5 px-3 transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-neutral-900 border-white/10 text-amber-400 shadow-sm'
                  : 'bg-neutral-900 border-white/5 text-neutral-500'
              }`}
              title={soundEnabled ? 'Mute synthesized sound effects' : 'Unmute sound effects'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="text-xs font-medium hidden md:inline">
                {soundEnabled ? 'Sound On' : 'Muted'}
              </span>
            </button>

            {/* Install App / APK Button */}
            <button
              onClick={() => setInstallModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs shadow-md shadow-amber-500/20 transition active:scale-95 cursor-pointer"
              title="Install app to your device home screen or get Android APK"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          </div>
        </div>

        {/* Primary Tab Navigation Bar */}
        <div className="border-t border-white/5 bg-neutral-950">
          <div className="max-w-5xl mx-auto px-2 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar py-1.5">
            {[
              { key: 'talisman', label: 'Talisman', icon: Sparkles },
              { key: 'sanctuary', label: 'Charm Sanctuary', icon: Layers },
              { key: 'overlay', label: 'Homescreen Overlay & APK', icon: Smartphone },
              { key: 'physics', label: 'Physics & Rope', icon: Sliders },
              { key: 'position', label: 'Position & Notch', icon: MoveHorizontal },
              { key: 'privacy', label: 'Privacy & Security', icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as ActiveTab)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 pb-20">
        {activeTab === 'talisman' && (
          <div className="space-y-4">
            {/* Direct answer banner for homescreen overlay */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-neutral-900 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Float this charm over your Home Screen &amp; all apps</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-semibold border border-amber-500/30">
                      Native Android APK
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Browsers are sandboxed to web pages. Get the included native Android app to hang the charm over WhatsApp, YouTube, &amp; games!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => setActiveTab('overlay')}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md shadow-amber-500/20"
                >
                  <span>How It Works &amp; APK</span>
                </button>
              </div>
            </div>

            <HomeView
              settings={settings}
              currentCharm={currentCharm}
              ritualState={ritualState}
              onTriggerRitual={handleTriggerRitual}
              onSetGarlandAge={handleSetGarlandAge}
              onUpdateSettings={setSettings}
              onNavigate={(screen) => {
                if (screen === 'library') setActiveTab('sanctuary');
                else if (screen === 'physics') setActiveTab('physics');
                else if (screen === 'position') setActiveTab('position');
                else if (screen === 'privacy') setActiveTab('privacy');
                else if (screen === 'code') setActiveTab('overlay');
              }}
              onRequestPermission={() => setPermissionDialogOpen(true)}
              containerWidth={640}
              containerHeight={280}
              onOpenFullscreen={() => setIsFullscreenDangle(true)}
              externalTiltX={tiltX}
            />
          </div>
        )}

        {activeTab === 'overlay' && (
          <div className="bg-neutral-900/40 border border-white/5 rounded-3xl p-4 sm:p-6">
            <AndroidOverlayGuideView
              onBack={() => setActiveTab('talisman')}
              onOpenInstallModal={() => setInstallModalOpen(true)}
            />
          </div>
        )}

        {activeTab === 'sanctuary' && (
          <div className="bg-neutral-900/40 border border-white/5 rounded-3xl p-4 sm:p-6">
            <LibraryView
              currentCharmId={settings.selectedCharmId}
              customCharms={settings.customCharms}
              onSelectCharm={(id) => {
                handleSelectCharm(id);
                setActiveTab('talisman');
              }}
              onAddCustomCharm={handleAddCustomCharm}
              onUpdateCharm={handleUpdateCharm}
              onDeleteCustomCharm={handleDeleteCustomCharm}
              onBack={() => setActiveTab('talisman')}
            />
          </div>
        )}

        {activeTab === 'physics' && (
          <div className="bg-neutral-900/40 border border-white/5 rounded-3xl p-4 sm:p-6">
            <PhysicsView
              settings={settings}
              onUpdateSettings={setSettings}
              onBack={() => setActiveTab('talisman')}
            />
          </div>
        )}

        {activeTab === 'position' && (
          <div className="bg-neutral-900/40 border border-white/5 rounded-3xl p-4 sm:p-6">
            <PositionView
              settings={settings}
              onUpdateSettings={setSettings}
              onBack={() => setActiveTab('talisman')}
            />
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="bg-neutral-900/40 border border-white/5 rounded-3xl p-4 sm:p-6">
            <PrivacyView
              settings={settings}
              onUpdateSettings={setSettings}
              onBack={() => setActiveTab('talisman')}
            />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="bg-neutral-900/40 border border-white/5 rounded-3xl p-4 sm:p-6">
            <CodeExportModal onBack={() => setActiveTab('talisman')} />
          </div>
        )}
      </main>

      {/* Floating Bottom Quick Action on Mobile */}
      <div className="sm:hidden fixed bottom-4 right-4 z-30">
        <button
          onClick={() => setIsFullscreenDangle(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-bold text-xs shadow-xl shadow-amber-500/30 active:scale-95 cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
          <span>Dangle Charm</span>
        </button>
      </div>

      {/* Modals */}
      <PermissionDialog
        isOpen={permissionDialogOpen}
        onGrant={handleGrantPermission}
        onClose={() => setPermissionDialogOpen(false)}
      />

      <InstallModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
      />

      {/* Clean App Footer */}
      <footer className="border-t border-white/5 bg-neutral-950/80 py-4 px-4 text-center text-xs text-neutral-500">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <span>🎋 Authentic Cultural Talismans</span>
          <span>📐 Real-time Pendulum Physics</span>
          <span>🔔 Harmonic Sound Synthesis</span>
          <span>🔒 100% Offline & Private</span>
        </div>
      </footer>
    </div>
  );
}
