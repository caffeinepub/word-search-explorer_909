// Minimal type declarations for Tone.js CDN global

declare namespace Tone {
  function start(): Promise<void>;
  function getContext(): AudioContext;
  function now(): number;

  type Time = number | string;
  type Frequency = number | string;

  interface SynthOptions {
    oscillator?: { type: OscillatorType };
    envelope?: {
      attack?: number;
      decay?: number;
      sustain?: number;
      release?: number;
    };
    volume?: number;
  }

  interface PolySynthOptions {
    maxPolyphony?: number;
    voice?: typeof Synth;
    options?: SynthOptions;
  }

  class Synth {
    constructor(options?: SynthOptions);
    toDestination(): this;
    triggerAttackRelease(
      note: Frequency,
      duration: Time,
      time?: Time,
      velocity?: number,
    ): this;
    dispose(): void;
    volume: { value: number };
  }

  class PolySynth {
    constructor(options?: PolySynthOptions);
    toDestination(): this;
    triggerAttackRelease(
      notes: Frequency | Frequency[],
      duration: Time,
      time?: Time,
      velocity?: number,
    ): this;
    dispose(): void;
    volume: { value: number };
  }

  class AMSynth extends Synth {
    constructor(options?: SynthOptions);
  }

  class FMSynth extends Synth {
    constructor(options?: SynthOptions);
  }

  interface SequenceOptions<T> {
    callback: (time: number, note: T) => void;
    events: (T | null)[];
    subdivision: Time;
  }

  class Sequence<T = string> {
    constructor(
      callback: (time: number, note: T) => void,
      events: (T | null)[],
      subdivision?: Time,
    );
    start(time?: Time): this;
    stop(time?: Time): this;
    dispose(): void;
    loop: boolean | number;
  }

  const Transport: {
    bpm: { value: number };
    start(time?: Time): typeof Transport;
    stop(time?: Time): typeof Transport;
    cancel(time?: Time): typeof Transport;
    state: "started" | "stopped" | "paused";
  };

  const context: AudioContext;
}
