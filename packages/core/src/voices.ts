/** Approved voice roster — single source of truth. */

export interface VoiceInfo {
  readonly id: string;
  readonly name: string;
  readonly gender: "male" | "female";
  readonly accent: "american" | "british";
  readonly style: string;
  readonly language: string;
}

export const DEFAULT_VOICE = "bm_george" as const;

/**
 * Approved voice roster (12 voices).
 * All voices are Kokoro-compatible, English-only.
 */
export const VOICES: ReadonlyMap<string, VoiceInfo> = new Map([
  ["af_aoede",     { id: "af_aoede",     name: "Aoede",    gender: "female", accent: "american", style: "musical",       language: "en" }],
  ["af_jessica",   { id: "af_jessica",   name: "Jessica",  gender: "female", accent: "american", style: "professional",  language: "en" }],
  ["af_sky",       { id: "af_sky",       name: "Sky",      gender: "female", accent: "american", style: "airy",          language: "en" }],
  ["am_eric",      { id: "am_eric",      name: "Eric",     gender: "male",   accent: "american", style: "confident",     language: "en" }],
  ["am_fenrir",    { id: "am_fenrir",    name: "Fenrir",   gender: "male",   accent: "american", style: "powerful",      language: "en" }],
  ["am_liam",      { id: "am_liam",      name: "Liam",     gender: "male",   accent: "american", style: "friendly",      language: "en" }],
  ["am_onyx",      { id: "am_onyx",      name: "Onyx",     gender: "male",   accent: "american", style: "smooth",        language: "en" }],
  ["bf_alice",     { id: "bf_alice",     name: "Alice",    gender: "female", accent: "british",  style: "proper",        language: "en" }],
  ["bf_emma",      { id: "bf_emma",      name: "Emma",     gender: "female", accent: "british",  style: "refined",       language: "en" }],
  ["bf_isabella",  { id: "bf_isabella",  name: "Isabella", gender: "female", accent: "british",  style: "warm",          language: "en" }],
  ["bm_george",    { id: "bm_george",    name: "George",   gender: "male",   accent: "british",  style: "authoritative", language: "en" }],
  ["bm_lewis",     { id: "bm_lewis",     name: "Lewis",    gender: "male",   accent: "british",  style: "friendly",      language: "en" }],
]);

/** All approved voice IDs as a set for O(1) lookup. */
export const APPROVED_VOICE_IDS: ReadonlySet<string> = new Set(VOICES.keys());

/** Get a voice by ID, or undefined if not in the approved roster. */
export function getVoice(id: string): VoiceInfo | undefined {
  return VOICES.get(id);
}

/** Check if a voice ID is in the approved roster. */
export function isApprovedVoice(id: string): boolean {
  return APPROVED_VOICE_IDS.has(id);
}
