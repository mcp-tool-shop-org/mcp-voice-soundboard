/** WAV concatenation — merge multiple WAV files into one. */

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import type { ChunkArtifact } from "./types.js";

/**
 * Concatenate multiple WAV chunk artifacts into a single WAV file.
 * All chunks must be the same sample rate and format (16-bit PCM mono).
 * Returns the path to the concatenated file.
 */
export async function concatWavFiles(
  chunks: readonly ChunkArtifact[],
  outputDir: string,
): Promise<{ path: string; durationMs: number }> {
  const buffers: Buffer[] = [];
  let totalDataSize = 0;
  let sampleRate = 24000;

  for (const chunk of chunks) {
    let wav: Buffer;
    if (chunk.audioPath) {
      wav = await readFile(chunk.audioPath);
    } else if (chunk.audioBytesBase64) {
      wav = Buffer.from(chunk.audioBytesBase64, "base64");
    } else {
      continue;
    }

    // Parse WAV header to extract data portion
    const parsed = parseWavData(wav);
    if (parsed) {
      buffers.push(parsed.data);
      totalDataSize += parsed.data.length;
      sampleRate = parsed.sampleRate;
    }
  }

  if (buffers.length === 0) {
    throw new Error("No valid WAV data to concatenate");
  }

  // Build new WAV file
  const dataChunk = Buffer.concat(buffers);
  const wavFile = buildWavFile(dataChunk, sampleRate);

  const filename = `vsmcp_concat_${randomUUID().slice(0, 8)}.wav`;
  const outPath = join(outputDir, filename);
  await writeFile(outPath, wavFile);

  const bytesPerSample = 2; // 16-bit
  const numSamples = dataChunk.length / bytesPerSample;
  const durationMs = Math.round((numSamples / sampleRate) * 1000);

  return { path: outPath, durationMs };
}

/**
 * Concatenate multiple WAV chunk artifacts into a single base64 string.
 */
export async function concatWavBase64(
  chunks: readonly ChunkArtifact[],
): Promise<{ base64: string; durationMs: number }> {
  const buffers: Buffer[] = [];
  let totalDataSize = 0;
  let sampleRate = 24000;

  for (const chunk of chunks) {
    let wav: Buffer;
    if (chunk.audioPath) {
      wav = await readFile(chunk.audioPath);
    } else if (chunk.audioBytesBase64) {
      wav = Buffer.from(chunk.audioBytesBase64, "base64");
    } else {
      continue;
    }

    const parsed = parseWavData(wav);
    if (parsed) {
      buffers.push(parsed.data);
      totalDataSize += parsed.data.length;
      sampleRate = parsed.sampleRate;
    }
  }

  if (buffers.length === 0) {
    throw new Error("No valid WAV data to concatenate");
  }

  const dataChunk = Buffer.concat(buffers);
  const wavFile = buildWavFile(dataChunk, sampleRate);

  const bytesPerSample = 2;
  const numSamples = dataChunk.length / bytesPerSample;
  const durationMs = Math.round((numSamples / sampleRate) * 1000);

  return { base64: wavFile.toString("base64"), durationMs };
}

// ── WAV helpers ──

interface WavData {
  sampleRate: number;
  data: Buffer;
}

function parseWavData(wav: Buffer): WavData | null {
  if (wav.length < 44) return null;
  if (wav.toString("ascii", 0, 4) !== "RIFF") return null;
  if (wav.toString("ascii", 8, 12) !== "WAVE") return null;

  const sampleRate = wav.readUInt32LE(24);

  // Find data chunk
  let offset = 12;
  while (offset < wav.length - 8) {
    const chunkId = wav.toString("ascii", offset, offset + 4);
    const chunkSize = wav.readUInt32LE(offset + 4);

    if (chunkId === "data") {
      const dataStart = offset + 8;
      const dataEnd = Math.min(dataStart + chunkSize, wav.length);
      return { sampleRate, data: wav.subarray(dataStart, dataEnd) };
    }

    offset += 8 + chunkSize;
  }

  return null;
}

export function buildWavFile(pcmData: Buffer, sampleRate: number): Buffer {
  const bytesPerSample = 2;
  const channels = 1;
  const fileSize = 44 + pcmData.length;
  const buf = Buffer.alloc(fileSize);
  let o = 0;

  buf.write("RIFF", o); o += 4;
  buf.writeUInt32LE(fileSize - 8, o); o += 4;
  buf.write("WAVE", o); o += 4;

  buf.write("fmt ", o); o += 4;
  buf.writeUInt32LE(16, o); o += 4;
  buf.writeUInt16LE(1, o); o += 2; // PCM
  buf.writeUInt16LE(channels, o); o += 2;
  buf.writeUInt32LE(sampleRate, o); o += 4;
  buf.writeUInt32LE(sampleRate * bytesPerSample * channels, o); o += 4;
  buf.writeUInt16LE(bytesPerSample * channels, o); o += 2;
  buf.writeUInt16LE(bytesPerSample * 8, o); o += 2;

  buf.write("data", o); o += 4;
  buf.writeUInt32LE(pcmData.length, o); o += 4;
  pcmData.copy(buf, o);

  return buf;
}
