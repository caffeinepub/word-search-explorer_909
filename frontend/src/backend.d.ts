import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DailyPuzzleInfo {
    seed: bigint;
    level: bigint;
    alreadyCompleted: boolean;
    themeId: ThemeId;
}
export type ThemeId = string;
export interface CurrentPuzzle {
    grid: Array<Array<string>>;
    puzzleIndex: bigint;
    foundWords: Array<string>;
    words: Array<string>;
    hintsUsed: bigint;
    themeId: ThemeId;
}
export interface UserProgress {
    hints: bigint;
    coins: bigint;
    currentPuzzle?: CurrentPuzzle;
    themeProgress: Array<[ThemeId, bigint]>;
    lastHintRegenTime: bigint;
    lastDailyCompletion: bigint;
}
export interface UserProfile {
    name: string;
}
export interface backendInterface {
    buyHint(): Promise<void>;
    checkAuth(): Promise<boolean>;
    clearCurrentPuzzle(): Promise<void>;
    completeDailyPuzzle(hintsUsed: bigint): Promise<bigint>;
    completePuzzle(hintsUsed: bigint, timedCompletion: boolean): Promise<boolean>;
    getDailyPuzzle(): Promise<DailyPuzzleInfo>;
    getProfile(): Promise<UserProfile | null>;
    getProgress(): Promise<UserProgress>;
    saveFoundWord(word: string): Promise<void>;
    setProfile(name: string): Promise<void>;
    startPuzzle(themeId: ThemeId, puzzleIndex: bigint, grid: Array<Array<string>>, words: Array<string>): Promise<void>;
    useHint(): Promise<void>;
}
