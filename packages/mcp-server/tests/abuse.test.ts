/**
 * Abuse battery — edge-case and adversarial input tests.
 * Validates that guardrails hold under hostile input.
 */

import { describe, it, expect } from "vitest";
import {
  validateText,
  LIMITS,
  parseSsmlLite,
  SSML_LIMITS,
  chunkText,
  parseSfxTags,
  SFX_MAX_EVENTS,
  resolveOutputDir,
  OutputDirError,
  LimitError,
} from "@mcptoolshop/voice-soundboard-core";
import { SynthesisSemaphore, BusyError } from "../src/concurrency.js";
import { ToolRateLimiter } from "../src/rateLimit.js";
import { withTimeout, TimeoutError } from "../src/timeout.js";

// ── Text limits ──

describe("abuse: text limits", () => {
  it("rejects text exceeding maxTextLength", () => {
    const oversized = "x".repeat(LIMITS.maxTextLength + 1);
    expect(() => validateText(oversized)).toThrow(LimitError);
  });

  it("rejects empty string", () => {
    expect(() => validateText("")).toThrow(LimitError);
  });

  it("rejects whitespace-only string", () => {
    expect(() => validateText("   \n\t  ")).toThrow(LimitError);
  });

  it("accepts text at exactly maxTextLength", () => {
    const exact = "x".repeat(LIMITS.maxTextLength);
    expect(validateText(exact)).toBe(exact);
  });

  it("handles null bytes in text", () => {
    // validateText should handle text with null bytes gracefully
    const withNulls = "Hello\x00World";
    expect(validateText(withNulls)).toBe(withNulls);
  });
});

// ── SSML abuse ──

describe("abuse: SSML limits", () => {
  it("caps nodes at maxNodes", () => {
    const tooMany = `<speak>${"<break/>".repeat(SSML_LIMITS.maxNodes + 1)}</speak>`;
    const plan = parseSsmlLite(tooMany);
    // Should trigger fallback or warning
    expect(plan.warnings.length).toBeGreaterThan(0);
  });

  it("caps break time to maxBreakMs", () => {
    const plan = parseSsmlLite('<speak><break time="99999ms"/></speak>');
    const breakEvent = plan.segments.find(
      (s) => s.type === "event" && s.event.type === "break",
    );
    if (breakEvent && breakEvent.type === "event" && breakEvent.event.type === "break") {
      expect(breakEvent.event.timeMs).toBeLessThanOrEqual(SSML_LIMITS.maxBreakMs);
    }
  });

  it("handles deeply nested SSML", () => {
    const deep = "<speak>" + "<emphasis>".repeat(50) + "text" + "</emphasis>".repeat(50) + "</speak>";
    const plan = parseSsmlLite(deep);
    // Should not throw, may produce warnings
    expect(plan.plainText).toContain("text");
  });
});

// ── SFX abuse ──

describe("abuse: SFX limits", () => {
  it("caps SFX events at SFX_MAX_EVENTS", () => {
    const text = "[ding] ".repeat(SFX_MAX_EVENTS + 10);
    const result = parseSfxTags(text, true);
    const sfxEvents = result.segments.filter((s) => s.type === "sfx");
    expect(sfxEvents.length).toBeLessThanOrEqual(SFX_MAX_EVENTS);
    expect(result.warnings.some((w) => w.code === "SFX_MAX_EVENTS")).toBe(true);
  });
});

// ── Path traversal ──

describe("abuse: path traversal", () => {
  it("rejects ../ traversal", async () => {
    await expect(
      resolveOutputDir("../../etc/passwd", "/tmp/sandbox"),
    ).rejects.toThrow(OutputDirError);
  });

  it("rejects absolute path escape", async () => {
    await expect(
      resolveOutputDir("/etc/passwd", "/tmp/sandbox"),
    ).rejects.toThrow(OutputDirError);
  });

  it("rejects ..\\  Windows-style traversal", async () => {
    await expect(
      resolveOutputDir("..\\..\\Windows\\System32", "/tmp/sandbox"),
    ).rejects.toThrow(OutputDirError);
  });
});

// ── Concurrency abuse ──

describe("abuse: concurrency", () => {
  it("rejects when queue is full", async () => {
    const sem = new SynthesisSemaphore(1);
    let resolve1!: () => void;

    // Fill the slot
    sem.run(() => new Promise<void>((r) => { resolve1 = r; }));

    // Fill the queue
    const p2 = sem.run(async () => "queued");

    // Third call should be rejected
    await expect(sem.run(async () => "overflow")).rejects.toThrow(BusyError);

    resolve1();
    await p2;
  });
});

// ── Rate limit abuse ──

describe("abuse: rate limiting", () => {
  it("blocks rapid-fire calls", () => {
    const limiter = new ToolRateLimiter({ maxCalls: 5, windowMs: 60_000 });
    const now = Date.now();

    // 5 should succeed
    for (let i = 0; i < 5; i++) {
      expect(limiter.check("voice_speak", now + i)).toBe(true);
    }

    // 6th should be blocked
    expect(limiter.check("voice_speak", now + 5)).toBe(false);
  });
});

// ── Timeout abuse ──

describe("abuse: timeout", () => {
  it("kills hanging synthesis", async () => {
    await expect(
      withTimeout(
        () => new Promise<never>(() => { /* intentionally never resolves */ }),
        50,
      ),
    ).rejects.toThrow(TimeoutError);
  });
});

// ── Chunking abuse ──

describe("abuse: chunking", () => {
  it("handles very long single-word text", () => {
    const longWord = "a".repeat(5000);
    const result = chunkText(longWord);
    // Should produce chunks without crashing
    expect(result.chunks.length).toBeGreaterThan(0);
  });
});
