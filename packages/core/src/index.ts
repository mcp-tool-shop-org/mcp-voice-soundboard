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

export {
  LIMITS,
  LimitError,
  validateText,
  validateSpeed,
} from "./limits.js";

export {
  DEFAULT_ARTIFACT_MODE,
  DEFAULT_OUTPUT_FORMAT,
  type OutputFormat,
  type ArtifactConfig,
  buildArtifactConfig,
  OutputDirError,
  defaultOutputRoot,
  resolveOutputDir,
} from "./artifact.js";

export {
  type SynthesisRequest,
  type SpeakInput,
  buildSynthesisRequest,
  errorResponse,
} from "./request.js";

export {
  type BreakEvent,
  type ProsodyEvent,
  type ProsodyEndEvent,
  type EmphasisEvent,
  type EmphasisEndEvent,
  type SpeechEvent,
  type TextSegment,
  type EventSegment,
  type PlanSegment,
  type SsmlWarning,
  type SpeechPlan,
  SSML_LIMITS,
  parseSsmlLite,
  looksLikeSsml,
  SsmlParseError,
} from "./ssml/index.js";
