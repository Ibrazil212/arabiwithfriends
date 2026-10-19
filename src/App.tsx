/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthScreen } from './components/Auth/AuthScreen';
import { GameHeader } from './components/Header/GameHeader';
import { GameBoard } from './components/Board/GameBoard';
import { PlayerRack } from './components/Rack/PlayerRack';
import { ActionControls } from './components/Controls/ActionControls';
import { DictionaryModal } from './components/Modals/DictionaryModal';
import { HowToPlayModal } from './components/Modals/HowToPlayModal';
import { SwapTilesModal } from './components/Modals/SwapTilesModal';
import { GameOverModal } from './components/Modals/GameOverModal';
import { SimulatedOtpToast } from './components/SimulatedOtpToast';
import { authService } from './services/auth';
import {
  createNewGame,
  findComputerMove,
  RACK_CAPACITY,
  validateMove,
  validateMoveAsync,
  drawTilesFromBag,
  countFilledBoardCells,
  GRID_FILL_TARGET_CELLS,
} from './services/gameEngine';
import { GameState, PlacedTile, Tile, UserAccount } from './types/game';
import { CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => authService.getCurrentUser());
  const [gameState, setGameState] = useState<GameState>(createNewGame);
  const [placedTiles, setPlacedTiles] = useState<PlacedTile[]>([]);
  const [selectedRackTile, setSelectedRackTile] = useState<Tile | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  // Modals
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  
  // Toasts / Feedback
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  };

  // Handle Tile Placement
  const handleCellClick = (row: number, col: number) => {
    if (gameState.turn !== 'player' || gameState.status !== 'playing' || isValidating) return;

    // If cell already has a permanently established tile, ignore
    if (gameState.board[row][col].tile) return;

    // If user has a tile selected from rack
    if (selectedRackTile) {
      // Remove from rack and add to placedTiles
      setGameState((prev) => ({
        ...prev,
        playerRack: prev.playerRack.filter((t) => t.id !== selectedRackTile.id),
      }));

      setPlacedTiles((prev) => [...prev, { row, col, tile: selectedRackTile }]);
      setSelectedRackTile(null);
    }
  };

  // Drop a rack tile onto an empty square (drag and drop)
  const handlePlaceFromRack = (tile: Tile, row: number, col: number) => {
    if (gameState.turn !== 'player' || gameState.status !== 'playing' || isValidating) return;
    if (gameState.board[row][col].tile) return;
    if (placedTiles.some((pt) => pt.row === row && pt.col === col)) return;

    setGameState((prev) => ({
      ...prev,
      playerRack: prev.playerRack.filter((t) => t.id !== tile.id),
    }));
    setPlacedTiles((prev) => [...prev, { row, col, tile }]);
    setSelectedRackTile(null);
  };

  // Remove temporary tile from board and return back to rack
  const handleRemoveTempTile = (row: number, col: number) => {
    if (isValidating) return;
    const target = placedTiles.find((pt) => pt.row === row && pt.col === col);
    if (!target) return;

    setPlacedTiles((prev) => prev.filter((pt) => !(pt.row === row && pt.col === col)));
    setGameState((prev) => ({
      ...prev,
      playerRack: [...prev.playerRack, target.tile],
    }));
  };

  // Select / Unselect Tile from Rack
  const handleSelectRackTile = (tile: Tile) => {
    if (gameState.turn !== 'player' || isValidating) return;
    setSelectedRackTile((prev) => (prev?.id === tile.id ? null : tile));
  };

  // Clear all temporary placed tiles back to rack
  const handleClear = () => {
    if (placedTiles.length === 0 || isValidating) return;
    setGameState((prev) => ({
      ...prev,
      playerRack: [...prev.playerRack, ...placedTiles.map((pt) => pt.tile)],
    }));
    setPlacedTiles([]);
    setSelectedRackTile(null);
  };

  // Shuffle Player Rack
  const handleShuffle = () => {
    if (isValidating) return;
    setGameState((prev) => {
      const shuffled = [...prev.playerRack].sort(() => Math.random() - 0.5);
      return { ...prev, playerRack: shuffled };
    });
  };

  // Confirm / Play Move (Async with live Almaany dictionary verification)
  const handleConfirmMove = async () => {
    if (gameState.turn !== 'player' || placedTiles.length === 0 || isValidating) return;

    setIsValidating(true);
    try {
      const validation = await validateMoveAsync(gameState.board, placedTiles, gameState.isFirstMove);

      if (!validation.isValid) {
        showToast(validation.error || 'Invalid move. Please verify placement.', 'error');
        setIsValidating(false);
        return;
      }

      // Move is valid! Apply to board
      const newBoard = gameState.board.map((row) =>
        row.map((cell) => {
          const pt = placedTiles.find((p) => p.row === cell.row && p.col === cell.col);
          if (pt) {
            return {
              ...cell,
              tile: pt.tile,
              playedBy: 'player' as const,
              turnPlayed: gameState.turnNumber,
            };
          }
          return cell;
        })
      );

      // Replenish player rack with continuous replacement from tile bag
      const needed = RACK_CAPACITY - gameState.playerRack.length;
      const { drawn, remainingBag: newBag } = drawTilesFromBag(gameState.tileBag, needed);
      const newPlayerRack = [...gameState.playerRack, ...drawn];
      const newScore = gameState.playerScore + validation.totalScore;

      const wordsText = validation.words
        .map((w) => `${w.word} (+${w.score} pts${w.definition ? ` - ${w.definition}` : ''})`)
        .join(', ');
      showToast(`Word accepted! ${wordsText} | Total: +${validation.totalScore} pts`, 'success');

      // Update Game State and check 80% grid target
      setPlacedTiles([]);
      setSelectedRackTile(null);

      const filledCount = countFilledBoardCells(newBoard);
      const isGridTargetMet = filledCount >= GRID_FILL_TARGET_CELLS;

      setGameState((prev) => {
        const nextState: GameState = {
          ...prev,
          board: newBoard,
          playerRack: newPlayerRack,
          tileBag: newBag,
          playerScore: newScore,
          turn: 'computer',
          isFirstMove: false,
          consecutivePasses: 0,
          turnNumber: prev.turnNumber + 1,
          filledCellsCount: filledCount,
          history: [
            ...prev.history,
            {
              id: `hist-${Date.now()}`,
              turnNumber: prev.turnNumber,
              player: 'player',
              action: 'play',
              words: validation.words,
              scoreGained: validation.totalScore,
              tilesPlayedCount: placedTiles.length,
              timestamp: Date.now(),
            },
          ],
        };

        if (isGridTargetMet) {
          showToast(`🎯 80% Grid Target Reached (${filledCount}/81 cells filled)!`, 'success');
          return checkGameOver(
            {
              ...nextState,
              gameOverReason: 'grid_filled',
            },
            false
          );
        }

        return nextState;
      });
    } catch (err) {
      console.error(err);
      showToast('Error validating move. Please try again.', 'error');
    } finally {
      setIsValidating(false);
    }
  };

  // Player Pass Turn
  const handlePass = () => {
    handleClear();
    showToast('You passed your turn.', 'info');
    setGameState((prev) => {
      const passes = prev.consecutivePasses + 1;
      if (passes >= 4) {
        return checkGameOver(prev, true);
      }
      return {
        ...prev,
        turn: 'computer',
        consecutivePasses: passes,
        turnNumber: prev.turnNumber + 1,
      };
    });
  };

  // Player Swap Tiles
  const handleConfirmSwap = (selectedTileIds: string[]) => {
    handleClear();
    setGameState((prev) => {
      const remainingRack = prev.playerRack.filter((t) => !selectedTileIds.includes(t.id));
      const swappedTiles = prev.playerRack.filter((t) => selectedTileIds.includes(t.id));
      const { drawn, remainingBag } = drawTilesFromBag(prev.tileBag, selectedTileIds.length);
      const newBag = [...remainingBag, ...swappedTiles];

      showToast(`Swapped ${selectedTileIds.length} tiles for new letters.`, 'info');

      return {
        ...prev,
        playerRack: [...remainingRack, ...drawn],
        tileBag: newBag,
        turn: 'computer',
        turnNumber: prev.turnNumber + 1,
      };
    });
  };

  // Computer AI Turn Effect
  useEffect(() => {
    if (gameState.turn !== 'computer' || gameState.status !== 'playing') return;

    const timer = setTimeout(() => {
      const computerMove = findComputerMove(gameState.board, gameState.computerRack, gameState.isFirstMove);

      if (computerMove && computerMove.validation.isValid) {
        const { placedTiles: compPlaced, validation } = computerMove;
        const newBoard = gameState.board.map((row) =>
          row.map((cell) => {
            const pt = compPlaced.find((p) => p.row === cell.row && p.col === cell.col);
            if (pt) {
              return {
                ...cell,
                tile: pt.tile,
                playedBy: 'computer' as const,
                turnPlayed: gameState.turnNumber,
              };
            }
            return cell;
          })
        );

        // Remove played tiles from computer rack & draw new replacement ones
        const compUsedIds = new Set(compPlaced.map((p) => p.tile.id));
        const remRack = gameState.computerRack.filter((t) => !compUsedIds.has(t.id));
        const needed = RACK_CAPACITY - remRack.length;
        const { drawn, remainingBag: newBag } = drawTilesFromBag(gameState.tileBag, needed);
        const newCompRack = [...remRack, ...drawn];
        const newScore = gameState.computerScore + validation.totalScore;

        const wordsDesc = validation.words.map((w) => `${w.word} (+${w.score} pts)`).join(', ');
        showToast(`Computer played: ${wordsDesc}`, 'info');

        const filledCount = countFilledBoardCells(newBoard);
        const isGridTargetMet = filledCount >= GRID_FILL_TARGET_CELLS;

        setGameState((prev) => {
          const nextState: GameState = {
            ...prev,
            board: newBoard,
            computerRack: newCompRack,
            tileBag: newBag,
            computerScore: newScore,
            turn: 'player',
            isFirstMove: false,
            consecutivePasses: 0,
            turnNumber: prev.turnNumber + 1,
            filledCellsCount: filledCount,
            lastComputerMove: {
              words: validation.words,
              scoreGained: validation.totalScore,
              cells: compPlaced.map((p) => ({ row: p.row, col: p.col })),
            },
            history: [
              ...prev.history,
              {
                id: `hist-${Date.now()}`,
                turnNumber: prev.turnNumber,
                player: 'computer',
                action: 'play',
                words: validation.words,
                scoreGained: validation.totalScore,
                tilesPlayedCount: compPlaced.length,
                timestamp: Date.now(),
              },
            ],
          };

          if (isGridTargetMet) {
            showToast(`🎯 80% Grid Target Reached (${filledCount}/81 cells filled)!`, 'info');
            return checkGameOver(
              {
                ...nextState,
                gameOverReason: 'grid_filled',
              },
              false
            );
          }

          return nextState;
        });
      } else {
        // Computer exchanges tiles with fresh ones from bag to keep match active
        const { drawn, remainingBag: newBag } = drawTilesFromBag(gameState.tileBag, RACK_CAPACITY);
        showToast('Computer exchanged tiles from the bag.', 'info');
        setGameState((prev) => {
          const passes = prev.consecutivePasses + 1;
          if (passes >= 4) {
            return checkGameOver(prev, true);
          }
          return {
            ...prev,
            computerRack: drawn,
            tileBag: newBag,
            turn: 'player',
            consecutivePasses: passes,
            turnNumber: prev.turnNumber + 1,
          };
        });
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [gameState.turn, gameState.status]);

  // Helper to determine game winner and record stats
  const checkGameOver = (state: GameState, forcedPassEnd = false): GameState => {
    let winner: 'player' | 'computer' | 'tie' = 'tie';
    if (state.playerScore > state.computerScore) winner = 'player';
    else if (state.computerScore > state.playerScore) winner = 'computer';

    if (currentUser) {
      authService.recordGameResult(
        currentUser.email,
        winner === 'player' ? 'win' : winner === 'computer' ? 'loss' : 'tie',
        state.playerScore
      );
    }

    const filled = countFilledBoardCells(state.board);

    return {
      ...state,
      status: 'game_over',
      winner,
      gameOverReason: state.gameOverReason || (filled >= GRID_FILL_TARGET_CELLS ? 'grid_filled' : forcedPassEnd ? 'passes' : 'grid_filled'),
      filledCellsCount: filled,
    };
  };

  const handleNewGame = () => {
    handleClear();
    setGameState(createNewGame());
    showToast('New Solo Game Started! First word must cover orange center.', 'info');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  // If not authenticated, render Auth Screen
  if (!currentUser) {
    return (
      <>
        <SimulatedOtpToast />
        <AuthScreen onAuthenticated={(user) => setCurrentUser(user)} />
      </>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-teal-500 via-emerald-400 to-amber-300 flex flex-col justify-between overflow-x-hidden text-slate-900">
      <SimulatedOtpToast />

      {/* Header with Scores & Navigation */}
      <GameHeader
        gameState={gameState}
        currentUser={currentUser}
        onOpenDictionary={() => setIsDictionaryOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onNewGame={handleNewGame}
        onLogout={handleLogout}
      />

      {/* Floating Status Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 max-w-sm w-[92%] animate-in fade-in slide-in-from-top-2">
          <div
            className={`py-2 px-3.5 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 backdrop-blur-md ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900/90 text-emerald-100 border-emerald-400'
                : toastMessage.type === 'error'
                ? 'bg-rose-900/90 text-rose-100 border-rose-400'
                : 'bg-slate-900/90 text-slate-100 border-teal-400'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : toastMessage.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-teal-300 shrink-0" />
            )}
            <span className="truncate">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* 9x9 Board */}
      <main className="flex-1 flex flex-col justify-center">
        <GameBoard
          board={gameState.board}
          placedTiles={placedTiles}
          selectedRackTile={selectedRackTile}
          onCellClick={handleCellClick}
          onRemoveTempTile={handleRemoveTempTile}
          lastComputerMoveCells={gameState.lastComputerMove?.cells}
        />
      </main>

      {/* Bottom Controls & Tile Rack */}
      <footer className="pb-3 pt-1">
        <ActionControls
          canSubmit={placedTiles.length > 0}
          canClear={placedTiles.length > 0}
          isPlayerTurn={gameState.turn === 'player' && gameState.status === 'playing'}
          isValidating={isValidating}
          onConfirm={handleConfirmMove}
          onClear={handleClear}
          onShuffle={handleShuffle}
          onSwap={() => setIsSwapOpen(true)}
          onPass={handlePass}
          onOpenDictionary={() => setIsDictionaryOpen(true)}
        />

        <PlayerRack
          rack={gameState.playerRack}
          selectedTileId={selectedRackTile?.id || null}
          onSelectTile={handleSelectRackTile}
          onPlaceTile={handlePlaceFromRack}
          disabled={gameState.turn !== 'player' || gameState.status !== 'playing'}
        />
      </footer>

      {/* Modals */}
      <DictionaryModal
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
      />

      <HowToPlayModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <SwapTilesModal
        isOpen={isSwapOpen}
        rack={gameState.playerRack}
        onClose={() => setIsSwapOpen(false)}
        onConfirmSwap={handleConfirmSwap}
      />

      {gameState.status === 'game_over' && (
        <GameOverModal
          gameState={gameState}
          onPlayAgain={handleNewGame}
        />
      )}
    </div>
  );
}
