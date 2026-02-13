/** SFX module — barrel exports. */

export {
  SFX_TAGS,
  type SfxTag,
  type SfxEvent,
  type SfxTextSegment,
  type SfxSegment,
  type SfxWarning,
  type SfxParseResult,
} from "./types.js";

export {
  type SfxGenParams,
  SFX_REGISTRY,
  SFX_MAX_EVENTS,
} from "./registry.js";

export {
  hasSfxTags,
  parseSfxTags,
} from "./parser.js";

export {
  generateSfxWav,
  getSfxDurationMs,
} from "./generator.js";

export {
  type SfxStitchWarning,
  type SfxStitchResult,
  createSfxChunks,
  checkSfxConcatRequired,
} from "./stitcher.js";
