import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { validateSynthesisResult, ValidationError } from "../src/validation.js";

/** Generate a minimal valid WAV buffer. */
function makeWav(dataSize = 100): Buffer {
  const fileSize = 44 + dataSize;
  const buf = Buffer.alloc(fileSize);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(fileSize - 8, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);    // PCM
  buf.writeUInt16LE(1, 22);    // mono
  buf.writeUInt32LE(24000, 24); // sampleRate
  buf.writeUInt32LE(48000, 28); // byteRate
  buf.writeUInt16LE(2, 32);    // blockAlign
  buf.writeUInt16LE(16, 34);   // bitsPerSample
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);
  return buf;
}

describe("validateSynthesisResult", () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), "validation-test-"));
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it("accepts valid WAV path result", async () => {
    const wavPath = join(testDir, "test.wav");
    await writeFile(wavPath, makeWav());

    await expect(validateSynthesisResult({
      audioPath: wavPath,
      durationMs: 100,
      sampleRate: 24000,
      format: "wav",
    })).resolves.toBeUndefined();
  });

  it("accepts valid base64 result", async () => {
    await expect(validateSynthesisResult({
      audioBytesBase64: makeWav().toString("base64"),
      durationMs: 100,
      sampleRate: 24000,
      format: "wav",
    })).resolves.toBeUndefined();
  });

  it("rejects zero duration", async () => {
    await expect(validateSynthesisResult({
      audioBytesBase64: "AAAA",
      durationMs: 0,
      sampleRate: 24000,
      format: "wav",
    })).rejects.toThrow(ValidationError);
  });

  it("rejects negative duration", async () => {
    await expect(validateSynthesisResult({
      audioBytesBase64: "AAAA",
      durationMs: -1,
      sampleRate: 24000,
      format: "wav",
    })).rejects.toThrow(ValidationError);
  });

  it("rejects duration exceeding 5 minutes", async () => {
    await expect(validateSynthesisResult({
      audioBytesBase64: "AAAA",
      durationMs: 300_001,
      sampleRate: 24000,
      format: "wav",
    })).rejects.toThrow(ValidationError);
  });

  it("rejects non-existent audio path", async () => {
    await expect(validateSynthesisResult({
      audioPath: join(testDir, "nonexistent.wav"),
      durationMs: 100,
      sampleRate: 24000,
      format: "wav",
    })).rejects.toThrow(ValidationError);
  });

  it("rejects WAV file without RIFF header", async () => {
    const fakePath = join(testDir, "fake.wav");
    await writeFile(fakePath, "not a wav file content");

    await expect(validateSynthesisResult({
      audioPath: fakePath,
      durationMs: 100,
      sampleRate: 24000,
      format: "wav",
    })).rejects.toThrow(ValidationError);
  });

  it("rejects result with neither path nor base64", async () => {
    await expect(validateSynthesisResult({
      durationMs: 100,
      sampleRate: 24000,
      format: "wav",
    })).rejects.toThrow(ValidationError);
  });

  it("ValidationError has VALIDATION_FAILED code", async () => {
    try {
      await validateSynthesisResult({
        durationMs: 0,
        sampleRate: 24000,
        format: "wav",
      });
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect((e as ValidationError).code).toBe("VALIDATION_FAILED");
    }
  });
});
