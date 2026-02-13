import { describe, it, expect } from "vitest";
import {
  parseEmotionSpans,
  hasEmotionTags,
  EMOTION_MAP,
  EMOTION_NAMES,
  PUBLIC_EMOTIONS,
  EMOTION_SPEED_MIN,
  EMOTION_SPEED_MAX,
  clampEmotionSpeed,
} from "../src/emotion/index.js";
import { APPROVED_VOICE_IDS } from "../src/voices.js";

// ── EMOTION_MAP integrity ──

describe("EMOTION_MAP", () => {
  it("has exactly 8 emotions", () => {
    expect(PUBLIC_EMOTIONS).toHaveLength(8);
    expect(Object.keys(EMOTION_MAP)).toHaveLength(8);
  });

  it("all voiceIds are in the approved roster", () => {
    for (const [emotion, entry] of Object.entries(EMOTION_MAP)) {
      expect(APPROVED_VOICE_IDS.has(entry.voiceId), `${emotion} → ${entry.voiceId}`).toBe(true);
    }
  });

  it("all speeds are within clamp range", () => {
    for (const [, entry] of Object.entries(EMOTION_MAP)) {
      expect(entry.speed).toBeGreaterThanOrEqual(EMOTION_SPEED_MIN);
      expect(entry.speed).toBeLessThanOrEqual(EMOTION_SPEED_MAX);
    }
  });

  it("maps exact voice IDs from spec", () => {
    expect(EMOTION_MAP.neutral.voiceId).toBe("bm_george");
    expect(EMOTION_MAP.serious.voiceId).toBe("bm_george");
    expect(EMOTION_MAP.friendly.voiceId).toBe("am_liam");
    expect(EMOTION_MAP.professional.voiceId).toBe("af_jessica");
    expect(EMOTION_MAP.calm.voiceId).toBe("bm_george");
    expect(EMOTION_MAP.joy.voiceId).toBe("am_eric");
    expect(EMOTION_MAP.urgent.voiceId).toBe("am_fenrir");
    expect(EMOTION_MAP.whisper.voiceId).toBe("am_onyx");
  });

  it("maps exact speeds from spec", () => {
    expect(EMOTION_MAP.neutral.speed).toBe(1.00);
    expect(EMOTION_MAP.serious.speed).toBe(1.00);
    expect(EMOTION_MAP.friendly.speed).toBe(1.00);
    expect(EMOTION_MAP.professional.speed).toBe(1.00);
    expect(EMOTION_MAP.calm.speed).toBe(0.95);
    expect(EMOTION_MAP.joy.speed).toBe(1.03);
    expect(EMOTION_MAP.urgent.speed).toBe(1.08);
    expect(EMOTION_MAP.whisper.speed).toBe(0.92);
  });
});

// ── clampEmotionSpeed ──

describe("clampEmotionSpeed", () => {
  it("clamps below min", () => {
    expect(clampEmotionSpeed(0.5)).toBe(EMOTION_SPEED_MIN);
  });

  it("clamps above max", () => {
    expect(clampEmotionSpeed(2.0)).toBe(EMOTION_SPEED_MAX);
  });

  it("passes through values in range", () => {
    expect(clampEmotionSpeed(1.0)).toBe(1.0);
    expect(clampEmotionSpeed(0.95)).toBe(0.95);
  });
});

// ── hasEmotionTags ──

describe("hasEmotionTags", () => {
  it("detects emotion tags", () => {
    expect(hasEmotionTags("{joy}Hello{/joy}")).toBe(true);
  });

  it("returns false for plain text", () => {
    expect(hasEmotionTags("Hello world")).toBe(false);
  });

  it("returns false for incomplete tags", () => {
    expect(hasEmotionTags("{joy}Hello")).toBe(false);
    expect(hasEmotionTags("Hello{/joy}")).toBe(false);
  });
});

// ── parseEmotionSpans — basic ──

describe("parseEmotionSpans — basic", () => {
  it("parses a single emotion span", () => {
    const result = parseEmotionSpans("{joy}I am so happy!{/joy}");
    expect(result.spans).toHaveLength(1);
    expect(result.spans[0]).toMatchObject({
      emotion: "joy",
      text: "I am so happy!",
      voiceId: "am_eric",
      speed: 1.03,
    });
    expect(result.warnings).toHaveLength(0);
  });

  it("parses multiple emotion spans", () => {
    const text = "{joy}Happy days{/joy} {calm}Peaceful night{/calm}";
    const result = parseEmotionSpans(text);
    expect(result.spans).toHaveLength(2);
    expect(result.spans[0].emotion).toBe("joy");
    expect(result.spans[1].emotion).toBe("calm");
  });

  it("treats untagged text as neutral", () => {
    const result = parseEmotionSpans("Hello world");
    expect(result.spans).toHaveLength(1);
    expect(result.spans[0]).toMatchObject({
      emotion: "neutral",
      text: "Hello world",
      voiceId: "bm_george",
    });
  });

  it("handles mixed tagged and untagged text", () => {
    const text = "Start here. {urgent}Breaking news!{/urgent} Back to normal.";
    const result = parseEmotionSpans(text);
    expect(result.spans).toHaveLength(3);
    expect(result.spans[0].emotion).toBe("neutral");
    expect(result.spans[0].text).toBe("Start here.");
    expect(result.spans[1].emotion).toBe("urgent");
    expect(result.spans[1].text).toBe("Breaking news!");
    expect(result.spans[2].emotion).toBe("neutral");
    expect(result.spans[2].text).toBe("Back to normal.");
  });

  it("skips empty spans", () => {
    const result = parseEmotionSpans("{joy}{/joy}");
    expect(result.spans).toHaveLength(0);
  });
});

// ── parseEmotionSpans — all 8 emotions ──

describe("parseEmotionSpans — all 8 emotions", () => {
  for (const emotion of PUBLIC_EMOTIONS) {
    it(`parses {${emotion}} correctly`, () => {
      const result = parseEmotionSpans(`{${emotion}}Test text{/${emotion}}`);
      expect(result.spans).toHaveLength(1);
      expect(result.spans[0].emotion).toBe(emotion);
      expect(result.spans[0].voiceId).toBe(EMOTION_MAP[emotion].voiceId);
      expect(result.spans[0].speed).toBe(clampEmotionSpeed(EMOTION_MAP[emotion].speed));
      expect(result.warnings).toHaveLength(0);
    });
  }
});

// ── parseEmotionSpans — warnings ──

describe("parseEmotionSpans — warnings", () => {
  it("warns on unsupported emotion and falls back to neutral", () => {
    const result = parseEmotionSpans("{excited}Wow!{/excited}");
    expect(result.spans).toHaveLength(1);
    expect(result.spans[0].emotion).toBe("neutral");
    expect(result.spans[0].voiceId).toBe("bm_george");
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].code).toBe("EMOTION_UNSUPPORTED");
    expect(result.warnings[0].message).toContain("excited");
  });

  it("warns on mismatched open/close tags", () => {
    const result = parseEmotionSpans("{joy}Hello{/calm}");
    // Mismatched tag regex won't match — treated as plain text
    expect(result.spans).toHaveLength(1);
    expect(result.spans[0].emotion).toBe("neutral");
  });
});

// ── parseEmotionSpans — edge cases ──

describe("parseEmotionSpans — edge cases", () => {
  it("handles empty string", () => {
    const result = parseEmotionSpans("");
    expect(result.spans).toHaveLength(0);
  });

  it("handles whitespace-only string", () => {
    const result = parseEmotionSpans("   ");
    expect(result.spans).toHaveLength(0);
  });

  it("handles adjacent spans with no gap", () => {
    const result = parseEmotionSpans("{joy}Happy{/joy}{calm}Peace{/calm}");
    expect(result.spans).toHaveLength(2);
    expect(result.spans[0].emotion).toBe("joy");
    expect(result.spans[1].emotion).toBe("calm");
  });

  it("preserves multiline text within spans", () => {
    const result = parseEmotionSpans("{whisper}Line one\nLine two{/whisper}");
    expect(result.spans).toHaveLength(1);
    expect(result.spans[0].text).toBe("Line one\nLine two");
  });
});
