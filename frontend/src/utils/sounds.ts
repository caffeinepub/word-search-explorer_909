// Audio context management and sound effect generators using Tone.js

let audioContextStarted = false;

export async function ensureAudioContext(): Promise<boolean> {
  if (audioContextStarted) return true;
  try {
    await Tone.start();
    audioContextStarted = true;
    return true;
  } catch {
    return false;
  }
}

export function isAudioContextReady(): boolean {
  return audioContextStarted;
}

// Lazy synth factories - create on first use, cache for reuse
let sineSynth: Tone.Synth | null = null;
let triangleSynth: Tone.Synth | null = null;
let squareSynth: Tone.Synth | null = null;
let fmSynth: Tone.FMSynth | null = null;
let polySynth: Tone.PolySynth | null = null;

// Dispose all synths to prevent memory leaks
export function disposeSynths(): void {
  if (sineSynth) {
    sineSynth.dispose();
    sineSynth = null;
  }
  if (triangleSynth) {
    triangleSynth.dispose();
    triangleSynth = null;
  }
  if (squareSynth) {
    squareSynth.dispose();
    squareSynth = null;
  }
  if (fmSynth) {
    fmSynth.dispose();
    fmSynth = null;
  }
  if (polySynth) {
    polySynth.dispose();
    polySynth = null;
  }
}

function getSineSynth(): Tone.Synth {
  if (!sineSynth) {
    sineSynth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 },
    }).toDestination();
    sineSynth.volume.value = -12;
  }
  return sineSynth;
}

function getTriangleSynth(): Tone.Synth {
  if (!triangleSynth) {
    triangleSynth = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.3 },
    }).toDestination();
    triangleSynth.volume.value = -10;
  }
  return triangleSynth;
}

function getSquareSynth(): Tone.Synth {
  if (!squareSynth) {
    squareSynth = new Tone.Synth({
      oscillator: { type: "square" },
      envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.1 },
    }).toDestination();
    squareSynth.volume.value = -20;
  }
  return squareSynth;
}

function getFMSynth(): Tone.FMSynth {
  if (!fmSynth) {
    fmSynth = new Tone.FMSynth({
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.5 },
    }).toDestination();
    fmSynth.volume.value = -10;
  }
  return fmSynth;
}

function getPolySynth(): Tone.PolySynth {
  if (!polySynth) {
    polySynth = new Tone.PolySynth().toDestination();
    polySynth.volume.value = -8;
  }
  return polySynth;
}

// Sound effect functions

export function playLetterSelect(): void {
  if (!isAudioContextReady()) return;
  const synth = getSineSynth();
  synth.triggerAttackRelease("C6", "32n");
}

// Notes for per-letter swipe sounds (ascending scale)
const SWIPE_NOTES = [
  "C5",
  "D5",
  "E5",
  "F5",
  "G5",
  "A5",
  "B5",
  "C6",
  "D6",
  "E6",
];

export function playLetterSwipe(index: number): void {
  if (!isAudioContextReady()) return;
  const synth = getSineSynth();
  const note = SWIPE_NOTES[index % SWIPE_NOTES.length];
  synth.triggerAttackRelease(note, "64n");
}

export function playWordFound(): void {
  if (!isAudioContextReady()) return;
  const synth = getTriangleSynth();
  const now = Tone.now();
  synth.triggerAttackRelease("C5", "16n", now);
  synth.triggerAttackRelease("E5", "16n", now + 0.1);
  synth.triggerAttackRelease("G5", "16n", now + 0.2);
  synth.triggerAttackRelease("C6", "8n", now + 0.3);
}

export function playPuzzleComplete(): void {
  if (!isAudioContextReady()) return;
  const synth = getPolySynth();
  const now = Tone.now();

  // Ascending notes
  synth.triggerAttackRelease("C4", "8n", now);
  synth.triggerAttackRelease("E4", "8n", now + 0.15);
  synth.triggerAttackRelease("G4", "8n", now + 0.3);
  synth.triggerAttackRelease("C5", "8n", now + 0.45);

  // Final chord
  synth.triggerAttackRelease(["C5", "E5", "G5"], "4n", now + 0.6);
}

export function playHintUsed(): void {
  if (!isAudioContextReady()) return;
  const synth = getFMSynth();
  synth.triggerAttackRelease("A5", "8n");
}

export function playInvalidSelection(): void {
  if (!isAudioContextReady()) return;
  const synth = getSquareSynth();
  synth.triggerAttackRelease("G2", "16n");
}

// UI Sound effects

export function playTap(): void {
  if (!isAudioContextReady()) return;
  const synth = getSineSynth();
  synth.triggerAttackRelease("G5", "64n");
}

export function playNavigate(): void {
  if (!isAudioContextReady()) return;
  const synth = getSineSynth();
  synth.triggerAttackRelease("E6", "32n");
}

export function playBack(): void {
  if (!isAudioContextReady()) return;
  const synth = getSineSynth();
  synth.triggerAttackRelease("A4", "32n");
}

export function playLocked(): void {
  if (!isAudioContextReady()) return;
  const synth = getSquareSynth();
  synth.triggerAttackRelease("D3", "32n");
}

export function playToggle(): void {
  if (!isAudioContextReady()) return;
  const synth = getSineSynth();
  synth.triggerAttackRelease("B5", "64n");
}

export function playModalOpen(): void {
  if (!isAudioContextReady()) return;

  // Swoosh: FM synth gives a breathy texture
  const fmSynth = getFMSynth();
  fmSynth.triggerAttackRelease("D4", "32n");

  // Pop landing: soft high sine tone after short delay
  setTimeout(() => {
    const sineSynth = getSineSynth();
    sineSynth.triggerAttackRelease("A5", "32n");
  }, 60);
}

export function playTimerTick(): void {
  if (!isAudioContextReady()) return;
  const synth = getSquareSynth();
  synth.triggerAttackRelease("A4", "32n");
}

export function playTimeUp(): void {
  if (!isAudioContextReady()) return;
  const synth = getSquareSynth();
  const now = Tone.now();
  synth.triggerAttackRelease("E4", "16n", now);
  synth.triggerAttackRelease("C4", "16n", now + 0.15);
  synth.triggerAttackRelease("A3", "8n", now + 0.3);
}
