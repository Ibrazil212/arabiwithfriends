import React from 'react';
import { X, Star, HelpCircle, Sparkles, BookCheck } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 text-white rounded-3xl p-6 border border-teal-500/40 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-teal-400 font-bold">
            <HelpCircle className="w-5 h-5" />
            <h3 className="text-lg text-white">How to Play Arabic Solo</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs text-slate-300">
          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
              <span>1. Orange Center Starting Square</span>
            </div>
            <p>The first word placed on the 9×9 board <strong>must cover the center orange square</strong>.</p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-teal-300">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>2. Special Multiplier Squares</span>
            </div>
            <p>Place tiles on special squares to multiply your word score:</p>
            <div className="flex gap-2 mt-1">
              <span className="px-2 py-0.5 rounded bg-sky-700 font-bold text-[11px] text-white">2× Double</span>
              <span className="px-2 py-0.5 rounded bg-indigo-700 font-bold text-[11px] text-white">3× Triple</span>
              <span className="px-2 py-0.5 rounded bg-purple-700 font-bold text-[11px] text-white">4× Quadruple</span>
            </div>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-300">
              <BookCheck className="w-4 h-4 text-emerald-400" />
              <span>3. Arabic Words & Rules</span>
            </div>
            <p>Connect letters horizontally or vertically to form authentic Arabic words. Words must be at least 2 letters long. All newly formed perpendicular cross-words must also be valid Arabic words.</p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-1">
            <span className="font-bold text-slate-200">4. Controls</span>
            <p>• <strong>Tap Tile</strong> in your rack, then <strong>tap an empty board square</strong> to place it.</p>
            <p>• <strong>Tap placed tile</strong> on board to return it to rack.</p>
            <p>• Click <strong>Confirm</strong> to submit your move or <strong>Clear</strong> to recall all placed tiles.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl active:scale-95 transition"
        >
          Got It, Let’s Play!
        </button>
      </div>
    </div>
  );
}
