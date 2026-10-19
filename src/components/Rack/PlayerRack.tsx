import React from 'react';
import { Tile } from '../../types/game';

interface PlayerRackProps {
  rack: Tile[];
  selectedTileId: string | null;
  onSelectTile: (tile: Tile) => void;
  disabled?: boolean;
}

export function PlayerRack({
  rack,
  selectedTileId,
  onSelectTile,
  disabled = false,
}: PlayerRackProps) {
  return (
    <div className="w-full max-w-md mx-auto px-3 py-1.5">
      <div className="bg-white p-2 rounded-2xl border border-white shadow-xl">
        {/* Tile Slots */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
          {rack.map((tile) => {
            const isSelected = selectedTileId === tile.id;

            return (
              <button
                key={tile.id}
                type="button"
                disabled={disabled}
                onClick={() => onSelectTile(tile)}
                className={`relative w-12 sm:w-14 h-14 sm:h-16 rounded-xl flex items-center justify-center select-none transition-all duration-150 active:scale-95 ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 shadow-xl ring-4 ring-slate-900 -translate-y-2 scale-105'
                    : 'bg-gradient-to-b from-white to-amber-50 border-2 border-amber-400 text-slate-950 shadow-md hover:-translate-y-0.5'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {/* Arabic letter: large and centered */}
                <span className="font-arabic font-black text-3xl sm:text-4xl leading-[1.5] pt-0.5 text-slate-950">
                  {tile.letter}
                </span>

                {/* Points: small corner badge */}
                <span className="absolute bottom-0.5 right-1 text-[10px] sm:text-xs font-bold text-slate-600 leading-none">
                  {tile.points}
                </span>
              </button>
            );
          })}

          {/* Empty Rack Fillers if less than 7 tiles */}
          {Array.from({ length: Math.max(0, 7 - rack.length) }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="w-12 sm:w-14 h-14 sm:h-16 rounded-xl border-2 border-dashed border-slate-300 bg-slate-100 flex items-center justify-center"
            >
              <span className="text-slate-400 text-xs">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
