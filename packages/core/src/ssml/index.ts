/** SSML-lite module — parse a subset of SSML into a SpeechPlan. */

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
} from "./types.js";

export { SSML_LIMITS } from "./limits.js";

export { parseSsmlLite, looksLikeSsml, SsmlParseError } from "./parser.js";
