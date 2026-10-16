/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { AuthScreen } from './components/Auth/AuthScreen';
import { GameHeader } from './components/Header/GameHeader';
import { GameBoard } from './components/Board/GameBoard';
import { PlayerRack } from './components/Rack/PlayerRack';
import { ActionControls } from './components/Controls/ActionControls';
import { DictionaryModal } from './components/Modals/DictionaryModal';
import { HowToPlayModal } from './components/Modals/HowToPlayModal';
import { SwapTilesModal } from './components/Modals/SwapTilesModal';
import { GameOverModal } from './components/Modals/GameOverModal';
import { Lobby } from './components/Lobby/Lobby';
import { ChatPanel } from './components/Chat/ChatPanel';
import { Profile, logout, subscribeAuth } from './services/auth';
import {
  createInitialBoard,
  countFilledBoardCells,
  drawTilesFromBag,
  GRID_FILL_TARGET_CELLS,
  RACK_CAPACITY,
  validateMoveAsync,
} from './services/gameEngine';
import {
  acceptInvite,
  challengePlayer,
  commitTurn,
  declineInvite,
  GameDoc,
  goOffline,
  goOnline,
  Invite,
  OnlinePlayer,
  subscribeGame,
  subscribeInvites,
  subscribePresence,
  subscribeRack,
} from './services/multiplayer';
import {
  BoardCell,
  FormedWord,
  GameState,
  MoveHistoryItem,
  PlacedTile,
  Tile,
} from './types/game';
import { CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';

const CURRENT_GAME_KEY = 'awf_current_game_v2';

function readStoredGameId(): string | null {
  try {
    return localStorage.getItem(CURRENT_GAME_KEY);
  } catch {
    return null;
  }
}

function storeGameId(id: string | null) {
  try {
    if (id) localStorage.setItem(CURRENT_GAME_KEY, id);
    else localStorage.removeItem(CURRENT_GAME_KEY);
  } catch {
    // Storage may be blocked; the game still works without resume.
  }
}

/** Converts the shared game document into the GameState shape the UI components expect. */
function toGameState(game: GameDoc, uid: string, rack: Tile[]): GameState {
  const opponentUid = game.p1 === uid ? game.p2 : game.p1;
  const board: BoardCell[][] = game.board ? JSON.parse(game.board) : createInitialBoard();

  const history: MoveHistoryItem[] = Object.entries(game.history || {})
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([key, h]) => ({
      id: key,
      turnNumber: Number(key),
      player: h.by === uid ? 'player' : 'computer',
      action: h.action,
      words: [],
      scoreGained: h.score,
      tilesPlayedCount: 0,
      timestamp: 0,
    }));

  const last = game.lastMove && game.lastMove.by !== uid ? game.lastMove : null;

  let winner: GameState['winner'] = null;
  if (game.winnerUid === 'tie') winner = 'tie';
  else if (game.winnerUid === uid) winner = 'player';
  else if (game.winnerUid) winner = 'computer';

  return {
    board,
    playerRack: rack,
    computerRack: [],
    tileBag: [],
    playerScore: game.players[uid]?.score ?? 0,
    computerScore: opponentUid ? game.players[opponentUid]?.score ?? 0 : 0,
    turn: game.turnUid === uid ? 'player' : 'computer',
    turnNumber: game.turnNumber,
    isFirstMove: game.isFirstMove,
    status: game.status === 'game_over' ? 'game_over' : 'playing',
    winner,
    gameOverReason: game.gameOverReason as GameState['gameOverReason'],
    filledCellsCount: game.filledCellsCount,
    consecutivePasses: game.consecutivePasses,
    history,
    lastComputerMove: last
      ? {
          words: JSON.parse(last.words) as FormedWord[],
          scoreGained: last.score,
          cells: JSON.parse(last.cells) as { row: number; col: number }[],
        }
      : null,
  };
}

export default function App() {
  const [authReady, setAuthReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);

  const [gameId, setGameId] = useState<string | null>(() => readStoredGameId());
  const [game, setGame] = useState<GameDoc | null>(null);
  const [rack, setRack] = useState<Tile[]>([]);
  const [placedTiles, setPlacedTiles] = useState<PlacedTile[]>([]);
  const [selectedRackTile, setSelectedRackTile] = useState<Tile | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isSwapOpen, setIsSwapOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  };

  // Auth state
  useEffect(() => {
    return subscribeAuth((p) => {
      setProfile(p);
      setAuthReady(true);
    });
  }, []);

  // Presence, lobby and invites for the signed-in user
  useEffect(() => {
    if (!profile) return;
    const stopOnline = goOnline(profile);
    const stopPresence = subscribePresence(setOnlinePlayers);
    const stopInvites = subscribeInvites(profile.uid, setInvites);
    return () => {
      stopOnline();
      stopPresence();
      stopInvites();
    };
  }, [profile?.uid]);

  // Live game document and my private rack
  useEffect(() => {
    if (!profile || !gameId) {
      setGame(null);
      setRack([]);
      return;
    }
    const stopGame = subscribeGame(gameId, (doc) => {
      setGame(doc);
      if (!doc) {
        storeGameId(null);
        setGameId(null);
      }
    });
    const stopRack = subscribeRack(gameId, profile.uid, (tiles) => {
      setRack(tiles);
    });
    return () => {
      stopGame();
      stopRack();
    };
  }, [profile?.uid, gameId]);

  const myUid = profile?.uid || '';
  const opponentUid = game ? (game.p1 === myUid ? game.p2 : game.p1) : undefined;
  const opponentName = (opponentUid && game?.players[opponentUid]?.name) || 'Waiting...';
  const opponentOnline = !!opponentUid && onlinePlayers.some((p) => p.uid === opponentUid);

  const gameState: GameState | null = useMemo(() => {
    if (!game || !profile || game.status === 'waiting') return null;
    return toGameState(game, myUid, rack);
  }, [game, rack, myUid]);

  const isMyTurn = !!game && game.status === 'playing' && game.turnUid === myUid;
  const bag: Tile[] = game?.bag ? JSON.parse(game.bag) : [];

  const clearPlacedTilesLocally = () => {
    setPlacedTiles([]);
    setSelectedRackTile(null);
  };

  // Board interaction (placing tiles is local until the move is confirmed)
  const handleCellClick = (row: number, col: number) => {
    if (!gameState || !isMyTurn || isValidating) return;
    if (gameState.board[row][col].tile) return;
    if (selectedRackTile) {
      setRack((prev) => prev.filter((t) => t.id !== selectedRackTile.id));
      setPlacedTiles((prev) => [...prev, { row, col, tile: selectedRackTile }]);
      setSelectedRackTile(null);
    }
  };

  const handleRemoveTempTile = (row: number, col: number) => {
    if (isValidating) return;
    const target = placedTiles.find((pt) => pt.row === row && pt.col === col);
    if (!target) return;
    setPlacedTiles((prev) => prev.filter((pt) => !(pt.row === row && pt.col === col)));
    setRack((prev) => [...prev, target.tile]);
  };

  const handleSelectRackTile = (tile: Tile) => {
    if (!isMyTurn || isValidating) return;
    setSelectedRackTile((prev) => (prev?.id === tile.id ? null : tile));
  };

  const handleClear = () => {
    if (placedTiles.length === 0 || isValidating) return;
    setRack((prev) => [...prev, ...placedTiles.map((pt) => pt.tile)]);
    clearPlacedTilesLocally();
  };

  const handleShuffle = () => {
    if (isValidating) return;
    setRack((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  /** Builds the end-of-game fields when the grid is full or four passes in a row happen. */
  const finishFields = (players: GameDoc['players'], reason: string): Partial<GameDoc> => {
    const [a, b] = Object.keys(players);
    const scoreA = players[a]?.score ?? 0;
    const scoreB = players[b]?.score ?? 0;
    const winnerUid = scoreA === scoreB ? 'tie' : scoreA > scoreB ? a : b;
    return { status: 'game_over', winnerUid, gameOverReason: reason };
  };

  const handleConfirmMove = async () => {
    if (!game || !gameState || !profile || !isMyTurn || placedTiles.length === 0 || isValidating) return;

    setIsValidating(true);
    try {
      const validation = await validateMoveAsync(gameState.board, placedTiles, game.isFirstMove);
      if (!validation.isValid) {
        showToast(validation.error || 'Invalid move. Please verify placement.', 'error');
        return;
      }

      const newBoard = gameState.board.map((row) =>
        row.map((cell) => {
          const pt = placedTiles.find((p) => p.row === cell.row && p.col === cell.col);
          return pt ? { ...cell, tile: pt.tile, playedBy: 'player' as const, turnPlayed: game.turnNumber } : cell;
        })
      );

      const needed = RACK_CAPACITY - rack.length;
      const { drawn, remainingBag } = drawTilesFromBag(bag, needed);
      const newRack = [...rack, ...drawn];
      const myScore = (game.players[myUid]?.score ?? 0) + validation.totalScore;
      const filled = countFilledBoardCells(newBoard);
      const gridDone = filled >= GRID_FILL_TARGET_CELLS;

      const players = { ...game.players, [myUid]: { ...game.players[myUid], score: myScore } };
      const fields: Partial<GameDoc> = {
        board: JSON.stringify(newBoard),
        bag: JSON.stringify(remainingBag),
        players,
        turnUid: opponentUid as string,
        turnNumber: game.turnNumber + 1,
        isFirstMove: false,
        consecutivePasses: 0,
        filledCellsCount: filled,
        lastMove: {
          by: myUid,
          action: 'play',
          words: JSON.stringify(validation.words),
          score: validation.totalScore,
          cells: JSON.stringify(placedTiles.map((p) => ({ row: p.row, col: p.col }))),
        },
        history: { ...(game.history || {}), [game.turnNumber]: { by: myUid, action: 'play', score: validation.totalScore } },
      };
      if (gridDone) Object.assign(fields, finishFields(players, 'grid_filled'));

      const ok = await commitTurn(gameId as string, myUid, game.turnNumber, fields, newRack);
      if (!ok) {
        showToast('Your opponent moved first. Your tiles were returned.', 'error');
        clearPlacedTilesLocally();
        return;
      }

      clearPlacedTilesLocally();
      const wordsText = validation.words.map((w) => `${w.word} (+${w.score} pts)`).join(', ');
      showToast(`Word accepted! ${wordsText} | Total: +${validation.totalScore} pts`, 'success');
      if (gridDone) showToast(`🎯 80% Grid Target Reached (${filled}/81 cells filled)!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Error sending move. Please try again.', 'error');
    } finally {
      setIsValidating(false);
    }
  };

  const handlePass = async () => {
    if (!game || !isMyTurn) return;
    const passes = game.consecutivePasses + 1;
    const fields: Partial<GameDoc> = {
      turnUid: opponentUid as string,
      turnNumber: game.turnNumber + 1,
      consecutivePasses: passes,
      lastMove: { by: myUid, action: 'pass', words: '[]', score: 0, cells: '[]' },
      history: { ...(game.history || {}), [game.turnNumber]: { by: myUid, action: 'pass', score: 0 } },
    };
    if (passes >= 4) Object.assign(fields, finishFields(game.players, 'passes'));

    // Return any placed tiles before passing.
    const restoredRack = [...rack, ...placedTiles.map((pt) => pt.tile)];
    clearPlacedTilesLocally();
    const ok = await commitTurn(gameId as string, myUid, game.turnNumber, fields, restoredRack);
    if (ok) showToast('You passed your turn.', 'info');
    else showToast('Your opponent moved first.', 'error');
  };

  const handleConfirmSwap = async (selectedTileIds: string[]) => {
    if (!game || !isMyTurn) return;
    const baseRack = [...rack, ...placedTiles.map((pt) => pt.tile)];
    const remaining = baseRack.filter((t) => !selectedTileIds.includes(t.id));
    const swapped = baseRack.filter((t) => selectedTileIds.includes(t.id));
    const { drawn, remainingBag } = drawTilesFromBag(bag, selectedTileIds.length);
    const fields: Partial<GameDoc> = {
      bag: JSON.stringify([...remainingBag, ...swapped]),
      turnUid: opponentUid as string,
      turnNumber: game.turnNumber + 1,
      lastMove: { by: myUid, action: 'swap', words: '[]', score: 0, cells: '[]' },
      history: { ...(game.history || {}), [game.turnNumber]: { by: myUid, action: 'swap', score: 0 } },
    };
    clearPlacedTilesLocally();
    const ok = await commitTurn(gameId as string, myUid, game.turnNumber, fields, [...remaining, ...drawn]);
    if (ok) showToast(`Swapped ${selectedTileIds.length} tiles for new letters.`, 'info');
    else showToast('Your opponent moved first.', 'error');
  };

  const handleChallenge = async (uid: string) => {
    if (!profile) return;
    try {
      const id = await challengePlayer(profile, uid);
      storeGameId(id);
      setGameId(id);
      showToast('Invite sent. Waiting for your opponent to accept.', 'info');
    } catch (err) {
      console.error(err);
      showToast('Could not send the invite. Please try again.', 'error');
    }
  };

  const handleAccept = async (id: string) => {
    if (!profile) return;
    try {
      await acceptInvite(profile, id);
      storeGameId(id);
      setGameId(id);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not join the game.', 'error');
    }
  };

  const handleDecline = (id: string) => {
    if (profile) declineInvite(profile.uid, id);
  };

  const backToLobby = () => {
    clearPlacedTilesLocally();
    storeGameId(null);
    setGameId(null);
    setGame(null);
  };

  const handleLogout = async () => {
    if (profile) {
      await goOffline(profile.uid).catch(() => undefined);
    }
    backToLobby();
    await logout();
  };

  if (!authReady) {
    return <div className="min-h-screen bg-gradient-to-b from-teal-500 to-amber-300" />;
  }

  if (!profile) {
    return <AuthScreen />;
  }

  // Lobby: no active game selected
  if (!gameId || !game) {
    return (
      <>
        <Lobby
          myUid={myUid}
          onlinePlayers={onlinePlayers}
          invites={invites}
          onChallenge={handleChallenge}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
        <div className="fixed bottom-3 left-0 right-0 flex justify-center">
          <button onClick={handleLogout} className="px-4 py-2 rounded-full bg-slate-900/80 text-white text-xs font-bold">
            Log out ({profile.name})
          </button>
        </div>
      </>
    );
  }

  // Waiting for the opponent to accept the invite
  if (game.status === 'waiting') {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-teal-500 via-emerald-400 to-amber-300 flex flex-col items-center justify-center gap-4 p-6">
        <div className="bg-white/95 rounded-2xl p-6 text-center shadow max-w-sm space-y-3">
          <Sparkles className="w-8 h-8 text-teal-600 mx-auto" />
          <p className="font-bold text-slate-900">Waiting for your opponent to accept...</p>
          <p className="text-xs text-slate-600">The game starts as soon as they accept your invite.</p>
          <button onClick={backToLobby} className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 text-xs font-bold">
            Back to lobby
          </button>
        </div>
      </div>
    );
  }

  if (!gameState) return null;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-teal-500 via-emerald-400 to-amber-300 flex flex-col justify-between overflow-x-hidden text-slate-900">
      <GameHeader
        gameState={gameState}
        currentUser={profile}
        opponentName={opponentName}
        opponentOnline={opponentOnline}
        onOpenDictionary={() => setIsDictionaryOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onNewGame={backToLobby}
        onLogout={handleLogout}
      />

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

      <main className="flex-1 flex flex-col justify-center">
        <GameBoard
          board={gameState.board}
          placedTiles={placedTiles}
          selectedRackTile={selectedRackTile}
          onCellClick={handleCellClick}
          onRemoveTempTile={handleRemoveTempTile}
          lastComputerMoveCells={gameState.lastComputerMove?.cells}
        />
        <div className="mt-3">
          <ChatPanel gameId={gameId} myUid={myUid} myName={profile.name} />
        </div>
      </main>

      <footer className="pb-3 pt-1">
        <ActionControls
          canSubmit={placedTiles.length > 0}
          canClear={placedTiles.length > 0}
          isPlayerTurn={isMyTurn}
          isValidating={isValidating}
          onConfirm={handleConfirmMove}
          onClear={handleClear}
          onShuffle={handleShuffle}
          onSwap={() => setIsSwapOpen(true)}
          onPass={handlePass}
          onOpenDictionary={() => setIsDictionaryOpen(true)}
        />

        <PlayerRack
          rack={rack}
          selectedTileId={selectedRackTile?.id || null}
          onSelectTile={handleSelectRackTile}
          disabled={!isMyTurn}
        />
      </footer>

      <DictionaryModal isOpen={isDictionaryOpen} onClose={() => setIsDictionaryOpen(false)} />
      <HowToPlayModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      <SwapTilesModal
        isOpen={isSwapOpen}
        rack={rack}
        onClose={() => setIsSwapOpen(false)}
        onConfirmSwap={handleConfirmSwap}
      />

      {game.status === 'game_over' && (
        <GameOverModal gameState={gameState} opponentName={opponentName} onPlayAgain={backToLobby} />
      )}
    </div>
  );
}
