/** SFX registry — known tags and their WAV generation parameters. */

import type { SfxTag } from "./types.js";

export interface SfxGenParams {
  /** Frequency in Hz (for sine-based sounds). */
  readonly frequency: number;
  /** Duration in milliseconds. */
  readonly durationMs: number;
  /** Waveform type. */
  readonly waveform: "sine" | "noise" | "impulse" | "arpeggio";
  /** Envelope type. */
  readonly envelope: "decay" | "bell" | "sweep" | "burst" | "rising";
}

/** Generation parameters for each known SFX tag. */
export const SFX_REGISTRY: Readonly<Record<SfxTag, SfxGenParams>> = {
  ding:   { frequency: 880,  durationMs: 200, waveform: "sine",    envelope: "decay" },
  chime:  { frequency: 1047, durationMs: 300, waveform: "sine",    envelope: "bell" },
  whoosh: { frequency: 0,    durationMs: 250, waveform: "noise",   envelope: "sweep" },
  click:  { frequency: 0,    durationMs: 50,  waveform: "impulse", envelope: "decay" },
  pop:    { frequency: 150,  durationMs: 80,  waveform: "sine",    envelope: "burst" },
  tada:   { frequency: 523,  durationMs: 400, waveform: "arpeggio", envelope: "rising" },
};

/** Max SFX events allowed per text. */
export const SFX_MAX_EVENTS = 30;
