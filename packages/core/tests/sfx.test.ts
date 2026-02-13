import { describe, it, expect } from "vitest";
import {
  parseSfxTags,
  hasSfxTags,
  SFX_TAGS,
  SFX_REGISTRY,
  SFX_MAX_EVENTS,
} from "../src/sfx/index.js";

// ── Registry integrity ──

describe("SFX_REGISTRY", () => {
  it("has an entry for every known tag", () => {
    for (const tag of SFX_TAGS) {
      expect(SFX_REGISTRY[tag]).toBeDefined();
      expect(SFX_REGISTRY[tag].durationMs).toBeGreaterThan(0);
    }
  });

  it("has exactly 6 known tags", () => {
    expect(SFX_TAGS).toHaveLength(6);
  });
});

// ── hasSfxTags ──

describe("hasSfxTags", () => {
  it("detects SFX tags", () => {
    expect(hasSfxTags("Hello [ding] world")).toBe(true);
  });

  it("returns false for plain text", () => {
    expect(hasSfxTags("Hello world")).toBe(false);
  });

  it("detects unknown bracket tags too", () => {
    expect(hasSfxTags("[unknown]")).toBe(true);
  });
});

// ── parseSfxTags — disabled (default) ──

describe("parseSfxTags — disabled", () => {
  it("returns original text as single segment when disabled", () => {
    const result = parseSfxTags("Hello [ding] world");
    expect(result.segments).toHaveLength(1);
    expect(result.segments[0]).toEqual({ type: "text", value: "Hello [ding] world" });
    expect(result.sfxCount).toBe(0);
  });

  it("emits SFX_DISABLED warning when tags present", () => {
    const result = parseSfxTags("Hello [ding] world");
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].code).toBe("SFX_DISABLED");
  });

  it("no warning when no tags present", () => {
    const result = parseSfxTags("Hello world");
    expect(result.warnings).toHaveLength(0);
  });
});

// ── parseSfxTags — enabled ──

describe("parseSfxTags — enabled", () => {
  it("extracts a single SFX tag", () => {
    const result = parseSfxTags("Hello [ding] world", true);
    expect(result.segments).toHaveLength(3);
    expect(result.segments[0]).toEqual({ type: "text", value: "Hello" });
    expect(result.segments[1]).toEqual({ type: "sfx", tag: "ding" });
    expect(result.segments[2]).toEqual({ type: "text", value: "world" });
    expect(result.sfxCount).toBe(1);
    expect(result.warnings).toHaveLength(0);
  });

  it("extracts multiple SFX tags", () => {
    const result = parseSfxTags("[ding] text [chime] more [pop]", true);
    expect(result.sfxCount).toBe(3);
    const sfxSegments = result.segments.filter((s) => s.type === "sfx");
    expect(sfxSegments).toHaveLength(3);
  });

  it("handles all 6 known tags", () => {
    for (const tag of SFX_TAGS) {
      const result = parseSfxTags(`[${tag}]`, true);
      expect(result.sfxCount).toBe(1);
      expect(result.segments[0]).toEqual({ type: "sfx", tag });
    }
  });

  it("is case-insensitive", () => {
    const result = parseSfxTags("[DING] [Chime]", true);
    expect(result.sfxCount).toBe(2);
  });

  it("warns on unknown tag and leaves as literal", () => {
    const result = parseSfxTags("[explosion]", true);
    expect(result.sfxCount).toBe(0);
    expect(result.segments[0]).toEqual({ type: "text", value: "[explosion]" });
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].code).toBe("SFX_UNKNOWN_TAG");
  });

  it("handles text with no tags", () => {
    const result = parseSfxTags("Just plain text", true);
    expect(result.segments).toHaveLength(1);
    expect(result.segments[0]).toEqual({ type: "text", value: "Just plain text" });
    expect(result.sfxCount).toBe(0);
  });
});

// ── parseSfxTags — max events ──

describe("parseSfxTags — max events limit", () => {
  it("enforces SFX_MAX_EVENTS limit", () => {
    const tags = Array.from({ length: SFX_MAX_EVENTS + 2 }, () => "[ding]").join(" ");
    const result = parseSfxTags(tags, true);
    expect(result.sfxCount).toBe(SFX_MAX_EVENTS);
    expect(result.warnings.some((w) => w.code === "SFX_MAX_EVENTS")).toBe(true);
  });
});

// ── Edge cases ──

describe("parseSfxTags — edge cases", () => {
  it("handles empty string", () => {
    const result = parseSfxTags("", true);
    expect(result.segments).toHaveLength(0);
    expect(result.sfxCount).toBe(0);
  });

  it("handles tag at start of text", () => {
    const result = parseSfxTags("[ding]Hello", true);
    expect(result.segments).toHaveLength(2);
    expect(result.segments[0]).toEqual({ type: "sfx", tag: "ding" });
    expect(result.segments[1]).toEqual({ type: "text", value: "Hello" });
  });

  it("handles tag at end of text", () => {
    const result = parseSfxTags("Hello[ding]", true);
    expect(result.segments).toHaveLength(2);
    expect(result.segments[0]).toEqual({ type: "text", value: "Hello" });
    expect(result.segments[1]).toEqual({ type: "sfx", tag: "ding" });
  });

  it("handles adjacent tags", () => {
    const result = parseSfxTags("[ding][chime]", true);
    expect(result.segments).toHaveLength(2);
    expect(result.segments[0]).toEqual({ type: "sfx", tag: "ding" });
    expect(result.segments[1]).toEqual({ type: "sfx", tag: "chime" });
  });
});
