import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Layers,
  Sparkles,
  RotateCcw,
  Maximize2,
  Compass,
  Sliders,
  Grid,
  FileText,
  Globe,
  Image as ImageIcon,
  Wifi,
  Battery,
  Flame,
  Volume2
} from 'lucide-react';
import { CharmItem, DangleSettings, RitualState } from '../types';
import { DangleCanvas } from './DangleCanvas';
import { CharmRenderer } from './CharmRenderer';
import { HomeView } from './screens/HomeView';
import { OnboardingView } from './screens/OnboardingView';
import { LibraryView } from './screens/LibraryView';
import { PhysicsView } from './screens/PhysicsView';
import { PositionView } from './screens/PositionView';
import { PrivacyView } from './screens/PrivacyView';
import { CodeExportModal } from './screens/CodeExportModal';

interface AndroidDeviceFrameProps {
  settings: DangleSettings;
  currentCharm: CharmItem;
  ritualState: RitualState;
  onTriggerRitual: (actionName?: string) => void;
  onSetGarlandAge: (days: number) => void;
  onUpdateSettings: (updater: (prev: DangleSettings) => DangleSettings) => void;
  onAddCustomCharm: (charm: CharmItem) => void;
  onDeleteCustomCharm: (charmId: string) => void;
  onSelectCharm: (id: string) => void;
  onRequestPermission: () => void;
}

type ActiveScreen = 'home' | 'onboarding' | 'library' | 'physics' | 'position' | 'privacy' | 'code';
type SystemViewMode = 'app' | 'os_overlay';
type SimulatedBackgroundApp = 'launcher' | 'gallery' | 'notes' | 'browser';

export const AndroidDeviceFrame: React.FC<AndroidDeviceFrameProps> = ({
  settings,
  currentCharm,
  ritualState,
  onTriggerRitual,
  onSetGarlandAge,
  onUpdateSettings,
  onAddCustomCharm,
  onDeleteCustomCharm,
  onSelectCharm,
  onRequestPermission,
}) => {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('home');
  const [systemViewMode, setSystemViewMode] = useState<SystemViewMode>('app');
  const [simulatedApp, setSimulatedApp] = useState<SimulatedBackgroundApp>('launcher');
  const [deviceTilt, setDeviceTilt] = useState<number>(0); // -10 to +10 degrees
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [testSwingCounter, setTestSwingCounter] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  // Time ticker
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${h}:${m}`);
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  // Listen to physical device orientation if supported on mobile/tablet browser
  useEffect(() => {
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null) {
        // gamma is left-to-right tilt in degrees (-90 to +90)
        const normalized = Math.max(-10, Math.min(10, e.gamma / 3.5));
        setDeviceTilt(normalized);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, []);

  const handleShakePhone = () => {
    setIsShaking(true);
    // Oscillate tilt rapidly
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setDeviceTilt((count % 2 === 0 ? 1 : -1) * (8 - count * 0.8));
      if (count >= 10) {
        clearInterval(interval);
        setDeviceTilt(0);
        setIsShaking(false);
      }
    }, 60);
  };

  const handleTestSwing = () => {
    setTestSwingCounter((prev) => prev + 1);
  };

  // Dimensions of the simulated phone display
  const phoneWidth = 380;
  const phoneHeight = 760;

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-6xl mx-auto p-2 sm:p-4">
      {/* Left / Center: The Android Phone Device Container */}
      <div className="relative flex flex-col items-center">
        {/* Phone Chassis (Pixel 9 Pro aesthetic) */}
        <div
          id="android-phone-chassis"
          className="relative rounded-[48px] p-3.5 bg-gradient-to-b from-neutral-800 via-neutral-900 to-neutral-950 shadow-2xl border-4 border-neutral-700/80 ring-1 ring-white/10"
          style={{
            width: `${phoneWidth + 28}px`,
            height: `${phoneHeight + 28}px`,
            transform: `rotate(${deviceTilt * 0.8}deg)`,
            transition: isShaking ? 'none' : 'transform 180ms ease-out',
          }}
        >
          {/* Side hardware buttons */}
          <div className="absolute -left-4.5 top-28 w-1 h-12 rounded-l-md bg-neutral-700 border-l border-white/20" />
          <div className="absolute -left-4.5 top-44 w-1 h-20 rounded-l-md bg-neutral-700 border-l border-white/20" />
          <div className="absolute -right-4.5 top-32 w-1 h-14 rounded-r-md bg-neutral-700 border-r border-white/20" />

          {/* Internal Screen Bezel */}
          <div
            id="android-screen-viewport"
            className="relative w-full h-full rounded-[40px] overflow-hidden bg-neutral-950 flex flex-col select-none border border-neutral-800"
          >
            {/* Top Status Bar with Camera Punch-Hole */}
            <div className="relative w-full h-11 px-6 flex items-center justify-between z-30 bg-black/40 backdrop-blur-sm shrink-0">
              {/* Left time */}
              <div className="text-xs font-semibold text-white tracking-tight font-mono">
                {currentTime}
              </div>

              {/* Center Selfie Camera Punch-Hole */}
              <div className="w-4 h-4 rounded-full bg-neutral-950 border border-neutral-700/80 flex items-center justify-center shadow-inner">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-950/80" />
              </div>

              {/* Right System Icons */}
              <div className="flex items-center gap-2 text-white">
                <span className="text-[10px] font-bold">5G</span>
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-4 h-4" />
              </div>
            </div>

            {/* Screen Content Body */}
            <div className="relative flex-1 w-full overflow-hidden flex flex-col">
              {/* View Mode A: Inside Screen Dangle Android App */}
              {systemViewMode === 'app' && (
                <div className="w-full h-full">
                  {activeScreen === 'onboarding' && (
                    <OnboardingView
                      charm={currentCharm}
                      physics={settings.physics}
                      appearance={settings.appearance}
                      onComplete={() => setActiveScreen('home')}
                    />
                  )}

                  {activeScreen === 'home' && (
                    <HomeView
                      settings={settings}
                      currentCharm={currentCharm}
                      ritualState={ritualState}
                      onTriggerRitual={onTriggerRitual}
                      onSetGarlandAge={onSetGarlandAge}
                      onUpdateSettings={onUpdateSettings}
                      onNavigate={(s) => setActiveScreen(s)}
                      onRequestPermission={onRequestPermission}
                      containerWidth={phoneWidth}
                      containerHeight={phoneHeight - 44 - 28}
                    />
                  )}

                  {activeScreen === 'library' && (
                    <LibraryView
                      currentCharmId={settings.selectedCharmId}
                      customCharms={settings.customCharms}
                      onSelectCharm={(id) => onSelectCharm(id)}
                      onAddCustomCharm={onAddCustomCharm}
                      onDeleteCustomCharm={onDeleteCustomCharm}
                      onBack={() => setActiveScreen('home')}
                    />
                  )}

                  {activeScreen === 'physics' && (
                    <PhysicsView
                      settings={settings}
                      onUpdateSettings={onUpdateSettings}
                      onBack={() => setActiveScreen('home')}
                    />
                  )}

                  {activeScreen === 'position' && (
                    <PositionView
                      settings={settings}
                      onUpdateSettings={onUpdateSettings}
                      onBack={() => setActiveScreen('home')}
                    />
                  )}

                  {activeScreen === 'privacy' && (
                    <PrivacyView
                      settings={settings}
                      onUpdateSettings={onUpdateSettings}
                      onBack={() => setActiveScreen('home')}
                    />
                  )}

                  {activeScreen === 'code' && (
                    <CodeExportModal onBack={() => setActiveScreen('home')} />
                  )}
                </div>
              )}

              {/* View Mode B: Floating Overlay Over Simulated Android OS & Other Apps */}
              {systemViewMode === 'os_overlay' && (
                <div className="relative w-full h-full bg-neutral-900 flex flex-col">
                  {/* Simulated App Content */}
                  {renderSimulatedAppContent(simulatedApp)}

                  {/* Android Foreground Service Notification Banner if active */}
                  {settings.isEnabled && (
                    <div className="absolute top-2 left-3 right-3 bg-neutral-900/95 border border-white/10 rounded-2xl p-2.5 shadow-xl flex items-center justify-between z-20 backdrop-blur-md">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                          🧿
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-white">Screen Dangle is active</div>
                          <div className="text-[10px] text-neutral-400">Hanging from top screen bezel</div>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          onUpdateSettings((prev) => ({ ...prev, isEnabled: false }))
                        }
                        className="text-[10px] font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20"
                      >
                        Turn Off
                      </button>
                    </div>
                  )}

                  {/* Overlay Off warning if disabled */}
                  {!settings.isEnabled && (
                    <div className="absolute top-3 left-3 right-3 bg-amber-950/90 border border-amber-500/30 rounded-2xl p-3 shadow-xl text-center z-20 backdrop-blur-md">
                      <div className="text-xs font-bold text-amber-300">Screen Dangle is currently OFF</div>
                      <div className="text-[11px] text-neutral-300 mt-0.5">
                        Enable the overlay in settings to display your charm over other apps.
                      </div>
                      <button
                        onClick={() =>
                          onUpdateSettings((prev) => ({ ...prev, isEnabled: true }))
                        }
                        className="mt-2 px-3 py-1 rounded-lg bg-amber-500 text-neutral-950 font-bold text-xs"
                      >
                        Turn ON Overlay
                      </button>
                    </div>
                  )}

                  {/* THE FLOATING OVERLAY: Hanging from top edge across apps */}
                  {settings.isEnabled && (
                    <DangleCanvas
                      charm={currentCharm}
                      physics={settings.physics}
                      appearance={settings.appearance}
                      horizontalPercent={settings.position.horizontalPercent}
                      containerWidth={phoneWidth}
                      containerHeight={phoneHeight - 44}
                      interactive={settings.position.dragInteraction}
                      externalTiltX={deviceTilt}
                      testSwingTrigger={testSwingCounter}
                      ritualState={ritualState}
                      onRitualTrigger={onTriggerRitual}
                      onAnchorMove={(pct) =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          position: { ...prev.position, horizontalPercent: pct },
                        }))
                      }
                    />
                  )}
                </div>
              )}
            </div>

            {/* Bottom Gesture Navigation Bar Pill */}
            <div className="w-full h-7 flex items-center justify-center shrink-0 bg-black/40 backdrop-blur-sm z-30">
              <div className="w-32 h-1 rounded-full bg-white/40" />
            </div>
          </div>
        </div>
      </div>

      {/* Right: Simulation Controller & Quick Actions */}
      <div className="w-full lg:w-96 flex flex-col space-y-4">
        {/* View Mode Switcher Card */}
        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Simulation View Mode
            </span>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-mono">
              Live Preview
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-950 rounded-xl border border-white/5">
            <button
              id="view-mode-app-btn"
              onClick={() => setSystemViewMode('app')}
              className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                systemViewMode === 'app'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Screen Dangle App</span>
            </button>

            <button
              id="view-mode-overlay-btn"
              onClick={() => setSystemViewMode('os_overlay')}
              className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                systemViewMode === 'os_overlay'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Overlay Over OS</span>
            </button>
          </div>

          {/* If in OS overlay mode, pick simulated background app */}
          {systemViewMode === 'os_overlay' && (
            <div className="pt-2 border-t border-white/5 space-y-2">
              <div className="text-[11px] font-semibold text-neutral-400">
                Simulated Active App:
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { key: 'launcher', label: 'Home', icon: Grid },
                  { key: 'gallery', label: 'Photos', icon: ImageIcon },
                  { key: 'notes', label: 'Notes', icon: FileText },
                  { key: 'browser', label: 'Web', icon: Globe },
                ].map((app) => {
                  const Icon = app.icon;
                  return (
                    <button
                      key={app.key}
                      onClick={() => setSimulatedApp(app.key as SimulatedBackgroundApp)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold flex flex-col items-center gap-1 border transition-colors ${
                        simulatedApp === app.key
                          ? 'bg-neutral-800 border-indigo-500 text-white'
                          : 'bg-neutral-950 border-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{app.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Motion Sensor & Physics Hardware Simulator */}
        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white">Sensor & Tilt Controls</span>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono">
              {deviceTilt > 0 ? `+${deviceTilt.toFixed(1)}°` : `${deviceTilt.toFixed(1)}°`}
            </span>
          </div>

          {/* Phone Tilt Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Tilt Phone Left / Right</span>
              <button
                onClick={() => setDeviceTilt(0)}
                className="text-[10px] text-indigo-400 hover:underline"
              >
                Zero Level
              </button>
            </div>
            <input
              type="range"
              min="-8"
              max="8"
              step="0.2"
              value={deviceTilt}
              onChange={(e) => setDeviceTilt(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-neutral-500">
              <span>◄ Tilt -8°</span>
              <span>Flat (0°)</span>
              <span>Tilt +8° ►</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              id="action-shake-phone-btn"
              onClick={handleShakePhone}
              disabled={isShaking}
              className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white border border-white/10 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Shake Phone</span>
            </button>

            <button
              id="action-test-swing-btn"
              onClick={handleTestSwing}
              className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Test Swing</span>
            </button>
          </div>
        </div>

        {/* Current Charm Quick Card */}
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-neutral-950 border border-white/10 flex items-center justify-center overflow-hidden p-1">
              <CharmRenderer
                charm={currentCharm}
                angle={0}
                size={36}
                appearance={settings.appearance}
              />
            </div>
            <div>
              <div className="text-xs font-bold text-white">{currentCharm.name}</div>
              <div className="text-[10px] text-amber-400/90 font-medium">
                {currentCharm.origin} • {settings.appearance.ropeStyle} string
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setSystemViewMode('app');
              setActiveScreen('library');
            }}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
          >
            Change
          </button>
        </div>

        {/* Direct Android Code & ZIP button */}
        <button
          onClick={() => {
            setSystemViewMode('app');
            setActiveScreen('code');
          }}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-950 border border-indigo-500/30 hover:border-indigo-500 text-xs font-bold text-indigo-300 flex items-center justify-between transition-all group"
        >
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span>Open Android Studio Project Inspector</span>
          </div>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md">
            View / ZIP
          </span>
        </button>
      </div>
    </div>
  );
};

// Sub-components for simulated Android Apps
function renderSimulatedAppContent(app: SimulatedBackgroundApp) {
  switch (app) {
    case 'gallery':
      return (
        <div className="p-4 flex-1 flex flex-col bg-neutral-950 text-white overflow-y-auto">
          <div className="text-sm font-bold mb-3 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-pink-400" />
            <span>Photos & Memories</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              'from-rose-500 to-amber-500',
              'from-sky-500 to-indigo-500',
              'from-emerald-500 to-teal-500',
              'from-purple-500 to-pink-500',
              'from-amber-400 to-orange-500',
              'from-cyan-500 to-blue-600',
              'from-fuchsia-500 to-rose-600',
              'from-indigo-600 to-violet-800',
              'from-emerald-600 to-green-700',
            ].map((grad, i) => (
              <div
                key={i}
                className={`h-24 rounded-xl bg-gradient-to-br ${grad} opacity-80 shadow-md flex items-end p-2 text-[9px] font-semibold`}
              >
                Shot #{i + 1}
              </div>
            ))}
          </div>
        </div>
      );

    case 'notes':
      return (
        <div className="p-4 flex-1 flex flex-col bg-neutral-900 text-neutral-100 overflow-y-auto">
          <div className="text-xs font-mono text-neutral-500 mb-1">NOTES / DRAFT</div>
          <h2 className="text-lg font-bold text-white mb-2">Trip to Kyoto Itinerary 🌸</h2>
          <p className="text-xs text-neutral-300 leading-relaxed space-y-2">
            <div>1. Visit Fushimi Inari Shrine early morning before crowds.</div>
            <div>2. Pick up an authentic brass wind chime charm from Gion shop.</div>
            <div>3. Traditional matcha tea ceremony near Arashiyama bamboo grove.</div>
            <div>4. Evening stroll along Kamo River with paper lanterns.</div>
          </p>
          <div className="mt-6 p-3 rounded-xl bg-neutral-950/60 border border-white/5 text-[11px] text-neutral-400">
            Notice how your screen charm hangs peacefully over your active notes without blocking your text.
          </div>
        </div>
      );

    case 'browser':
      return (
        <div className="flex-1 flex flex-col bg-neutral-950 text-neutral-100 overflow-y-auto">
          <div className="p-3 bg-neutral-900 border-b border-white/10 flex items-center gap-2">
            <div className="flex-1 bg-neutral-950 px-3 py-1.5 rounded-full text-[11px] text-neutral-400 font-mono truncate">
              https://science.org/physics/pendulum-dynamics
            </div>
          </div>
          <div className="p-4 space-y-3">
            <h1 className="text-base font-bold text-white">Harmonic Oscillators in Everyday Mobile Interfaces</h1>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Damped pendulums represent one of the most natural tactile feedback mechanisms in user experience design. When combined with device MEMS accelerometers, virtual charms recreate tangible reality.
            </p>
            <div className="h-32 rounded-xl bg-gradient-to-r from-blue-900/40 to-indigo-950/60 border border-indigo-500/20 p-3 flex flex-col justify-center">
              <div className="text-xs font-bold text-indigo-300">RK4 / Semi-Implicit Euler Numerical Integration</div>
              <div className="text-[10px] text-neutral-400 mt-1">
                Zero NaN protection, sleep state when energy &lt; ε.
              </div>
            </div>
          </div>
        </div>
      );

    default:
      // Home Launcher
      return (
        <div className="p-6 flex-1 flex flex-col justify-between bg-gradient-to-b from-indigo-950/40 via-neutral-950 to-neutral-950 text-white">
          {/* Big Clock Widget */}
          <div className="pt-6 text-center space-y-1">
            <div className="text-4xl font-extrabold tracking-tight font-mono">09:41</div>
            <div className="text-xs text-neutral-400">Tuesday, September 15</div>
          </div>

          {/* App Icons Grid */}
          <div className="grid grid-cols-4 gap-4 py-8">
            {[
              { name: 'Phone', bg: 'bg-emerald-500', icon: '📞' },
              { name: 'Messages', bg: 'bg-blue-500', icon: '💬' },
              { name: 'Chrome', bg: 'bg-amber-500', icon: '🌐' },
              { name: 'Camera', bg: 'bg-rose-500', icon: '📷' },
              { name: 'Music', bg: 'bg-purple-500', icon: '🎵' },
              { name: 'Photos', bg: 'bg-pink-500', icon: '🖼️' },
              { name: 'Maps', bg: 'bg-teal-500', icon: '🗺️' },
              { name: 'Dangle', bg: 'bg-indigo-600', icon: '🧿' },
            ].map((app) => (
              <div key={app.name} className="flex flex-col items-center gap-1">
                <div
                  className={`w-12 h-12 rounded-2xl ${app.bg} flex items-center justify-center text-xl shadow-md`}
                >
                  {app.icon}
                </div>
                <span className="text-[10px] text-neutral-300 font-medium">{app.name}</span>
              </div>
            ))}
          </div>

          {/* Search Bar at bottom */}
          <div className="w-full py-2.5 px-4 rounded-full bg-neutral-900/90 border border-white/10 text-xs text-neutral-400 flex items-center justify-between">
            <span>Search apps & web...</span>
            <span className="text-xs">🎙️</span>
          </div>
        </div>
      );
  }
}
