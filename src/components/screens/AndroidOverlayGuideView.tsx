import React, { useState } from 'react';
import {
  Layers,
  Download,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  Terminal,
  ExternalLink,
  ChevronRight,
  FolderArchive,
  Check,
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES } from '../../data/androidFiles';
import { GRADLE_WRAPPER_JAR_BASE64 } from '../../data/androidWrapperJarBase64';

interface AndroidOverlayGuideViewProps {
  onBack?: () => void;
  onOpenInstallModal?: () => void;
}

export const AndroidOverlayGuideView: React.FC<AndroidOverlayGuideViewProps> = ({
  onBack,
  onOpenInstallModal,
}) => {
  const [isZipping, setIsZipping] = useState(false);
  const [zipDownloaded, setZipDownloaded] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState<'pixel' | 'samsung' | 'xiaomi'>('samsung');

  const handleDownloadAndroidZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      for (const file of ANDROID_PROJECT_FILES) {
        zip.file(file.path, file.content);
      }
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
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/15 via-neutral-900 to-neutral-950 border border-amber-500/25 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
          <Layers className="w-3.5 h-3.5" />
          <span>System-Level Floating Overlay Guide</span>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            How to Float the Charm Over Your Home Screen &amp; All Apps
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
            You noticed that in the browser preview, the charm hangs only inside the web page. Here is why that happens and how the included native Android application enables floating over your <strong>actual phone launcher, WhatsApp, Instagram, YouTube, and games</strong>.
          </p>
        </div>

        {/* Browser Sandbox vs. Native OS Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-neutral-950/80 border border-white/5 space-y-1.5">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>Web Browser Version (What You See Now)</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Browsers (Chrome/Safari) operate in a strict security sandbox. By OS security design, a website is strictly forbidden from drawing pixels over the Android system UI or outside its window.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Native Android APK (Included in this Project)</span>
            </div>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              Uses Android&apos;s <code className="text-amber-300 font-mono">TYPE_APPLICATION_OVERLAY</code> and <code className="text-amber-300 font-mono">SYSTEM_ALERT_WINDOW</code> to hang from your actual device top bezel over every single app with real hardware gyroscope physics!
            </p>
          </div>
        </div>
      </div>

      {/* 3 Step Action Plan */}
      <div className="p-6 rounded-3xl bg-neutral-900/50 border border-white/5 space-y-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          3 Steps to Get It Running on Your Phone
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-white/5 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                1
              </div>
              <h4 className="text-xs font-bold text-white">Get the Android APK</h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Download the complete Android project ZIP below to open in Android Studio, or export to GitHub to get the pre-compiled APK from GitHub Actions.
              </p>
            </div>
            <button
              onClick={handleDownloadAndroidZip}
              disabled={isZipping}
              className="w-full py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-semibold text-[11px] flex items-center justify-center gap-1.5 border border-white/10 transition cursor-pointer"
            >
              {isZipping ? (
                <span>Packaging ZIP...</span>
              ) : zipDownloaded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Android Project</span>
                </>
              )}
            </button>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-white/5 space-y-2">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
              2
            </div>
            <h4 className="text-xs font-bold text-white">Install on Device</h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Install the <code className="text-neutral-200">app-debug.apk</code> on your Android phone. When prompted by Android, allow <em>&quot;Install unknown apps&quot;</em> for this installation.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-white/5 space-y-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
              3
            </div>
            <h4 className="text-xs font-bold text-white">Allow &quot;Appear On Top&quot;</h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Launch Lucky Dangle on your phone and tap <strong>&quot;Enable Overlay&quot;</strong>. Android will open the system settings where you toggle <strong>Allow display over other apps</strong> to ON!
            </p>
          </div>
        </div>
      </div>

      {/* Device-specific Permission Guide */}
      <div className="p-6 rounded-3xl bg-neutral-900/50 border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">
            How to Grant &quot;Display Over Other Apps&quot; by Phone Brand
          </h3>
          <div className="flex gap-1 bg-neutral-950 p-1 rounded-xl border border-white/5">
            {[
              { key: 'samsung', label: 'Samsung One UI' },
              { key: 'pixel', label: 'Google Pixel' },
              { key: 'xiaomi', label: 'Xiaomi / Redmi' },
            ].map((b) => (
              <button
                key={b.key}
                onClick={() => setSelectedManufacturer(b.key as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  selectedManufacturer === b.key
                    ? 'bg-neutral-800 text-amber-300 font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-950 border border-white/5 text-xs text-neutral-300 space-y-2">
          {selectedManufacturer === 'samsung' && (
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-neutral-300">
              <li>Open <strong>Settings</strong> on your Samsung Galaxy.</li>
              <li>Tap <strong>Apps</strong>, then tap the <strong>three dots (⋮)</strong> in the top right corner.</li>
              <li>Select <strong>Special access</strong> &rarr; <strong>Appear on top</strong>.</li>
              <li>Find <strong>Lucky Dangle</strong> and toggle the switch to <strong>ON</strong>.</li>
              <li>Return to your Home Screen — the charm is now floating over your phone!</li>
            </ol>
          )}

          {selectedManufacturer === 'pixel' && (
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-neutral-300">
              <li>Open <strong>Settings</strong> &rarr; <strong>Apps</strong>.</li>
              <li>Scroll to the bottom and tap <strong>Special app access</strong>.</li>
              <li>Tap <strong>Display over other apps</strong>.</li>
              <li>Select <strong>Lucky Dangle</strong> and toggle <strong>Allow display over other apps</strong> to ON.</li>
              <li>Press Home: your charm sways gracefully from the top camera punch hole!</li>
            </ol>
          )}

          {selectedManufacturer === 'xiaomi' && (
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-neutral-300">
              <li>Open <strong>Settings</strong> &rarr; <strong>Apps</strong> &rarr; <strong>Manage Apps</strong>.</li>
              <li>Locate and tap <strong>Lucky Dangle</strong>.</li>
              <li>Tap <strong>Other permissions</strong> &rarr; <strong>Display pop-up windows while running in the background</strong> &rarr; select <strong>Always allow</strong>.</li>
              <li>Also enable <strong>Autostart</strong> for persistent hanging across app reboots.</li>
            </ol>
          )}
        </div>
      </div>

      {/* Build Methods Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Method A */}
        <div className="p-5 rounded-3xl bg-neutral-900/50 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center font-bold">
                A
              </span>
              GitHub Actions Automated Build
            </span>
            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold">
              Zero Tooling
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            The repository includes a ready-to-run GitHub Actions workflow (<code className="text-neutral-300 font-mono">.github/workflows/build-apk.yml</code>). Click <strong>Export to GitHub</strong> in the AI Studio top menu, and GitHub will automatically compile the APK. Download it from the <strong>Actions &rarr; Artifacts</strong> tab!
          </p>
        </div>

        {/* Method B */}
        <div className="p-5 rounded-3xl bg-neutral-900/50 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center font-bold">
                B
              </span>
              Android Studio / Gradle Build
            </span>
            <span className="text-[10px] bg-neutral-800 text-neutral-300 border border-white/10 px-2 py-0.5 rounded font-semibold">
              Local Dev
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Download the Android Project ZIP or clone the repository, open the <code className="text-neutral-300 font-mono">/android</code> directory in Android Studio, connect your phone, and press <strong>Run</strong> (or run <code className="text-emerald-400 font-mono">./gradlew assembleDebug</code>).
          </p>
        </div>
      </div>
    </div>
  );
};
