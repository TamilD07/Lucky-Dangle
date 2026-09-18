import React from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  WifiOff,
  EyeOff,
  Cpu,
  FolderLock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import { DangleSettings } from '../../types';

interface PrivacyViewProps {
  settings: DangleSettings;
  onUpdateSettings: (updater: (prev: DangleSettings) => DangleSettings) => void;
  onBack: () => void;
}

export const PrivacyView: React.FC<PrivacyViewProps> = ({
  settings,
  onUpdateSettings,
  onBack,
}) => {
  const handleTogglePermission = () => {
    onUpdateSettings((prev) => ({
      ...prev,
      hasOverlayPermission: !prev.hasOverlayPermission,
      // If revoked, overlay turns off automatically
      isEnabled: !prev.hasOverlayPermission ? prev.isEnabled : false,
    }));
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between sticky top-0 bg-neutral-950/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <button
            id="privacy-back-btn"
            onClick={onBack}
            className="p-2 -ml-2 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-white">Privacy & Security</h2>
            <p className="text-[11px] text-neutral-400">Zero data collection architecture</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-5 max-w-lg mx-auto w-full">
        {/* Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-neutral-900 border border-emerald-500/20 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Your Privacy Matters</h3>
            <p className="text-xs text-neutral-300 leading-relaxed mt-1">
              Screen Dangle is built with strict privacy-first engineering. It requires zero accounts, has no servers, and runs 100% locally on your phone.
            </p>
          </div>
        </div>

        {/* Permission Card */}
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">SYSTEM_ALERT_WINDOW</div>
                <div className="text-[10px] text-neutral-400">Display over other apps</div>
              </div>
            </div>

            <div
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 ${
                settings.hasOverlayPermission
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              {settings.hasOverlayPermission ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Granted</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Not Granted</span>
                </>
              )}
            </div>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950 p-3 rounded-xl border border-white/5">
            &ldquo;Screen Dangle needs permission to display your selected charm above other apps. It does not read, record, or control the content of other apps.&rdquo;
          </p>

          <button
            onClick={handleTogglePermission}
            className="w-full py-2.5 rounded-xl border border-white/10 hover:bg-neutral-800 text-xs font-semibold text-neutral-200 transition-colors"
          >
            {settings.hasOverlayPermission ? 'Simulate Revoking Permission' : 'Grant Overlay Permission'}
          </button>
        </div>

        {/* Strict Privacy Commitments */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block px-1">
            Privacy Guarantees
          </label>

          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-neutral-900/40 border border-white/5 flex items-start gap-3">
              <WifiOff className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-white">100% Offline by Design</div>
                <div className="text-[11px] text-neutral-400">
                  The Android app omits the INTERNET permission entirely in AndroidManifest.xml. Zero network calls can be made.
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/40 border border-white/5 flex items-start gap-3">
              <EyeOff className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-white">Zero Screen Recording or Inspection</div>
                <div className="text-[11px] text-neutral-400">
                  Does not use MediaProjection, AccessibilityService, or screen capture. The overlay view only draws its own charm canvas.
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/40 border border-white/5 flex items-start gap-3">
              <FolderLock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-white">Local Photos & Storage Access Framework</div>
                <div className="text-[11px] text-neutral-400">
                  Custom image charms are selected through Android Photo Picker without requesting broad storage permissions. Decoded locally into app-internal memory.
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/40 border border-white/5 flex items-start gap-3">
              <Cpu className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-white">Local Sensor Processing & Deep Sleep</div>
                <div className="text-[11px] text-neutral-400">
                  Accelerometer data feeds directly into the pendulum differential equation. When movement stops, sensor callbacks and physics unregister immediately.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-neutral-900/20 border border-white/5 text-[11px] text-neutral-500 flex items-center justify-between">
          <span>Target SDK: 35 (Android 15) • Min SDK: 26 (Android 8.0)</span>
          <span className="font-mono">v1.0.0</span>
        </div>
      </div>
    </div>
  );
};
