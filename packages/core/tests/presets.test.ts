import { describe, it, expect } from "vitest";
import {
  PRESETS,
  PRESET_NAMES,
  HUMOR_PRESETS,
  HUMOR_MOODS,
  getPreset,
  getHumorPreset,
  wrapWithProsody,
  type HumorMood,
} from "../src/presets.js";
import { isApprovedVoice } from "../src/voices.js";

describe("presets", () => {
  it("has 5 built-in presets", () => {
    expect(PRESETS.size).toBe(5);
  });

  it("all presets map to approved voices", () => {
    for (const [, preset] of PRESETS) {
      expect(isApprovedVoice(preset.voice)).toBe(true);
    }
  });

  it("narrator preset uses bm_george at 0.95x", () => {
    const narrator = getPreset("narrator");
    expect(narrator).toBeDefined();
    expect(narrator!.voice).toBe("bm_george");
    expect(narrator!.speed).toBe(0.95);
  });

  it("getPreset returns undefined for unknown preset", () => {
    expect(getPreset("nonexistent")).toBeUndefined();
  });

  it("preset names are lowercase", () => {
    for (const name of PRESET_NAMES) {
      expect(name).toBe(name.toLowerCase());
    }
  });

  it("all presets have descriptions", () => {
    for (const [, preset] of PRESETS) {
      expect(preset.description.length).toBeGreaterThan(0);
    }
  });

  it("all preset speeds are within sane range", () => {
    for (const [, preset] of PRESETS) {
      expect(preset.speed).toBeGreaterThanOrEqual(0.5);
      expect(preset.speed).toBeLessThanOrEqual(2.0);
    }
  });
});

describe("humor presets", () => {
  it("has 6 humor presets (one per mood)", () => {
    expect(HUMOR_PRESETS.size).toBe(6);
    expect(HUMOR_MOODS).toHaveLength(6);
  });

  it("all humor presets map to approved voices", () => {
    for (const [, preset] of HUMOR_PRESETS) {
      expect(isApprovedVoice(preset.voice)).toBe(true);
    }
  });

  it("all humor presets have prosody configs", () => {
    for (const [, preset] of HUMOR_PRESETS) {
      expect(preset.prosody).toBeDefined();
    }
  });

  it("all humor presets have descriptions", () => {
    for (const [, preset] of HUMOR_PRESETS) {
      expect(preset.description.length).toBeGreaterThan(0);
    }
  });

  it("all humor preset speeds are within sane range", () => {
    for (const [, preset] of HUMOR_PRESETS) {
      expect(preset.speed).toBeGreaterThanOrEqual(0.5);
      expect(preset.speed).toBeLessThanOrEqual(2.0);
    }
  });

  it("getHumorPreset resolves each mood", () => {
    for (const mood of HUMOR_MOODS) {
      const preset = getHumorPreset(mood);
      expect(preset).toBeDefined();
      expect(preset!.name).toBe(`humor_${mood}`);
    }
  });

  it("getPreset finds humor presets by full name", () => {
    const dry = getPreset("humor_dry");
    expect(dry).toBeDefined();
    expect(dry!.voice).toBe("bm_george");
    expect(dry!.speed).toBe(0.92);
  });

  it("PRESET_NAMES includes both standard and humor presets", () => {
    expect(PRESET_NAMES.size).toBe(11);
    expect(PRESET_NAMES.has("narrator")).toBe(true);
    expect(PRESET_NAMES.has("humor_dry")).toBe(true);
    expect(PRESET_NAMES.has("humor_zoomer")).toBe(true);
  });

  it("dry preset uses bm_george with deadpan prosody", () => {
    const dry = getHumorPreset("dry");
    expect(dry!.voice).toBe("bm_george");
    expect(dry!.prosody!.pitch).toBe("-8%");
    expect(dry!.prosody!.emphasis).toBe("none");
  });

  it("roast preset uses am_eric with moderate emphasis", () => {
    const roast = getHumorPreset("roast");
    expect(roast!.voice).toBe("am_eric");
    expect(roast!.prosody!.emphasis).toBe("moderate");
  });

  it("zoomer preset uses am_fenrir with high energy prosody", () => {
    const zoomer = getHumorPreset("zoomer");
    expect(zoomer!.voice).toBe("am_fenrir");
    expect(zoomer!.prosody!.volume).toBe("loud");
    expect(zoomer!.prosody!.emphasis).toBe("strong");
  });
});

describe("wrapWithProsody", () => {
  it("returns text unchanged when no prosody", () => {
    expect(wrapWithProsody("Hello", undefined)).toBe("Hello");
  });

  it("returns text unchanged when prosody has no attrs", () => {
    expect(wrapWithProsody("Hello", {})).toBe("Hello");
  });

  it("wraps text in SSML prosody tags", () => {
    const result = wrapWithProsody("Test", { pitch: "-8%", rate: "0.92" });
    expect(result).toBe('<speak><prosody pitch="-8%" rate="0.92">Test</prosody></speak>');
  });

  it("includes volume when provided", () => {
    const result = wrapWithProsody("Test", { rate: "1.0", volume: "loud" });
    expect(result).toContain('volume="loud"');
  });

  it("wraps in emphasis when emphasis is not none", () => {
    const result = wrapWithProsody("Test", { pitch: "+5%", emphasis: "moderate" });
    expect(result).toContain('<emphasis level="moderate">Test</emphasis>');
  });

  it("skips emphasis wrapper when emphasis is none", () => {
    const result = wrapWithProsody("Test", { pitch: "-8%", emphasis: "none" });
    expect(result).not.toContain("<emphasis");
    expect(result).toContain("Test</prosody>");
  });

  it("matches dry mood output shape", () => {
    const dry = getHumorPreset("dry")!;
    const result = wrapWithProsody("Verdict: bugs.", dry.prosody);
    expect(result).toMatch(/^<speak><prosody.*>Verdict: bugs\.<\/prosody><\/speak>$/);
    expect(result).toContain('pitch="-8%"');
    expect(result).toContain('rate="0.92"');
    expect(result).not.toContain("<emphasis");
  });

  it("matches roast mood output shape with emphasis", () => {
    const roast = getHumorPreset("roast")!;
    const result = wrapWithProsody("Verdict: spaghetti.", roast.prosody);
    expect(result).toContain('<emphasis level="moderate">Verdict: spaghetti.</emphasis>');
  });
});
