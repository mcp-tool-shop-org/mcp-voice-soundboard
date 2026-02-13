/** Emotion types — emotion span parsing and voice/speed mapping. */

export const PUBLIC_EMOTIONS = [
  "neutral",
  "serious",
  "friendly",
  "professional",
  "calm",
  "joy",
  "urgent",
  "whisper",
] as const;

export type Emotion = (typeof PUBLIC_EMOTIONS)[number];

export interface EmotionMapEntry {
  /** Preset name hint (undefined if no matching preset). */
  readonly preset: string | undefined;
  /** Resolved voice ID from the approved roster. */
  readonly voiceId: string;
  /** Base speed multiplier for this emotion. */
  readonly speed: number;
}

export interface EmotionSpan {
  readonly emotion: Emotion;
  readonly text: string;
  readonly voiceId: string;
  readonly speed: number;
}

export interface EmotionWarning {
  readonly code: string;
  readonly message: string;
}

export interface EmotionParseResult {
  readonly spans: readonly EmotionSpan[];
  readonly warnings: readonly EmotionWarning[];
}
