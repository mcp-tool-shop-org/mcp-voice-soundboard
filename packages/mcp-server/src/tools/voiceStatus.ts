/** voice.status tool — report engine health, roster, presets. */

import {
  VOICES,
  PRESETS,
  DEFAULT_VOICE,
  type VoiceStatusResponse,
} from "@mcp-tool-shop/voice-soundboard-core";
import type { Backend } from "../backend.js";

export function buildStatusResponse(backend: Backend): VoiceStatusResponse {
  return {
    voices: [...VOICES.values()],
    presets: [...PRESETS.values()],
    defaultVoice: DEFAULT_VOICE,
    backend: {
      type: backend.type,
      ready: backend.ready,
      model: backend.model,
      sampleRate: backend.sampleRate,
    },
  };
}
