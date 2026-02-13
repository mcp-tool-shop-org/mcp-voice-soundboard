/**
 * SFX WAV generator — programmatic audio generation for sound effects.
 *
 * All SFX are generated as 24kHz mono 16-bit PCM to match TTS output.
 * No external WAV assets needed.
 */

import type { SfxTag } from "./types.js";
import { SFX_REGISTRY } from "./registry.js";
import { buildWavFile } from "../orchestrator/concat.js";

const SAMPLE_RATE = 24000;
const MAX_INT16 = 32767;

/**
 * Generate a WAV buffer for a given SFX tag.
 * Returns raw WAV file data (with header) as a Buffer.
 */
export function generateSfxWav(tag: SfxTag): Buffer {
  const params = SFX_REGISTRY[tag];
  const numSamples = Math.round((params.durationMs / 1000) * SAMPLE_RATE);
  const pcm = Buffer.alloc(numSamples * 2); // 16-bit = 2 bytes per sample

  switch (params.waveform) {
    case "sine":
      generateSine(pcm, numSamples, params.frequency, params.envelope);
      break;
    case "noise":
      generateNoise(pcm, numSamples, params.envelope);
      break;
    case "impulse":
      generateImpulse(pcm, numSamples);
      break;
    case "arpeggio":
      generateArpeggio(pcm, numSamples, params.frequency, params.envelope);
      break;
  }

  return buildWavFile(pcm, SAMPLE_RATE);
}

/** Get the duration in ms for a given SFX tag. */
export function getSfxDurationMs(tag: SfxTag): number {
  return SFX_REGISTRY[tag].durationMs;
}

// ── Waveform generators ──

function generateSine(
  pcm: Buffer,
  numSamples: number,
  frequency: number,
  envelope: string,
): void {
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const phase = 2 * Math.PI * frequency * t;
    let sample = Math.sin(phase);
    sample *= applyEnvelope(i, numSamples, envelope);
    writeSample(pcm, i, sample * 0.7);
  }
}

function generateNoise(pcm: Buffer, numSamples: number, envelope: string): void {
  for (let i = 0; i < numSamples; i++) {
    let sample = Math.random() * 2 - 1;
    sample *= applyEnvelope(i, numSamples, envelope);
    writeSample(pcm, i, sample * 0.4);
  }
}

function generateImpulse(pcm: Buffer, numSamples: number): void {
  for (let i = 0; i < numSamples; i++) {
    const t = i / numSamples;
    // Sharp impulse with fast exponential decay
    const sample = Math.exp(-t * 30) * (i < 3 ? 1.0 : 0.3 * Math.exp(-t * 10));
    writeSample(pcm, i, sample * 0.8);
  }
}

function generateArpeggio(
  pcm: Buffer,
  numSamples: number,
  baseFreq: number,
  envelope: string,
): void {
  // C5-E5-G5 arpeggio (major triad)
  const freqs = [baseFreq, baseFreq * 1.26, baseFreq * 1.5]; // ~C5, E5, G5
  const noteSamples = Math.floor(numSamples / freqs.length);

  for (let noteIdx = 0; noteIdx < freqs.length; noteIdx++) {
    const startSample = noteIdx * noteSamples;
    const freq = freqs[noteIdx];

    for (let i = 0; i < noteSamples; i++) {
      const globalIdx = startSample + i;
      if (globalIdx >= numSamples) break;

      const t = i / SAMPLE_RATE;
      const phase = 2 * Math.PI * freq * t;
      let sample = Math.sin(phase);

      // Per-note envelope: quick attack, sustain, gentle release
      const noteT = i / noteSamples;
      const noteEnv = Math.min(1, noteT * 10) * (1 - Math.pow(noteT, 3));
      // Global rising envelope
      const globalEnv = applyEnvelope(globalIdx, numSamples, envelope);
      sample *= noteEnv * globalEnv;
      writeSample(pcm, globalIdx, sample * 0.6);
    }
  }
}

// ── Envelope helpers ──

function applyEnvelope(sampleIdx: number, totalSamples: number, envelope: string): number {
  const t = sampleIdx / totalSamples;
  switch (envelope) {
    case "decay":
      return Math.exp(-t * 5);
    case "bell":
      // Fast attack, slow decay with a resonant tail
      return Math.min(1, t * 20) * Math.exp(-t * 4) * (1 + 0.3 * Math.sin(t * 30));
    case "sweep":
      // Bandpass-like sweep: rises then falls
      return Math.sin(Math.PI * t) * (1 - t * 0.5);
    case "burst":
      // Very fast attack and decay
      return Math.exp(-t * 15);
    case "rising":
      // Gradual rise with gentle taper at end
      return Math.min(1, t * 3) * (1 - Math.pow(Math.max(0, t - 0.8) * 5, 2));
    default:
      return 1;
  }
}

function writeSample(pcm: Buffer, index: number, value: number): void {
  const clamped = Math.max(-1, Math.min(1, value));
  pcm.writeInt16LE(Math.round(clamped * MAX_INT16), index * 2);
}
