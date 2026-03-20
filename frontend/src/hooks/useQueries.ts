import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";
import { getEffectiveHints } from "../utils/hintHelpers";

// Types

export interface SavedPuzzle {
  themeId: string;
  puzzleIndex: number;
  grid: string[][];
  words: string[];
  foundWords: string[];
  hintsUsed: number;
}

export interface GameProgress {
  coins: number;
  hints: number;
  lastHintRegenTime: number;
  themeProgress: Array<[string, number]>;
  currentPuzzle: SavedPuzzle | null;
  lastDailyCompletion: number;
}

export interface DailyPuzzleInfo {
  themeId: string;
  level: number;
  seed: number;
  alreadyCompleted: boolean;
}

// Helper functions

const PROGRESS_CACHE_KEY = "word-search-progress";

function getCachedProgress(): GameProgress | null {
  try {
    const cached = localStorage.getItem(PROGRESS_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function setCachedProgress(progress: GameProgress): void {
  try {
    localStorage.setItem(PROGRESS_CACHE_KEY, JSON.stringify(progress));
  } catch {
    // localStorage full or unavailable
  }
}

// Convert backend bigints to frontend numbers
// caffeine-bindgen converts Motoko optionals to T | null at runtime
function convertProgress(raw: {
  coins: bigint;
  hints: bigint;
  lastHintRegenTime: bigint;
  themeProgress: Array<[string, bigint]>;
  currentPuzzle?: unknown;
  lastDailyCompletion: bigint;
}): GameProgress {
  const puzzle = raw.currentPuzzle as {
    themeId: string;
    puzzleIndex: bigint;
    grid: string[][];
    words: string[];
    foundWords: string[];
    hintsUsed: bigint;
  } | null;

  return {
    coins: Number(raw.coins),
    hints: Number(raw.hints),
    lastHintRegenTime: Number(raw.lastHintRegenTime),
    themeProgress: raw.themeProgress.map(
      ([id, level]) => [id, Number(level)] as [string, number],
    ),
    currentPuzzle: puzzle
      ? {
          themeId: puzzle.themeId,
          puzzleIndex: Number(puzzle.puzzleIndex),
          grid: puzzle.grid,
          words: puzzle.words,
          foundWords: puzzle.foundWords,
          hintsUsed: Number(puzzle.hintsUsed),
        }
      : null,
    lastDailyCompletion: Number(raw.lastDailyCompletion),
  };
}

function convertDailyInfo(raw: {
  themeId: string;
  level: bigint;
  seed: bigint;
  alreadyCompleted: boolean;
}): DailyPuzzleInfo {
  return {
    themeId: raw.themeId,
    level: Number(raw.level),
    seed: Number(raw.seed),
    alreadyCompleted: raw.alreadyCompleted,
  };
}

// Query key hooks

function useProgressQueryKey() {
  const { identity } = useInternetIdentity();
  return ["progress", identity?.getPrincipal().toString()];
}

function useDailyQueryKey() {
  const { identity } = useInternetIdentity();
  return ["dailyPuzzle", identity?.getPrincipal().toString()];
}

// Profile hooks

export function useProfile() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ["profile", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.getProfile();
      return result ?? null;
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useSetProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.setProfile(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile", identity?.getPrincipal().toString()],
      });
    },
  });
}

// Progress hooks

export function useProgress() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const queryKey = useProgressQueryKey();

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.getProgress();
      const progress = convertProgress(result);
      setCachedProgress(progress);
      return progress;
    },
    enabled: !!actor && !isFetching && !!identity,
    placeholderData: () => getCachedProgress() ?? undefined,
  });
}

export function useStartPuzzle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const queryKey = useProgressQueryKey();

  return useMutation({
    mutationFn: async ({
      themeId,
      puzzleIndex,
      grid,
      words,
    }: {
      themeId: string;
      puzzleIndex: number;
      grid: string[][];
      words: string[];
    }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.startPuzzle(themeId, BigInt(puzzleIndex), grid, words);
    },
    onSuccess: (_, { themeId, puzzleIndex, grid, words }) => {
      const previous = queryClient.getQueryData<GameProgress>(queryKey);
      if (previous) {
        const updated = {
          ...previous,
          currentPuzzle: {
            themeId,
            puzzleIndex,
            grid,
            words,
            foundWords: [],
            hintsUsed: 0,
          },
        };
        queryClient.setQueryData(queryKey, updated);
        setCachedProgress(updated);
      }
    },
  });
}

export function useSaveFoundWord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const queryKey = useProgressQueryKey();

  return useMutation({
    mutationFn: async ({ word }: { word: string }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.saveFoundWord(word);
    },
    onSuccess: (_, { word }) => {
      const previous = queryClient.getQueryData<GameProgress>(queryKey);
      if (previous?.currentPuzzle) {
        const updated = {
          ...previous,
          currentPuzzle: {
            ...previous.currentPuzzle,
            foundWords: [...previous.currentPuzzle.foundWords, word],
          },
        };
        queryClient.setQueryData(queryKey, updated);
        setCachedProgress(updated);
      }
    },
  });
}

export function useCompletePuzzle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const queryKey = useProgressQueryKey();

  return useMutation({
    mutationFn: async ({
      hintsUsed,
      timedCompletion,
    }: {
      hintsUsed: number;
      timedCompletion: boolean;
    }): Promise<boolean> => {
      if (!actor) throw new Error("Actor not ready");
      // Returns true if first-time completion, false if replay
      return actor.completePuzzle(BigInt(hintsUsed), timedCompletion);
    },
    onSuccess: (isFirstTime, { hintsUsed, timedCompletion }) => {
      const previous = queryClient.getQueryData<GameProgress>(queryKey);
      if (previous) {
        const puzzleIndex = previous.currentPuzzle?.puzzleIndex ?? 0;
        const completedLevel = puzzleIndex + 1;

        // Base coins: 20 if no hints, 10 otherwise
        let earnedCoins = hintsUsed === 0 ? 20 : 10;

        // Timed completion bonus
        if (timedCompletion) {
          earnedCoins += 10;
        }

        // Chapter completion bonus - only on first-time completion of level 5
        const isChapterComplete = completedLevel === 5 && isFirstTime;
        if (isChapterComplete) {
          earnedCoins += 50;
        }

        // Update themeProgress
        const themeId = previous.currentPuzzle?.themeId;
        let themeProgress = previous.themeProgress;
        if (themeId) {
          const existing = themeProgress.find(([id]) => id === themeId);
          if (existing) {
            themeProgress = themeProgress.map(([id, level]) =>
              id === themeId
                ? [id, Math.max(level, completedLevel)]
                : [id, level],
            ) as Array<[string, number]>;
          } else {
            themeProgress = [...themeProgress, [themeId, completedLevel]];
          }
        }

        // Hint bonus: 2 if no hints used, 1 otherwise
        const hintBonus = isChapterComplete ? (hintsUsed === 0 ? 2 : 1) : 0;
        const effectiveHints = getEffectiveHints(
          previous.hints,
          previous.lastHintRegenTime,
        );

        const updated: GameProgress = {
          ...previous,
          coins: previous.coins + earnedCoins,
          hints: Math.min(effectiveHints + hintBonus, 5),
          lastHintRegenTime: Date.now() * 1_000_000,
          themeProgress,
          currentPuzzle: null,
        };
        queryClient.setQueryData(queryKey, updated);
        setCachedProgress(updated);
      }
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useClearCurrentPuzzle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const queryKey = useProgressQueryKey();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      await actor.clearCurrentPuzzle();
    },
    onSuccess: () => {
      const previous = queryClient.getQueryData<GameProgress>(queryKey);
      if (previous) {
        const updated: GameProgress = {
          ...previous,
          currentPuzzle: null,
        };
        queryClient.setQueryData(queryKey, updated);
        setCachedProgress(updated);
      }
    },
  });
}

// Hint hooks

export function useUseHint() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const queryKey = useProgressQueryKey();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      await actor.useHint();
    },
    onSuccess: () => {
      const previous = queryClient.getQueryData<GameProgress>(queryKey);
      if (previous) {
        const effective = getEffectiveHints(
          previous.hints,
          previous.lastHintRegenTime,
        );
        const updated: GameProgress = {
          ...previous,
          hints: effective - 1,
          lastHintRegenTime: Date.now() * 1_000_000,
        };
        queryClient.setQueryData(queryKey, updated);
        setCachedProgress(updated);
      }
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useBuyHint() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const queryKey = useProgressQueryKey();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      await actor.buyHint();
    },
    onSuccess: () => {
      const previous = queryClient.getQueryData<GameProgress>(queryKey);
      if (previous) {
        const effective = getEffectiveHints(
          previous.hints,
          previous.lastHintRegenTime,
        );
        const updated: GameProgress = {
          ...previous,
          coins: previous.coins - 100,
          hints: effective + 1,
          lastHintRegenTime: Date.now() * 1_000_000,
        };
        queryClient.setQueryData(queryKey, updated);
        setCachedProgress(updated);
      }
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

// Daily puzzle hooks

export function useDailyPuzzle() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const queryKey = useDailyQueryKey();

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.getDailyPuzzle();
      return convertDailyInfo(result);
    },
    enabled: !!actor && !isFetching && !!identity,
    staleTime: 60_000,
  });
}

export function useCompleteDailyPuzzle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const dailyQueryKey = useDailyQueryKey();
  const progressQueryKey = useProgressQueryKey();

  return useMutation({
    mutationFn: async ({ hintsUsed }: { hintsUsed: number }) => {
      if (!actor) throw new Error("Actor not ready");
      const earnedCoins = await actor.completeDailyPuzzle(BigInt(hintsUsed));
      return Number(earnedCoins);
    },
    onSuccess: (earnedCoins) => {
      // Update daily puzzle to show completed
      queryClient.setQueryData<DailyPuzzleInfo>(dailyQueryKey, (old) =>
        old ? { ...old, alreadyCompleted: true } : old,
      );

      // Update progress with new coins
      const previous = queryClient.getQueryData<GameProgress>(progressQueryKey);
      if (previous) {
        const updated: GameProgress = {
          ...previous,
          coins: previous.coins + earnedCoins,
          lastDailyCompletion: Date.now() * 1_000_000,
        };
        queryClient.setQueryData(progressQueryKey, updated);
        setCachedProgress(updated);
      }

      queryClient.invalidateQueries({ queryKey: progressQueryKey });
      queryClient.invalidateQueries({ queryKey: dailyQueryKey });
    },
  });
}
