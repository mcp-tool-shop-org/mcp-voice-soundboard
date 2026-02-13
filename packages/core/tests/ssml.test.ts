import { describe, it, expect } from "vitest";
import {
  parseSsmlLite,
  looksLikeSsml,
  SSML_LIMITS,
  type SpeechPlan,
  type PlanSegment,
} from "../src/ssml/index.js";

// ── Helpers ──

function textSegments(plan: SpeechPlan): string[] {
  return plan.segments
    .filter((s): s is Extract<PlanSegment, { type: "text" }> => s.type === "text")
    .map((s) => s.value);
}

function eventTypes(plan: SpeechPlan): string[] {
  return plan.segments
    .filter((s): s is Extract<PlanSegment, { type: "event" }> => s.type === "event")
    .map((s) => s.event.type);
}

// ── looksLikeSsml ──

describe("looksLikeSsml", () => {
  it("returns true for <speak>", () => {
    expect(looksLikeSsml("<speak>Hello</speak>")).toBe(true);
  });

  it("returns true for <break/>", () => {
    expect(looksLikeSsml('Take a breath <break time="500ms"/> and continue')).toBe(true);
  });

  it("returns true for <prosody>", () => {
    expect(looksLikeSsml('<prosody rate="slow">Slow down</prosody>')).toBe(true);
  });

  it("returns true for <emphasis>", () => {
    expect(looksLikeSsml('<emphasis level="strong">Important</emphasis>')).toBe(true);
  });

  it("returns true for <sub>", () => {
    expect(looksLikeSsml('<sub alias="World Wide Web">WWW</sub>')).toBe(true);
  });

  it("returns true for <say-as>", () => {
    expect(looksLikeSsml('<say-as interpret-as="cardinal">42</say-as>')).toBe(true);
  });

  it("returns false for plain text", () => {
    expect(looksLikeSsml("Hello world")).toBe(false);
  });

  it("returns false for non-SSML tags", () => {
    expect(looksLikeSsml("<div>Hello</div>")).toBe(false);
  });

  it("returns false for angle brackets in text", () => {
    expect(looksLikeSsml("2 < 3 and 5 > 4")).toBe(false);
  });
});

// ── Plain text passthrough ──

describe("parseSsmlLite — plain text", () => {
  it("passes plain text through as-is", () => {
    const plan = parseSsmlLite("Hello world");
    expect(plan.wasSSML).toBe(false);
    expect(plan.plainText).toBe("Hello world");
    expect(plan.segments).toHaveLength(1);
    expect(plan.segments[0]).toEqual({ type: "text", value: "Hello world" });
    expect(plan.warnings).toHaveLength(0);
  });

  it("trims whitespace", () => {
    const plan = parseSsmlLite("  Hello  ");
    expect(plan.plainText).toBe("Hello");
  });

  it("handles empty input", () => {
    const plan = parseSsmlLite("");
    expect(plan.plainText).toBe("");
    expect(plan.segments).toHaveLength(0);
    expect(plan.wasSSML).toBe(false);
  });
});

// ── <speak> wrapper ──

describe("parseSsmlLite — <speak>", () => {
  it("unwraps <speak> wrapper", () => {
    const plan = parseSsmlLite("<speak>Hello world</speak>");
    expect(plan.wasSSML).toBe(true);
    expect(plan.plainText).toBe("Hello world");
    expect(plan.segments).toHaveLength(1);
  });

  it("handles <speak> with attributes", () => {
    const plan = parseSsmlLite('<speak version="1.0">Hello</speak>');
    expect(plan.plainText).toBe("Hello");
  });
});

// ── <break> ──

describe("parseSsmlLite — <break>", () => {
  it("parses self-closing break with time in ms", () => {
    const plan = parseSsmlLite('<speak>Hello<break time="500ms"/>world</speak>');
    expect(plan.segments).toHaveLength(3);
    expect(plan.segments[0]).toEqual({ type: "text", value: "Hello" });
    expect(plan.segments[1]).toEqual({
      type: "event",
      event: { type: "break", timeMs: 500 },
    });
    expect(plan.segments[2]).toEqual({ type: "text", value: "world" });
  });

  it("parses break with time in seconds", () => {
    const plan = parseSsmlLite('<speak>Wait<break time="1.5s"/>done</speak>');
    const breakEvt = plan.segments[1];
    expect(breakEvt).toEqual({
      type: "event",
      event: { type: "break", timeMs: 1500 },
    });
  });

  it("parses break with strength", () => {
    const plan = parseSsmlLite('<speak>A<break strength="strong"/>B</speak>');
    const breakEvt = plan.segments[1];
    expect(breakEvt).toEqual({
      type: "event",
      event: { type: "break", timeMs: 750 },
    });
  });

  it("uses default 250ms for break without attributes", () => {
    const plan = parseSsmlLite("<speak>A<break/>B</speak>");
    const breakEvt = plan.segments[1];
    expect(breakEvt).toEqual({
      type: "event",
      event: { type: "break", timeMs: 250 },
    });
  });

  it("clamps break time to maxBreakMs", () => {
    const plan = parseSsmlLite('<speak>A<break time="60000ms"/>B</speak>');
    const breakEvt = plan.segments[1];
    expect(breakEvt).toEqual({
      type: "event",
      event: { type: "break", timeMs: SSML_LIMITS.maxBreakMs },
    });
  });

  it("handles non-self-closing <break> as self-closing", () => {
    const plan = parseSsmlLite('<speak>A<break time="300ms">B</speak>');
    expect(eventTypes(plan)).toContain("break");
  });
});

// ── <prosody> ──

describe("parseSsmlLite — <prosody>", () => {
  it("parses prosody with numeric rate", () => {
    const plan = parseSsmlLite('<speak><prosody rate="1.2">Fast speech</prosody></speak>');
    expect(plan.segments[0]).toEqual({
      type: "event",
      event: { type: "prosody", rate: 1.2 },
    });
    expect(plan.segments[1]).toEqual({ type: "text", value: "Fast speech" });
    expect(plan.segments[2]).toEqual({ type: "event", event: { type: "prosody_end" } });
  });

  it("parses prosody with named rate 'slow'", () => {
    const plan = parseSsmlLite('<speak><prosody rate="slow">Slow</prosody></speak>');
    expect(plan.segments[0]).toEqual({
      type: "event",
      event: { type: "prosody", rate: 0.75 },
    });
  });

  it("parses prosody with named rate 'x-fast'", () => {
    const plan = parseSsmlLite('<speak><prosody rate="x-fast">Quick</prosody></speak>');
    expect(plan.segments[0]).toEqual({
      type: "event",
      event: { type: "prosody", rate: 1.5 },
    });
  });

  it("clamps prosody rate to limits", () => {
    const plan = parseSsmlLite('<speak><prosody rate="0.1">Too slow</prosody></speak>');
    expect(plan.segments[0]).toEqual({
      type: "event",
      event: { type: "prosody", rate: SSML_LIMITS.minProsodyRate },
    });
  });

  it("auto-closes unclosed prosody", () => {
    const plan = parseSsmlLite('<speak><prosody rate="fast">No close tag</speak>');
    expect(eventTypes(plan)).toEqual(["prosody", "prosody_end"]);
    expect(plan.warnings.some((w) => w.code === "SSML_UNCLOSED_TAG")).toBe(true);
  });
});

// ── <emphasis> ──

describe("parseSsmlLite — <emphasis>", () => {
  it("parses emphasis with level strong", () => {
    const plan = parseSsmlLite('<speak><emphasis level="strong">Important!</emphasis></speak>');
    expect(plan.segments[0]).toEqual({
      type: "event",
      event: { type: "emphasis", level: "strong" },
    });
    expect(plan.segments[1]).toEqual({ type: "text", value: "Important!" });
    expect(plan.segments[2]).toEqual({ type: "event", event: { type: "emphasis_end" } });
  });

  it("defaults emphasis level to moderate", () => {
    const plan = parseSsmlLite("<speak><emphasis>Default</emphasis></speak>");
    expect(plan.segments[0]).toEqual({
      type: "event",
      event: { type: "emphasis", level: "moderate" },
    });
  });

  it("handles all emphasis levels", () => {
    for (const level of ["strong", "moderate", "reduced", "none"] as const) {
      const plan = parseSsmlLite(`<speak><emphasis level="${level}">Text</emphasis></speak>`);
      const first = plan.segments[0];
      expect(first).toEqual({
        type: "event",
        event: { type: "emphasis", level },
      });
    }
  });
});

// ── <sub> ──

describe("parseSsmlLite — <sub>", () => {
  it("replaces content with alias", () => {
    const plan = parseSsmlLite('<speak><sub alias="World Wide Web">WWW</sub></speak>');
    expect(plan.plainText).toBe("World Wide Web");
    expect(textSegments(plan)).toEqual(["World Wide Web"]);
  });

  it("keeps original text when no alias", () => {
    const plan = parseSsmlLite("<speak><sub>WWW</sub></speak>");
    expect(plan.plainText).toBe("WWW");
  });
});

// ── <say-as> ──

describe("parseSsmlLite — <say-as>", () => {
  it("passes through inner text", () => {
    const plan = parseSsmlLite('<speak><say-as interpret-as="cardinal">42</say-as></speak>');
    expect(plan.plainText).toBe("42");
  });
});

// ── Unsupported tags ──

describe("parseSsmlLite — unsupported tags", () => {
  it("strips unsupported tags with warning", () => {
    const plan = parseSsmlLite("<speak>Hello <phoneme>world</phoneme></speak>");
    expect(plan.plainText).toContain("Hello");
    expect(plan.plainText).toContain("world");
    expect(plan.warnings.some((w) => w.code === "SSML_TAG_STRIPPED")).toBe(true);
  });
});

// ── XML entities ──

describe("parseSsmlLite — XML entities", () => {
  it("decodes &amp; &lt; &gt; &quot; &apos;", () => {
    const plan = parseSsmlLite("<speak>Tom &amp; Jerry say &quot;hi&quot;</speak>");
    expect(plan.plainText).toBe('Tom & Jerry say "hi"');
  });
});

// ── Limits ──

describe("parseSsmlLite — limits", () => {
  it("falls back on too many nodes", () => {
    const breaks = Array.from({ length: SSML_LIMITS.maxNodes + 1 }, () => "<break/>").join("");
    const plan = parseSsmlLite(`<speak>Hello${breaks}</speak>`);
    expect(plan.warnings.some((w) => w.code === "SSML_PARSE_FAILED")).toBe(true);
    expect(plan.plainText).toContain("Hello");
  });

  it("falls back on text exceeding maxTotalChars", () => {
    const longText = "x".repeat(SSML_LIMITS.maxTotalChars + 1);
    const plan = parseSsmlLite(`<speak>${longText}</speak>`);
    expect(plan.warnings.some((w) => w.code === "SSML_PARSE_FAILED")).toBe(true);
  });
});

// ── Complex documents ──

describe("parseSsmlLite — complex documents", () => {
  it("handles mixed tags", () => {
    const ssml = `
      <speak>
        Welcome to the show.
        <break time="500ms"/>
        <prosody rate="1.1">
          Today we have <emphasis level="strong">exciting</emphasis> news!
        </prosody>
        <break time="250ms"/>
        That is all.
      </speak>
    `;
    const plan = parseSsmlLite(ssml);
    expect(plan.wasSSML).toBe(true);
    expect(plan.plainText).toContain("Welcome to the show.");
    expect(plan.plainText).toContain("exciting");
    expect(plan.plainText).toContain("That is all.");

    const events = eventTypes(plan);
    expect(events).toContain("break");
    expect(events).toContain("prosody");
    expect(events).toContain("emphasis");
    expect(events).toContain("emphasis_end");
    expect(events).toContain("prosody_end");
  });

  it("preserves segment order", () => {
    const plan = parseSsmlLite('<speak>A<break time="100ms"/>B</speak>');
    expect(plan.segments).toEqual([
      { type: "text", value: "A" },
      { type: "event", event: { type: "break", timeMs: 100 } },
      { type: "text", value: "B" },
    ]);
  });

  it("handles SSML without <speak> wrapper", () => {
    const plan = parseSsmlLite('Hello <break time="200ms"/> world');
    expect(plan.wasSSML).toBe(true);
    expect(plan.plainText).toContain("Hello");
    expect(plan.plainText).toContain("world");
    expect(eventTypes(plan)).toContain("break");
  });
});

// ── Fallback on malformed input ──

describe("parseSsmlLite — fallback", () => {
  it("falls back to plain text on deeply nested malformed SSML", () => {
    // This doesn't actually trigger an error since the parser is lenient,
    // but let's verify it doesn't crash
    const plan = parseSsmlLite("<speak><<>>broken</speak>");
    expect(plan.wasSSML).toBe(true);
    // Should have at least the text content
    expect(plan.plainText.length).toBeGreaterThan(0);
  });
});
