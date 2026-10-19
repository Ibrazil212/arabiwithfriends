import React from 'react';
import { Bot, User, BookOpen, RotateCcw, HelpCircle, LogOut, Sparkles } from 'lucide-react';
import { GameState, UserAccount } from '../../types/game';
import { countFilledBoardCells, GRID_FILL_TARGET_CELLS, TOTAL_BOARD_CELLS } from '../../services/gameEngine';

interface GameHeaderProps {
  gameState: GameState;
  currentUser: UserAccount | null;
  onOpenDictionary: () => void;
  onOpenRules: () => void;
  onNewGame: () => void;
  onLogout: () => void;
}

export function GameHeader({
  gameState,
  currentUser,
  onOpenDictionary,
  onOpenRules,
  onNewGame,
  onLogout,
}: GameHeaderProps) {
  const isPlayerTurn = gameState.turn === 'player';
  const filledCount = countFilledBoardCells(gameState.board);
  const fillPercent = Math.round((filledCount / TOTAL_BOARD_CELLS) * 100);
  const targetProgress = Math.min(100, Math.round((filledCount / GRID_FILL_TARGET_CELLS) * 100));

  return (
    <header className="w-full max-w-md mx-auto pt-3 pb-2 px-3">
      {/* Top Utility Nav */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-lg bg-teal-600/90 text-white flex items-center justify-center font-bold text-xs shadow-sm font-arabic">
            ض
          </div>
          <span className="text-xs font-extrabold text-slate-900 tracking-tight">
            Arabic With Friends
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenRules}
            title="How to Play & Rules"
            className="p-1.5 bg-white/80 hover:bg-white text-slate-700 rounded-lg text-xs font-semibold shadow-sm border border-slate-200/60 transition active:scale-95 flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Rules</span>
          </button>

          <button
            onClick={onOpenDictionary}
            title="Search Arabic Dictionary"
            className="p-1.5 bg-white/80 hover:bg-white text-teal-800 rounded-lg text-xs font-semibold shadow-sm border border-slate-200/60 transition active:scale-95 flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline text-[11px]">Dictionary</span>
          </button>

          <button
            onClick={onNewGame}
            title="Start New Game"
            className="p-1.5 bg-white/80 hover:bg-white text-amber-800 rounded-lg text-xs font-semibold shadow-sm border border-slate-200/60 transition active:scale-95 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline text-[11px]">Restart</span>
          </button>

          <button
            onClick={onLogout}
            title="Sign Out"
            className="p-1.5 bg-white/80 hover:bg-white text-slate-500 hover:text-rose-600 rounded-lg text-xs transition active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Players & Scores Banner (Matches PDF Layout) */}
      <div className="grid grid-cols-2 gap-3 items-center">
        {/* Player 1 (You) */}
        <div
          className={`relative p-2.5 rounded-2xl transition-all duration-300 ${
            isPlayerTurn
              ? 'bg-slate-900 text-white shadow-lg ring-2 ring-teal-400 scale-[1.02]'
              : 'bg-slate-900/80 text-white/90'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
              <User className="w-5 h-5 text-slate-950" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold truncate">
                  {currentUser?.name || 'Player 1'}
                </span>
                {isPlayerTurn && (
                  <span className="inline-block w-2 h-2 rounded-full bg-teal-400 animate-ping shrink-0" />
                )}
              </div>
              <div className="text-[11px] text-slate-300">
                Points: <span className="font-extrabold text-sm text-teal-300 font-mono">{gameState.playerScore}</span>
              </div>
            </div>
          </div>
          {isPlayerTurn && (
            <div className="mt-1 text-[10px] text-center font-semibold text-teal-300 bg-teal-950/60 py-0.5 rounded-md">
              YOUR TURN
            </div>
          )}
        </div>

        {/* Player 2 (Computer Opponent) */}
        <div
          className={`relative p-2.5 rounded-2xl transition-all duration-300 ${
            !isPlayerTurn
              ? 'bg-slate-900 text-white shadow-lg ring-2 ring-amber-400 scale-[1.02]'
              : 'bg-slate-900/80 text-white/90'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
              <Bot className="w-5 h-5 text-slate-950" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold truncate">Computer AI</span>
                {!isPlayerTurn && (
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                )}
              </div>
              <div className="text-[11px] text-slate-300">
                Points: <span className="font-extrabold text-sm text-amber-300 font-mono">{gameState.computerScore}</span>
              </div>
            </div>
          </div>
          {!isPlayerTurn && (
            <div className="mt-1 text-[10px] text-center font-semibold text-amber-300 bg-amber-950/60 py-0.5 rounded-md flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 animate-spin" />
              <span>THINKING...</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid Fill Target Progress (Target: 80% / 65 cells) */}
      <div className="mt-2 bg-white/95 rounded-2xl px-3 py-2 border border-white shadow-md">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm animate-pulse"></span>
            <span className="font-bold text-slate-800">Grid Target (80%)</span>
          </div>
          <span className="text-emerald-700 font-mono font-bold text-xs">
            {filledCount} / {GRID_FILL_TARGET_CELLS} cells ({fillPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden p-0.5">
          <div
            className="bg-gradient-to-r from-teal-500 via-emerald-400 to-amber-400 h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${targetProgress}%` }}
          />
        </div>
      </div>
    </header>
  );
}
