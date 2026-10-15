/** Emotion span parser — extracts {emotion}...{/emotion} spans from text. */

import type {
  Emotion,
  EmotionSpan,
  EmotionWarning,
  EmotionParseResult,
} from "./types.js";
import { EMOTION_MAP, EMOTION_NAMES, clampEmotionSpeed } from "./map.js";

const EMOTION_OPEN_RE = /\{(\w+)\}/g;
const EMOTION_CLOSE_RE = /\{\/(\w+)\}/g;

interface EmotionTagMatch {
  /** Index of the opening `{`. */
  readonly index: number;
  /** The whole `{open}inner{/close}` text. */
  readonly full: string;
  readonly openName: string;
  readonly innerText: string;
  readonly closeName: string;
}

/**
 * Find `{emotion}text{/emotion}` spans: each runs from an open tag to the first
 * close tag after it, whatever its name (names are compared by the caller).
 * Same matches as the lazy regex /\{(\w+)\}([\s\S]*?)\{\/(\w+)\}/g, but each
 * tag is looked for once, forward only; the regex rescans to the end of the text
 * from every unclosed open tag, which is quadratic.
 */
function* findEmotionTags(text: string): Generator<EmotionTagMatch> {
  let pos = 0;
  while (pos < text.length) {
    EMOTION_OPEN_RE.lastIndex = pos;
    const open = EMOTION_OPEN_RE.exec(text);
    if (!open) return;
    const innerStart = open.index + open[0].length;

    EMOTION_CLOSE_RE.lastIndex = innerStart;
    const close = EMOTION_CLOSE_RE.exec(text);
    // No close tag after this open tag means none after any later one either.
    if (!close) return;

    const end = close.index + close[0].length;
    yield {
      index: open.index,
      full: text.slice(open.index, end),
      openName: open[1],
      innerText: text.slice(innerStart, close.index),
      closeName: close[1],
    };
    pos = end;
  }
}

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

  for (const match of findEmotionTags(text)) {
    const { openName, innerText, closeName } = match;
    const matchStart = match.index;

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
      pushNeutralSpan(spans, match.full);
      lastIndex = matchStart + match.full.length;
      continue;
    }

    const trimmed = innerText.trim();
    if (!trimmed) {
      lastIndex = matchStart + match.full.length;
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

    lastIndex = matchStart + match.full.length;
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
