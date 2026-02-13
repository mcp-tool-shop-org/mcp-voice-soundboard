/** SFX tag parser — extracts [tag] sound effect directives from text. */

import { SFX_TAGS, type SfxTag, type SfxSegment, type SfxWarning, type SfxParseResult } from "./types.js";
import { SFX_MAX_EVENTS } from "./registry.js";

const SFX_TAG_SET: ReadonlySet<string> = new Set(SFX_TAGS);

/**
 * Regex to match SFX tags: [ding], [chime], [whoosh], etc.
 * Also matches unknown bracket tags for warning purposes.
 */
const SFX_TAG_RE = /\[(\w+)\]/g;

/** Check whether text contains any potential SFX tags. */
export function hasSfxTags(text: string): boolean {
  return SFX_TAG_RE.test(text);
}

/**
 * Parse SFX tags from text.
 *
 * When `enabled=false` (default), tags are left as literal text and a
 * `SFX_DISABLED` warning is emitted. When `enabled=true`, known tags
 * become `SfxEvent` segments interleaved with text segments.
 *
 * Unknown tags are always left as literal text with `SFX_UNKNOWN_TAG` warning.
 * Exceeding `SFX_MAX_EVENTS` emits `SFX_MAX_EVENTS` warning and stops extracting.
 */
export function parseSfxTags(
  text: string,
  enabled: boolean = false,
): SfxParseResult {
  // Reset regex lastIndex since we use test() above
  SFX_TAG_RE.lastIndex = 0;

  const warnings: SfxWarning[] = [];

  if (!enabled) {
    // Feature disabled — check if there are any tags and warn
    SFX_TAG_RE.lastIndex = 0;
    if (SFX_TAG_RE.test(text)) {
      warnings.push({
        code: "SFX_DISABLED",
        message: "SFX tags detected but SFX feature is disabled; tags left as literal text",
      });
    }
    return {
      segments: [{ type: "text", value: text }],
      warnings,
      sfxCount: 0,
    };
  }

  const segments: SfxSegment[] = [];
  let lastIndex = 0;
  let sfxCount = 0;
  let maxReached = false;

  SFX_TAG_RE.lastIndex = 0;
  for (const match of text.matchAll(SFX_TAG_RE)) {
    const tagName = match[1].toLowerCase();
    const matchStart = match.index!;

    // Emit any text before this tag
    if (matchStart > lastIndex) {
      const before = text.slice(lastIndex, matchStart);
      if (before.trim()) {
        segments.push({ type: "text", value: before.trim() });
      }
    }

    if (!SFX_TAG_SET.has(tagName)) {
      // Unknown tag — leave as literal
      warnings.push({
        code: "SFX_UNKNOWN_TAG",
        message: `Unknown SFX tag [${tagName}], left as literal text`,
      });
      segments.push({ type: "text", value: match[0] });
    } else if (maxReached) {
      // Over limit — leave as literal
      segments.push({ type: "text", value: match[0] });
    } else {
      sfxCount++;
      if (sfxCount > SFX_MAX_EVENTS) {
        maxReached = true;
        warnings.push({
          code: "SFX_MAX_EVENTS",
          message: `Exceeded max SFX events (${SFX_MAX_EVENTS}); remaining tags left as literal text`,
        });
        segments.push({ type: "text", value: match[0] });
        sfxCount--; // Don't count the one that exceeded
      } else {
        segments.push({ type: "sfx", tag: tagName as SfxTag });
      }
    }

    lastIndex = matchStart + match[0].length;
  }

  // Trailing text
  if (lastIndex < text.length) {
    const tail = text.slice(lastIndex);
    if (tail.trim()) {
      segments.push({ type: "text", value: tail.trim() });
    }
  }

  // If no segments were created, return original text
  if (segments.length === 0 && text.trim()) {
    segments.push({ type: "text", value: text.trim() });
  }

  return { segments, warnings, sfxCount };
}
