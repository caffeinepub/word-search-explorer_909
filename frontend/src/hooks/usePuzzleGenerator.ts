import { useMemo } from "react";
import {
  generatePuzzle,
  selectWordsForLevel,
  type PuzzleResult,
} from "../utils/puzzleGenerator";
import { LEVEL_CONFIG, type ThemeId } from "../utils/themes";
import { getWordList } from "../utils/wordLists";
import { useSettingsStore } from "../stores/settingsStore";

export function usePuzzleGenerator(
  theme: ThemeId,
  level: number,
  seed?: number,
): PuzzleResult {
  const language = useSettingsStore((s) => s.language);
  const levelConfig = LEVEL_CONFIG[level] ?? LEVEL_CONFIG[1];

  return useMemo(() => {
    // Use seed to force re-generation when needed
    void seed;

    const wordPool = getWordList(language, theme);
    const words = selectWordsForLevel(wordPool, levelConfig);
    return generatePuzzle(words, levelConfig.gridSize);
  }, [theme, level, language, levelConfig, seed]);
}
