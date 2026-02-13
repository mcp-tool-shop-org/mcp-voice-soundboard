/** Backend interface and mock implementation. */

import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import type { SynthesisRequest } from "@mcp-tool-shop/voice-soundboard-core";

export interface SynthesisResult {
  readonly audioPath?: string;
  readonly audioBytesBase64?: string;
  readonly durationMs: number;
  readonly sampleRate: number;
  readonly format: string;
}

export interface Backend {
  readonly type: string;
  readonly ready: boolean;
  readonly model?: string;
  readonly sampleRate?: number;
  synthesize(request: SynthesisRequest): Promise<SynthesisResult>;
}

/**
 * Generate a minimal valid WAV file (16-bit PCM silence).
 * Duration: ~100ms at 24000Hz mono.
 */
function generateMockWav(): Buffer {
  const sampleRate = 24000;
  const durationSec = 0.1;
  const numSamples = Math.floor(sampleRate * durationSec);
  const bytesPerSample = 2;
  const dataSize = numSamples * bytesPerSample;
  const fileSize = 44 + dataSize;

  const buf = Buffer.alloc(fileSize);
  let offset = 0;

  // RIFF header
  buf.write("RIFF", offset); offset += 4;
  buf.writeUInt32LE(fileSize - 8, offset); offset += 4;
  buf.write("WAVE", offset); offset += 4;

  // fmt chunk
  buf.write("fmt ", offset); offset += 4;
  buf.writeUInt32LE(16, offset); offset += 4;          // chunk size
  buf.writeUInt16LE(1, offset); offset += 2;            // PCM format
  buf.writeUInt16LE(1, offset); offset += 2;            // mono
  buf.writeUInt32LE(sampleRate, offset); offset += 4;   // sample rate
  buf.writeUInt32LE(sampleRate * bytesPerSample, offset); offset += 4; // byte rate
  buf.writeUInt16LE(bytesPerSample, offset); offset += 2; // block align
  buf.writeUInt16LE(16, offset); offset += 2;           // bits per sample

  // data chunk
  buf.write("data", offset); offset += 4;
  buf.writeUInt32LE(dataSize, offset); offset += 4;
  // Remaining bytes are already zeros (silence)

  return buf;
}

export class MockBackend implements Backend {
  readonly type = "mock";
  readonly ready = true;
  readonly model = "mock-silence";
  readonly sampleRate = 24000;

  async synthesize(request: SynthesisRequest): Promise<SynthesisResult> {
    const wav = generateMockWav();

    if (request.artifact.mode === "base64") {
      return {
        audioBytesBase64: wav.toString("base64"),
        durationMs: 100,
        sampleRate: this.sampleRate,
        format: request.artifact.format,
      };
    }

    // Path mode: write to disk
    const outputDir = request.artifact.outputDir ?? tmpdir();
    const filename = `vsmcp_${randomUUID().slice(0, 8)}.${request.artifact.format}`;
    const audioPath = join(outputDir, filename);
    await writeFile(audioPath, wav);

    return {
      audioPath,
      durationMs: 100,
      sampleRate: this.sampleRate,
      format: request.artifact.format,
    };
  }
}
