import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LetterGrid } from "./GameLetterGrid";
import { WordList } from "./WordList";
import { CurrentWordOverlay } from "./CurrentWordOverlay";
import { ThemedBackground } from "./ThemedBackground";
import { PuzzleComplete } from "./PuzzleComplete";
import { DailyPuzzleComplete } from "./DailyPuzzleComplete";
import { HintButton } from "./HintButton";
import { TimerDisplay } from "./TimerDisplay";
import {
  useSwipeSelection,
  type CellPosition,
} from "../hooks/useSwipeSelection";
import { useAudio } from "../hooks/useAudio";
import {
  type ThemeId,
  FOUND_WORD_COLORS,
  LEVEL_CONFIG,
  TIMED_MODE_SECONDS,
} from "../utils/themes";
import {
  useStartPuzzle,
  useCompletePuzzle,
  useUseHint,
  useBuyHint,
  useCompleteDailyPuzzle,
  type SavedPuzzle,
} from "../hooks/useQueries";
import {
  generatePuzzle,
  generateSeededPuzzle,
  selectWordsForLevel,
  findWordInGrid,
  type PuzzleResult,
} from "../utils/puzzleGenerator";
import { getWordList } from "../utils/wordLists";
import { useSettingsStore } from "../stores/settingsStore";
import { toast } from "sonner";
import { PostcardRevealDialog } from "./PostcardRevealDialog";
import { useTranslation } from "../locales";

interface FoundWordEntry {
  word: string;
  cells: CellPosition[];
  color: string;
}

interface GameBoardProps {
  themeId: ThemeId;
  level: number;
  savedPuzzle: SavedPuzzle | null;
  isLastLevelInTheme: boolean;
  isLastTheme: boolean;
  hints: number;
  lastHintRegenTime: number;
  coins: number;
  onNextPuzzle?: () => void;
  onBackToJourney: () => void;
  onViewCollection: () => void;
  isDailyMode?: boolean;
  dailySeed?: number;
  onDailyComplete?: () => void;
}

export function GameBoard({
  themeId,
  level,
  savedPuzzle,
  isLastLevelInTheme,
  isLastTheme,
  hints,
  lastHintRegenTime,
  coins,
  onNextPuzzle,
  onBackToJourney,
  onViewCollection,
  isDailyMode = false,
  dailySeed,
  onDailyComplete,
}: GameBoardProps) {
  const language = useSettingsStore((s) => s.language);
  const timedModeEnabled = useSettingsStore((s) => s.timedModeEnabled);
  const { t } = useTranslation();
  const levelConfig = LEVEL_CONFIG[level] ?? LEVEL_CONFIG[1];
  const timerSeconds = TIMED_MODE_SECONDS[levelConfig.gridSize] ?? 60;
  const {
    playWordFound,
    playInvalidSelection,
    playPuzzleComplete,
    playHintUsed,
    playLetterSwipe,
  } = useAudio();

  const { mutate: doStartPuzzle } = useStartPuzzle();
  const { mutateAsync: completePuzzle } = useCompletePuzzle();
  const { mutateAsync: completeDailyPuzzle } = useCompleteDailyPuzzle();
  const { mutate: doUseHint, isPending: isUsingHint } = useUseHint();
  const { mutate: doBuyHint, isPending: isBuyingHint } = useBuyHint();

  // Check if we can restore from saved state (not allowed in timed mode to prevent timer exploit)
  const canRestore =
    !timedModeEnabled &&
    savedPuzzle &&
    savedPuzzle.themeId === themeId &&
    savedPuzzle.puzzleIndex === level - 1;

  // Generate or restore puzzle (computed once on mount via useState initializer)
  const [puzzle] = useState<PuzzleResult>(() => {
    if (canRestore) {
      return {
        grid: savedPuzzle.grid,
        words: savedPuzzle.words,
        placedWords: [],
        size: savedPuzzle.grid.length,
      };
    }
    const wordPool = getWordList(language, themeId);
    if (isDailyMode && dailySeed !== undefined) {
      const words = selectWordsForLevel(wordPool, levelConfig, dailySeed);
      return generateSeededPuzzle(words, levelConfig.gridSize, dailySeed);
    }
    const words = selectWordsForLevel(wordPool, levelConfig);
    return generatePuzzle(words, levelConfig.gridSize);
  });

  // Initialize found words from saved state
  const [foundWordEntries, setFoundWordEntries] = useState<FoundWordEntry[]>(
    () => {
      if (canRestore) {
        return savedPuzzle.foundWords.map((word, i) => ({
          word,
          cells: findWordInGrid(savedPuzzle.grid, word) ?? [],
          color: FOUND_WORD_COLORS[i % FOUND_WORD_COLORS.length],
        }));
      }
      return [];
    },
  );

  const [hintsUsed, setHintsUsed] = useState(() =>
    canRestore ? savedPuzzle.hintsUsed : 0,
  );
  const [hintedCells, setHintedCells] = useState<CellPosition[] | null>(null);
  const [completionSent, setCompletionSent] = useState(false);
  const [showPostcardReveal, setShowPostcardReveal] = useState(false);
  const [isFirstTimeCompletion, setIsFirstTimeCompletion] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [completedInTime, setCompletedInTime] = useState(false);
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isComplete =
    puzzle.words.length > 0 && foundWordEntries.length === puzzle.words.length;

  // Timer is only active in timed mode, not in daily mode
  const showTimer = timedModeEnabled && !isDailyMode;
  const isTimerRunning = showTimer && !isComplete && !timerExpired;

  const handleTimeUp = useCallback(() => {
    setTimerExpired(true);
  }, []);

  // Always sync puzzle to backend on mount (server preserves existing matching puzzle)
  useEffect(() => {
    doStartPuzzle({
      themeId,
      puzzleIndex: level - 1,
      grid: puzzle.grid,
      words: puzzle.words,
    });
    // Only run on mount
  }, []);

  // Trigger puzzle completion
  const triggerCompletion = useCallback(async () => {
    if (completionSent) return;
    setCompletionSent(true);
    playPuzzleComplete();

    const wasCompletedInTime = showTimer && !timerExpired;
    setCompletedInTime(wasCompletedInTime);

    try {
      if (isDailyMode) {
        await completeDailyPuzzle({ hintsUsed });
      } else {
        const isFirstTime = await completePuzzle({
          hintsUsed,
          timedCompletion: wasCompletedInTime,
        });
        setIsFirstTimeCompletion(isFirstTime);
      }
    } catch (error) {
      toast.error(
        isDailyMode ? t("errors.dailyComplete") : t("errors.completePuzzle"),
      );
    }
  }, [
    completionSent,
    playPuzzleComplete,
    showTimer,
    timerExpired,
    isDailyMode,
    completeDailyPuzzle,
    completePuzzle,
    t,
    hintsUsed,
  ]);

  const handleSelectionComplete = useCallback(
    (cells: CellPosition[]) => {
      if (isComplete) return;

      const letters = cells.map((c) => puzzle.grid[c.row][c.col]).join("");
      const reversed = [...letters].reverse().join("");

      const matchedWord = puzzle.words.find(
        (w) =>
          !foundWordEntries.some((e) => e.word === w) &&
          (w === letters || w === reversed),
      );

      if (matchedWord) {
        playWordFound();
        const isLastWord = foundWordEntries.length + 1 === puzzle.words.length;

        setFoundWordEntries((prev) => [
          ...prev,
          {
            word: matchedWord,
            cells,
            color: FOUND_WORD_COLORS[prev.length % FOUND_WORD_COLORS.length],
          },
        ]);

        // Complete if last word
        if (isLastWord) {
          triggerCompletion();
        }
      } else if (cells.length > 1) {
        playInvalidSelection();
      }
    },
    [
      puzzle,
      foundWordEntries,
      isComplete,
      playWordFound,
      playInvalidSelection,
      triggerCompletion,
    ],
  );

  const handleUseHint = useCallback(() => {
    const unfoundWords = puzzle.words.filter(
      (w) => !foundWordEntries.some((e) => e.word === w),
    );
    if (unfoundWords.length === 0) return;

    const word = unfoundWords[Math.floor(Math.random() * unfoundWords.length)];
    const cells = findWordInGrid(puzzle.grid, word);
    if (!cells || cells.length === 0) return;

    doUseHint(undefined, {
      onSuccess: () => {
        playHintUsed();
        setHintedCells([cells[0]]);
        setHintsUsed((prev) => prev + 1);
        if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
        hintTimeoutRef.current = setTimeout(() => setHintedCells(null), 3000);
      },
      onError: () => {
        toast.error(t("errors.useHint"));
      },
    });
  }, [puzzle, foundWordEntries, doUseHint, playHintUsed, t]);

  // Cleanup hint timeout on unmount
  useEffect(() => {
    return () => {
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    };
  }, []);

  const handleBuyHint = useCallback(() => {
    doBuyHint(undefined, {
      onError: () => {
        toast.error(t("errors.buyHint"));
      },
    });
  }, [doBuyHint, t]);

  const { selectedCells, gridRef, gridProps } = useSwipeSelection({
    onSelectionComplete: handleSelectionComplete,
    onCellAdded: playLetterSwipe,
  });

  const foundWords = useMemo(
    () => new Set(foundWordEntries.map((e) => e.word)),
    [foundWordEntries],
  );
  const foundWordColors = useMemo(
    () => new Map(foundWordEntries.map((e) => [e.word, e.color])),
    [foundWordEntries],
  );

  return (
    <ThemedBackground themeId={themeId}>
      <div className="flex justify-between items-center mb-2">
        {showTimer ? (
          <TimerDisplay
            initialSeconds={timerSeconds}
            isRunning={isTimerRunning}
            onTimeUp={handleTimeUp}
          />
        ) : (
          <div />
        )}
        <HintButton
          storedHints={hints}
          lastHintRegenTimeNs={lastHintRegenTime}
          coins={coins}
          disabled={isComplete}
          isUsingHint={isUsingHint}
          isBuyingHint={isBuyingHint}
          onUseHint={handleUseHint}
          onBuyHint={handleBuyHint}
        />
      </div>
      <WordList
        words={puzzle.words}
        foundWords={foundWords}
        foundWordColors={foundWordColors}
      />
      <div className="relative mt-3">
        <CurrentWordOverlay grid={puzzle.grid} selectedCells={selectedCells} />
        <LetterGrid
          grid={puzzle.grid}
          selectedCells={selectedCells}
          foundWords={foundWordEntries}
          hintedCells={hintedCells}
          gridRef={gridRef}
          gridEventHandlers={gridProps}
        />
      </div>
      {isDailyMode ? (
        <DailyPuzzleComplete
          open={isComplete}
          wordsFound={foundWordEntries.length}
          hintsUsed={hintsUsed}
          onBackToHome={onDailyComplete ?? (() => {})}
        />
      ) : (
        <PuzzleComplete
          open={isComplete && !showPostcardReveal}
          wordsFound={foundWordEntries.length}
          hintsUsed={hintsUsed}
          isLastLevelInTheme={isLastLevelInTheme && isFirstTimeCompletion}
          isLastTheme={isLastTheme}
          timedCompletion={completedInTime}
          onNextPuzzle={
            isLastLevelInTheme && isFirstTimeCompletion
              ? () => setShowPostcardReveal(true)
              : (onNextPuzzle ?? (() => {}))
          }
          onBackToJourney={
            isLastLevelInTheme && isFirstTimeCompletion
              ? () => setShowPostcardReveal(true)
              : onBackToJourney
          }
        />
      )}
      <PostcardRevealDialog
        open={showPostcardReveal}
        themeId={themeId}
        onContinue={() => {
          setShowPostcardReveal(false);
          if (isLastTheme) {
            onBackToJourney();
          } else {
            (onNextPuzzle ?? onBackToJourney)();
          }
        }}
        onViewCollection={() => {
          setShowPostcardReveal(false);
          onViewCollection();
        }}
      />
    </ThemedBackground>
  );
}
