/** Voice presets — named configurations mapping to approved voices. */

export interface PresetConfig {
  readonly name: string;
  readonly voice: string;
  readonly speed: number;
  readonly description: string;
}

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

/** All preset names as a set. */
export const PRESET_NAMES: ReadonlySet<string> = new Set(PRESETS.keys());

/** Get a preset by name, or undefined if not found. */
export function getPreset(name: string): PresetConfig | undefined {
  return PRESETS.get(name);
}
