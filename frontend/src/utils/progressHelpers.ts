import { THEMES, type ThemeId } from "../utils/themes";

export const THEME_ORDER: ThemeId[] = Object.keys(THEMES) as ThemeId[];
export const MAX_LEVEL = 5;

function getCompletedLevel(
  themeId: ThemeId,
  themeProgress: Array<[string, number]>,
): number {
  const entry = themeProgress.find(([id]) => id === themeId);
  return entry ? entry[1] : 0;
}

export function getThemeCompletedLevel(
  themeId: ThemeId,
  themeProgress: Array<[string, number]>,
): number {
  return getCompletedLevel(themeId, themeProgress);
}

export function isThemeUnlocked(
  themeId: ThemeId,
  themeProgress: Array<[string, number]>,
): boolean {
  const index = THEME_ORDER.indexOf(themeId);
  if (index === 0) return true;
  const prevTheme = THEME_ORDER[index - 1];
  return getCompletedLevel(prevTheme, themeProgress) >= MAX_LEVEL;
}

export function isThemeCompleted(
  themeId: ThemeId,
  themeProgress: Array<[string, number]>,
): boolean {
  return getCompletedLevel(themeId, themeProgress) >= MAX_LEVEL;
}

export function isLevelUnlocked(
  themeId: ThemeId,
  level: number,
  themeProgress: Array<[string, number]>,
): boolean {
  if (!isThemeUnlocked(themeId, themeProgress)) return false;
  if (level === 1) return true;
  return getCompletedLevel(themeId, themeProgress) >= level - 1;
}

export function isLevelCompleted(
  themeId: ThemeId,
  level: number,
  themeProgress: Array<[string, number]>,
): boolean {
  return getCompletedLevel(themeId, themeProgress) >= level;
}

export function getCurrentLevel(
  themeId: ThemeId,
  themeProgress: Array<[string, number]>,
): number {
  const completed = getCompletedLevel(themeId, themeProgress);
  return Math.min(completed + 1, MAX_LEVEL);
}

export function getCollectedPostcards(
  themeProgress: Array<[string, number]>,
): ThemeId[] {
  return THEME_ORDER.filter((id) => isThemeCompleted(id, themeProgress));
}

export function getNextPuzzle(
  themeId: ThemeId,
  level: number,
): { themeId: ThemeId; level: number } | null {
  if (level < MAX_LEVEL) {
    return { themeId, level: level + 1 };
  }
  const themeIndex = THEME_ORDER.indexOf(themeId);
  if (themeIndex < THEME_ORDER.length - 1) {
    return { themeId: THEME_ORDER[themeIndex + 1], level: 1 };
  }
  return null;
}
