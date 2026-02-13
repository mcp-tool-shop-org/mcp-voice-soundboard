import { describe, it, expect } from "vitest";
import {
  generateSfxWav,
  getSfxDurationMs,
  SFX_TAGS,
  SFX_REGISTRY,
  createSfxChunks,
  checkSfxConcatRequired,
  parseSfxTags,
} from "../src/sfx/index.js";

// ── WAV generation ──

describe("generateSfxWav", () => {
  it("generates valid WAV for each known tag", () => {
    for (const tag of SFX_TAGS) {
      const wav = generateSfxWav(tag);
      // Check RIFF header
      expect(wav.toString("ascii", 0, 4)).toBe("RIFF");
      expect(wav.toString("ascii", 8, 12)).toBe("WAVE");
      // Check fmt chunk
      expect(wav.toString("ascii", 12, 16)).toBe("fmt ");
      // PCM format = 1
      expect(wav.readUInt16LE(20)).toBe(1);
      // Mono
      expect(wav.readUInt16LE(22)).toBe(1);
      // 24kHz
      expect(wav.readUInt32LE(24)).toBe(24000);
      // 16-bit
      expect(wav.readUInt16LE(34)).toBe(16);
      // Check data chunk exists
      expect(wav.toString("ascii", 36, 40)).toBe("data");
    }
  });

  it("generates WAV with correct data size", () => {
    for (const tag of SFX_TAGS) {
      const wav = generateSfxWav(tag);
      const expectedSamples = Math.round((SFX_REGISTRY[tag].durationMs / 1000) * 24000);
      const expectedDataSize = expectedSamples * 2; // 16-bit
      const dataSize = wav.readUInt32LE(40);
      expect(dataSize).toBe(expectedDataSize);
    }
  });

  it("generates non-silent audio", () => {
    for (const tag of SFX_TAGS) {
      const wav = generateSfxWav(tag);
      const dataStart = 44;
      const dataSize = wav.readUInt32LE(40);
      let maxAbs = 0;
      for (let i = dataStart; i < dataStart + dataSize; i += 2) {
        const sample = Math.abs(wav.readInt16LE(i));
        if (sample > maxAbs) maxAbs = sample;
      }
      expect(maxAbs, `${tag} should have non-zero samples`).toBeGreaterThan(100);
    }
  });
});

// ── getSfxDurationMs ──

describe("getSfxDurationMs", () => {
  it("returns correct duration for each tag", () => {
    for (const tag of SFX_TAGS) {
      expect(getSfxDurationMs(tag)).toBe(SFX_REGISTRY[tag].durationMs);
    }
  });
});

// ── createSfxChunks ──

describe("createSfxChunks", () => {
  it("creates base64 chunks for SFX events", () => {
    const segments = parseSfxTags("[ding] hello [chime]", true).segments;
    const chunks = createSfxChunks(segments);
    expect(chunks).toHaveLength(2);
    for (const chunk of chunks) {
      expect(chunk.audioBytesBase64).toBeDefined();
      expect(typeof chunk.audioBytesBase64).toBe("string");
      expect(chunk.durationMs).toBeGreaterThan(0);
      expect(chunk.sampleRate).toBe(24000);
      expect(chunk.format).toBe("wav");
    }
  });

  it("returns empty array when no SFX events", () => {
    const segments = parseSfxTags("hello world", true).segments;
    const chunks = createSfxChunks(segments);
    expect(chunks).toHaveLength(0);
  });
});

// ── checkSfxConcatRequired ──

describe("checkSfxConcatRequired", () => {
  it("returns warning when SFX present and concat disabled", () => {
    const segments = parseSfxTags("[ding] hello", true).segments;
    const warning = checkSfxConcatRequired(segments, false);
    expect(warning).not.toBeNull();
    expect(warning!.code).toBe("SFX_REQUIRES_CONCAT");
  });

  it("returns null when concat enabled", () => {
    const segments = parseSfxTags("[ding] hello", true).segments;
    const warning = checkSfxConcatRequired(segments, true);
    expect(warning).toBeNull();
  });

  it("returns null when no SFX present", () => {
    const segments = parseSfxTags("hello world", true).segments;
    const warning = checkSfxConcatRequired(segments, false);
    expect(warning).toBeNull();
  });
});
