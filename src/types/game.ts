export interface ArabicLetterInfo {
  letter: string;
  normalized: string;
  name: string;
  transliteration: string;
  points: number;
  frequency: number;
}

export interface Tile {
  id: string;
  letter: string;
  points: number;
  normalized: string;
}

export type MultiplierType = 'NONE' | '2X' | '3X' | '4X' | 'CENTER';

export interface BoardCell {
  row: number;
  col: number;
  multiplierType: MultiplierType;
  multiplierValue: number; // 1, 2, 3, 4
  tile: Tile | null;
  isTemp?: boolean; // Placed on current turn but not yet confirmed
  playedBy?: 'player' | 'computer' | null;
  turnPlayed?: number;
}

export interface PlacedTile {
  row: number;
  col: number;
  tile: Tile;
}

export interface FormedWord {
  word: string;
  normalized: string;
  direction: 'horizontal' | 'vertical';
  coords: { row: number; col: number }[];
  score: number;
  definition?: string;
  root?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  words: FormedWord[];
  totalScore: number;
}

export interface MoveHistoryItem {
  id: string;
  turnNumber: number;
  player: 'player' | 'computer';
  action: 'play' | 'pass' | 'swap';
  words: FormedWord[];
  scoreGained: number;
  tilesPlayedCount: number;
  timestamp: number;
}

export interface GameState {
  board: BoardCell[][];
  playerRack: Tile[];
  computerRack: Tile[];
  tileBag: Tile[];
  playerScore: number;
  computerScore: number;
  turn: 'player' | 'computer';
  turnNumber: number;
  isFirstMove: boolean;
  status: 'playing' | 'game_over';
  winner: 'player' | 'computer' | 'tie' | null;
  gameOverReason?: 'grid_filled' | 'passes' | 'out_of_tiles';
  filledCellsCount?: number;
  consecutivePasses: number;
  history: MoveHistoryItem[];
  lastComputerMove?: {
    words: FormedWord[];
    scoreGained: number;
    cells: { row: number; col: number }[];
  } | null;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
  otpCode?: string;
  otpExpiresAt?: number;
  createdAt: number;
  stats: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    ties: number;
    highestScore: number;
  };
}

export interface AiDifficulty {
  id: 'easy' | 'medium' | 'hard';
  name: string;
  description: string;
  maxScoreCap?: number;
}
