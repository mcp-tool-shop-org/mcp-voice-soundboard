/**
 * SSML-lite parser — converts a subset of SSML into a SpeechPlan.
 *
 * Tag allowlist:
 *   <speak>         — root wrapper (optional)
 *   <break>         — pause (time="250ms" or strength="medium")
 *   <prosody>       — rate modifier (rate="slow"|"fast"|"x-slow"|"x-fast"|"1.2")
 *   <emphasis>      — emphasis level (level="strong"|"moderate"|"reduced"|"none")
 *   <sub>           — substitution (alias="replacement text")
 *   <say-as>        — interpret-as hint (stripped; text passed through)
 *
 * Everything else is stripped with a warning. The parser produces a flat
 * list of text/event segments plus a fallback plain-text string.
 */

import type {
  SpeechPlan,
  PlanSegment,
  TextSegment,
  SpeechEvent,
  SsmlWarning,
} from "./types.js";
import { SSML_LIMITS } from "./limits.js";

// ── Public API ──

export class SsmlParseError extends Error {
  constructor(
    message: string,
    public readonly code: string = "SSML_PARSE_FAILED",
  ) {
    super(message);
    this.name = "SsmlParseError";
  }
}

/**
 * Parse SSML-lite input into a SpeechPlan.
 * If input doesn't look like SSML, wraps it as plain text.
 * On parse errors, falls back to plain text with an SSML_PARSE_FAILED warning.
 */
export function parseSsmlLite(input: string): SpeechPlan {
  const trimmed = input.trim();

  if (!looksLikeSsml(trimmed)) {
    return plainTextPlan(trimmed);
  }

  try {
    return doParse(trimmed);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return plainTextFallback(trimmed, message);
  }
}

/** Check if input looks like it might be SSML. */
export function looksLikeSsml(input: string): boolean {
  return /<\s*(speak|break|prosody|emphasis|sub|say-as)\b/i.test(input);
}

// ── Allowed tags ──

const ALLOWED_TAGS = new Set(["speak", "break", "prosody", "emphasis", "sub", "say-as"]);

// ── Parse state ──

interface ParseState {
  body: string;
  segments: PlanSegment[];
  warnings: SsmlWarning[];
  nodeCount: number;
  totalChars: number;
  openStack: string[];
}

// ── Core parser ──

/**
 * Regex that matches SSML tags (open, close, self-closing).
 * Groups: 1=closing-slash, 2=tag-name, 3=attributes, 4=self-closing-slash
 */
const TAG_RE = /<(\/?)(\w[\w-]*)((?:\s+[^>]*?)?)(\/?)\s*>/g;

function doParse(input: string): SpeechPlan {
  let body = input;
  const speakMatch = body.match(/^\s*<speak\b[^>]*>([\s\S]*)<\/speak>\s*$/i);
  if (speakMatch) {
    body = speakMatch[1];
  }

  const state: ParseState = {
    body,
    segments: [],
    warnings: [],
    nodeCount: 0,
    totalChars: 0,
    openStack: [],
  };

  const re = new RegExp(TAG_RE.source, TAG_RE.flags);
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(body)) !== null) {
    const textBefore = body.slice(lastIndex, match.index);
    if (textBefore) {
      addText(state, textBefore);
    }
    lastIndex = match.index + match[0].length;

    const isClosing = match[1] === "/";
    const tagName = match[2].toLowerCase();
    const attrsStr = match[3];
    const isSelfClosing = match[4] === "/";

    state.nodeCount++;
    if (state.nodeCount > SSML_LIMITS.maxNodes) {
      throw new SsmlParseError(`Too many SSML nodes (max ${SSML_LIMITS.maxNodes})`);
    }

    if (!ALLOWED_TAGS.has(tagName)) {
      state.warnings.push({
        code: "SSML_TAG_STRIPPED",
        message: `Unsupported tag <${tagName}> stripped`,
      });
      continue;
    }

    if (tagName === "speak") {
      continue;
    }

    if (isClosing) {
      handleClosingTag(state, tagName);
    } else if (isSelfClosing) {
      handleSelfClosingTag(state, tagName, attrsStr);
    } else {
      const skip = handleOpeningTag(state, tagName, attrsStr, re);
      if (skip !== undefined) {
        lastIndex = skip;
        re.lastIndex = skip;
      }
    }
  }

  const tail = body.slice(lastIndex);
  if (tail) {
    addText(state, tail);
  }

  // Auto-close unclosed tags
  while (state.openStack.length > 0) {
    const unclosed = state.openStack.pop()!;
    if (unclosed === "prosody") {
      pushEvent(state, { type: "prosody_end" });
    } else if (unclosed === "emphasis") {
      pushEvent(state, { type: "emphasis_end" });
    }
    state.warnings.push({
      code: "SSML_UNCLOSED_TAG",
      message: `Unclosed <${unclosed}> auto-closed`,
    });
  }

  const plainText = extractPlainText(state.segments);

  return {
    segments: state.segments,
    plainText,
    wasSSML: true,
    warnings: state.warnings,
  };
}

// ── Tag handlers ──

function handleSelfClosingTag(state: ParseState, tagName: string, attrsStr: string): void {
  if (tagName === "break") {
    const timeMs = parseBreakTime(attrsStr);
    pushEvent(state, { type: "break", timeMs });
  }
}

/**
 * Handle an opening tag. Returns a new lastIndex if content was consumed
 * (for <sub> alias replacement), or undefined otherwise.
 */
function handleOpeningTag(
  state: ParseState,
  tagName: string,
  attrsStr: string,
  re: RegExp,
): number | undefined {
  switch (tagName) {
    case "break": {
      const timeMs = parseBreakTime(attrsStr);
      pushEvent(state, { type: "break", timeMs });
      return undefined;
    }
    case "prosody": {
      const rate = parseProsodyRate(attrsStr);
      if (rate !== undefined) {
        pushEvent(state, { type: "prosody", rate });
        state.openStack.push("prosody");
      }
      return undefined;
    }
    case "emphasis": {
      const level = parseEmphasisLevel(attrsStr);
      pushEvent(state, { type: "emphasis", level });
      state.openStack.push("emphasis");
      return undefined;
    }
    case "sub": {
      const alias = parseAttr(attrsStr, "alias");
      if (alias) {
        const closeEnd = findCloseTagEnd(state.body, "sub", re.lastIndex);
        if (closeEnd !== -1) {
          addText(state, alias);
          return closeEnd;
        }
      }
      return undefined;
    }
    case "say-as": {
      // Passthrough — inner text is handled naturally
      return undefined;
    }
    default:
      return undefined;
  }
}

function handleClosingTag(state: ParseState, tagName: string): void {
  if (tagName === "prosody") {
    const idx = state.openStack.lastIndexOf("prosody");
    if (idx !== -1) {
      state.openStack.splice(idx, 1);
      pushEvent(state, { type: "prosody_end" });
    }
  } else if (tagName === "emphasis") {
    const idx = state.openStack.lastIndexOf("emphasis");
    if (idx !== -1) {
      state.openStack.splice(idx, 1);
      pushEvent(state, { type: "emphasis_end" });
    }
  }
}

// ── Attribute parsers ──

function parseBreakTime(attrsStr: string): number {
  const timeVal = parseAttr(attrsStr, "time");
  if (timeVal) {
    const ms = parseDurationMs(timeVal);
    return Math.min(ms, SSML_LIMITS.maxBreakMs);
  }

  const strength = parseAttr(attrsStr, "strength");
  if (strength) {
    return strengthToMs(strength);
  }

  return 250;
}

function parseProsodyRate(attrsStr: string): number | undefined {
  const rate = parseAttr(attrsStr, "rate");
  if (!rate) return undefined;

  const numeric = parseFloat(rate);
  if (!isNaN(numeric)) {
    return clampRate(numeric);
  }

  switch (rate.toLowerCase()) {
    case "x-slow": return clampRate(0.5);
    case "slow": return clampRate(0.75);
    case "medium": return 1.0;
    case "fast": return clampRate(1.25);
    case "x-fast": return clampRate(1.5);
    default: return undefined;
  }
}

function parseEmphasisLevel(attrsStr: string): "strong" | "moderate" | "reduced" | "none" {
  const level = parseAttr(attrsStr, "level");
  if (!level) return "moderate";

  switch (level.toLowerCase()) {
    case "strong": return "strong";
    case "moderate": return "moderate";
    case "reduced": return "reduced";
    case "none": return "none";
    default: return "moderate";
  }
}

// ── Utility ──

function parseAttr(attrsStr: string, name: string): string | undefined {
  const re = new RegExp(`${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i");
  const m = attrsStr.match(re);
  return m ? (m[1] ?? m[2]) : undefined;
}

function parseDurationMs(value: string): number {
  const trimmed = value.trim().toLowerCase();
  if (trimmed.endsWith("ms")) {
    return Math.max(0, parseInt(trimmed, 10));
  }
  if (trimmed.endsWith("s")) {
    return Math.max(0, parseFloat(trimmed) * 1000);
  }
  const num = parseInt(trimmed, 10);
  return isNaN(num) ? 250 : Math.max(0, num);
}

function strengthToMs(strength: string): number {
  switch (strength.toLowerCase()) {
    case "none": return 0;
    case "x-weak": return 100;
    case "weak": return 200;
    case "medium": return 400;
    case "strong": return 750;
    case "x-strong": return 1000;
    default: return 250;
  }
}

function clampRate(rate: number): number {
  return Math.max(SSML_LIMITS.minProsodyRate, Math.min(SSML_LIMITS.maxProsodyRate, rate));
}

function addText(state: ParseState, raw: string): void {
  const text = decodeEntities(raw);
  if (!text.trim()) return;

  state.totalChars += text.length;
  if (state.totalChars > SSML_LIMITS.maxTotalChars) {
    throw new SsmlParseError(`SSML text content exceeds ${SSML_LIMITS.maxTotalChars} characters`);
  }

  const last = state.segments[state.segments.length - 1];
  if (last && last.type === "text") {
    state.segments[state.segments.length - 1] = { type: "text", value: last.value + text };
  } else {
    state.segments.push({ type: "text", value: text });
  }
}

function pushEvent(state: ParseState, event: SpeechEvent): void {
  state.segments.push({ type: "event", event });
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function extractPlainText(segments: readonly PlanSegment[]): string {
  return segments
    .filter((s): s is TextSegment => s.type === "text")
    .map((s) => s.value)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Find the end index (past the closing tag) of </tagName> starting from fromIndex. */
function findCloseTagEnd(body: string, tagName: string, fromIndex: number): number {
  const closeTag = `</${tagName}>`;
  const idx = body.toLowerCase().indexOf(closeTag.toLowerCase(), fromIndex);
  if (idx === -1) return -1;
  return idx + closeTag.length;
}

// ── Plain text plans ──

function plainTextPlan(text: string): SpeechPlan {
  if (!text) {
    return { segments: [], plainText: "", wasSSML: false, warnings: [] };
  }
  return {
    segments: [{ type: "text", value: text }],
    plainText: text,
    wasSSML: false,
    warnings: [],
  };
}

function plainTextFallback(input: string, errorMessage: string): SpeechPlan {
  const stripped = stripAllTags(input);
  return {
    segments: stripped ? [{ type: "text", value: stripped }] : [],
    plainText: stripped,
    wasSSML: true,
    warnings: [{
      code: "SSML_PARSE_FAILED",
      message: `SSML parse failed, using plain text fallback: ${errorMessage}`,
    }],
  };
}

function stripAllTags(input: string): string {
  return decodeEntities(input.replace(/<[^>]*>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
}
