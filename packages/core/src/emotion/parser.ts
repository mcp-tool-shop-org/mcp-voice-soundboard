/** Emotion span parser — extracts {emotion}...{/emotion} spans from text. */

import type {
  Emotion,
  EmotionSpan,
  EmotionWarning,
  EmotionParseResult,
} from "./types.js";
import { EMOTION_MAP, EMOTION_NAMES, clampEmotionSpeed } from "./map.js";

/**
 * Regex to match `{emotion}text{/emotion}` spans.
 * Captures: [1] emotion name (open), [2] inner text, [3] emotion name (close — must match [1]).
 * Uses lazy match for inner text to handle adjacent spans correctly.
 */
const EMOTION_SPAN_RE = /\{(\w+)\}([\s\S]*?)\{\/(\w+)\}/g;

/** Check whether text contains any emotion span tags. */
export function hasEmotionTags(text: string): boolean {
  return /\{\w+\}/.test(text) && /\{\/\w+\}/.test(text);
}

/**
 * Parse emotion spans from text.
 *
 * Tagged regions become spans with the specified emotion's voice/speed.
 * Untagged text becomes `neutral` spans.
 * Mismatched open/close names are treated as literal text with a warning.
 * Unsupported emotion names → `neutral` + `EMOTION_UNSUPPORTED` warning.
 */
export function parseEmotionSpans(text: string): EmotionParseResult {
  const spans: EmotionSpan[] = [];
  const warnings: EmotionWarning[] = [];

  let lastIndex = 0;

  for (const match of text.matchAll(EMOTION_SPAN_RE)) {
    const openName = match[1];
    const innerText = match[2];
    const closeName = match[3];
    const matchStart = match.index!;

    // Emit any untagged text before this span as neutral
    if (matchStart > lastIndex) {
      const before = text.slice(lastIndex, matchStart).trim();
      if (before) {
        pushNeutralSpan(spans, before);
      }
    }

    // Validate open/close match
    if (openName !== closeName) {
      warnings.push({
        code: "EMOTION_MISMATCH",
        message: `Mismatched tags: {${openName}} closed by {/${closeName}}`,
      });
      // Treat entire match as literal text in a neutral span
      pushNeutralSpan(spans, match[0]);
      lastIndex = matchStart + match[0].length;
      continue;
    }

    const trimmed = innerText.trim();
    if (!trimmed) {
      lastIndex = matchStart + match[0].length;
      continue;
    }

    // Resolve emotion
    let emotion: Emotion;
    if (EMOTION_NAMES.has(openName)) {
      emotion = openName as Emotion;
    } else {
      warnings.push({
        code: "EMOTION_UNSUPPORTED",
        message: `Unknown emotion "${openName}", falling back to neutral`,
      });
      emotion = "neutral";
    }

    const entry = EMOTION_MAP[emotion];
    spans.push({
      emotion,
      text: trimmed,
      voiceId: entry.voiceId,
      speed: clampEmotionSpeed(entry.speed),
    });

    lastIndex = matchStart + match[0].length;
  }

  // Any trailing untagged text
  if (lastIndex < text.length) {
    const tail = text.slice(lastIndex).trim();
    if (tail) {
      pushNeutralSpan(spans, tail);
    }
  }

  // Edge case: no spans parsed and no tags matched at all → entire text is neutral
  if (spans.length === 0 && lastIndex === 0 && text.trim()) {
    pushNeutralSpan(spans, text.trim());
  }

  return { spans, warnings };
}

function pushNeutralSpan(spans: EmotionSpan[], text: string): void {
  const entry = EMOTION_MAP.neutral;
  spans.push({
    emotion: "neutral",
    text,
    voiceId: entry.voiceId,
    speed: clampEmotionSpeed(entry.speed),
  });
}
