import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Bot, RotateCcw, Award, CheckCircle2, Grid } from 'lucide-react';
import { GameState } from '../../types/game';
import { countFilledBoardCells, GRID_FILL_TARGET_CELLS, TOTAL_BOARD_CELLS } from '../../services/gameEngine';

interface GameOverModalProps {
  gameState: GameState;
  opponentName: string;
  onPlayAgain: () => void;
}

export function GameOverModal({ gameState, opponentName, onPlayAgain }: GameOverModalProps) {
  const isPlayerWinner = gameState.winner === 'player';
  const isTie = gameState.winner === 'tie';
  const filledCells = gameState.filledCellsCount ?? countFilledBoardCells(gameState.board);
  const fillPercent = Math.round((filledCells / TOTAL_BOARD_CELLS) * 100);
  const isGridTargetMet = filledCells >= GRID_FILL_TARGET_CELLS;

  useEffect(() => {
    if (isPlayerWinner) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isPlayerWinner]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-sm bg-slate-900 text-white rounded-3xl p-6 border border-amber-400/50 shadow-2xl text-center space-y-4">
        {/* Badge Icon */}
        <div className="inline-flex p-4 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-400 text-slate-950 shadow-lg mx-auto">
          {isPlayerWinner ? (
            <Trophy className="w-10 h-10" />
          ) : isTie ? (
            <Award className="w-10 h-10" />
          ) : (
            <Bot className="w-10 h-10" />
          )}
        </div>

        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            {isPlayerWinner
              ? 'Congratulations! You Won!'
              : isTie
              ? 'It’s a Tie!'
              : `${opponentName} Won!`}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {isGridTargetMet
              ? '🎯 80% Grid Fill Target Achieved!'
              : isPlayerWinner
              ? 'Excellent Arabic word strategy!'
              : 'Great match! Play another round to get your revenge.'}
          </p>
        </div>

        {/* Final Score Comparison */}
        <div className="grid grid-cols-2 gap-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider">
              Your Score
            </span>
            <div className="text-3xl font-black font-mono text-white">
              {gameState.playerScore}
            </div>
          </div>
          <div className="space-y-1 border-l border-slate-700">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
              {opponentName}
            </span>
            <div className="text-3xl font-black font-mono text-white">
              {gameState.computerScore}
            </div>
          </div>
        </div>

        {/* Grid Fill & Turn Stats */}
        <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800 flex items-center justify-around text-xs text-slate-300">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-medium">Grid Fill</span>
            <span className="font-bold text-teal-300 font-mono">
              {filledCells}/81 ({fillPercent}%)
            </span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-medium">Turns</span>
            <span className="font-bold text-white font-mono">{gameState.turnNumber}</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-medium">Words</span>
            <span className="font-bold text-amber-300 font-mono">
              {gameState.history.filter((h) => h.action === 'play').length}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onPlayAgain}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold rounded-2xl shadow-lg shadow-teal-500/20 active:scale-95 transition flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Play Solo Again</span>
        </button>
      </div>
    </div>
  );
}
