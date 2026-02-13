/** Input validation — voice and preset resolution. */

import { APPROVED_VOICE_IDS, DEFAULT_VOICE, getVoice, type VoiceInfo } from "./voices.js";
import { getPreset, type PresetConfig } from "./presets.js";

export class VoiceValidationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "VoiceValidationError";
  }
}

/**
 * Assert that a voice ID is in the approved roster.
 * Throws VoiceValidationError with the roster if not.
 */
export function assertApprovedVoice(voiceId: string): VoiceInfo {
  const voice = getVoice(voiceId);
  if (!voice) {
    throw new VoiceValidationError(
      `Voice "${voiceId}" is not in the approved roster`,
      "VOICE_NOT_APPROVED",
      { requested: voiceId, approved: [...APPROVED_VOICE_IDS] },
    );
  }
  return voice;
}

export interface ResolvedVoice {
  readonly voice: VoiceInfo;
  readonly speed: number;
  readonly source: "voice" | "preset" | "default";
  readonly presetName?: string;
}

/**
 * Resolve a voice or preset name to a concrete voice + speed.
 *
 * Resolution order:
 * 1. If input matches a preset name → use preset's voice + speed
 * 2. If input matches an approved voice ID → use that voice, speed = 1.0
 * 3. If input is undefined/empty → use DEFAULT_VOICE, speed = 1.0
 * 4. Otherwise → throw VoiceValidationError
 */
export function resolveVoiceOrPreset(
  input: string | undefined,
  speedOverride?: number,
): ResolvedVoice {
  // Default
  if (!input || input.trim() === "") {
    const voice = getVoice(DEFAULT_VOICE)!;
    return { voice, speed: speedOverride ?? 1.0, source: "default" };
  }

  const trimmed = input.trim().toLowerCase();

  // Try preset first
  const preset = getPreset(trimmed);
  if (preset) {
    const voice = getVoice(preset.voice)!;
    return {
      voice,
      speed: speedOverride ?? preset.speed,
      source: "preset",
      presetName: preset.name,
    };
  }

  // Try direct voice ID
  const voice = getVoice(trimmed);
  if (voice) {
    return { voice, speed: speedOverride ?? 1.0, source: "voice" };
  }

  // Not found
  throw new VoiceValidationError(
    `"${input}" is not a recognized voice or preset`,
    "VOICE_OR_PRESET_NOT_FOUND",
    { requested: input, approved: [...APPROVED_VOICE_IDS], presets: [...getPreset("assistant") ? ["assistant", "narrator", "announcer", "storyteller", "whisper"] : []] },
  );
}
