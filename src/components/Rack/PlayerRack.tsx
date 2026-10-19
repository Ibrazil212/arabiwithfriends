import React, { useEffect, useRef, useState } from 'react';
import { Tile } from '../../types/game';

interface PlayerRackProps {
  rack: Tile[];
  selectedTileId: string | null;
  onSelectTile: (tile: Tile) => void;
  onPlaceTile: (tile: Tile, row: number, col: number) => void;
  disabled?: boolean;
}

// Movement (in px) before a press becomes a drag instead of a tap.
const DRAG_THRESHOLD = 6;

// Times New Roman first (as requested); Amiri (already loaded in index.html) is the fallback
// on Android, where Times New Roman is not installed.
const TILE_FONT = "'Times New Roman', Amiri, serif";

export function PlayerRack({
  rack,
  selectedTileId,
  onSelectTile,
  onPlaceTile,
  disabled = false,
}: PlayerRackProps) {
  const [drag, setDrag] = useState<{ tile: Tile; x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const onPlaceRef = useRef(onPlaceTile);
  onPlaceRef.current = onPlaceTile;

  // Remove any window listeners if the rack unmounts mid-drag.
  useEffect(() => () => cleanupRef.current?.(), []);

  const handlePointerDown = (e: React.PointerEvent, tile: Tile) => {
    if (disabled || e.button > 0) return;
    suppressClick.current = false;

    const startX = e.clientX;
    const startY = e.clientY;
    let dragging = false;

    const cleanup = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      cleanupRef.current = null;
    };

    const onMove = (ev: PointerEvent) => {
      if (!dragging) {
        if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < DRAG_THRESHOLD) return;
        dragging = true;
      }
      setDrag({ tile, x: ev.clientX, y: ev.clientY });
    };

    const onUp = (ev: PointerEvent) => {
      cleanup();
      if (!dragging) return; // a plain tap: the onClick handler selects the tile
      suppressClick.current = true;
      setDrag(null);

      // Find the board cell under the finger (the ghost tile has pointer-events: none).
      const el = document.elementFromPoint(ev.clientX, ev.clientY) as HTMLElement | null;
      const cell = el?.closest<HTMLElement>('[id^="cell-"]');
      if (cell) {
        const [, row, col] = cell.id.split('-');
        onPlaceRef.current(tile, Number(row), Number(col));
      }
    };

    const onCancel = () => {
      cleanup();
      setDrag(null);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    cleanupRef.current = cleanup;
  };

  return (
    <div className="w-full max-w-md mx-auto px-3 py-1.5">
      <div className="bg-white p-2 rounded-2xl border border-white shadow-xl">
        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
          {rack.map((tile) => {
            const isSelected = selectedTileId === tile.id;

            return (
              <button
                key={tile.id}
                type="button"
                disabled={disabled}
                onPointerDown={(e) => handlePointerDown(e, tile)}
                onClick={() => {
                  if (suppressClick.current) {
                    suppressClick.current = false;
                    return;
                  }
                  onSelectTile(tile);
                }}
                style={{ touchAction: 'none', fontFamily: TILE_FONT }}
                className={`relative w-12 sm:w-14 h-14 sm:h-16 rounded-xl flex items-center justify-center select-none transition-all duration-150 ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 shadow-xl ring-4 ring-slate-900 -translate-y-2 scale-105'
                    : 'bg-gradient-to-b from-white to-amber-50 border-2 border-amber-400 text-slate-950 shadow-md hover:-translate-y-0.5'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'} ${
                  drag?.tile.id === tile.id ? 'opacity-30' : ''
                }`}
              >
                <span className="font-bold text-2xl sm:text-3xl leading-[1.4] pt-0.5 text-slate-950">
                  {tile.letter}
                </span>

                <span className="absolute bottom-0.5 right-1 text-[10px] sm:text-xs font-bold text-slate-600 leading-none">
                  {tile.points}
                </span>
              </button>
            );
          })}

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

      {/* Floating copy of the tile that follows the finger while dragging */}
      {drag && (
        <div
          className="fixed z-50 pointer-events-none w-14 h-16 rounded-xl bg-gradient-to-b from-amber-200 to-amber-400 border-2 border-amber-600 shadow-2xl flex items-center justify-center"
          style={{ left: drag.x, top: drag.y, transform: 'translate(-50%, -60%)', fontFamily: TILE_FONT }}
        >
          <span className="font-bold text-3xl leading-[1.4] pt-0.5 text-slate-950">{drag.tile.letter}</span>
          <span className="absolute bottom-0.5 right-1 text-xs font-bold text-slate-700 leading-none">
            {drag.tile.points}
          </span>
        </div>
      )}
    </div>
  );
}
