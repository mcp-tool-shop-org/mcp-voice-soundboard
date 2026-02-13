/** Emotion module — barrel exports. */

export {
  PUBLIC_EMOTIONS,
  type Emotion,
  type EmotionMapEntry,
  type EmotionSpan,
  type EmotionWarning,
  type EmotionParseResult,
} from "./types.js";

export {
  EMOTION_MAP,
  EMOTION_NAMES,
  EMOTION_SPEED_MIN,
  EMOTION_SPEED_MAX,
  clampEmotionSpeed,
} from "./map.js";

export {
  hasEmotionTags,
  parseEmotionSpans,
} from "./parser.js";
