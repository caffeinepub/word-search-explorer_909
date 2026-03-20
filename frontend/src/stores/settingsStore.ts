import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "en" | "es" | "fr" | "de" | "pt";

export const LANGUAGES: Record<Language, { label: string; flag: string }> = {
  en: { label: "English", flag: "🇬🇧" },
  es: { label: "Español", flag: "🇪🇸" },
  fr: { label: "Français", flag: "🇫🇷" },
  de: { label: "Deutsch", flag: "🇩🇪" },
  pt: { label: "Português", flag: "🇧🇷" },
};

interface SettingsState {
  language: Language;
  setLanguage: (language: Language) => void;
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  soundsEnabled: boolean;
  setSoundsEnabled: (enabled: boolean) => void;
  audioContextReady: boolean;
  setAudioContextReady: (ready: boolean) => void;
  timedModeEnabled: boolean;
  setTimedModeEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (language) => set({ language }),
      musicEnabled: true,
      setMusicEnabled: (enabled) => set({ musicEnabled: enabled }),
      soundsEnabled: true,
      setSoundsEnabled: (enabled) => set({ soundsEnabled: enabled }),
      audioContextReady: false,
      setAudioContextReady: (ready) => set({ audioContextReady: ready }),
      timedModeEnabled: false,
      setTimedModeEnabled: (enabled) => set({ timedModeEnabled: enabled }),
    }),
    {
      name: "word-search-settings",
      partialize: (state) => ({
        language: state.language,
        musicEnabled: state.musicEnabled,
        soundsEnabled: state.soundsEnabled,
        timedModeEnabled: state.timedModeEnabled,
      }),
    },
  ),
);
