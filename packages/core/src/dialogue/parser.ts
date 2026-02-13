/**
 * Dialogue script parser.
 *
 * Script syntax:
 *   Speaker: text to speak
 *   [pause 350ms]
 *   # comment
 *   (blank lines are ignored)
 *
 * Casting:
 *   - Explicit cast map: { "Alice": "bf_alice", "Bob": "bm_george" }
 *   - Cast values can be voice IDs or preset names
 *   - Uncast speakers get auto-assigned from the approved roster
 *   - Auto-casting alternates between male and female voices
 */

import { VOICES, APPROVED_VOICE_IDS, type VoiceInfo } from "../voices.js";
import { getPreset } from "../presets.js";
import { resolveVoiceOrPreset } from "../validate.js";
import type {
  CueSheet,
  DialogueCue,
  DialogueLine,
  DialoguePause,
  DialogueWarning,
  CastMap,
} from "./types.js";

// ── Public API ──

export class DialogueParseError extends Error {
  constructor(
    message: string,
    public readonly code: string = "DIALOGUE_PARSE_FAILED",
  ) {
    super(message);
    this.name = "DialogueParseError";
  }
}

export interface ParseDialogueOptions {
  /** Explicit speaker → voice/preset assignments. */
  cast?: CastMap;
  /** Maximum number of unique speakers (default 10). */
  maxSpeakers?: number;
  /** Maximum number of cues (default 100). */
  maxCues?: number;
}

const DEFAULT_MAX_SPEAKERS = 10;
const DEFAULT_MAX_CUES = 100;

/**
 * Parse a dialogue script into a CueSheet.
 */
export function parseDialogue(script: string, options?: ParseDialogueOptions): CueSheet {
  const cast = options?.cast ?? {};
  const maxSpeakers = options?.maxSpeakers ?? DEFAULT_MAX_SPEAKERS;
  const maxCues = options?.maxCues ?? DEFAULT_MAX_CUES;

  const warnings: DialogueWarning[] = [];
  const cues: DialogueCue[] = [];
  const speakerSet = new Set<string>();

  const lines = script.split("\n");

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    // Pause directive: [pause 350ms]
    const pauseMatch = trimmed.match(/^\[pause\s+(\d+)\s*(ms)?\]$/i);
    if (pauseMatch) {
      const ms = parseInt(pauseMatch[1], 10);
      cues.push({ type: "pause", durationMs: Math.min(ms, 5000) });

      if (cues.length > maxCues) {
        throw new DialogueParseError(`Too many cues (max ${maxCues})`);
      }
      continue;
    }

    // Speaker line: Speaker: text
    const lineMatch = trimmed.match(/^([^:]+):\s+(.+)$/);
    if (lineMatch) {
      const speaker = lineMatch[1].trim();
      const text = lineMatch[2].trim();

      if (!text) {
        warnings.push({
          code: "DIALOGUE_EMPTY_LINE",
          message: `Empty text for speaker "${speaker}", skipped`,
        });
        continue;
      }

      speakerSet.add(speaker);
      if (speakerSet.size > maxSpeakers) {
        throw new DialogueParseError(`Too many speakers (max ${maxSpeakers})`);
      }

      // Voice will be resolved after parsing all lines
      cues.push({ type: "line", speaker, text, voiceId: "" });

      if (cues.length > maxCues) {
        throw new DialogueParseError(`Too many cues (max ${maxCues})`);
      }
      continue;
    }

    // Unrecognized line
    warnings.push({
      code: "DIALOGUE_UNRECOGNIZED_LINE",
      message: `Unrecognized line format: "${trimmed.slice(0, 50)}"`,
    });
  }

  if (cues.length === 0) {
    throw new DialogueParseError("No valid dialogue lines found in script");
  }

  // Resolve casting
  const speakers = [...speakerSet];
  const resolvedCast = resolveCast(speakers, cast, warnings);

  // Apply voice IDs to line cues
  const resolvedCues = cues.map((cue): DialogueCue => {
    if (cue.type === "line") {
      const voiceId = resolvedCast.get(cue.speaker) ?? "";
      return { ...cue, voiceId };
    }
    return cue;
  });

  return {
    cues: resolvedCues,
    cast: resolvedCast,
    speakers,
    warnings,
  };
}

// ── Casting ──

/** Auto-cast voice pool — alternating gender for contrast. */
const AUTO_CAST_POOL: readonly string[] = [
  "bm_george",    // male british
  "af_jessica",   // female american
  "am_eric",      // male american
  "bf_emma",      // female british
  "am_fenrir",    // male american
  "af_aoede",     // female american
  "bm_lewis",     // male british
  "bf_alice",     // female british
  "am_liam",      // male american
  "af_sky",       // female american
  "am_onyx",      // male american
  "bf_isabella",  // female british
];

function resolveCast(
  speakers: string[],
  explicitCast: CastMap,
  warnings: DialogueWarning[],
): Map<string, string> {
  const result = new Map<string, string>();
  const usedVoices = new Set<string>();
  let autoIdx = 0;

  for (const speaker of speakers) {
    const explicit = explicitCast[speaker];

    if (explicit) {
      // Try to resolve as voice ID or preset
      const voiceId = resolveToVoiceId(explicit);
      if (voiceId) {
        result.set(speaker, voiceId);
        usedVoices.add(voiceId);
      } else {
        warnings.push({
          code: "DIALOGUE_CAST_INVALID",
          message: `Cast "${explicit}" for speaker "${speaker}" is not a valid voice or preset, auto-casting instead`,
        });
        // Fall through to auto-cast
        const auto = pickAutoVoice(usedVoices, autoIdx);
        result.set(speaker, auto.voiceId);
        usedVoices.add(auto.voiceId);
        autoIdx = auto.nextIdx;
      }
    } else {
      // Auto-cast
      const auto = pickAutoVoice(usedVoices, autoIdx);
      result.set(speaker, auto.voiceId);
      usedVoices.add(auto.voiceId);
      autoIdx = auto.nextIdx;
    }
  }

  return result;
}

function resolveToVoiceId(input: string): string | null {
  const lower = input.trim().toLowerCase();

  // Direct voice ID
  if (APPROVED_VOICE_IDS.has(lower)) {
    return lower;
  }

  // Preset name → voice ID
  const preset = getPreset(lower);
  if (preset) {
    return preset.voice;
  }

  return null;
}

function pickAutoVoice(
  used: Set<string>,
  startIdx: number,
): { voiceId: string; nextIdx: number } {
  // Find next unused voice in pool
  for (let i = 0; i < AUTO_CAST_POOL.length; i++) {
    const idx = (startIdx + i) % AUTO_CAST_POOL.length;
    const voiceId = AUTO_CAST_POOL[idx];
    if (!used.has(voiceId)) {
      return { voiceId, nextIdx: idx + 1 };
    }
  }

  // All used — wrap around from pool start
  return { voiceId: AUTO_CAST_POOL[startIdx % AUTO_CAST_POOL.length], nextIdx: startIdx + 1 };
}
