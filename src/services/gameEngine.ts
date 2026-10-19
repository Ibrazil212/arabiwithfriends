import { BoardCell, FormedWord, GameState, MultiplierType, PlacedTile, Tile, ValidationResult } from '../types/game';
import { generateTileBag, normalizeArabic } from './arabicLetters';
import { arabicDictionary } from './dictionary';

export const BOARD_SIZE = 9;
export const CENTER_ROW = 4;
export const CENTER_COL = 4;
export const RACK_CAPACITY = 7;
export const TOTAL_BOARD_CELLS = BOARD_SIZE * BOARD_SIZE; // 81 cells
export const GRID_FILL_TARGET_PERCENT = 80;
export const GRID_FILL_TARGET_CELLS = Math.ceil(TOTAL_BOARD_CELLS * 0.8); // 65 cells (80% of grid)

/**
 * Counts the number of permanently placed tiles on the board
 */
export function countFilledBoardCells(board: BoardCell[][]): number {
  let count = 0;
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c].tile) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Continuously draws replacement tiles from the tile bag, automatically replenishing
 * the bag with a fresh shuffled set if it ever runs low, so each letter used is
 * immediately replaced with another until 80% of the grid is filled!
 */
export function drawTilesFromBag(
  bag: Tile[],
  count: number,
  keep: Tile[] = []
): { drawn: Tile[]; remainingBag: Tile[] } {
  let currentBag = [...bag];
  const drawn: Tile[] = [];
  const letterKey = (t: Tile) => normalizeArabic(t.letter);

  while (drawn.length < count) {
    if (currentBag.length === 0) {
      currentBag = generateTileBag();
    }
    // Prefer a letter the rack does not already hold, so the player is not stuck with repeats.
    const taken = new Set([...keep, ...drawn].map(letterKey));
    let idx = currentBag.findIndex((t) => !taken.has(letterKey(t)));
    if (idx === -1) idx = 0; // only repeats are left in the bag
    const [tile] = currentBag.splice(idx, 1);
    drawn.push(tile);
  }

  return { drawn, remainingBag: currentBag };
}

/**
 * Creates a clean 9x9 board with standard WWF/Scrabble-like multipliers and orange center square
 */
export function createInitialBoard(): BoardCell[][] {
  const board: BoardCell[][] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    const row: BoardCell[] = [];
    for (let c = 0; c < BOARD_SIZE; c++) {
      let multiplierType: MultiplierType = 'NONE';
      let multiplierValue = 1;

      // Center square (4,4)
      if (r === CENTER_ROW && c === CENTER_COL) {
        multiplierType = 'CENTER';
        multiplierValue = 1;
      }
      // 4X Multiplier Squares (Corners & Mid-edges)
      else if (
        (r === 0 && (c === 0 || c === 8)) ||
        (r === 8 && (c === 0 || c === 8)) ||
        (r === 4 && (c === 0 || c === 8)) ||
        (r === 0 && c === 4) ||
        (r === 8 && c === 4)
      ) {
        multiplierType = '4X';
        multiplierValue = 4;
      }
      // 3X Multiplier Squares
      else if (
        (r === 1 && (c === 1 || c === 7)) ||
        (r === 7 && (c === 1 || c === 7)) ||
        (r === 2 && c === 4) ||
        (r === 6 && c === 4) ||
        (r === 4 && (c === 2 || c === 6))
      ) {
        multiplierType = '3X';
        multiplierValue = 3;
      }
      // 2X Multiplier Squares
      else if (
        (r === 2 && (c === 2 || c === 6)) ||
        (r === 6 && (c === 2 || c === 6)) ||
        (r === 3 && (c === 3 || c === 5)) ||
        (r === 5 && (c === 3 || c === 5)) ||
        (r === 1 && c === 4) ||
        (r === 7 && c === 4) ||
        (r === 4 && (c === 1 || c === 7))
      ) {
        multiplierType = '2X';
        multiplierValue = 2;
      }

      row.push({
        row: r,
        col: c,
        multiplierType,
        multiplierValue,
        tile: null,
      });
    }
    board.push(row);
  }

  return board;
}

/**
 * Initializes a new game state
 */
export function createNewGame(): GameState {
  const initialBag = generateTileBag();
  const playerDraw = drawTilesFromBag(initialBag, RACK_CAPACITY);
  const computerDraw = drawTilesFromBag(playerDraw.remainingBag, RACK_CAPACITY, playerDraw.drawn);
  const playerRack = playerDraw.drawn;
  const computerRack = computerDraw.drawn;
  const tileBag = computerDraw.remainingBag;

  return {
    board: createInitialBoard(),
    playerRack,
    computerRack,
    tileBag,
    playerScore: 0,
    computerScore: 0,
    turn: 'player',
    turnNumber: 1,
    isFirstMove: true,
    status: 'playing',
    winner: null,
    consecutivePasses: 0,
    history: [],
    lastComputerMove: null,
  };
}

/**
 * Validates a proposed move on the board
 */
/**
 * Validates a proposed move on the board (Asynchronous with live Almaany Dictionary API lookup)
 */
export async function validateMoveAsync(
  board: BoardCell[][],
  placedTiles: PlacedTile[],
  isFirstMove: boolean
): Promise<ValidationResult> {
  if (placedTiles.length === 0) {
    return { isValid: false, error: 'No tiles have been placed on the board.', words: [], totalScore: 0 };
  }

  // 1. Check all placed tiles are on valid, empty squares
  for (const pt of placedTiles) {
    const existing = board[pt.row][pt.col].tile;
    if (existing && !board[pt.row][pt.col].isTemp) {
      return { isValid: false, error: 'Cannot place tile on an already occupied square.', words: [], totalScore: 0 };
    }
  }

  // 2. Check alignment: all newly placed tiles must be in the same row OR same column
  const rows = placedTiles.map(pt => pt.row);
  const cols = placedTiles.map(pt => pt.col);
  const isHorizontal = rows.every(r => r === rows[0]);
  const isVertical = cols.every(c => c === cols[0]);

  if (!isHorizontal && !isVertical) {
    return {
      isValid: false,
      error: 'All placed tiles must be in a single straight line (row or column).',
      words: [],
      totalScore: 0,
    };
  }

  // Create a virtual board with the newly placed tiles
  const tempBoard: BoardCell[][] = board.map(row =>
    row.map(cell => ({ ...cell, tile: cell.tile ? { ...cell.tile } : null }))
  );
  for (const pt of placedTiles) {
    tempBoard[pt.row][pt.col].tile = pt.tile;
  }

  // 3. First move rule: must cover the center square (4,4)
  if (isFirstMove) {
    const touchesCenter = placedTiles.some(pt => pt.row === CENTER_ROW && pt.col === CENTER_COL);
    if (!touchesCenter) {
      return {
        isValid: false,
        error: 'First move must use the orange center square (marked in center).',
        words: [],
        totalScore: 0,
      };
    }
  } else {
    // 4. Subsequent move rule: must connect to at least one existing tile on the board
    let connectsToExisting = false;
    for (const pt of placedTiles) {
      const neighbors = [
        { r: pt.row - 1, c: pt.col },
        { r: pt.row + 1, c: pt.col },
        { r: pt.row, c: pt.col - 1 },
        { r: pt.row, c: pt.col + 1 },
      ];

      for (const n of neighbors) {
        if (n.r >= 0 && n.r < BOARD_SIZE && n.c >= 0 && n.c < BOARD_SIZE) {
          const neighborCell = board[n.r][n.c];
          if (neighborCell.tile && !board[n.r][n.c].isTemp) {
            connectsToExisting = true;
            break;
          }
        }
      }
      if (connectsToExisting) break;
    }

    if (!connectsToExisting) {
      return {
        isValid: false,
        error: 'New words must connect to existing tiles already on the board.',
        words: [],
        totalScore: 0,
      };
    }
  }

  // 5. Check no empty gaps between newly placed tiles in the main line
  if (isHorizontal) {
    const r = rows[0];
    const minCol = Math.min(...cols);
    const maxCol = Math.max(...cols);
    for (let c = minCol; c <= maxCol; c++) {
      if (!tempBoard[r][c].tile) {
        return {
          isValid: false,
          error: 'Tiles in the word cannot have empty gaps between them.',
          words: [],
          totalScore: 0,
        };
      }
    }
  } else {
    const c = cols[0];
    const minRow = Math.min(...rows);
    const maxRow = Math.max(...rows);
    for (let r = minRow; r <= maxRow; r++) {
      if (!tempBoard[r][c].tile) {
        return {
          isValid: false,
          error: 'Tiles in the word cannot have empty gaps between them.',
          words: [],
          totalScore: 0,
        };
      }
    }
  }

  // 6. Extract all formed word segment coordinate lists
  const wordSegments: { coords: { row: number; col: number }[]; direction: 'horizontal' | 'vertical' }[] = [];
  const placedMap = new Set(placedTiles.map(pt => `${pt.row},${pt.col}`));

  // Extract main word
  if (isHorizontal) {
    const r = rows[0];
    let startC = Math.min(...cols);
    let endC = Math.max(...cols);

    while (startC > 0 && tempBoard[r][startC - 1].tile) startC--;
    while (endC < BOARD_SIZE - 1 && tempBoard[r][endC + 1].tile) endC++;

    if (endC - startC >= 1) {
      const coords: { row: number; col: number }[] = [];
      for (let c = startC; c <= endC; c++) {
        coords.push({ row: r, col: c });
      }
      wordSegments.push({ coords, direction: 'horizontal' });
    }
  } else {
    const c = cols[0];
    let startR = Math.min(...rows);
    let endR = Math.max(...rows);

    while (startR > 0 && tempBoard[startR - 1][c].tile) startR--;
    while (endR < BOARD_SIZE - 1 && tempBoard[endR + 1][c].tile) endR++;

    if (endR - startR >= 1) {
      const coords: { row: number; col: number }[] = [];
      for (let r = startR; r <= endR; r++) {
        coords.push({ row: r, col: c });
      }
      wordSegments.push({ coords, direction: 'vertical' });
    }
  }

  // Extract perpendicular cross words formed by each newly placed tile
  for (const pt of placedTiles) {
    if (isHorizontal) {
      let startR = pt.row;
      let endR = pt.row;
      while (startR > 0 && tempBoard[startR - 1][pt.col].tile) startR--;
      while (endR < BOARD_SIZE - 1 && tempBoard[endR + 1][pt.col].tile) endR++;

      if (endR - startR >= 1) {
        const coords: { row: number; col: number }[] = [];
        for (let r = startR; r <= endR; r++) {
          coords.push({ row: r, col: pt.col });
        }
        wordSegments.push({ coords, direction: 'vertical' });
      }
    } else {
      let startC = pt.col;
      let endC = pt.col;
      while (startC > 0 && tempBoard[pt.row][startC - 1].tile) startC--;
      while (endC < BOARD_SIZE - 1 && tempBoard[pt.row][endC + 1].tile) endC++;

      if (endC - startC >= 1) {
        const coords: { row: number; col: number }[] = [];
        for (let c = startC; c <= endC; c++) {
          coords.push({ row: pt.row, col: c });
        }
        wordSegments.push({ coords, direction: 'horizontal' });
      }
    }
  }

  if (wordSegments.length === 0) {
    return {
      isValid: false,
      error: 'Words must be at least 2 letters long.',
      words: [],
      totalScore: 0,
    };
  }

  // 7. Evaluate and validate each word with local dictionary + live Almaany lookup
  const formedWords: FormedWord[] = [];

  for (const segment of wordSegments) {
    const wordObj = await evaluateWordAsync(board, tempBoard, segment.coords, segment.direction, placedMap);
    if (!wordObj.isValid) {
      return {
        isValid: false,
        error: `"${wordObj.word}" is not recognized in the Arabic dictionary (معجم المعاني).`,
        words: formedWords,
        totalScore: 0,
      };
    }
    formedWords.push(wordObj);
  }

  // 8. Calculate total score with multipliers + Bingo bonus
  let totalScore = formedWords.reduce((sum, w) => sum + w.score, 0);
  if (placedTiles.length === RACK_CAPACITY) {
    totalScore += 30; // 7-letter Bingo bonus!
  }

  return {
    isValid: true,
    words: formedWords,
    totalScore,
  };
}

/**
 * Validates a proposed move synchronously (for fast AI computations)
 */
export function validateMove(
  board: BoardCell[][],
  placedTiles: PlacedTile[],
  isFirstMove: boolean
): ValidationResult {
  if (placedTiles.length === 0) {
    return { isValid: false, error: 'No tiles have been placed on the board.', words: [], totalScore: 0 };
  }

  for (const pt of placedTiles) {
    const existing = board[pt.row][pt.col].tile;
    if (existing && !board[pt.row][pt.col].isTemp) {
      return { isValid: false, error: 'Cannot place tile on an already occupied square.', words: [], totalScore: 0 };
    }
  }

  const rows = placedTiles.map(pt => pt.row);
  const cols = placedTiles.map(pt => pt.col);
  const isHorizontal = rows.every(r => r === rows[0]);
  const isVertical = cols.every(c => c === cols[0]);

  if (!isHorizontal && !isVertical) {
    return {
      isValid: false,
      error: 'All placed tiles must be in a single straight line (row or column).',
      words: [],
      totalScore: 0,
    };
  }

  const tempBoard: BoardCell[][] = board.map(row =>
    row.map(cell => ({ ...cell, tile: cell.tile ? { ...cell.tile } : null }))
  );
  for (const pt of placedTiles) {
    tempBoard[pt.row][pt.col].tile = pt.tile;
  }

  if (isFirstMove) {
    const touchesCenter = placedTiles.some(pt => pt.row === CENTER_ROW && pt.col === CENTER_COL);
    if (!touchesCenter) {
      return {
        isValid: false,
        error: 'First move must use the orange center square (marked in center).',
        words: [],
        totalScore: 0,
      };
    }
  } else {
    let connectsToExisting = false;
    for (const pt of placedTiles) {
      const neighbors = [
        { r: pt.row - 1, c: pt.col },
        { r: pt.row + 1, c: pt.col },
        { r: pt.row, c: pt.col - 1 },
        { r: pt.row, c: pt.col + 1 },
      ];

      for (const n of neighbors) {
        if (n.r >= 0 && n.r < BOARD_SIZE && n.c >= 0 && n.c < BOARD_SIZE) {
          const neighborCell = board[n.r][n.c];
          if (neighborCell.tile && !board[n.r][n.c].isTemp) {
            connectsToExisting = true;
            break;
          }
        }
      }
      if (connectsToExisting) break;
    }

    if (!connectsToExisting) {
      return {
        isValid: false,
        error: 'New words must connect to existing tiles already on the board.',
        words: [],
        totalScore: 0,
      };
    }
  }

  if (isHorizontal) {
    const r = rows[0];
    const minCol = Math.min(...cols);
    const maxCol = Math.max(...cols);
    for (let c = minCol; c <= maxCol; c++) {
      if (!tempBoard[r][c].tile) {
        return {
          isValid: false,
          error: 'Tiles in the word cannot have empty gaps between them.',
          words: [],
          totalScore: 0,
        };
      }
    }
  } else {
    const c = cols[0];
    const minRow = Math.min(...rows);
    const maxRow = Math.max(...rows);
    for (let r = minRow; r <= maxRow; r++) {
      if (!tempBoard[r][c].tile) {
        return {
          isValid: false,
          error: 'Tiles in the word cannot have empty gaps between them.',
          words: [],
          totalScore: 0,
        };
      }
    }
  }

  const formedWords: FormedWord[] = [];
  const placedMap = new Set(placedTiles.map(pt => `${pt.row},${pt.col}`));

  if (isHorizontal) {
    const r = rows[0];
    let startC = Math.min(...cols);
    let endC = Math.max(...cols);

    while (startC > 0 && tempBoard[r][startC - 1].tile) startC--;
    while (endC < BOARD_SIZE - 1 && tempBoard[r][endC + 1].tile) endC++;

    if (endC - startC >= 1) {
      const coords: { row: number; col: number }[] = [];
      for (let c = startC; c <= endC; c++) {
        coords.push({ row: r, col: c });
      }
      const wordObj = evaluateWordSync(board, tempBoard, coords, 'horizontal', placedMap);
      formedWords.push(wordObj);
    }
  } else {
    const c = cols[0];
    let startR = Math.min(...rows);
    let endR = Math.max(...rows);

    while (startR > 0 && tempBoard[startR - 1][c].tile) startR--;
    while (endR < BOARD_SIZE - 1 && tempBoard[endR + 1][c].tile) endR++;

    if (endR - startR >= 1) {
      const coords: { row: number; col: number }[] = [];
      for (let r = startR; r <= endR; r++) {
        coords.push({ row: r, col: c });
      }
      const wordObj = evaluateWordSync(board, tempBoard, coords, 'vertical', placedMap);
      formedWords.push(wordObj);
    }
  }

  for (const pt of placedTiles) {
    if (isHorizontal) {
      let startR = pt.row;
      let endR = pt.row;
      while (startR > 0 && tempBoard[startR - 1][pt.col].tile) startR--;
      while (endR < BOARD_SIZE - 1 && tempBoard[endR + 1][pt.col].tile) endR++;

      if (endR - startR >= 1) {
        const coords: { row: number; col: number }[] = [];
        for (let r = startR; r <= endR; r++) {
          coords.push({ row: r, col: pt.col });
        }
        const wordObj = evaluateWordSync(board, tempBoard, coords, 'vertical', placedMap);
        formedWords.push(wordObj);
      }
    } else {
      let startC = pt.col;
      let endC = pt.col;
      while (startC > 0 && tempBoard[pt.row][startC - 1].tile) startC--;
      while (endC < BOARD_SIZE - 1 && tempBoard[pt.row][endC + 1].tile) endC++;

      if (endC - startC >= 1) {
        const coords: { row: number; col: number }[] = [];
        for (let c = startC; c <= endC; c++) {
          coords.push({ row: pt.row, col: c });
        }
        const wordObj = evaluateWordSync(board, tempBoard, coords, 'horizontal', placedMap);
        formedWords.push(wordObj);
      }
    }
  }

  if (formedWords.length === 0) {
    return {
      isValid: false,
      error: 'Words must be at least 2 letters long.',
      words: [],
      totalScore: 0,
    };
  }

  for (const fw of formedWords) {
    const valid = arabicDictionary.isValidWord(fw.word);
    if (!valid) {
      return {
        isValid: false,
        error: `"${fw.word}" is not recognized in the Arabic dictionary.`,
        words: formedWords,
        totalScore: 0,
      };
    }
  }

  let totalScore = formedWords.reduce((sum, w) => sum + w.score, 0);
  if (placedTiles.length === RACK_CAPACITY) {
    totalScore += 30;
  }

  return {
    isValid: true,
    words: formedWords,
    totalScore,
  };
}

/**
 * Evaluates formed letters into a valid word object with live Almaany verification
 */
async function evaluateWordAsync(
  originalBoard: BoardCell[][],
  board: BoardCell[][],
  coords: { row: number; col: number }[],
  direction: 'horizontal' | 'vertical',
  placedMap: Set<string>
): Promise<FormedWord & { isValid: boolean }> {
  // In Arabic:
  // For Horizontal words: reading Right-to-Left (highest col index down to lowest col index) is standard.
  // coords is indexed from min col to max col, so reverse is Right-to-Left.
  const lettersForward = coords.map(pt => board[pt.row][pt.col].tile!.letter).join('');
  const lettersReverse = [...coords].reverse().map(pt => board[pt.row][pt.col].tile!.letter).join('');

  // Determine candidates: for horizontal, test RTL first (e.g. رحل)
  const candidateList = direction === 'horizontal' ? [lettersReverse] : [lettersForward, lettersReverse];

  let chosenWord = candidateList[0];
  let normalized = normalizeArabic(chosenWord);
  let isValid = false;
  let def = null;

  // 1. Check local dictionary
  for (const cand of candidateList) {
    if (arabicDictionary.isValidWord(cand)) {
      chosenWord = cand;
      normalized = normalizeArabic(cand);
      isValid = true;
      def = arabicDictionary.getDefinition(cand);
      break;
    }
  }

  // 2. If not found in local dictionary, check live Almaany API backend
  if (!isValid) {
    for (const cand of candidateList) {
      const liveRes = await arabicDictionary.checkWordLive(cand);
      if (liveRes.isValid) {
        chosenWord = cand;
        normalized = normalizeArabic(cand);
        isValid = true;
        def = liveRes.entry || { word: cand, translation: liveRes.definitionAr || 'Valid Arabic word', root: cand };
        break;
      }
    }
  }

  // Calculate score
  let wordScore = 0;
  let wordMultiplier = 1;

  for (const pt of coords) {
    const cell = board[pt.row][pt.col];
    const tile = cell.tile!;
    const letterScore = tile.points;

    const isNew = placedMap.has(`${pt.row},${pt.col}`) && !originalBoard[pt.row][pt.col].tile;
    if (isNew) {
      if (cell.multiplierType === '2X') {
        wordMultiplier *= 2;
      } else if (cell.multiplierType === '3X') {
        wordMultiplier *= 3;
      } else if (cell.multiplierType === '4X') {
        wordMultiplier *= 4;
      }
    }

    wordScore += letterScore;
  }

  wordScore *= wordMultiplier;

  return {
    word: chosenWord,
    normalized,
    direction,
    coords,
    score: wordScore,
    definition: def?.translation,
    root: def?.root,
    isValid,
  };
}

/**
 * Synchronous word evaluation (for fast AI move generator)
 */
function evaluateWordSync(
  originalBoard: BoardCell[][],
  board: BoardCell[][],
  coords: { row: number; col: number }[],
  direction: 'horizontal' | 'vertical',
  placedMap: Set<string>
): FormedWord {
  const lettersForward = coords.map(pt => board[pt.row][pt.col].tile!.letter).join('');
  const lettersReverse = [...coords].reverse().map(pt => board[pt.row][pt.col].tile!.letter).join('');

  const candidateList = direction === 'horizontal' ? [lettersReverse] : [lettersForward, lettersReverse];

  let chosenWord = candidateList[0];
  let normalized = normalizeArabic(chosenWord);

  for (const cand of candidateList) {
    if (arabicDictionary.isValidWord(cand)) {
      chosenWord = cand;
      normalized = normalizeArabic(cand);
      break;
    }
  }

  let wordScore = 0;
  let wordMultiplier = 1;

  for (const pt of coords) {
    const cell = board[pt.row][pt.col];
    const tile = cell.tile!;
    const letterScore = tile.points;

    const isNew = placedMap.has(`${pt.row},${pt.col}`) && !originalBoard[pt.row][pt.col].tile;
    if (isNew) {
      if (cell.multiplierType === '2X') wordMultiplier *= 2;
      else if (cell.multiplierType === '3X') wordMultiplier *= 3;
      else if (cell.multiplierType === '4X') wordMultiplier *= 4;
    }

    wordScore += letterScore;
  }

  wordScore *= wordMultiplier;
  const def = arabicDictionary.getDefinition(chosenWord);

  return {
    word: chosenWord,
    normalized,
    direction,
    coords,
    score: wordScore,
    definition: def?.translation,
    root: def?.root,
  };
}

/**
 * Computer AI Opponent: Finds legal Arabic moves on the board
 */
export function findComputerMove(
  board: BoardCell[][],
  computerRack: Tile[],
  isFirstMove: boolean
): { placedTiles: PlacedTile[]; validation: ValidationResult } | null {
  const rackLetters = computerRack.map(t => t.letter);

  // 1. If it's the first move: must form a word covering (4,4) with 3 or 4 letters (NEVER 2)
  if (isFirstMove) {
    const candidateWords = arabicDictionary
      .findFormableWords(rackLetters)
      .filter((entry) => entry.word.length >= 3 && entry.word.length <= BOARD_SIZE); // STRICT: NEVER 2 letters

    // Prioritize 4-letter words, then 3-letter words, then 5-letter words
    candidateWords.sort((a, b) => {
      const getPriority = (len: number) => {
        if (len === 4) return 100;
        if (len === 3) return 90;
        if (len === 5) return 80;
        return len;
      };
      return getPriority(b.word.length) - getPriority(a.word.length);
    });

    for (const entry of candidateWords) {
      const word = entry.word;
      if (word.length < 3 || word.length > BOARD_SIZE) continue; // NEVER 2 letters

      // 1A. Try horizontal placements that cover center square (4,4)
      for (let offset = 0; offset < word.length; offset++) {
        const startCol = CENTER_COL - offset;
        if (startCol >= 0 && startCol + word.length <= BOARD_SIZE) {
          const placedTiles: PlacedTile[] = [];
          const usedRackIndices = new Set<number>();
          let matched = true;

          for (let i = 0; i < word.length; i++) {
            const char = word[i];
            const rackIdx = computerRack.findIndex(
              (t, idx) => !usedRackIndices.has(idx) && normalizeArabic(t.letter) === normalizeArabic(char)
            );

            if (rackIdx === -1) {
              matched = false;
              break;
            }
            usedRackIndices.add(rackIdx);
            placedTiles.push({
              row: CENTER_ROW,
              col: startCol + (word.length - 1 - i), // right to left
              tile: computerRack[rackIdx],
            });
          }

          if (matched) {
            const val = validateMove(board, placedTiles, true);
            if (val.isValid && val.words.every((w) => w.word.length >= 3)) {
              return { placedTiles, validation: val };
            }
          }
        }
      }

      // 1B. Try vertical placements that cover center square (4,4)
      for (let offset = 0; offset < word.length; offset++) {
        const startRow = CENTER_ROW - offset;
        if (startRow >= 0 && startRow + word.length <= BOARD_SIZE) {
          const placedTiles: PlacedTile[] = [];
          const usedRackIndices = new Set<number>();
          let matched = true;

          for (let i = 0; i < word.length; i++) {
            const char = word[i];
            const rackIdx = computerRack.findIndex(
              (t, idx) => !usedRackIndices.has(idx) && normalizeArabic(t.letter) === normalizeArabic(char)
            );

            if (rackIdx === -1) {
              matched = false;
              break;
            }
            usedRackIndices.add(rackIdx);
            placedTiles.push({
              row: startRow + i,
              col: CENTER_COL,
              tile: computerRack[rackIdx],
            });
          }

          if (matched) {
            const val = validateMove(board, placedTiles, true);
            if (val.isValid && val.words.every((w) => w.word.length >= 3)) {
              return { placedTiles, validation: val };
            }
          }
        }
      }
    }
  }

  // 2. Subsequent moves: Look for anchor letters on the board
  const anchors: { row: number; col: number; tile: Tile }[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c].tile) {
        anchors.push({ row: r, col: c, tile: board[r][c].tile! });
      }
    }
  }

  // Search candidate words matching anchors
  for (const anchor of anchors) {
    const matchingWords = arabicDictionary.findFormableWords(rackLetters, { char: anchor.tile.letter });
    // Prioritize 4, 3, and 5 letter words
    matchingWords.sort((a, b) => {
      const getPriority = (len: number) => {
        if (len === 4) return 100;
        if (len === 3) return 90;
        if (len >= 5) return 85;
        return len;
      };
      return getPriority(b.word.length) - getPriority(a.word.length);
    });
    // Try top scoring candidate words
    for (const entry of matchingWords.slice(0, 20)) {
      const word = entry.word;
      const charIndex = word.indexOf(normalizeArabic(anchor.tile.letter));
      if (charIndex === -1) continue;

      // Try Horizontal placement intersecting anchor
      const startCol = anchor.col - (word.length - 1 - charIndex); // right to left
      if (startCol >= 0 && startCol + word.length <= BOARD_SIZE) {
        const placedTiles: PlacedTile[] = [];
        const usedRackIndices = new Set<number>();
        let possible = true;

        for (let i = 0; i < word.length; i++) {
          const targetCol = startCol + (word.length - 1 - i); // right to left
          const targetChar = word[i];
          const existingTile = board[anchor.row][targetCol].tile;

          if (existingTile) {
            if (normalizeArabic(existingTile.letter) !== normalizeArabic(targetChar)) {
              possible = false;
              break;
            }
          } else {
            const rackIdx = computerRack.findIndex(
              (t, idx) => !usedRackIndices.has(idx) && normalizeArabic(t.letter) === normalizeArabic(targetChar)
            );
            if (rackIdx === -1) {
              possible = false;
              break;
            }
            usedRackIndices.add(rackIdx);
            placedTiles.push({
              row: anchor.row,
              col: targetCol,
              tile: computerRack[rackIdx],
            });
          }
        }

        if (possible && placedTiles.length > 0) {
          const val = validateMove(board, placedTiles, false);
          if (val.isValid) {
            return { placedTiles, validation: val };
          }
        }
      }

      // Try Vertical placement intersecting anchor
      const startRow = anchor.row - charIndex;
      if (startRow >= 0 && startRow + word.length <= BOARD_SIZE) {
        const placedTiles: PlacedTile[] = [];
        const usedRackIndices = new Set<number>();
        let possible = true;

        for (let i = 0; i < word.length; i++) {
          const targetRow = startRow + i;
          const targetChar = word[i];
          const existingTile = board[targetRow][anchor.col].tile;

          if (existingTile) {
            if (normalizeArabic(existingTile.letter) !== normalizeArabic(targetChar)) {
              possible = false;
              break;
            }
          } else {
            const rackIdx = computerRack.findIndex(
              (t, idx) => !usedRackIndices.has(idx) && normalizeArabic(t.letter) === normalizeArabic(targetChar)
            );
            if (rackIdx === -1) {
              possible = false;
              break;
            }
            usedRackIndices.add(rackIdx);
            placedTiles.push({
              row: targetRow,
              col: anchor.col,
              tile: computerRack[rackIdx],
            });
          }
        }

        if (possible && placedTiles.length > 0) {
          const val = validateMove(board, placedTiles, false);
          if (val.isValid) {
            return { placedTiles, validation: val };
          }
        }
      }
    }
  }

  return null;
}
