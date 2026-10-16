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
    <div className="w-full max-w-md mx-auto px-3 py-1.5 space-y-1.5">
      {/* Primary Action Buttons: Confirm, Dictionary, Clear (Matching PDF Page 3) */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          disabled={!isPlayerTurn || !canSubmit || isValidating}
          onClick={onConfirm}
          className="py-3 px-2 rounded-xl font-extrabold text-sm text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 shadow-md disabled:opacity-40 disabled:pointer-events-none transition flex items-center justify-center gap-1.5"
        >
          {isValidating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Checking...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Confirm</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onOpenDictionary}
          className="py-3 px-2 rounded-xl font-extrabold text-sm text-white bg-teal-600 hover:bg-teal-500 active:scale-95 shadow-md transition flex items-center justify-center gap-1.5"
        >
          <BookOpen className="w-4 h-4" />
          <span>Dictionary</span>
        </button>

        <button
          type="button"
          disabled={!canClear || isValidating}
          onClick={onClear}
          className="py-3 px-2 rounded-xl font-extrabold text-sm text-white bg-rose-600 hover:bg-rose-500 active:scale-95 shadow-md disabled:opacity-40 disabled:pointer-events-none transition flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Clear</span>
        </button>
      </div>

      {/* Secondary Controls: Shuffle, Swap, Pass */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          type="button"
          disabled={!isPlayerTurn}
          onClick={onShuffle}
          className="flex-1 py-2 px-2 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-slate-200 text-xs font-semibold border border-slate-700/60 shadow-sm transition active:scale-95 flex items-center justify-center gap-1 disabled:opacity-40"
        >
          <Shuffle className="w-3.5 h-3.5 text-amber-400" />
          <span>Shuffle</span>
        </button>

        <button
          type="button"
          disabled={!isPlayerTurn}
          onClick={onSwap}
          className="flex-1 py-2 px-2 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-slate-200 text-xs font-semibold border border-slate-700/60 shadow-sm transition active:scale-95 flex items-center justify-center gap-1 disabled:opacity-40"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-sky-400" />
          <span>Swap</span>
        </button>

        <button
          type="button"
          disabled={!isPlayerTurn}
          onClick={onPass}
          className="flex-1 py-2 px-2 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-slate-200 text-xs font-semibold border border-slate-700/60 shadow-sm transition active:scale-95 flex items-center justify-center gap-1 disabled:opacity-40"
        >
          <SkipForward className="w-3.5 h-3.5 text-rose-400" />
          <span>Pass</span>
        </button>
      </div>
    </div>
  );
}
