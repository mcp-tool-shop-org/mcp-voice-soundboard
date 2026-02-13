/** Emotion map — maps each emotion to a voice ID and speed. */

import type { Emotion, EmotionMapEntry } from "./types.js";

/** Speed clamp range for emotion-derived speeds. */
export const EMOTION_SPEED_MIN = 0.85;
export const EMOTION_SPEED_MAX = 1.15;

/**
 * Canonical emotion → voice/speed mapping.
 *
 * Preset field is informational only — the voiceId is always used directly.
 * "friendly" and "professional" have no matching preset in the preset roster.
 */
export const EMOTION_MAP: Readonly<Record<Emotion, EmotionMapEntry>> = {
  neutral:      { preset: "default",     voiceId: "bm_george",  speed: 1.00 },
  serious:      { preset: "narrator",    voiceId: "bm_george",  speed: 1.00 },
  friendly:     { preset: undefined,     voiceId: "am_liam",    speed: 1.00 },
  professional: { preset: undefined,     voiceId: "af_jessica",  speed: 1.00 },
  calm:         { preset: "narrator",    voiceId: "bm_george",  speed: 0.95 },
  joy:          { preset: undefined,     voiceId: "am_eric",    speed: 1.03 },
  urgent:       { preset: "announcer",   voiceId: "am_fenrir",  speed: 1.08 },
  whisper:      { preset: "storyteller", voiceId: "am_onyx",    speed: 0.92 },
};

/** All valid emotion names as a set for O(1) lookup. */
export const EMOTION_NAMES: ReadonlySet<string> = new Set(Object.keys(EMOTION_MAP));

/** Clamp a speed value to the emotion speed range. */
export function clampEmotionSpeed(speed: number): number {
  return Math.max(EMOTION_SPEED_MIN, Math.min(EMOTION_SPEED_MAX, speed));
}
