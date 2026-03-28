/** Voice presets — named configurations mapping to approved voices. */

/** Prosody configuration for fine-grained speech control (SSML-based backends). */
export interface ProsodyConfig {
  /** Pitch adjustment (e.g. "+5%", "-8%", "0%"). Maps to SSML <prosody pitch="...">. */
  readonly pitch?: string;
  /** Rate multiplier as string (e.g. "0.92", "1.05"). Maps to SSML <prosody rate="...">. */
  readonly rate?: string;
  /** Volume level. Maps to SSML <prosody volume="...">. */
  readonly volume?: "x-soft" | "soft" | "medium" | "loud" | "x-loud";
  /** Emphasis level for punch words. Maps to SSML <emphasis level="...">. */
  readonly emphasis?: "none" | "reduced" | "moderate" | "strong";
}

/**
 * Piper-native prosody config — maps directly to Piper's SynthesisConfig params.
 * Used when VOICE_SOUNDBOARD_ENGINE=piper for real prosody control
 * (length_scale, noise_scale, noise_w_scale, volume).
 */
export interface PiperProsodyConfig {
  /** Phoneme length scale (>1 = slower, <1 = faster). Default 1.0. */
  readonly length_scale: number;
  /** Generator noise scale (lower = flatter/more monotone, higher = more expressive). 0–1. */
  readonly noise_scale: number;
  /** Phoneme width noise scale (lower = metronomic, higher = erratic timing). 0–1. */
  readonly noise_w_scale: number;
  /** Volume multiplier (0.5–1.5). Default 1.0. */
  readonly volume: number;
  /** Piper voice model name (e.g. "en_GB-alan-medium"). */
  readonly piper_voice: string;
}

export interface PresetConfig {
  readonly name: string;
  readonly voice: string;
  readonly speed: number;
  readonly description: string;
  /** Optional prosody overrides for backends that support SSML. */
  readonly prosody?: ProsodyConfig;
  /** Optional Piper-native prosody config (used when engine=piper). */
  readonly piperProsody?: PiperProsodyConfig;
}

/** Humor mood identifiers for sensor-humor integration. */
export type HumorMood = "dry" | "roast" | "chaotic" | "cheeky" | "cynic" | "zoomer";

/** All valid humor mood names. */
export const HUMOR_MOODS: readonly HumorMood[] = [
  "dry", "roast", "chaotic", "cheeky", "cynic", "zoomer",
] as const;

/**
 * Built-in presets. All voices reference the approved roster.
 *
 * Original Python presets used af_bella (assistant), am_michael (announcer),
 * and af_nicole (whisper) which are not in the approved 12. These are remapped
 * to the closest approved alternatives.
 */
export const PRESETS: ReadonlyMap<string, PresetConfig> = new Map([
  ["assistant",   { name: "assistant",   voice: "af_jessica",  speed: 1.0,  description: "Friendly, helpful, conversational" }],
  ["narrator",    { name: "narrator",    voice: "bm_george",   speed: 0.95, description: "Calm, clear, documentary style" }],
  ["announcer",   { name: "announcer",   voice: "am_eric",     speed: 1.1,  description: "Bold, energetic, broadcast style" }],
  ["storyteller", { name: "storyteller", voice: "bf_emma",     speed: 0.9,  description: "Expressive, varied pacing" }],
  ["whisper",     { name: "whisper",     voice: "af_sky",      speed: 0.85, description: "Soft, intimate, gentle" }],
]);

/**
 * Humor mood presets — voice + prosody tuned for comedic delivery styles.
 * Used by sensor-humor MCP tool for spoken comedy integration.
 */
export const HUMOR_PRESETS: ReadonlyMap<string, PresetConfig> = new Map([
  ["humor_dry", {
    name: "humor_dry",
    voice: "bm_george",
    speed: 0.92,
    description: "Deadpan British flat — understated devastation",
    prosody: { pitch: "-8%", rate: "0.92", volume: "medium", emphasis: "none" },
    piperProsody: { piper_voice: "en_GB-alan-medium", length_scale: 1.15, noise_scale: 0.3, noise_w_scale: 0.3, volume: 0.9 },
  }],
  ["humor_roast", {
    name: "humor_roast",
    voice: "am_eric",
    speed: 1.05,
    description: "Warm sarcasm — slight energy on verdict labels",
    prosody: { pitch: "+5%", rate: "1.05", volume: "medium", emphasis: "moderate" },
    piperProsody: { piper_voice: "en_US-ryan-high", length_scale: 0.95, noise_scale: 0.667, noise_w_scale: 0.8, volume: 1.0 },
  }],
  ["humor_chaotic", {
    name: "humor_chaotic",
    voice: "am_liam",
    speed: 1.05,
    description: "News anchor goes off-script — grounded start, absurd pivot, total confidence",
    prosody: { pitch: "+5%", rate: "1.05", volume: "medium", emphasis: "moderate" },
    piperProsody: { piper_voice: "en_US-lessac-high", length_scale: 0.95, noise_scale: 0.7, noise_w_scale: 0.8, volume: 1.05 },
  }],
  ["humor_cheeky", {
    name: "humor_cheeky",
    voice: "af_jessica",
    speed: 1.0,
    description: "Playful teasing — warm opener, gentle mockery with a wink",
    prosody: { pitch: "+3%", rate: "1.0", volume: "medium", emphasis: "moderate" },
    piperProsody: { piper_voice: "en_GB-cori-high", length_scale: 1.0, noise_scale: 0.6, noise_w_scale: 0.65, volume: 1.0 },
  }],
  ["humor_cynic", {
    name: "humor_cynic",
    voice: "bm_george",
    speed: 0.90,
    description: "Bitter jaded realism — flat, cold, quietly vicious",
    prosody: { pitch: "-5%", rate: "0.90", volume: "soft", emphasis: "none" },
    piperProsody: { piper_voice: "en_GB-alan-medium", length_scale: 1.20, noise_scale: 0.25, noise_w_scale: 0.25, volume: 0.85 },
  }],
  ["humor_zoomer", {
    name: "humor_zoomer",
    voice: "am_fenrir",
    speed: 1.12,
    description: "Terminally online streamer — brisk, mocking, one caps hit",
    prosody: { pitch: "+8%", rate: "1.12", volume: "loud", emphasis: "strong" },
    piperProsody: { piper_voice: "en_US-ryan-high", length_scale: 0.90, noise_scale: 0.85, noise_w_scale: 0.9, volume: 1.15 },
  }],
]);

/** Combined map: standard presets + humor presets. */
const ALL_PRESETS: ReadonlyMap<string, PresetConfig> = new Map([
  ...PRESETS,
  ...HUMOR_PRESETS,
]);

/** All preset names as a set (includes humor presets). */
export const PRESET_NAMES: ReadonlySet<string> = new Set(ALL_PRESETS.keys());

/** Get a preset by name, or undefined if not found. Searches both standard and humor presets. */
export function getPreset(name: string): PresetConfig | undefined {
  return ALL_PRESETS.get(name);
}

/** Get a humor preset by mood name (e.g. "dry" → humor_dry preset). */
export function getHumorPreset(mood: HumorMood): PresetConfig | undefined {
  return HUMOR_PRESETS.get(`humor_${mood}`);
}

/**
 * Wrap text in SSML prosody tags based on a ProsodyConfig.
 * Returns the original text unchanged if no prosody is defined.
 */
export function wrapWithProsody(text: string, prosody?: ProsodyConfig): string {
  if (!prosody) return text;

  const attrs: string[] = [];
  if (prosody.pitch) attrs.push(`pitch="${prosody.pitch}"`);
  if (prosody.rate) attrs.push(`rate="${prosody.rate}"`);
  if (prosody.volume) attrs.push(`volume="${prosody.volume}"`);

  if (attrs.length === 0) return text;

  const inner = prosody.emphasis && prosody.emphasis !== "none"
    ? `<emphasis level="${prosody.emphasis}">${text}</emphasis>`
    : text;

  return `<speak><prosody ${attrs.join(" ")}>${inner}</prosody></speak>`;
}
