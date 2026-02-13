import { describe, it, expect } from "vitest";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readFile, mkdir } from "node:fs/promises";
import { runPlan, type SynthesizeFn, type ChunkArtifact } from "../src/orchestrator/index.js";
import { parseSsmlLite } from "../src/ssml/index.js";
import type { SpeechPlan } from "../src/ssml/types.js";

// ── Mock synthesizer ──

function mockSynthesize(mode: "path" | "base64" = "base64"): {
  fn: SynthesizeFn;
  calls: { text: string; index: number }[];
} {
  const calls: { text: string; index: number }[] = [];

  const fn: SynthesizeFn = async (text, chunkIndex) => {
    calls.push({ text, index: chunkIndex });

    // Generate a tiny valid WAV
    const wav = generateMockWav();

    if (mode === "base64") {
      return {
        audioBytesBase64: wav.toString("base64"),
        durationMs: 100,
        sampleRate: 24000,
        format: "wav",
      };
    }

    // For path mode, write to temp
    const { writeFile: wf } = await import("node:fs/promises");
    const { randomUUID } = await import("node:crypto");
    const dir = join(tmpdir(), "vsmcp-orch-test");
    await mkdir(dir, { recursive: true });
    const path = join(dir, `chunk_${randomUUID().slice(0, 8)}.wav`);
    await wf(path, wav);

    return {
      audioPath: path,
      durationMs: 100,
      sampleRate: 24000,
      format: "wav",
    };
  };

  return { fn, calls };
}

function generateMockWav(): Buffer {
  const sampleRate = 24000;
  const numSamples = Math.floor(sampleRate * 0.1);
  const bytesPerSample = 2;
  const dataSize = numSamples * bytesPerSample;
  const fileSize = 44 + dataSize;
  const buf = Buffer.alloc(fileSize);
  let o = 0;
  buf.write("RIFF", o); o += 4;
  buf.writeUInt32LE(fileSize - 8, o); o += 4;
  buf.write("WAVE", o); o += 4;
  buf.write("fmt ", o); o += 4;
  buf.writeUInt32LE(16, o); o += 4;
  buf.writeUInt16LE(1, o); o += 2;
  buf.writeUInt16LE(1, o); o += 2;
  buf.writeUInt32LE(sampleRate, o); o += 4;
  buf.writeUInt32LE(sampleRate * bytesPerSample, o); o += 4;
  buf.writeUInt16LE(bytesPerSample, o); o += 2;
  buf.writeUInt16LE(16, o); o += 2;
  buf.write("data", o); o += 4;
  buf.writeUInt32LE(dataSize, o); o += 4;
  return buf;
}

function plainPlan(text: string): SpeechPlan {
  return parseSsmlLite(text);
}

// ── Tests ──

describe("runPlan — single chunk", () => {
  it("synthesizes plain text as a single chunk", async () => {
    const { fn, calls } = mockSynthesize();
    const result = await runPlan({
      plan: plainPlan("Hello world"),
      synthesize: fn,
      options: { artifactMode: "base64" },
    });

    expect(calls).toHaveLength(1);
    expect(calls[0].text).toBe("Hello world");
    expect(calls[0].index).toBe(0);
    expect(result.chunkCount).toBe(1);
    expect(result.chunks).toHaveLength(1);
    expect(result.interrupted).toBe(false);
    expect(result.totalDurationMs).toBe(100);
  });

  it("returns empty result for empty plan", async () => {
    const { fn, calls } = mockSynthesize();
    const result = await runPlan({
      plan: plainPlan(""),
      synthesize: fn,
      options: { artifactMode: "base64" },
    });

    expect(calls).toHaveLength(0);
    expect(result.chunkCount).toBe(0);
    expect(result.chunks).toHaveLength(0);
  });
});

describe("runPlan — multi chunk", () => {
  it("synthesizes multiple chunks sequentially", async () => {
    const { fn, calls } = mockSynthesize();
    // Create text long enough to be chunked
    const longText = "This is a sentence. ".repeat(50).trim(); // ~1000 chars
    const result = await runPlan({
      plan: plainPlan(longText),
      synthesize: fn,
      options: { artifactMode: "base64" },
      chunkingOptions: { maxChunkChars: 200 },
    });

    expect(calls.length).toBeGreaterThan(1);
    expect(result.chunkCount).toBe(calls.length);
    expect(result.totalDurationMs).toBe(calls.length * 100);
    expect(result.warnings.some((w) => w.code === "CHUNKED_TEXT")).toBe(true);

    // Verify sequential indices
    for (let i = 0; i < calls.length; i++) {
      expect(calls[i].index).toBe(i);
    }
  });
});

describe("runPlan — SSML input", () => {
  it("extracts plain text from SSML and synthesizes", async () => {
    const { fn, calls } = mockSynthesize();
    const plan = parseSsmlLite('<speak>Hello <break time="500ms"/> world</speak>');

    const result = await runPlan({
      plan,
      synthesize: fn,
      options: { artifactMode: "base64" },
    });

    expect(calls).toHaveLength(1);
    // Plain text should have "Hello" and "world"
    const synthesizedText = calls[0].text;
    expect(synthesizedText).toContain("Hello");
    expect(synthesizedText).toContain("world");
  });
});

describe("runPlan — interrupt", () => {
  it("stops synthesis when signal is aborted", async () => {
    const controller = new AbortController();
    const { fn, calls } = mockSynthesize();

    // Abort after first chunk
    const wrappedFn: SynthesizeFn = async (text, idx) => {
      const result = await fn(text, idx);
      if (idx === 0) controller.abort();
      return result;
    };

    const longText = "Chunk one. ".repeat(20) + "\n\n" + "Chunk two. ".repeat(20);
    const result = await runPlan({
      plan: plainPlan(longText),
      synthesize: wrappedFn,
      options: { artifactMode: "base64", signal: controller.signal },
      chunkingOptions: { maxChunkChars: 100 },
    });

    expect(result.interrupted).toBe(true);
    expect(result.warnings.some((w) => w.code === "SYNTHESIS_INTERRUPTED")).toBe(true);
    // Should have synthesized some but not all chunks
    expect(result.chunkCount).toBeGreaterThanOrEqual(1);
    expect(result.chunkCount).toBeLessThan(
      longText.length / 100, // rough expected total
    );
  });
});

describe("runPlan — concat base64", () => {
  it("concatenates chunks into single base64 when concat=true", async () => {
    const { fn } = mockSynthesize("base64");
    const longText = "First sentence. ".repeat(30) + "\n\n" + "Second sentence. ".repeat(30);

    const result = await runPlan({
      plan: plainPlan(longText),
      synthesize: fn,
      options: { artifactMode: "base64", concat: true },
      chunkingOptions: { maxChunkChars: 200 },
    });

    expect(result.chunkCount).toBeGreaterThan(1);
    expect(result.concatBase64).toBeDefined();
    expect(typeof result.concatBase64).toBe("string");
    // Verify the concat is a valid WAV (starts with RIFF)
    const wav = Buffer.from(result.concatBase64!, "base64");
    expect(wav.toString("ascii", 0, 4)).toBe("RIFF");
    expect(wav.toString("ascii", 8, 12)).toBe("WAVE");
  });
});

describe("runPlan — concat path", () => {
  it("concatenates chunks into single file when concat=true", async () => {
    const { fn } = mockSynthesize("path");
    const outputDir = join(tmpdir(), "vsmcp-orch-concat-test");
    await mkdir(outputDir, { recursive: true });

    const longText = "First sentence. ".repeat(30) + "\n\n" + "Second sentence. ".repeat(30);

    const result = await runPlan({
      plan: plainPlan(longText),
      synthesize: fn,
      options: { artifactMode: "path", concat: true, outputDir },
      chunkingOptions: { maxChunkChars: 200 },
    });

    expect(result.chunkCount).toBeGreaterThan(1);
    expect(result.concatPath).toBeDefined();
    expect(result.concatPath).toContain("concat");

    // Verify file exists and is valid WAV
    const wav = await readFile(result.concatPath!);
    expect(wav.toString("ascii", 0, 4)).toBe("RIFF");
  });
});

describe("runPlan — single chunk skips concat", () => {
  it("does not concat when only one chunk", async () => {
    const { fn } = mockSynthesize("base64");
    const result = await runPlan({
      plan: plainPlan("Short text"),
      synthesize: fn,
      options: { artifactMode: "base64", concat: true },
    });

    expect(result.chunkCount).toBe(1);
    expect(result.concatBase64).toBeUndefined();
  });
});

describe("runPlan — warnings propagation", () => {
  it("propagates SSML warnings", async () => {
    const { fn } = mockSynthesize();
    const plan = parseSsmlLite("<speak>Hello <phoneme>world</phoneme></speak>");

    const result = await runPlan({
      plan,
      synthesize: fn,
      options: { artifactMode: "base64" },
    });

    expect(result.warnings.some((w) => w.code === "SSML_TAG_STRIPPED")).toBe(true);
  });
});
