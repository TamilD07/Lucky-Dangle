import React, { useState } from 'react';
import {
  ArrowLeft,
  Download,
  Copy,
  Check,
  FileCode,
  FolderTree,
  ExternalLink,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES } from '../../data/androidFiles';

interface CodeExportModalProps {
  onBack: () => void;
}

export const CodeExportModal: React.FC<CodeExportModalProps> = ({ onBack }) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(7); // Default to PendulumPhysicsEngine.kt
  const [copied, setCopied] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const currentFile = ANDROID_PROJECT_FILES[selectedFileIndex];

  const handleCopy = () => {
    if (!currentFile) return;
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Add all project files into the zip archive
      for (const file of ANDROID_PROJECT_FILES) {
        zip.file(file.path, file.content);
      }

      // Add README.md
      zip.file(
        'README.md',
        `# Screen Dangle - Native Android Application

A production-ready Android application that displays a small customizable virtual charm hanging from the top edge of your screen with realistic pendulum & spring physics and device sensor reaction.

## How to Run in Android Studio
1. Open Android Studio (Hedgehog or newer recommended).
2. Select "Open" and choose this project folder.
3. Allow Gradle sync to complete (JDK 17 required).
4. Run on an Android device or emulator with API 26+ (Android 8.0 to Android 15).
5. Grant SYSTEM_ALERT_WINDOW permission when prompted to see the charm floating over apps!

## Features
- Hardware-accelerated Pendulum & Spring-damper physics engine
- Accelerometer motion sensor response with automatic sleep state to prevent battery drain
- WindowManager TYPE_APPLICATION_OVERLAY floating overlay
- DataStore preferences for 100% offline persistence
- Jetpack Compose Material 3 UI
- 0% data collection, zero network permissions.
`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ScreenDangle-Android-Studio-Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate zip', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-neutral-950/90 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Android Studio Project</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/30">
                Kotlin & Jetpack Compose
              </span>
            </h2>
            <p className="text-[11px] text-neutral-400">Pure native code ready to build & deploy</p>
          </div>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isZipping ? 'Packaging...' : 'Download ZIP'}</span>
        </button>
      </div>

      {/* Main Split View: Files Sidebar + Code Preview */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Files List */}
        <div className="w-full md:w-64 border-r border-white/5 bg-neutral-950/80 p-2 overflow-y-auto shrink-0 max-h-48 md:max-h-none">
          <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider px-2 py-1 mb-1">
            Project Structure
          </div>

          <div className="space-y-0.5">
            {ANDROID_PROJECT_FILES.map((file, idx) => {
              const isSelected = idx === selectedFileIndex;
              const fileName = file.path.split('/').pop();

              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFileIndex(idx)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 transition-colors truncate ${
                    isSelected
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
                  }`}
                  title={file.path}
                >
                  <FileCode className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  <span className="truncate">{fileName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Code Display */}
        <div className="flex-1 flex flex-col bg-neutral-900/40 overflow-hidden">
          {/* File bar */}
          <div className="p-2.5 px-4 bg-neutral-900/80 border-b border-white/5 flex items-center justify-between shrink-0">
            <span className="text-xs font-mono text-neutral-300 truncate">
              {currentFile?.path}
            </span>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors px-2 py-1 rounded bg-neutral-800"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Source Code Container */}
          <div className="flex-1 p-4 overflow-auto font-mono text-xs text-neutral-200 leading-relaxed selection:bg-indigo-500 selection:text-white">
            <pre className="whitespace-pre">{currentFile?.content}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
