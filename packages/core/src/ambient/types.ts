/** Ambient types — inner monologue and ephemeral events. */

export const AMBIENT_CATEGORIES = [
  "general",
  "thinking",
  "observation",
  "debug",
] as const;

export type AmbientCategory = (typeof AMBIENT_CATEGORIES)[number];

export interface AmbientEntry {
  readonly id: string;
  readonly text: string;
  readonly category: AmbientCategory;
  readonly createdAt: number;
  readonly expiresAt: number;
  readonly redacted: boolean;
}

export interface AmbientConfig {
  /** Whether ambient system is enabled. Default: false. */
  readonly enabled: boolean;
  /** Global rate limit: minimum ms between emissions. Default: 10000 (10s). */
  readonly globalCooldownMs: number;
  /** Per-category cooldown in ms. Default: 15000 (15s). */
  readonly categoryCooldownMs: number;
  /** Max entries in buffer. Default: 5. */
  readonly maxBufferSize: number;
  /** Entry TTL in ms. Default: 60000 (60s). */
  readonly ttlMs: number;
  /** Max text length per entry. Default: 500. */
  readonly maxTextLength: number;
}

export interface AmbientWarning {
  readonly code: string;
  readonly message: string;
}

export type AmbientResult =
  | { readonly accepted: true; readonly entry: AmbientEntry }
  | { readonly accepted: false; readonly reason: string; readonly code: string };
