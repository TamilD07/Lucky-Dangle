import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  Copy,
  X,
  Layers,
  Sparkles,
  Terminal,
  Globe,
  FolderArchive,
  ShieldCheck,
  ExternalLink,
  Check
} from 'lucide-react';
import JSZip from 'jszip';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { ANDROID_PROJECT_FILES } from '../data/androidFiles';
import { GRADLE_WRAPPER_JAR_BASE64 } from '../data/androidWrapperJarBase64';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl?: string;
  initialTab?: 'pwa' | 'native';
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  appUrl,
  initialTab = 'native',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'pwa' | 'native'>(initialTab);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipDownloaded, setZipDownloaded] = useState(false);

  if (!isOpen) return null;

  const targetUrl = appUrl || window.location.href;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadAndroidZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      for (const file of ANDROID_PROJECT_FILES) {
        zip.file(file.path, file.content);
      }

      // Add binary Gradle wrapper jar
      zip.file('gradle/wrapper/gradle-wrapper.jar', GRADLE_WRAPPER_JAR_BASE64, { base64: true });

      zip.file(
        'README.md',
        `# Lucky Dangle - Native Android System Overlay Application

This native Android application creates a true system-level floating charm overlay that hangs from the top bezel of your device, floating over the Home Screen and all other applications (WhatsApp, YouTube, Instagram, games, etc.).

## How It Works
- Uses Android \`WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY\` with \`SYSTEM_ALERT_WINDOW\` permission.
- Runs as a Foreground Service (\`OverlayService.kt\`) with zero network access and 100% offline security.
- Responds to real device accelerometer & gyroscope (\`MotionSensorManager.kt\`) with realistic pendulum physics (\`PendulumPhysicsEngine.kt\`).

## Quick Build Instructions
1. Open this folder in Android Studio (or run \`./gradlew assembleDebug\`).
2. Install the resulting APK on your phone.
3. Tap "Enable Overlay" and grant "Display over other apps".
4. The charm will now hang over your Home Screen and all apps!
`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'LuckyDangle-Android-Native-Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setZipDownloaded(true);
      setTimeout(() => setZipDownloaded(false), 3000);
    } catch (err) {
      console.error('Failed to generate Android ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div
        id="install-modal-content"
        className="relative w-full max-w-lg bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Install on Mobile</h3>
              <p className="text-[11px] text-neutral-400">Get Lucky Dangle on your Android phone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-white/10 bg-neutral-950/40 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'pwa'
                ? 'bg-neutral-800 text-white shadow-sm border border-white/10'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Mobile Install (WebAPK)</span>
          </button>
          <button
            onClick={() => setActiveTab('native')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'native'
                ? 'bg-neutral-800 text-white shadow-sm border border-white/10'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Native Android APK (Overlay)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-neutral-300">
          {activeTab === 'pwa' ? (
            <div className="space-y-4">
              {/* Status Banner */}
              {isInstalled ? (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Lucky Dangle is already installed as a standalone app on this device!</span>
                </div>
              ) : isInstallable ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-300 font-semibold">
                    <Sparkles className="w-4 h-4" />
                    <span>Direct One-Tap Install Ready!</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Tap the button below to install Lucky Dangle onto your phone. Android will generate an official
                    standalone WebAPK icon in your app drawer.
                  </p>
                  <button
                    onClick={install}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-[0.99]"
                  >
                    <Download className="w-4 h-4" />
                    Install App on this Device
                  </button>
                </div>
              ) : null}

              {/* Step by step for mobile browsers */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                  How to Install on Any Android Mobile Phone
                </span>
                <ol className="space-y-2 text-[11px] text-neutral-300">
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-neutral-800 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      Open this app link in <strong>Chrome</strong> or <strong>Samsung Internet</strong> on your Android
                      mobile phone.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-neutral-800 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      Tap the <strong>three dots menu (⋮)</strong> at the top right corner of Chrome.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-neutral-800 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <span>
                      Select <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-neutral-800 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      4
                    </span>
                    <span>
                      Android automatically generates and registers an APK in your launcher with standalone full-screen
                      physics, 120Hz gestures, and offline support!
                    </span>
                  </li>
                </ol>
              </div>

              {/* Quick Share / Open URL */}
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Mobile Direct URL
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2 rounded-lg bg-neutral-900 border border-white/5 font-mono text-[11px] text-neutral-300 break-all select-all">
                  {targetUrl}
                </div>
              </div>

              {isIOS && (
                <div className="p-3 rounded-xl bg-neutral-800/60 border border-white/5 text-[11px] text-neutral-400">
                  <strong className="text-neutral-200">On iPhone / iPad:</strong> Tap the Safari Share icon (square
                  with arrow pointing up), then scroll down and tap <em>&quot;Add to Home Screen&quot;</em>.
                </div>
              )}
            </div>
          ) : (
            /* Native Android APK Tab */
            <div className="space-y-4">
              {/* Core explanation callout */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-neutral-900 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <Layers className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>How Homescreen & All-Apps Overlay Works</span>
                </div>
                <p className="text-[11px] text-neutral-200 leading-relaxed">
                  <strong>Why can it only hang in the website right now?</strong> Web browsers (Chrome, Safari) run in a sandboxed security container and are physically blocked by mobile OS rules from drawing on top of other apps or your phone launcher.
                </p>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  To float over your <strong>Home Screen, WhatsApp, Instagram, YouTube, and Games</strong>, you need the <strong>Native Android System Overlay APK</strong>. It uses Android&apos;s special <code className="text-amber-300 font-mono">SYSTEM_ALERT_WINDOW</code> permission to hang from your phone&apos;s top bezel everywhere!
                </p>
              </div>

              {/* Direct Instant ZIP Download */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderArchive className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white text-xs">Download Android Studio Project</span>
                  </div>
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-semibold">
                    Complete Source Included
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Download the complete Kotlin + Jetpack Compose Android source code package with all charm vector assets, physics engines, and overlay background services.
                </p>
                <button
                  onClick={handleDownloadAndroidZip}
                  disabled={isZipping}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-[0.99] cursor-pointer disabled:opacity-50"
                >
                  {isZipping ? (
                    <span>Packaging Android Project ZIP...</span>
                  ) : zipDownloaded ? (
                    <>
                      <Check className="w-4 h-4 text-neutral-950" />
                      <span>Downloaded Successfully!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Android Project (.ZIP)</span>
                    </>
                  )}
                </button>
              </div>

              {/* 3 Step Activation Guide */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-white/10 space-y-3">
                <span className="font-bold text-white text-xs block">
                  3 Steps to Floating Overlay on Your Phone
                </span>
                <div className="space-y-2.5 text-[11px]">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <strong className="text-neutral-200">Build or Export APK:</strong> Open the downloaded Android folder in <em>Android Studio</em> and click <strong>Run</strong> (or export to GitHub and grab the APK from the automated GitHub Actions workflow).
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <strong className="text-neutral-200">Open App &amp; Grant Overlay:</strong> On your phone, open <em>Lucky Dangle</em>. It will prompt you for <strong>&quot;Display over other apps&quot;</strong> (Appear on top). Toggle it to <strong>Allowed</strong>.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <strong className="text-neutral-200">Go to Home Screen:</strong> Press your phone&apos;s Home button or open WhatsApp/Instagram. The charm hangs right from your screen bezel, swinging with your phone&apos;s real hardware motion sensors!
                    </div>
                  </div>
                </div>
              </div>

              {/* Method A: GitHub Actions APK */}
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center">
                      A
                    </span>
                    Automated APK via GitHub Actions (No local install needed)
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    Pre-Configured
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  We pre-configured <code className="text-neutral-200 font-mono">.github/workflows/build-apk.yml</code>. Export this project to GitHub from the top AI Studio menu, and GitHub Actions automatically compiles and provides the signed <code className="text-emerald-400 font-mono">app-debug.apk</code> to download directly in the Actions tab.
                </p>
              </div>

              {/* Method B: Local Gradle CLI */}
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-white/10 space-y-2">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center">
                    B
                  </span>
                  Command Line Build
                </span>
                <p className="text-[11px] text-neutral-400">
                  Unzip the downloaded project and run inside the directory:
                </p>
                <div className="p-2.5 rounded-lg bg-black border border-white/10 font-mono text-[11px] text-emerald-400 flex items-center justify-between">
                  <span>./gradlew assembleDebug</span>
                  <Terminal className="w-3.5 h-3.5 text-neutral-500" />
                </div>
                <p className="text-[10px] text-neutral-500">
                  APK Output: <code className="text-neutral-400 font-mono">app/build/outputs/apk/debug/app-debug.apk</code>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-neutral-950 flex items-center justify-between">
          <span className="text-[10px] text-neutral-400">Lucky Dangle Mobile Edition</span>
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
