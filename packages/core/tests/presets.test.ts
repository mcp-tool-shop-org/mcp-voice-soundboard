import { describe, it, expect } from "vitest";
import { PRESETS, PRESET_NAMES, getPreset } from "../src/presets.js";
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
