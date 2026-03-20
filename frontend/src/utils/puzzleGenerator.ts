import type { LevelConfig } from "../utils/themes";

export interface CellPosition {
  row: number;
  col: number;
}

export interface PlacedWord {
  word: string;
  cells: CellPosition[];
}

export interface PuzzleResult {
  grid: string[][];
  words: string[];
  placedWords: PlacedWord[];
  size: number;
}

interface Direction {
  row: number;
  col: number;
}

const DIRECTIONS: Direction[] = [
  { row: 0, col: 1 }, // right
  { row: 0, col: -1 }, // left
  { row: 1, col: 0 }, // down
  { row: -1, col: 0 }, // up
  { row: 1, col: 1 }, // diagonal down-right
  { row: 1, col: -1 }, // diagonal down-left
  { row: -1, col: 1 }, // diagonal up-right
  { row: -1, col: -1 }, // diagonal up-left
];

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Mulberry32 seeded PRNG (deterministic)
function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Find a word's cell positions in a grid by scanning all positions/directions.
// Used to restore found word highlights from backend saved state.
export function findWordInGrid(
  grid: string[][],
  word: string,
): CellPosition[] | null {
  const size = grid.length;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] !== word[0]) continue;
      for (const dir of DIRECTIONS) {
        const cells: CellPosition[] = [];
        let found = true;
        for (let i = 0; i < word.length; i++) {
          const r = row + i * dir.row;
          const c = col + i * dir.col;
          if (
            r < 0 ||
            r >= size ||
            c < 0 ||
            c >= size ||
            grid[r][c] !== word[i]
          ) {
            found = false;
            break;
          }
          cells.push({ row: r, col: c });
        }
        if (found) return cells;
      }
    }
  }
  return null;
}

function createEmptyGrid(size: number): string[][] {
  return Array.from({ length: size }, () => Array(size).fill(""));
}

function canPlaceWord(
  grid: string[][],
  word: string,
  startRow: number,
  startCol: number,
  direction: Direction,
  size: number,
): boolean {
  for (let i = 0; i < word.length; i++) {
    const row = startRow + i * direction.row;
    const col = startCol + i * direction.col;

    if (row < 0 || row >= size || col < 0 || col >= size) return false;
    if (grid[row][col] !== "" && grid[row][col] !== word[i]) return false;
  }
  return true;
}

function placeWord(
  grid: string[][],
  word: string,
  startRow: number,
  startCol: number,
  direction: Direction,
): CellPosition[] {
  const cells: CellPosition[] = [];
  for (let i = 0; i < word.length; i++) {
    const row = startRow + i * direction.row;
    const col = startCol + i * direction.col;
    grid[row][col] = word[i];
    cells.push({ row, col });
  }
  return cells;
}

// Shuffle an array in-place (Fisher-Yates)
function shuffle<T>(array: T[], random: () => number = Math.random): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function tryPlaceWord(
  grid: string[][],
  word: string,
  size: number,
  maxAttempts: number = 100,
  random: () => number = Math.random,
): CellPosition[] | null {
  const shuffledDirections = shuffle([...DIRECTIONS], random);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const direction = shuffledDirections[attempt % shuffledDirections.length];
    const startRow = Math.floor(random() * size);
    const startCol = Math.floor(random() * size);

    if (canPlaceWord(grid, word, startRow, startCol, direction, size)) {
      return placeWord(grid, word, startRow, startCol, direction);
    }
  }

  return null;
}

function fillEmptyCells(
  grid: string[][],
  random: () => number = Math.random,
): void {
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] === "") {
        grid[row][col] = LETTERS[Math.floor(random() * LETTERS.length)];
      }
    }
  }
}

export function selectWordsForLevel(
  wordPool: string[],
  levelConfig: LevelConfig,
  seed?: number,
): string[] {
  const { wordCount, wordLengthRange } = levelConfig;
  const [minLen, maxLen] = wordLengthRange;
  const random = seed !== undefined ? mulberry32(seed) : Math.random;

  const eligible = wordPool.filter(
    (w) => w.length >= minLen && w.length <= maxLen,
  );

  if (eligible.length < wordCount) {
    // Fall back to any words that fit in the grid
    const fallback = wordPool.filter((w) => w.length <= levelConfig.gridSize);
    return shuffle([...fallback], random).slice(0, wordCount);
  }

  return shuffle([...eligible], random).slice(0, wordCount);
}

export function generatePuzzle(
  words: string[],
  size: number,
  maxRetries: number = 10,
  seed?: number,
): PuzzleResult {
  // Sort words longest-first for better placement
  const sortedWords = [...words].sort((a, b) => b.length - a.length);
  const random = seed !== undefined ? mulberry32(seed) : Math.random;

  for (let retry = 0; retry < maxRetries; retry++) {
    const grid = createEmptyGrid(size);
    const placedWords: PlacedWord[] = [];
    let allPlaced = true;

    for (const word of sortedWords) {
      const cells = tryPlaceWord(grid, word, size, 100, random);
      if (cells) {
        placedWords.push({ word, cells });
      } else {
        allPlaced = false;
        break;
      }
    }

    if (allPlaced) {
      fillEmptyCells(grid, random);
      return {
        grid,
        words: placedWords.map((pw) => pw.word),
        placedWords,
        size,
      };
    }
  }

  // Last resort: place as many words as possible
  const grid = createEmptyGrid(size);
  const placedWords: PlacedWord[] = [];

  for (const word of sortedWords) {
    const cells = tryPlaceWord(grid, word, size, 200, random);
    if (cells) {
      placedWords.push({ word, cells });
    }
  }

  fillEmptyCells(grid, random);
  return {
    grid,
    words: placedWords.map((pw) => pw.word),
    placedWords,
    size,
  };
}

export function generateSeededPuzzle(
  words: string[],
  size: number,
  seed: number,
): PuzzleResult {
  return generatePuzzle(words, size, 10, seed);
}
