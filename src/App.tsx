/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AuthScreen } from './components/Auth/AuthScreen';
import { GameHeader } from './components/Header/GameHeader';
import { GameBoard } from './components/Board/GameBoard';
import { PlayerRack } from './components/Rack/PlayerRack';
import { ActionControls } from './components/Controls/ActionControls';
import { DictionaryModal } from './components/Modals/DictionaryModal';
import { HowToPlayModal } from './components/Modals/HowToPlayModal';
import { SwapTilesModal } from './components/Modals/SwapTilesModal';
import { GameOverModal } from './components/Modals/GameOverModal';
import { ChatPanel } from './components/Chat/ChatPanel';
import { Profile, logout, subscribeAuth } from './services/auth';
import {
  countFilledBoardCells,
  createInitialBoard,
  drawTilesFromBag,
  findComputerMove,
  GRID_FILL_TARGET_CELLS,
  RACK_CAPACITY,
  validateMoveAsync,
} from './services/gameEngine';
import {
  acceptInvite,
  cancelChallenge,
  challengePlayer,
  COMPUTER_UID,
  commitTurn,
  GameDoc,
  goOffline,
  goOnline,
  Invite,
  OnlinePlayer,
  startComputerGame,
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

function computerFinishFields(players: GameDoc['players'], reason: string): Partial<GameDoc> {
  const [a, b] = Object.keys(players);
  const scoreA = players[a]?.score ?? 0;
  const scoreB = players[b]?.score ?? 0;
  const winnerUid = scoreA === scoreB ? 'tie' : scoreA > scoreB ? a : b;
  return { status: 'game_over', winnerUid, gameOverReason: reason };
}

/** Plays the computer's turn with the local solver and saves it. Runs in the player's browser only. */
async function playComputerTurn(gameId: string, g: GameDoc, humanUid: string): Promise<void> {
  const board: BoardCell[][] = JSON.parse(g.board);
  const compRack: Tile[] = JSON.parse(g.computerRack || '[]');
  const bag: Tile[] = JSON.parse(g.bag || '[]');
  const result = findComputerMove(board, compRack, g.isFirstMove);

  if (!result || !result.validation.isValid) {
    const passes = g.consecutivePasses + 1;
    const fields: Partial<GameDoc> = {
      turnUid: humanUid,
      turnNumber: g.turnNumber + 1,
      consecutivePasses: passes,
      lastMove: { by: COMPUTER_UID, action: 'pass', words: '[]', score: 0, cells: '[]' },
      history: { ...(g.history || {}), [g.turnNumber]: { by: COMPUTER_UID, action: 'pass', score: 0 } },
    };
    if (passes >= 4) Object.assign(fields, computerFinishFields(g.players, 'passes'));
    await commitTurn(gameId, COMPUTER_UID, g.turnNumber, fields, null);
    return;
  }

  const placed = result.placedTiles;
  const newBoard = board.map((row) =>
    row.map((cell) => {
      const pt = placed.find((p) => p.row === cell.row && p.col === cell.col);
      return pt ? { ...cell, tile: pt.tile, playedBy: 'computer' as const, turnPlayed: g.turnNumber } : cell;
    })
  );
  const placedIds = new Set(placed.map((p) => p.tile.id));
  const remaining = compRack.filter((t) => !placedIds.has(t.id));
  const { drawn, remainingBag } = drawTilesFromBag(bag, RACK_CAPACITY - remaining.length);
  const gained = result.validation.totalScore;
  const players = { ...g.players, [COMPUTER_UID]: { ...g.players[COMPUTER_UID], score: (g.players[COMPUTER_UID]?.score ?? 0) + gained } };
  const filled = countFilledBoardCells(newBoard);
  const gridDone = filled >= GRID_FILL_TARGET_CELLS;

  const fields: Partial<GameDoc> = {
    board: JSON.stringify(newBoard),
    bag: JSON.stringify(remainingBag),
    players,
    computerRack: JSON.stringify([...remaining, ...drawn]),
    turnUid: humanUid,
    turnNumber: g.turnNumber + 1,
    isFirstMove: false,
    consecutivePasses: 0,
    filledCellsCount: filled,
    lastMove: {
      by: COMPUTER_UID,
      action: 'play',
      words: JSON.stringify(result.validation.words),
      score: gained,
      cells: JSON.stringify(placed.map((p) => ({ row: p.row, col: p.col }))),
    },
    history: { ...(g.history || {}), [g.turnNumber]: { by: COMPUTER_UID, action: 'play', score: gained } },
  };
  if (gridDone) Object.assign(fields, computerFinishFields(players, 'grid_filled'));
  await commitTurn(gameId, COMPUTER_UID, g.turnNumber, fields, null);
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

  // Refs so timers always read the latest lists
  const onlinePlayersRef = useRef<OnlinePlayer[]>([]);
  onlinePlayersRef.current = onlinePlayers;
  const invitesRef = useRef<Invite[]>([]);
  invitesRef.current = invites;
  const challengedUidRef = useRef<string | null>(null);
  const acceptingRef = useRef<string | null>(null);

  /** Starts a game against the computer and makes it the current game. */
  const startVsComputer = async (me: Profile) => {
    try {
      const id = await startComputerGame(me);
      challengedUidRef.current = null;
      storeGameId(id);
      setGameId(id);
    } catch (err) {
      console.error(err);
      showToast('Could not start the game. Please try again.', 'error');
    }
  };

  /** Drops a waiting challenge (if any) and plays the computer instead. */
  const forceComputer = async () => {
    if (!profile) return;
    if (gameId && challengedUidRef.current) {
      await cancelChallenge(gameId, challengedUidRef.current).catch(() => undefined);
    }
    challengedUidRef.current = null;
    storeGameId(null);
    setGameId(null);
    await startVsComputer(profile);
  };

  // Matchmaking: with no game open, challenge an online player, or play the computer if nobody is online
  useEffect(() => {
    if (!profile || gameId) return;
    const timer = setTimeout(() => {
      if (invitesRef.current.length > 0) return; // an invite is waiting: the auto-accept effect handles it
      const others = onlinePlayersRef.current.filter((p) => p.uid !== profile.uid);
      if (others.length === 0) {
        startVsComputer(profile);
        return;
      }
      const target = others[0].uid;
      challengePlayer(profile, target)
        .then((id) => {
          challengedUidRef.current = target;
          storeGameId(id);
          setGameId(id);
        })
        .catch(() => startVsComputer(profile));
    }, 2000 + Math.random() * 1500); // random pause so two players don't challenge each other at once
    return () => clearTimeout(timer);
  }, [profile?.uid, gameId]);

  // Join an invite automatically when I have no game
  useEffect(() => {
    if (!profile || gameId || invites.length === 0) return;
    const inv = invites[0];
    if (acceptingRef.current === inv.gameId) return;
    acceptingRef.current = inv.gameId;
    acceptInvite(profile, inv.gameId)
      .then(() => {
        storeGameId(inv.gameId);
        setGameId(inv.gameId);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        acceptingRef.current = null;
      });
  }, [invites, gameId, profile?.uid]);

  // My challenge was not accepted in 8 seconds: play the computer instead
  useEffect(() => {
    if (!profile || !gameId || !game || game.status !== 'waiting' || game.p1 !== profile.uid) return;
    const timer = setTimeout(() => {
      forceComputer();
    }, 8000);
    return () => clearTimeout(timer);
  }, [gameId, game?.status]);

  // Computer's turn: the human's browser (player 1) plays it after a short pause
  useEffect(() => {
    if (!profile || !gameId || !game) return;
    if (game.status !== 'playing' || game.p2 !== COMPUTER_UID || game.turnUid !== COMPUTER_UID) return;
    if (game.p1 !== profile.uid) return;
    const snapshot = game;
    const timer = setTimeout(() => {
      playComputerTurn(gameId, snapshot, profile.uid).catch((err) => console.error(err));
    }, 1000);
    return () => clearTimeout(timer);
  }, [gameId, game?.turnNumber, game?.turnUid, game?.status]);

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
  const opponentOnline = opponentUid === COMPUTER_UID || (!!opponentUid && onlinePlayers.some((p) => p.uid === opponentUid));

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

  // No game yet: the app looks for an online player, or plays the computer
  if (!gameId || !game) {
    const othersOnline = onlinePlayers.filter((p) => p.uid !== profile.uid).length;
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-teal-500 via-emerald-400 to-amber-300 flex flex-col items-center justify-center gap-4 p-6">
        <div className="bg-white/95 rounded-2xl p-6 text-center shadow max-w-sm space-y-3">
          <Sparkles className="w-8 h-8 text-teal-600 mx-auto" />
          <p className="font-bold text-slate-900">Procurando um jogador online...</p>
          <p className="text-xs text-slate-600">{othersOnline} jogador(es) online agora.</p>
          <button onClick={() => startVsComputer(profile)} className="px-4 py-2 rounded-lg bg-amber-500 text-slate-900 text-xs font-black">
            Jogar contra o computador
          </button>
        </div>
        <button onClick={handleLogout} className="px-4 py-2 rounded-full bg-slate-900/80 text-white text-xs font-bold">
          Log out ({profile.name})
        </button>
      </div>
    );
  }

  // Waiting for the opponent to accept my challenge (the computer takes over after 8 seconds)
  if (game.status === 'waiting') {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-teal-500 via-emerald-400 to-amber-300 flex flex-col items-center justify-center gap-4 p-6">
        <div className="bg-white/95 rounded-2xl p-6 text-center shadow max-w-sm space-y-3">
          <Sparkles className="w-8 h-8 text-teal-600 mx-auto" />
          <p className="font-bold text-slate-900">Esperando o jogador aceitar...</p>
          <p className="text-xs text-slate-600">Se ninguém aceitar em alguns segundos, o jogo começa contra o computador.</p>
          <button onClick={forceComputer} className="px-4 py-2 rounded-lg bg-amber-500 text-slate-900 text-xs font-black">
            Jogar contra o computador agora
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
      </main>

      <ChatPanel gameId={gameId} myUid={myUid} myName={profile.name} />

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
