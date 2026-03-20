import { useEffect, useRef, useCallback } from "react";
import { useSettingsStore } from "../stores/settingsStore";
import { isAudioContextReady } from "../utils/sounds";

// C major pentatonic scale for gentle music-box sound
const NOTES = ["C4", "D4", "E4", "G4", "A4", "C5", "D5", "E5"];

// 8-bar arpeggio pattern with rests
const PATTERN: (string | null)[] = [
  NOTES[0],
  NOTES[2],
  NOTES[4],
  null,
  NOTES[3],
  NOTES[5],
  null,
  NOTES[4],
  NOTES[2],
  NOTES[6],
  null,
  NOTES[5],
  NOTES[3],
  null,
  NOTES[7],
  NOTES[4],
];

let amSynth: Tone.AMSynth | null = null;

function getAMSynth(): Tone.AMSynth {
  if (!amSynth) {
    amSynth = new Tone.AMSynth({
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.2, release: 0.8 },
    }).toDestination();
    amSynth.volume.value = -18;
  }
  return amSynth;
}

export function useBackgroundMusic() {
  const musicEnabled = useSettingsStore((s) => s.musicEnabled);
  const audioContextReady = useSettingsStore((s) => s.audioContextReady);
  const sequenceRef = useRef<Tone.Sequence<string | null> | null>(null);
  const isPlayingRef = useRef(false);

  const startMusic = useCallback(() => {
    if (!isAudioContextReady() || isPlayingRef.current) return;

    const synth = getAMSynth();

    // Dispose old sequence if exists
    if (sequenceRef.current) {
      sequenceRef.current.dispose();
      sequenceRef.current = null;
    }

    // Cancel any pending events and reset transport
    Tone.Transport.cancel();
    Tone.Transport.stop();

    // Create fresh sequence
    const seq = new Tone.Sequence(
      (time, note) => {
        if (note) {
          synth.triggerAttackRelease(note, "8n", time);
        }
      },
      PATTERN,
      "8n",
    );
    seq.loop = true;
    sequenceRef.current = seq;

    Tone.Transport.bpm.value = 70;
    seq.start(0);
    Tone.Transport.start();
    isPlayingRef.current = true;
  }, []);

  const stopMusic = useCallback(() => {
    if (!isPlayingRef.current) return;

    if (sequenceRef.current) {
      sequenceRef.current.stop();
      sequenceRef.current.dispose();
      sequenceRef.current = null;
    }
    if (amSynth) {
      amSynth.dispose();
      amSynth = null;
    }
    Tone.Transport.cancel();
    Tone.Transport.stop();
    isPlayingRef.current = false;
  }, []);

  // Auto-start/stop based on music enabled state and audio context readiness
  useEffect(() => {
    if (musicEnabled && audioContextReady) {
      startMusic();
    } else {
      stopMusic();
    }
  }, [musicEnabled, audioContextReady, startMusic, stopMusic]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMusic();
    };
  }, [stopMusic]);

  return { startMusic, stopMusic };
}
