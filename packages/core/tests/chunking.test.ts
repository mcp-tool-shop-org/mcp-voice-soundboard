import { describe, it, expect } from "vitest";
import { chunkText, CHUNK_LIMITS } from "../src/chunking/index.js";

// ── Short text (no chunking) ──

describe("chunkText — short text", () => {
  it("returns single chunk for short text", () => {
    const result = chunkText("Hello world");
    expect(result.chunks).toEqual(["Hello world"]);
    expect(result.wasChunked).toBe(false);
    expect(result.wasTruncated).toBe(false);
    expect(result.warnings).toHaveLength(0);
  });

  it("handles empty text", () => {
    const result = chunkText("");
    expect(result.chunks).toEqual([]);
    expect(result.wasChunked).toBe(false);
  });

  it("trims whitespace", () => {
    const result = chunkText("  Hello  ");
    expect(result.chunks).toEqual(["Hello"]);
  });

  it("returns single chunk when exactly at limit", () => {
    const text = "x".repeat(CHUNK_LIMITS.maxChunkChars);
    const result = chunkText(text);
    expect(result.chunks).toHaveLength(1);
    expect(result.wasChunked).toBe(false);
  });
});

// ── Paragraph splitting ──

describe("chunkText — paragraph splitting", () => {
  it("splits on double newlines when text exceeds maxChunkChars", () => {
    // Each paragraph needs to be substantial enough that total > maxChunkChars
    const p1 = "First paragraph. ".repeat(15).trim();   // ~255 chars
    const p2 = "Second paragraph. ".repeat(15).trim();   // ~270 chars
    const p3 = "Third paragraph. ".repeat(15).trim();    // ~255 chars
    const text = `${p1}\n\n${p2}\n\n${p3}`;
    const result = chunkText(text);
    expect(result.chunks.length).toBe(3);
    expect(result.chunks[0]).toContain("First paragraph");
    expect(result.chunks[1]).toContain("Second paragraph");
    expect(result.chunks[2]).toContain("Third paragraph");
    expect(result.wasChunked).toBe(true);
    expect(result.warnings.some((w) => w.code === "CHUNKED_TEXT")).toBe(true);
  });

  it("splits on double newlines with custom maxChunkChars", () => {
    const text = "First.\n\nSecond.\n\nThird.";
    const result = chunkText(text, { maxChunkChars: 10 });
    expect(result.chunks.length).toBe(3);
  });

  it("handles mixed whitespace between paragraphs", () => {
    const text = "First.\n\n\n  \nSecond.";
    const result = chunkText(text, { maxChunkChars: 10 });
    expect(result.chunks).toHaveLength(2);
  });
});

// ── Sentence splitting ──

describe("chunkText — sentence splitting", () => {
  it("splits long paragraph into sentences", () => {
    // Create a paragraph longer than maxChunkChars that has sentence boundaries
    const sentence = "This is a moderately long sentence that takes up space. ";
    const count = Math.ceil((CHUNK_LIMITS.maxChunkChars + 100) / sentence.length);
    const text = sentence.repeat(count).trim();

    const result = chunkText(text);
    expect(result.wasChunked).toBe(true);
    for (const chunk of result.chunks) {
      expect(chunk.length).toBeLessThanOrEqual(CHUNK_LIMITS.maxChunkChars + 100);
    }
  });
});

// ── Punctuation splitting ──

describe("chunkText — punctuation splitting", () => {
  it("splits on commas when sentences are too long", () => {
    // One long sentence with many comma clauses
    const clause = "this is a clause with some words in it, ";
    const count = Math.ceil((CHUNK_LIMITS.maxChunkChars + 50) / clause.length);
    const text = clause.repeat(count).trim().replace(/,\s*$/, ".");

    const result = chunkText(text);
    expect(result.wasChunked).toBe(true);
    expect(result.chunks.length).toBeGreaterThan(1);
  });
});

// ── Hard splitting ──

describe("chunkText — hard splitting", () => {
  it("hard splits when no natural boundaries exist", () => {
    // A string with no punctuation or spaces — worst case
    const text = "x".repeat(CHUNK_LIMITS.maxChunkChars * 2 + 10);
    const result = chunkText(text);
    expect(result.wasChunked).toBe(true);
    expect(result.chunks.length).toBeGreaterThan(1);
    // Each chunk should be <= maxChunkChars
    for (const chunk of result.chunks) {
      expect(chunk.length).toBeLessThanOrEqual(CHUNK_LIMITS.maxChunkChars);
    }
  });

  it("prefers word boundaries in hard split", () => {
    const words = "word ".repeat(200).trim(); // ~1000 chars with spaces
    const result = chunkText(words, { maxChunkChars: 100 });
    expect(result.wasChunked).toBe(true);
    for (const chunk of result.chunks) {
      // Should split at word boundary, no trailing space
      expect(chunk).not.toMatch(/^\s/);
      expect(chunk).not.toMatch(/\s$/);
    }
  });
});

// ── Tiny chunk merging ──

describe("chunkText — tiny chunk merging", () => {
  it("merges tiny chunks with previous", () => {
    const text = "A big paragraph here.\n\nOK.\n\nAnother paragraph.";
    const result = chunkText(text);
    // "OK." is only 3 chars, below minChunkChars — should be merged
    expect(result.chunks.some((c) => c === "OK.")).toBe(false);
    // The merged chunk should contain "OK."
    expect(result.chunks.some((c) => c.includes("OK."))).toBe(true);
  });

  it("does not merge when it would exceed maxChunkChars", () => {
    const longChunk = "x".repeat(CHUNK_LIMITS.maxChunkChars - 5);
    const tiny = "Hi.";
    const text = longChunk + "\n\n" + tiny + "\n\nAnother paragraph.";
    const result = chunkText(text);
    // The tiny chunk shouldn't merge with the long one (would exceed max)
    // It should merge with "Another paragraph." instead
    expect(result.chunks[0].length).toBeLessThanOrEqual(CHUNK_LIMITS.maxChunkChars);
  });
});

// ── Truncation ──

describe("chunkText — truncation", () => {
  it("truncates text exceeding maxTotalChars", () => {
    const text = "Hello world. ".repeat(2000); // ~26000 chars
    const result = chunkText(text);
    expect(result.wasTruncated).toBe(true);
    expect(result.warnings.some((w) => w.code === "TRUNCATED")).toBe(true);
    const totalChars = result.chunks.reduce((sum, c) => sum + c.length, 0);
    expect(totalChars).toBeLessThanOrEqual(CHUNK_LIMITS.maxTotalChars);
  });

  it("truncates at sentence boundary when possible", () => {
    const text = "This is a sentence. ".repeat(700); // ~14000 chars
    const result = chunkText(text, { maxTotalChars: 100 });
    expect(result.wasTruncated).toBe(true);
    // Should end at a sentence boundary
    const lastChunk = result.chunks[result.chunks.length - 1];
    expect(lastChunk.endsWith(".")).toBe(true);
  });

  it("enforces maxChunks limit", () => {
    // Create many paragraphs that each exceed maxChunkChars when combined
    const paragraphs = Array.from(
      { length: 100 },
      (_, i) => `Paragraph number ${i} with enough text to be a real chunk.`,
    ).join("\n\n");
    // Use small maxChunkChars to force many splits, then cap with maxChunks
    const result = chunkText(paragraphs, { maxChunkChars: 60, maxChunks: 5 });
    expect(result.chunks.length).toBeLessThanOrEqual(5);
    expect(result.wasTruncated).toBe(true);
  });
});

// ── Custom options ──

describe("chunkText — custom options", () => {
  it("respects custom maxChunkChars", () => {
    const text = "First sentence. Second sentence. Third sentence.";
    const result = chunkText(text, { maxChunkChars: 20 });
    expect(result.wasChunked).toBe(true);
    for (const chunk of result.chunks) {
      expect(chunk.length).toBeLessThanOrEqual(30); // some slack for split boundaries
    }
  });

  it("respects custom minChunkChars", () => {
    const text = "Big paragraph here.\n\nOK.\n\nAnother here.";
    // With minChunkChars=0 and small maxChunkChars to force splitting
    const result = chunkText(text, { minChunkChars: 0, maxChunkChars: 25 });
    expect(result.chunks).toContain("OK.");
  });
});

// ── Realistic content ──

describe("chunkText — realistic content", () => {
  it("handles a long article-like text", () => {
    const paragraphs = [
      "The quick brown fox jumps over the lazy dog. This is a well-known pangram used in typing tests.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "Another paragraph with some content. It has multiple sentences. Each one is fairly short.",
    ];
    const text = paragraphs.join("\n\n");
    const result = chunkText(text);
    expect(result.chunks.length).toBeGreaterThanOrEqual(1);
    // All content should be preserved
    const joined = result.chunks.join(" ");
    expect(joined).toContain("quick brown fox");
    expect(joined).toContain("Lorem ipsum");
    expect(joined).toContain("fairly short");
  });
});
