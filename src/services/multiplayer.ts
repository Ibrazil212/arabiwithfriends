import {
  onDisconnect,
  onValue,
  limitToLast,
  push,
  query,
  ref,
  remove,
  runTransaction,
  set,
} from 'firebase/database';
import { db } from './firebase';
import { createNewGame } from './gameEngine';
import { Tile } from '../types/game';
import type { Profile } from './auth';

export interface PlayerInfo {
  name: string;
  score: number;
}

export interface GameDoc {
  status: 'waiting' | 'playing' | 'game_over';
  p1: string;
  p2?: string;
  players: Record<string, PlayerInfo>;
  turnUid: string;
  turnNumber: number;
  isFirstMove: boolean;
  consecutivePasses: number;
  board: string; // JSON of BoardCell[][]
  bag: string; // JSON of Tile[]
  winnerUid?: string; // uid of the winner, or 'tie'
  gameOverReason?: string;
  filledCellsCount?: number;
  lastMove?: { by: string; action: 'play' | 'pass' | 'swap'; words: string; score: number; cells: string };
  history?: Record<string, { by: string; action: 'play' | 'pass' | 'swap'; score: number }>;
  createdAt: number;
}

export interface OnlinePlayer {
  uid: string;
  name: string;
}

export interface Invite {
  gameId: string;
  from: string;
  fromName: string;
  ts: number;
}

export interface ChatMessage {
  id: string;
  uid: string;
  name: string;
  text: string;
  ts: number;
}

/** Firebase rejects undefined values, so strip them before writing. */
function clean<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

/** Marks the current user as online and removes the mark when the connection drops. */
export function goOnline(profile: Profile) {
  const myPresence = ref(db, `presence/${profile.uid}`);
  return onValue(ref(db, '.info/connected'), (snap) => {
    if (snap.val() === true) {
      onDisconnect(myPresence).remove();
      set(myPresence, { name: profile.name, ts: Date.now() });
    }
  });
}

export function goOffline(uid: string) {
  return remove(ref(db, `presence/${uid}`));
}

export function subscribePresence(callback: (players: OnlinePlayer[]) => void) {
  return onValue(ref(db, 'presence'), (snap) => {
    const val = (snap.val() || {}) as Record<string, { name: string }>;
    callback(Object.entries(val).map(([uid, info]) => ({ uid, name: info.name })));
  });
}

/** Creates a waiting game and sends an invite to another online player. */
export async function challengePlayer(me: Profile, opponentUid: string): Promise<string> {
  const gameRef = push(ref(db, 'games'));
  const gameId = gameRef.key as string;
  const doc: Partial<GameDoc> = {
    status: 'waiting',
    p1: me.uid,
    players: { [me.uid]: { name: me.name, score: 0 } },
    turnUid: me.uid,
    turnNumber: 1,
    isFirstMove: true,
    consecutivePasses: 0,
    board: '',
    bag: '',
    createdAt: Date.now(),
  };
  await set(gameRef, clean(doc));
  await set(ref(db, `invites/${opponentUid}/${gameId}`), {
    from: me.uid,
    fromName: me.name,
    ts: Date.now(),
  });
  return gameId;
}

export function subscribeInvites(uid: string, callback: (invites: Invite[]) => void) {
  return onValue(ref(db, `invites/${uid}`), (snap) => {
    const val = (snap.val() || {}) as Record<string, { from: string; fromName: string; ts: number }>;
    callback(
      Object.entries(val)
        .map(([gameId, inv]) => ({ gameId, from: inv.from, fromName: inv.fromName, ts: inv.ts }))
        .sort((a, b) => b.ts - a.ts)
    );
  });
}

export async function declineInvite(uid: string, gameId: string) {
  await remove(ref(db, `invites/${uid}/${gameId}`));
}

/** Joins a waiting game and deals the starting racks. Throws if the game is no longer open. */
export async function acceptInvite(me: Profile, gameId: string): Promise<void> {
  const gameRef = ref(db, `games/${gameId}`);
  const fresh = createNewGame();

  const result = await runTransaction(gameRef, (cur: GameDoc | null) => {
    if (cur === null) return null; // unknown local state: let Firebase retry with the server value
    if (cur.status !== 'waiting' || cur.p1 === me.uid) return undefined;
    const next: GameDoc = {
      ...cur,
      status: 'playing',
      p2: me.uid,
      players: { ...cur.players, [me.uid]: { name: me.name, score: 0 } },
      turnUid: cur.p1,
      board: JSON.stringify(fresh.board),
      bag: JSON.stringify(fresh.tileBag),
    };
    return next;
  });

  if (!result.committed || !result.snapshot.exists()) {
    await remove(ref(db, `invites/${me.uid}/${gameId}`));
    throw new Error('This game is no longer available.');
  }

  const p1 = (result.snapshot.val() as GameDoc).p1;
  // Joiner deals both racks: the challenger's (computerRack) and their own (playerRack).
  await set(ref(db, `racks/${gameId}/${p1}`), JSON.stringify(fresh.computerRack));
  await set(ref(db, `racks/${gameId}/${me.uid}`), JSON.stringify(fresh.playerRack));
  await remove(ref(db, `invites/${me.uid}/${gameId}`));
}

export function subscribeGame(gameId: string, callback: (game: GameDoc | null) => void) {
  return onValue(ref(db, `games/${gameId}`), (snap) => callback((snap.val() as GameDoc) || null));
}

export function subscribeRack(gameId: string, uid: string, callback: (rack: Tile[]) => void) {
  return onValue(ref(db, `racks/${gameId}/${uid}`), (snap) => {
    const raw = snap.val() as string | null;
    callback(raw ? (JSON.parse(raw) as Tile[]) : []);
  });
}

/**
 * Saves a finished turn only if it is still this player's turn and the turn number matches.
 * Returns false if the opponent already moved (the local state is stale).
 */
export async function commitTurn(
  gameId: string,
  uid: string,
  expectedTurnNumber: number,
  fields: Partial<GameDoc>,
  myRack: Tile[] | null
): Promise<boolean> {
  const result = await runTransaction(ref(db, `games/${gameId}`), (cur: GameDoc | null) => {
    if (cur === null) return null; // unknown local state: let Firebase retry with the server value
    if (cur.status !== 'playing' || cur.turnUid !== uid || cur.turnNumber !== expectedTurnNumber) {
      return undefined;
    }
    return { ...cur, ...clean(fields) } as GameDoc;
  });
  if (!result.committed || !result.snapshot.exists()) return false;
  if (myRack) {
    await set(ref(db, `racks/${gameId}/${uid}`), JSON.stringify(myRack));
  }
  return true;
}

export async function sendChat(gameId: string, uid: string, name: string, text: string) {
  const trimmed = text.trim().slice(0, 300);
  if (!trimmed) return;
  await push(ref(db, `chat/${gameId}`), { uid, name, text: trimmed, ts: Date.now() });
}

export function subscribeChat(gameId: string, callback: (messages: ChatMessage[]) => void) {
  return onValue(query(ref(db, `chat/${gameId}`), limitToLast(100)), (snap) => {
    const val = (snap.val() || {}) as Record<string, Omit<ChatMessage, 'id'>>;
    callback(
      Object.entries(val)
        .map(([id, msg]) => ({ id, ...msg }))
        .sort((a, b) => a.ts - b.ts)
    );
  });
}
