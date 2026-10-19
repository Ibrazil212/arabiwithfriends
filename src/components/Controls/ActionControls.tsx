import React from 'react';
import { Check, RotateCcw, Shuffle, ArrowLeftRight, SkipForward, BookOpen, Loader2 } from 'lucide-react';

interface ActionControlsProps {
  canSubmit: boolean;
  canClear: boolean;
  isPlayerTurn: boolean;
  isValidating?: boolean;
  onConfirm: () => void;
  onClear: () => void;
  onShuffle: () => void;
  onSwap: () => void;
  onPass: () => void;
  onOpenDictionary: () => void;
}

export function ActionControls({
  canSubmit,
  canClear,
  isPlayerTurn,
  isValidating = false,
  onConfirm,
  onClear,
  onShuffle,
  onSwap,
  onPass,
  onOpenDictionary,
}: ActionControlsProps) {
  return (
    <div className="w-full max-w-md mx-auto px-3 py-1.5 space-y-2">
      {/* Primary action: Confirm is the main call to action */}
      <button
        type="button"
        disabled={!isPlayerTurn || !canSubmit || isValidating}
        onClick={onConfirm}
        className="w-full py-3.5 rounded-2xl font-black text-base text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] shadow-lg disabled:opacity-40 disabled:pointer-events-none transition flex items-center justify-center gap-2"
      >
        {isValidating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Checking...</span>
          </>
        ) : (
          <>
            <Check className="w-5 h-5 stroke-[3]" />
            <span>Confirm</span>
          </>
        )}
      </button>

      {/* Secondary actions: quieter, same weight between them */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onOpenDictionary}
          className="py-2.5 px-2 rounded-xl font-bold text-sm text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm active:scale-95 transition flex items-center justify-center gap-1.5"
        >
          <BookOpen className="w-4 h-4 text-teal-600" />
          <span>Dictionary</span>
        </button>

        <button
          type="button"
          disabled={!canClear || isValidating}
          onClick={onClear}
          className="py-2.5 px-2 rounded-xl font-bold text-sm text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4 text-rose-600" />
          <span>Clear</span>
        </button>
      </div>

      {/* Game actions: icons sit above their labels, small and out of the way */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Shuffle', icon: Shuffle, color: 'text-amber-600', onClick: onShuffle },
          { label: 'Swap', icon: ArrowLeftRight, color: 'text-sky-600', onClick: onSwap },
          { label: 'Pass', icon: SkipForward, color: 'text-rose-600', onClick: onPass },
        ].map(({ label, icon: Icon, color, onClick }) => (
          <button
            key={label}
            type="button"
            disabled={!isPlayerTurn}
            onClick={onClick}
            className="py-2 rounded-xl bg-white/95 hover:bg-white text-slate-700 text-[11px] font-bold border border-white shadow-sm active:scale-95 transition flex flex-col items-center justify-center gap-0.5 disabled:opacity-40"
          >
            <Icon className={`w-4 h-4 ${color}`} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
