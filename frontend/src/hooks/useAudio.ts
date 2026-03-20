import { useCallback } from "react";
import { useSettingsStore } from "../stores/settingsStore";
import {
  playLetterSelect as _playLetterSelect,
  playLetterSwipe as _playLetterSwipe,
  playWordFound as _playWordFound,
  playPuzzleComplete as _playPuzzleComplete,
  playHintUsed as _playHintUsed,
  playInvalidSelection as _playInvalidSelection,
  playTap as _playTap,
  playNavigate as _playNavigate,
  playBack as _playBack,
  playLocked as _playLocked,
  playToggle as _playToggle,
  playModalOpen as _playModalOpen,
  playTimerTick as _playTimerTick,
  playTimeUp as _playTimeUp,
} from "../utils/sounds";

export function useAudio() {
  const soundsEnabled = useSettingsStore((s) => s.soundsEnabled);

  const playLetterSelect = useCallback(() => {
    if (soundsEnabled) _playLetterSelect();
  }, [soundsEnabled]);

  const playLetterSwipe = useCallback(
    (index: number) => {
      if (soundsEnabled) _playLetterSwipe(index);
    },
    [soundsEnabled],
  );

  const playWordFound = useCallback(() => {
    if (soundsEnabled) _playWordFound();
  }, [soundsEnabled]);

  const playPuzzleComplete = useCallback(() => {
    if (soundsEnabled) _playPuzzleComplete();
  }, [soundsEnabled]);

  const playHintUsed = useCallback(() => {
    if (soundsEnabled) _playHintUsed();
  }, [soundsEnabled]);

  const playInvalidSelection = useCallback(() => {
    if (soundsEnabled) _playInvalidSelection();
  }, [soundsEnabled]);

  const playTap = useCallback(() => {
    if (soundsEnabled) _playTap();
  }, [soundsEnabled]);

  const playNavigate = useCallback(() => {
    if (soundsEnabled) _playNavigate();
  }, [soundsEnabled]);

  const playBack = useCallback(() => {
    if (soundsEnabled) _playBack();
  }, [soundsEnabled]);

  const playLocked = useCallback(() => {
    if (soundsEnabled) _playLocked();
  }, [soundsEnabled]);

  const playToggle = useCallback(() => {
    if (soundsEnabled) _playToggle();
  }, [soundsEnabled]);

  const playModalOpen = useCallback(() => {
    if (soundsEnabled) _playModalOpen();
  }, [soundsEnabled]);

  const playTimerTick = useCallback(() => {
    if (soundsEnabled) _playTimerTick();
  }, [soundsEnabled]);

  const playTimeUp = useCallback(() => {
    if (soundsEnabled) _playTimeUp();
  }, [soundsEnabled]);

  return {
    playLetterSelect,
    playLetterSwipe,
    playWordFound,
    playPuzzleComplete,
    playHintUsed,
    playInvalidSelection,
    playTap,
    playNavigate,
    playBack,
    playLocked,
    playToggle,
    playModalOpen,
    playTimerTick,
    playTimeUp,
  };
}
