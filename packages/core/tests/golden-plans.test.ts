/**
 * Golden plan tests — verify SpeechPlan shape stability for known inputs.
 * These tests lock down the parser output to prevent regressions.
 */

import { describe, it, expect } from "vitest";
import { parseSsmlLite, type SpeechPlan } from "../src/ssml/index.js";
import { chunkText } from "../src/chunking/index.js";
import { parseDialogue } from "../src/dialogue/index.js";

// ── SSML golden plans ──

describe("golden: SSML plan shapes", () => {
  it("plain text → single text segment, wasSSML=false", () => {
    const plan = parseSsmlLite("Hello world");
    expect(plan.wasSSML).toBe(false);
    expect(plan.segments).toEqual([{ type: "text", value: "Hello world" }]);
    expect(plan.plainText).toBe("Hello world");
    expect(plan.warnings).toHaveLength(0);
  });

  it("<speak> wrapped → wasSSML=true, text extracted", () => {
    const plan = parseSsmlLite("<speak>Hello world</speak>");
    expect(plan.wasSSML).toBe(true);
    expect(plan.segments).toEqual([{ type: "text", value: "Hello world" }]);
    expect(plan.plainText).toBe("Hello world");
  });

  it("break produces exact event shape", () => {
    const plan = parseSsmlLite('<speak>A<break time="300ms"/>B</speak>');
    expect(plan.segments).toEqual([
      { type: "text", value: "A" },
      { type: "event", event: { type: "break", timeMs: 300 } },
      { type: "text", value: "B" },
    ]);
  });

  it("prosody wraps text with rate events", () => {
    const plan = parseSsmlLite('<speak><prosody rate="1.2">Fast</prosody></speak>');
    expect(plan.segments).toEqual([
      { type: "event", event: { type: "prosody", rate: 1.2 } },
      { type: "text", value: "Fast" },
      { type: "event", event: { type: "prosody_end" } },
    ]);
  });

  it("emphasis wraps text with level events", () => {
    const plan = parseSsmlLite('<speak><emphasis level="strong">Important</emphasis></speak>');
    expect(plan.segments).toEqual([
      { type: "event", event: { type: "emphasis", level: "strong" } },
      { type: "text", value: "Important" },
      { type: "event", event: { type: "emphasis_end" } },
    ]);
  });

  it("sub replaces content with alias", () => {
    const plan = parseSsmlLite('<speak><sub alias="World Wide Web">WWW</sub></speak>');
    expect(plan.segments).toEqual([{ type: "text", value: "World Wide Web" }]);
    expect(plan.plainText).toBe("World Wide Web");
  });

  it("fallback plan has SSML_PARSE_FAILED warning", () => {
    const overLimit = "<break/>".repeat(250); // exceeds maxNodes
    const plan = parseSsmlLite(`<speak>Hello${overLimit}</speak>`);
    expect(plan.wasSSML).toBe(true);
    expect(plan.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "SSML_PARSE_FAILED" }),
      ]),
    );
    // Fallback plain text should still have content
    expect(plan.plainText).toContain("Hello");
  });
});

// ── Chunking golden shapes ──

describe("golden: chunking shapes", () => {
  it("short text → single chunk, no warnings", () => {
    const result = chunkText("Short text");
    expect(result.chunks).toEqual(["Short text"]);
    expect(result.wasChunked).toBe(false);
    expect(result.wasTruncated).toBe(false);
    expect(result.warnings).toHaveLength(0);
  });

  it("long text → CHUNKED_TEXT warning with chunk count", () => {
    const text = "This is a sentence. ".repeat(50);
    const result = chunkText(text, { maxChunkChars: 200 });
    expect(result.wasChunked).toBe(true);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "CHUNKED_TEXT" }),
      ]),
    );
    // Warning message includes chunk count
    const w = result.warnings.find((w) => w.code === "CHUNKED_TEXT")!;
    expect(w.message).toMatch(/\d+ chunks/);
  });

  it("over-limit text → TRUNCATED warning", () => {
    const text = "x".repeat(15000);
    const result = chunkText(text);
    expect(result.wasTruncated).toBe(true);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "TRUNCATED" }),
      ]),
    );
  });
});

// ── Dialogue golden shapes ──

describe("golden: dialogue CueSheet shapes", () => {
  it("simple dialogue → stable CueSheet", () => {
    const sheet = parseDialogue("Alice: Hello\nBob: Hi there");
    expect(sheet.speakers).toEqual(["Alice", "Bob"]);
    expect(sheet.cues).toHaveLength(2);
    expect(sheet.cues[0]).toMatchObject({
      type: "line",
      speaker: "Alice",
      text: "Hello",
    });
    expect(sheet.cues[1]).toMatchObject({
      type: "line",
      speaker: "Bob",
      text: "Hi there",
    });
    // Both have valid voiceIds
    for (const cue of sheet.cues) {
      if (cue.type === "line") {
        expect(cue.voiceId).toBeTruthy();
      }
    }
  });

  it("pause directive → exact durationMs", () => {
    const sheet = parseDialogue("Alice: Hi\n[pause 350ms]\nBob: Hey");
    expect(sheet.cues[1]).toEqual({ type: "pause", durationMs: 350 });
  });

  it("explicit cast → exact voice IDs in cues", () => {
    const sheet = parseDialogue("Alice: Hi\nBob: Hey", {
      cast: { Alice: "bf_alice", Bob: "bm_george" },
    });
    expect(sheet.cues[0]).toMatchObject({ voiceId: "bf_alice" });
    expect(sheet.cues[1]).toMatchObject({ voiceId: "bm_george" });
  });

  it("auto-cast → alternating gender voices", () => {
    const sheet = parseDialogue(
      "A: Hi\nB: Hey\nC: Hello\nD: Hola",
    );
    const voices = sheet.speakers.map((s) => sheet.cast.get(s)!);
    // Should alternate: male, female, male, female
    expect(voices[0]).toBe("bm_george");    // male
    expect(voices[1]).toBe("af_jessica");   // female
    expect(voices[2]).toBe("am_eric");      // male
    expect(voices[3]).toBe("bf_emma");      // female
  });
});

// ── Error code stability ──

describe("golden: stable error codes", () => {
  it("DIALOGUE_PARSE_FAILED on empty script", () => {
    expect(() => parseDialogue("")).toThrow(
      expect.objectContaining({ code: "DIALOGUE_PARSE_FAILED" }),
    );
  });

  it("SSML_PARSE_FAILED warning on malformed SSML", () => {
    // Force parse error via node limit
    const plan = parseSsmlLite(`<speak>${"<break/>".repeat(250)}</speak>`);
    expect(plan.warnings.some((w) => w.code === "SSML_PARSE_FAILED")).toBe(true);
  });
});
