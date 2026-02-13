import { describe, it, expect } from "vitest";
import {
  assertApprovedVoice,
  resolveVoiceOrPreset,
  VoiceValidationError,
} from "../src/validate.js";

describe("assertApprovedVoice", () => {
  it("returns voice info for approved voice", () => {
    const voice = assertApprovedVoice("bm_george");
    expect(voice.id).toBe("bm_george");
    expect(voice.name).toBe("George");
  });

  it("throws VoiceValidationError for non-approved voice", () => {
    expect(() => assertApprovedVoice("af_bella")).toThrow(VoiceValidationError);
    try {
      assertApprovedVoice("af_bella");
    } catch (e) {
      const err = e as VoiceValidationError;
      expect(err.code).toBe("VOICE_NOT_APPROVED");
      expect(err.context?.approved).toHaveLength(12);
    }
  });
});

describe("resolveVoiceOrPreset", () => {
  it("resolves undefined to default voice", () => {
    const result = resolveVoiceOrPreset(undefined);
    expect(result.voice.id).toBe("bm_george");
    expect(result.speed).toBe(1.0);
    expect(result.source).toBe("default");
  });

  it("resolves empty string to default voice", () => {
    const result = resolveVoiceOrPreset("");
    expect(result.voice.id).toBe("bm_george");
    expect(result.source).toBe("default");
  });

  it("resolves preset name to preset voice + speed", () => {
    const result = resolveVoiceOrPreset("narrator");
    expect(result.voice.id).toBe("bm_george");
    expect(result.speed).toBe(0.95);
    expect(result.source).toBe("preset");
    expect(result.presetName).toBe("narrator");
  });

  it("resolves direct voice ID", () => {
    const result = resolveVoiceOrPreset("am_fenrir");
    expect(result.voice.id).toBe("am_fenrir");
    expect(result.speed).toBe(1.0);
    expect(result.source).toBe("voice");
  });

  it("speed override takes precedence over preset speed", () => {
    const result = resolveVoiceOrPreset("narrator", 1.5);
    expect(result.speed).toBe(1.5);
  });

  it("speed override works with direct voice", () => {
    const result = resolveVoiceOrPreset("am_fenrir", 0.8);
    expect(result.speed).toBe(0.8);
  });

  it("speed override works with default", () => {
    const result = resolveVoiceOrPreset(undefined, 1.2);
    expect(result.speed).toBe(1.2);
  });

  it("throws for unknown voice/preset", () => {
    expect(() => resolveVoiceOrPreset("totally_fake")).toThrow(VoiceValidationError);
    try {
      resolveVoiceOrPreset("totally_fake");
    } catch (e) {
      const err = e as VoiceValidationError;
      expect(err.code).toBe("VOICE_OR_PRESET_NOT_FOUND");
    }
  });

  it("preset takes priority over voice ID if both match", () => {
    // No preset is named the same as a voice ID, but test the resolution order
    const result = resolveVoiceOrPreset("assistant");
    expect(result.source).toBe("preset");
  });

  it("is case-insensitive", () => {
    const result = resolveVoiceOrPreset("NARRATOR");
    expect(result.source).toBe("preset");
  });

  it("trims whitespace", () => {
    const result = resolveVoiceOrPreset("  am_fenrir  ");
    expect(result.voice.id).toBe("am_fenrir");
  });
});
