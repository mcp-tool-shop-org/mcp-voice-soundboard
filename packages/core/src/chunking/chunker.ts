/**
 * Smart text chunker — splits long text for sequential synthesis.
 *
 * Split cascade:
 *   1. Paragraphs (double newline)
 *   2. Sentences (period/exclamation/question followed by space or EOL)
 *   3. Punctuation (comma, semicolon, colon, dash followed by space)
 *   4. Hard split at maxChunkChars boundary (last resort)
 *
 * Tiny chunks (< minChunkChars) are merged with the previous chunk.
 */

import type { ChunkResult, ChunkWarning, ChunkingOptions } from "./types.js";
import { CHUNK_LIMITS } from "./limits.js";

/** Split text into synthesis-friendly chunks. */
export function chunkText(text: string, options?: ChunkingOptions): ChunkResult {
  const maxChunkChars = options?.maxChunkChars ?? CHUNK_LIMITS.maxChunkChars;
  const minChunkChars = options?.minChunkChars ?? CHUNK_LIMITS.minChunkChars;
  const maxTotalChars = options?.maxTotalChars ?? CHUNK_LIMITS.maxTotalChars;
  const maxChunks = options?.maxChunks ?? CHUNK_LIMITS.maxChunks;

  const warnings: ChunkWarning[] = [];
  let input = text.trim();

  if (!input) {
    return { chunks: [], wasChunked: false, wasTruncated: false, warnings };
  }

  // Enforce total chars limit
  let wasTruncated = false;
  if (input.length > maxTotalChars) {
    input = truncateAtBoundary(input, maxTotalChars);
    wasTruncated = true;
    warnings.push({
      code: "TRUNCATED",
      message: `Text truncated from ${text.trim().length} to ${input.length} characters (limit: ${maxTotalChars})`,
    });
  }

  // If short enough, return as single chunk
  if (input.length <= maxChunkChars) {
    return { chunks: [input], wasChunked: false, wasTruncated, warnings };
  }

  // Split cascade
  let rawChunks = splitByParagraphs(input);
  rawChunks = refineSplits(rawChunks, maxChunkChars, splitBySentences);
  rawChunks = refineSplits(rawChunks, maxChunkChars, splitByPunctuation);
  rawChunks = refineSplits(rawChunks, maxChunkChars, hardSplit);

  // Merge tiny chunks
  rawChunks = mergeTiny(rawChunks, minChunkChars, maxChunkChars);

  // Enforce max chunks
  if (rawChunks.length > maxChunks) {
    rawChunks = rawChunks.slice(0, maxChunks);
    wasTruncated = true;
    warnings.push({
      code: "TRUNCATED",
      message: `Chunk count reduced to ${maxChunks} (limit)`,
    });
  }

  if (rawChunks.length > 1) {
    warnings.push({
      code: "CHUNKED_TEXT",
      message: `Text split into ${rawChunks.length} chunks`,
    });
  }

  return {
    chunks: rawChunks,
    wasChunked: rawChunks.length > 1,
    wasTruncated,
    warnings,
  };
}

// ── Split strategies ──

/** Split on paragraph boundaries (double newline). */
function splitByParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Split on sentence boundaries. */
function splitBySentences(text: string): string[] {
  // Split after sentence-ending punctuation followed by space or EOL
  const parts = text.split(/(?<=[.!?])\s+/);
  return parts.map((s) => s.trim()).filter(Boolean);
}

/** Split on clause-level punctuation. */
function splitByPunctuation(text: string): string[] {
  const parts = text.split(/(?<=[,;:\u2014])\s+/);
  return parts.map((s) => s.trim()).filter(Boolean);
}

/** Hard split at character boundary (last resort). */
function hardSplit(text: string, maxChars?: number): string[] {
  const limit = maxChars ?? CHUNK_LIMITS.maxChunkChars;
  const result: string[] = [];
  let remaining = text;

  while (remaining.length > limit) {
    // Try to split at a word boundary
    let splitIdx = remaining.lastIndexOf(" ", limit);
    if (splitIdx <= 0) {
      splitIdx = limit;
    }
    result.push(remaining.slice(0, splitIdx).trim());
    remaining = remaining.slice(splitIdx).trim();
  }
  if (remaining) {
    result.push(remaining);
  }
  return result;
}

/**
 * For any chunk still over maxChunkChars, apply a finer split strategy.
 */
function refineSplits(
  chunks: string[],
  maxChunkChars: number,
  splitter: (text: string, maxChars?: number) => string[],
): string[] {
  const result: string[] = [];
  for (const chunk of chunks) {
    if (chunk.length <= maxChunkChars) {
      result.push(chunk);
    } else {
      result.push(...splitter(chunk, maxChunkChars));
    }
  }
  return result;
}

/** Merge tiny chunks with their neighbor. */
function mergeTiny(chunks: string[], minChars: number, maxChars: number): string[] {
  if (chunks.length <= 1) return chunks;

  const result: string[] = [chunks[0]];
  for (let i = 1; i < chunks.length; i++) {
    const current = chunks[i];
    const prev = result[result.length - 1];

    if (current.length < minChars && (prev.length + current.length + 1) <= maxChars) {
      // Merge with previous
      result[result.length - 1] = prev + " " + current;
    } else {
      result.push(current);
    }
  }
  return result;
}

/** Truncate text at a natural boundary near maxChars. */
function truncateAtBoundary(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;

  // Try sentence boundary
  const sub = text.slice(0, maxChars);
  const sentEnd = Math.max(sub.lastIndexOf(". "), sub.lastIndexOf("! "), sub.lastIndexOf("? "));
  if (sentEnd > maxChars * 0.5) {
    return text.slice(0, sentEnd + 1).trim();
  }

  // Try word boundary
  const wordEnd = sub.lastIndexOf(" ");
  if (wordEnd > maxChars * 0.5) {
    return text.slice(0, wordEnd).trim();
  }

  // Hard cut
  return sub.trim();
}
