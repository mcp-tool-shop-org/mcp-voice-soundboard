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

export {
  type ChunkingOptions,
  type ChunkResult,
  type ChunkWarning,
  CHUNK_LIMITS,
  chunkText,
} from "./chunking/index.js";

export {
  type SynthesizeFn,
  type ChunkArtifact,
  type RunPlanOptions,
  type SpeechResult,
  type OrchestratorWarning,
  type RunPlanInput,
  runPlan,
  type EmotionSynthesisContext,
  type EmotionSynthesizeFn,
  type RunEmotionPlanInput,
  runEmotionPlan,
  concatWavFiles,
  concatWavBase64,
  buildWavFile,
} from "./orchestrator/index.js";

export {
  type DialogueLine,
  type DialoguePause,
  type DialogueCue,
  type CueSheet,
  type DialogueWarning,
  type CastMap,
  parseDialogue,
  DialogueParseError,
  type ParseDialogueOptions,
} from "./dialogue/index.js";

export {
  PUBLIC_EMOTIONS,
  type Emotion,
  type EmotionMapEntry,
  type EmotionSpan,
  type EmotionWarning,
  type EmotionParseResult,
  EMOTION_MAP,
  EMOTION_NAMES,
  EMOTION_SPEED_MIN,
  EMOTION_SPEED_MAX,
  clampEmotionSpeed,
  hasEmotionTags,
  parseEmotionSpans,
} from "./emotion/index.js";

export {
  SFX_TAGS,
  type SfxTag,
  type SfxEvent,
  type SfxTextSegment,
  type SfxSegment,
  type SfxWarning,
  type SfxParseResult,
  type SfxGenParams,
  SFX_REGISTRY,
  SFX_MAX_EVENTS,
  hasSfxTags,
  parseSfxTags,
  generateSfxWav,
  getSfxDurationMs,
  type SfxStitchWarning,
  type SfxStitchResult,
  createSfxChunks,
  checkSfxConcatRequired,
} from "./sfx/index.js";

export {
  AMBIENT_CATEGORIES,
  type AmbientCategory,
  type AmbientEntry,
  type AmbientConfig,
  type AmbientWarning,
  type AmbientResult,
  type RedactResult,
  redactSensitive,
  AmbientEmitter,
} from "./ambient/index.js";
