import React, { useState } from 'react';
import { X, ArrowLeftRight } from 'lucide-react';
import { Tile } from '../../types/game';

interface SwapTilesModalProps {
  isOpen: boolean;
  rack: Tile[];
  onClose: () => void;
  onConfirmSwap: (selectedTileIds: string[]) => void;
}

export function SwapTilesModal({ isOpen, rack, onClose, onConfirmSwap }: SwapTilesModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSwap = () => {
    if (selectedIds.length === 0) return;
    onConfirmSwap(selectedIds);
    setSelectedIds([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm bg-slate-900 text-white rounded-3xl p-6 border border-sky-500/40 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sky-400 font-bold">
            <ArrowLeftRight className="w-5 h-5" />
            <h3 className="text-lg text-white">Swap Arabic Tiles</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Select which tiles you want to return to the bag to draw new replacements. (Swapping uses your turn).
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 py-2">
          {rack.map((tile) => {
            const isSelected = selectedIds.includes(tile.id);
            return (
              <button
                key={tile.id}
                type="button"
                onClick={() => toggleSelect(tile.id)}
                className={`w-11 h-12 rounded-xl flex flex-col items-center justify-between p-1 select-none transition ${
                  isSelected
                    ? 'bg-gradient-to-b from-sky-400 to-sky-600 text-white ring-4 ring-white scale-105 shadow-lg'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <span className="font-arabic font-extrabold text-xl leading-none mt-0.5">
                  {tile.letter}
                </span>
                <span className="text-[10px] font-bold text-slate-300">{tile.points}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={selectedIds.length === 0}
          onClick={handleSwap}
          className="w-full py-3 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-bold rounded-xl active:scale-95 transition"
        >
          Swap Selected ({selectedIds.length})
        </button>
      </div>
    </div>
  );
}
