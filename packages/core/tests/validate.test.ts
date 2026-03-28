import { describe, it, expect } from "vitest";
import {
  assertApprovedVoice,
  resolveVoiceOrPreset,
  VoiceValidationError,
} from "../src/validate.js";
import { validateText, LIMITS } from "../src/limits.js";

describe("assertApprovedVoice", () => {
  it("returns voice info for approved voice", () => {
    const voice = assertApprovedVoice("bm_george");
    expect(voice.id).toBe("bm_george");
    expect(voice.name).toBe("George");
  });

  it("throws VoiceValidationError for non-approved voice", () => {
    expect(() => assertApprovedVoice("xx_fake")).toThrow(VoiceValidationError);
  });

  it("non-approved voice error has VOICE_NOT_APPROVED code and approved list", () => {
    expect.assertions(2);
    try {
      assertApprovedVoice("xx_fake");
    } catch (e) {
      const err = e as VoiceValidationError;
      expect(err.code).toBe("VOICE_NOT_APPROVED");
      expect(err.context?.approved.length).toBeGreaterThan(0);
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
  });

  it("unknown voice/preset error has VOICE_OR_PRESET_NOT_FOUND code", () => {
    expect.assertions(1);
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

// ── Unicode / CJK / Multi-byte text ──

describe("Unicode and CJK voice validation", () => {
  it("resolves Japanese voice jf_alpha", () => {
    const result = resolveVoiceOrPreset("jf_alpha");
    expect(result.voice.id).toBe("jf_alpha");
    expect(result.voice.language).toBe("ja");
    expect(result.source).toBe("voice");
  });

  it("resolves Chinese voice zf_xiaobei", () => {
    const result = resolveVoiceOrPreset("zf_xiaobei");
    expect(result.voice.id).toBe("zf_xiaobei");
    expect(result.voice.language).toBe("zh");
    expect(result.source).toBe("voice");
  });

  it("validates Japanese text with jf_alpha voice", () => {
    const text = validateText("こんにちは世界");
    expect(text).toBe("こんにちは世界");
  });

  it("validates Chinese text", () => {
    const text = validateText("你好世界，这是一个测试");
    expect(text).toBe("你好世界，这是一个测试");
  });

  it("validates emoji text", () => {
    const text = validateText("Hello 🎉🔥 World 🚀");
    expect(text).toBe("Hello 🎉🔥 World 🚀");
  });

  it("validates mixed CJK + Latin text", () => {
    const text = validateText("Hello こんにちは 你好 World");
    expect(text).toBe("Hello こんにちは 你好 World");
  });

  it("multi-byte characters near maxTextLength boundary — under limit", () => {
    // Each CJK character is 1 char in JS string length but 3 bytes in UTF-8
    const cjkText = "漢".repeat(LIMITS.maxTextLength);
    expect(cjkText.length).toBe(LIMITS.maxTextLength);
    const result = validateText(cjkText);
    expect(result).toBe(cjkText);
  });

  it("multi-byte characters exceeding maxTextLength", () => {
    const cjkText = "漢".repeat(LIMITS.maxTextLength + 1);
    expect(() => validateText(cjkText)).toThrow();
  });

  it("emoji at exactly maxTextLength boundary", () => {
    // Emoji like 🎉 are 2 chars in JS (surrogate pair) — fill to just under limit
    const emoji = "🎉"; // length 2 in JS
    const count = Math.floor(LIMITS.maxTextLength / emoji.length);
    const emojiText = emoji.repeat(count);
    expect(emojiText.length).toBeLessThanOrEqual(LIMITS.maxTextLength);
    const result = validateText(emojiText);
    expect(result).toBe(emojiText);
  });

  it("emoji-only text exceeding maxTextLength", () => {
    const emoji = "🎉";
    const count = Math.floor(LIMITS.maxTextLength / emoji.length) + 1;
    const emojiText = emoji.repeat(count);
    expect(emojiText.length).toBeGreaterThan(LIMITS.maxTextLength);
    expect(() => validateText(emojiText)).toThrow();
  });
});
