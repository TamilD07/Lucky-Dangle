import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Compass, Sliders } from 'lucide-react';
import { CharmItem, PhysicsConfig, AppearanceConfig } from '../../types';
import { DangleCanvas } from '../DangleCanvas';

interface OnboardingViewProps {
  charm: CharmItem;
  physics: PhysicsConfig;
  appearance: AppearanceConfig;
  onComplete: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  charm,
  physics,
  appearance,
  onComplete,
}) => {
  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100 overflow-y-auto">
      {/* Top interactive preview area */}
      <div className="relative w-full h-64 bg-gradient-to-b from-neutral-900 to-neutral-950 border-b border-white/5 flex flex-col items-center justify-center overflow-hidden">
        {/* Soft background radial ambient light */}
        <div className="absolute w-56 h-56 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

        {/* Live Swinging Charm Canvas in header */}
        <div className="relative w-full h-full">
          <DangleCanvas
            charm={charm}
            physics={physics}
            appearance={appearance}
            horizontalPercent={0.5}
            containerWidth={360}
            containerHeight={256}
            interactive={true}
          />
        </div>

        <div className="absolute bottom-2 text-[11px] font-medium text-neutral-400 bg-neutral-900/80 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-sm pointer-events-none">
          Drag or tap the charm above to test physics
        </div>
      </div>

      {/* Content body */}
      <div className="flex-1 p-6 flex flex-col justify-between max-w-md mx-auto w-full">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to Android Screen Dangle</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
            Turn your screen into a tiny hanging world.
          </h1>

          <p className="text-sm text-neutral-400 leading-relaxed mb-6">
            A small, elegant virtual charm hanging from your top screen bezel. Reacts naturally to your phone’s movement, gravity, and touch with real-time pendulum physics.
          </p>

          {/* 4 Steps */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-900/60 border border-white/5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                1
              </div>
              <div>
                <div className="text-xs font-semibold text-neutral-200">Choose your charm</div>
                <div className="text-[11px] text-neutral-400">Select an Evil Eye, Lucky Coin, Origami Crane, Cat, or create your own custom emoji & photo charm.</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-900/60 border border-white/5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                2
              </div>
              <div>
                <div className="text-xs font-semibold text-neutral-200">Customize physics & appearance</div>
                <div className="text-[11px] text-neutral-400">Fine-tune swing damping, chain thickness, gravity, and position away from your selfie camera.</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-900/60 border border-white/5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                3
              </div>
              <div>
                <div className="text-xs font-semibold text-neutral-200">Enable Screen Dangle overlay</div>
                <div className="text-[11px] text-neutral-400">Grant overlay permission to let your charm hang above your home screen, browser, and favorite apps.</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 text-xs">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>100% offline, zero battery drain when idle, no screen recording or data collection.</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-6 flex items-center gap-3">
          <button
            id="onboarding-skip-btn"
            onClick={onComplete}
            className="flex-1 py-3 px-4 rounded-xl border border-white/10 hover:bg-neutral-900 text-sm font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            Skip
          </button>
          <button
            id="onboarding-get-started-btn"
            onClick={onComplete}
            className="flex-[2] py-3 px-5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
