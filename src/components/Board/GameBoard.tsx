import React from 'react';
import { BoardCell, PlacedTile, Tile } from '../../types/game';
import { Star, X } from 'lucide-react';

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
      <div className="w-full aspect-square bg-slate-900/90 p-1.5 sm:p-2 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md">
        <div className="w-full h-full grid grid-cols-9 grid-rows-9 gap-1 bg-slate-950/80 p-1 rounded-xl">
          {board.map((row, r) =>
            row.map((cell, c) => {
              const tempTile = getTempPlacedTile(r, c);
              const activeTile = tempTile || cell.tile;
              const isTemp = !!tempTile;
              const isCompLast = isComputerCell(r, c);
              const isCenter = cell.multiplierType === 'CENTER';

              // Clean cell styling based on multipliers
              let cellBg = 'bg-slate-800/80 hover:bg-slate-750 border border-slate-700/40 text-slate-400';

              if (isCenter) {
                cellBg = 'bg-gradient-to-br from-rose-500/90 to-amber-600/90 border border-rose-400/60 shadow-sm text-white';
              } else if (cell.multiplierType === '4X') {
                cellBg = 'bg-purple-900/70 border border-purple-500/40 hover:bg-purple-850 text-purple-200';
              } else if (cell.multiplierType === '3X') {
                cellBg = 'bg-indigo-900/70 border border-indigo-500/40 hover:bg-indigo-850 text-indigo-200';
              } else if (cell.multiplierType === '2X') {
                cellBg = 'bg-sky-900/70 border border-sky-500/40 hover:bg-sky-850 text-sky-200';
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
                    isTargetable ? 'ring-2 ring-amber-400/80 ring-offset-1 ring-offset-slate-900 cursor-pointer scale-[1.02] bg-slate-700/90 z-10' : ''
                  } ${isCompLast && !isTemp ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900 z-10' : ''}`}
                >
                  {/* Placed Tile Rendering */}
                  {activeTile ? (
                    <div
                      className={`w-full h-full flex flex-col items-center justify-between p-0.5 rounded-md sm:rounded-lg transition-transform ${
                        isTemp
                          ? 'bg-gradient-to-b from-amber-300 via-amber-400 to-orange-400 text-slate-950 shadow-md ring-2 ring-white scale-[0.96]'
                          : isCompLast
                          ? 'bg-gradient-to-b from-amber-100 via-amber-200 to-amber-300 text-slate-950 shadow-md border border-amber-400'
                          : 'bg-gradient-to-b from-[#fffaf0] via-[#fef3d6] to-[#fae6b8] border border-[#d8b368]/60 text-slate-950 shadow-sm'
                      }`}
                    >
                      {/* Arabic Letter (Centered, crisp & bold) */}
                      <span className="font-arabic font-black text-lg sm:text-2xl md:text-3xl leading-none text-slate-950 mt-0.5 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">
                        {activeTile.letter}
                      </span>

                      {/* Point Value (Bottom Right) */}
                      <div className="w-full flex items-center justify-between px-1 text-[8px] sm:text-[10px] font-black text-slate-700 leading-none">
                        {isTemp ? (
                          <span className="w-3 h-3 rounded-full bg-slate-950/10 flex items-center justify-center">
                            <X className="w-2.5 h-2.5 text-slate-950" />
                          </span>
                        ) : (
                          <span className="opacity-0">.</span>
                        )}
                        <span>{activeTile.points}</span>
                      </div>
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
                        <div className="font-black text-[9px] sm:text-[11px] leading-none tracking-tight">
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
