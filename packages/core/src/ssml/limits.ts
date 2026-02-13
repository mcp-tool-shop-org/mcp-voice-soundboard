/** SSML-specific limits. */

export const SSML_LIMITS = {
  /** Maximum number of SSML element nodes (prevents DoS via deep/wide markup). */
  maxNodes: 200,
  /** Maximum break duration in ms. */
  maxBreakMs: 5_000,
  /** Maximum total characters of text content. */
  maxTotalChars: 10_000,
  /** Minimum prosody rate multiplier. */
  minProsodyRate: 0.5,
  /** Maximum prosody rate multiplier. */
  maxProsodyRate: 2.0,
} as const;
