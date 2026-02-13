/** voice.status tool — report engine health, roster, presets. */

import {
  VOICES,
  PRESETS,
  DEFAULT_VOICE,
  type VoiceStatusResponse,
} from "@mcptoolshop/voice-soundboard-core";
import type { Backend } from "../backend.js";

export async function buildStatusResponse(backend: Backend): Promise<VoiceStatusResponse> {
  const health = await backend.health();
  return {
    voices: [...VOICES.values()],
    presets: [...PRESETS.values()],
    defaultVoice: DEFAULT_VOICE,
    backend: {
      type: backend.type,
      ready: health.ready,
      model: backend.model,
      sampleRate: backend.sampleRate,
      details: health.details,
    },
  };
}
