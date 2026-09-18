import React from 'react';
import { ShieldCheck, Lock, ExternalLink, X } from 'lucide-react';

interface PermissionDialogProps {
  isOpen: boolean;
  onGrant: () => void;
  onClose: () => void;
}

export const PermissionDialog: React.FC<PermissionDialogProps> = ({
  isOpen,
  onGrant,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-white/10 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center space-y-2 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <Lock className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-white">
            Overlay Permission Required
          </h3>

          <p className="text-xs text-neutral-300 leading-relaxed">
            Screen Dangle needs permission to display your selected charm above other apps. It does not read, record, or control the content of other apps.
          </p>
        </div>

        {/* Android system illustration */}
        <div className="p-3.5 rounded-2xl bg-neutral-950 border border-white/5 space-y-2 text-xs">
          <div className="flex items-center justify-between text-neutral-400 font-semibold">
            <span>Display over other apps</span>
            <span className="text-indigo-400 font-mono">Allowed</span>
          </div>
          <div className="text-[11px] text-neutral-500 leading-normal">
            This opens Android Settings. Find <span className="text-neutral-300 font-medium">Screen Dangle</span> and switch the toggle to <span className="text-emerald-400 font-medium">Allow</span>.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            Not Now
          </button>
          <button
            onClick={onGrant}
            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <span>Grant Permission</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
