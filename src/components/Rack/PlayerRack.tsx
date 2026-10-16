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
      <div className="bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl border border-amber-400/50 shadow-lg">
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
                className={`relative w-11 sm:w-12 h-12 sm:h-14 rounded-xl flex flex-col items-center justify-between p-1 select-none transition-all duration-150 active:scale-95 ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-400 to-orange-500 text-slate-950 shadow-xl ring-4 ring-white -translate-y-2 scale-105'
                    : 'bg-gradient-to-b from-orange-400 to-amber-500 text-white hover:from-orange-300 hover:to-amber-400 shadow-md hover:-translate-y-0.5'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {/* Arabic Letter */}
                <span className="font-arabic font-extrabold text-xl sm:text-2xl leading-none text-slate-950 mt-0.5">
                  {tile.letter}
                </span>

                {/* Point Value (Scrabble / WWF Style) */}
                <div className="w-full flex justify-end px-0.5">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-900 leading-none">
                    {tile.points}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Empty Rack Fillers if less than 7 tiles */}
          {Array.from({ length: Math.max(0, 7 - rack.length) }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="w-11 sm:w-12 h-12 sm:h-14 rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/40 flex items-center justify-center"
            >
              <span className="text-slate-600 text-xs">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
