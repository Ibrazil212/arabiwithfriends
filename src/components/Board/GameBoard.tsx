import React from 'react';
import { BoardCell, PlacedTile, Tile } from '../../types/game';
import { Star } from 'lucide-react';

interface GameBoardProps {
  board: BoardCell[][];
  placedTiles: PlacedTile[];
  selectedRackTile: Tile | null;
  onCellClick: (row: number, col: number) => void;
  onRemoveTempTile: (row: number, col: number) => void;
  lastComputerMoveCells?: { row: number; col: number }[];
}

export function GameBoard({
  board,
  placedTiles,
  selectedRackTile,
  onCellClick,
  onRemoveTempTile,
  lastComputerMoveCells = [],
}: GameBoardProps) {
  const isComputerCell = (r: number, c: number) => {
    return lastComputerMoveCells.some((cell) => cell.row === r && cell.col === c);
  };

  const getTempPlacedTile = (r: number, c: number): Tile | null => {
    const pt = placedTiles.find((p) => p.row === r && p.col === c);
    return pt ? pt.tile : null;
  };

  return (
    <div className="w-full max-w-md mx-auto px-2 py-1 flex items-center justify-center">
      {/* Clean outer board container with subtle luxury bezel */}
      <div className="w-full aspect-square bg-white p-1.5 sm:p-2 rounded-2xl shadow-xl border border-white">
        <div className="w-full h-full grid grid-cols-9 grid-rows-9 gap-1 bg-slate-200 p-1 rounded-xl">
          {board.map((row, r) =>
            row.map((cell, c) => {
              const tempTile = getTempPlacedTile(r, c);
              const activeTile = tempTile || cell.tile;
              const isTemp = !!tempTile;
              const isCompLast = isComputerCell(r, c);
              const isCenter = cell.multiplierType === 'CENTER';

              // Clean cell styling based on multipliers
              let cellBg = 'bg-slate-50 hover:bg-white border border-slate-200 text-slate-500';

              if (isCenter) {
                cellBg = 'bg-gradient-to-br from-rose-400 to-amber-400 border border-rose-300 shadow-sm text-white';
              } else if (cell.multiplierType === '4X') {
                cellBg = 'bg-purple-100 border border-purple-300 text-purple-800';
              } else if (cell.multiplierType === '3X') {
                cellBg = 'bg-indigo-100 border border-indigo-300 text-indigo-800';
              } else if (cell.multiplierType === '2X') {
                cellBg = 'bg-sky-100 border border-sky-300 text-sky-800';
              }

              // Interactive highlight if user has a rack tile selected
              const isTargetable = selectedRackTile && !activeTile;

              return (
                <button
                  key={`cell-${r}-${c}`}
                  id={`cell-${r}-${c}`}
                  type="button"
                  onClick={() => {
                    if (isTemp) {
                      onRemoveTempTile(r, c);
                    } else {
                      onCellClick(r, c);
                    }
                  }}
                  className={`relative w-full h-full rounded-md sm:rounded-lg flex flex-col items-center justify-center transition-all select-none p-0 overflow-hidden ${cellBg} ${
                    isTargetable ? 'ring-2 ring-amber-500 ring-offset-1 ring-offset-white cursor-pointer scale-[1.02] bg-amber-50 z-10' : ''
                  } ${isCompLast && !isTemp ? 'ring-2 ring-amber-500 ring-offset-1 ring-offset-white z-10' : ''}`}
                >
                  {/* Placed Tile Rendering */}
                  {activeTile ? (
                    <div
                      className={`relative w-full h-full flex items-center justify-center rounded-md sm:rounded-lg transition-transform ${
                        isTemp
                          ? 'bg-gradient-to-b from-amber-200 to-amber-400 text-slate-950 shadow-md ring-2 ring-amber-600 scale-[0.96]'
                          : isCompLast
                          ? 'bg-gradient-to-b from-amber-100 to-amber-300 text-slate-950 shadow-md border-2 border-amber-500'
                          : 'bg-gradient-to-b from-white to-amber-50 border-2 border-amber-400 text-slate-950 shadow-sm'
                      }`}
                    >
                      {/* Arabic letter: large, centered, never clipped */}
                      <span
                        className="font-bold text-2xl sm:text-3xl leading-[1.5] pt-0.5 text-slate-950"
                        style={{ fontFamily: "'Times New Roman', Amiri, serif" }}
                      >
                        {activeTile.letter}
                      </span>

                      {/* Points: small badge in the corner, out of the letter's way */}
                      <span className="absolute bottom-0 right-0.5 text-[9px] sm:text-[10px] font-black text-slate-600 leading-none">
                        {activeTile.points}
                      </span>

                    </div>
                  ) : (
                    /* Empty Cell Multiplier Badge / Center Label */
                    <div className="flex flex-col items-center justify-center text-center select-none">
                      {isCenter ? (
                        <div className="flex flex-col items-center text-white">
                          <Star className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-200 fill-amber-300" />
                          <span className="text-[6px] sm:text-[8px] font-black uppercase tracking-tighter text-amber-100">
                            START
                          </span>
                        </div>
                      ) : cell.multiplierType !== 'NONE' ? (
                        <div className="font-black text-[10px] sm:text-xs leading-none tracking-tight">
                          <span>{cell.multiplierValue}×</span>
                        </div>
                      ) : null}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
