// @mcp-tool-shop/voice-soundboard-core
// Backend-agnostic voice soundboard core library

export {
  type VoiceInfo,
  DEFAULT_VOICE,
  VOICES,
  APPROVED_VOICE_IDS,
  getVoice,
  isApprovedVoice,
} from "./voices.js";

export {
  type PresetConfig,
  PRESETS,
  PRESET_NAMES,
  getPreset,
} from "./presets.js";

export {
  VoiceValidationError,
  type ResolvedVoice,
  assertApprovedVoice,
  resolveVoiceOrPreset,
} from "./validate.js";

export {
  type BackendInfo,
  type VoiceStatusResponse,
  type VoiceSpeakResponse,
  type ArtifactMode,
  type VoiceInterruptResponse,
  type VoiceStreamResponse,
  type VoiceErrorResponse,
  type VoiceErrorCode,
} from "./schemas.js";
