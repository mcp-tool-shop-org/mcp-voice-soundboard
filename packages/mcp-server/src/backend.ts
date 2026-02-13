/** Backend interface, types, and mock implementation. */

import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import type { SynthesisRequest } from "@mcp-tool-shop/voice-soundboard-core";

// ── Types ──

export type BackendType = "mock" | "python" | "http" | "none";

export interface SynthesisResult {
  readonly audioPath?: string;
  readonly audioBytesBase64?: string;
  readonly durationMs: number;
  readonly sampleRate: number;
  readonly format: string;
}

export interface BackendHealth {
  readonly ready: boolean;
  readonly details?: string;
}

export interface Backend {
  readonly type: BackendType;
  readonly ready: boolean;
  readonly model?: string;
  readonly sampleRate?: number;
  health(): Promise<BackendHealth>;
  synthesize(request: SynthesisRequest): Promise<SynthesisResult>;
  interrupt?(): Promise<void>;
}

// ── Selection ──

export interface BackendConfig {
  /** Explicit backend choice (--backend flag). */
  backend?: BackendType;
  /** HTTP backend URL (env: VOICE_SOUNDBOARD_TTS_URL). */
  ttsUrl?: string;
  /** HTTP backend auth token (env: VOICE_SOUNDBOARD_TTS_TOKEN). */
  ttsToken?: string;
  /** HTTP backend timeout in ms. */
  httpTimeout?: number;
  /** Python command (env: VOICE_SOUNDBOARD_PYTHON). */
  pythonCommand?: string;
  /** Python bridge module (env: VOICE_SOUNDBOARD_PYTHON_MODULE). */
  pythonModule?: string;
}

/**
 * Read backend config from CLI args and environment.
 * CLI flags take precedence over env vars.
 */
export function readBackendConfig(argv: string[]): BackendConfig {
  const config: BackendConfig = {};

  // Parse --backend=<type>
  for (const arg of argv) {
    if (arg.startsWith("--backend=")) {
      config.backend = arg.slice("--backend=".length) as BackendType;
    }
  }

  // Env vars (lower precedence than explicit flags)
  config.ttsUrl = process.env.VOICE_SOUNDBOARD_TTS_URL;
  config.ttsToken = process.env.VOICE_SOUNDBOARD_TTS_TOKEN;
  config.pythonCommand = process.env.VOICE_SOUNDBOARD_PYTHON;
  config.pythonModule = process.env.VOICE_SOUNDBOARD_PYTHON_MODULE;

  if (process.env.VOICE_SOUNDBOARD_HTTP_TIMEOUT) {
    config.httpTimeout = parseInt(process.env.VOICE_SOUNDBOARD_HTTP_TIMEOUT, 10);
  }

  return config;
}

/** Check if python is available on PATH. */
async function isPythonAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    execFile("python", ["--version"], { timeout: 3000 }, (err) => {
      resolve(!err);
    });
  });
}

/**
 * Select and instantiate the appropriate backend.
 *
 * Priority:
 * 1. Explicit --backend flag
 * 2. VOICE_SOUNDBOARD_TTS_URL set → http
 * 3. Python available → python
 * 4. Fallback → none (or mock for dev)
 */
export async function selectBackend(config: BackendConfig): Promise<Backend> {
  // Explicit choice wins
  if (config.backend) {
    switch (config.backend) {
      case "mock":
        return new MockBackend();
      case "http":
        // Lazy import to avoid loading HTTP backend when not needed
        const { HttpBackend } = await import("./backends/httpBackend.js");
        return new HttpBackend({
          url: config.ttsUrl ?? "",
          token: config.ttsToken,
          timeout: config.httpTimeout,
        });
      case "python":
        const { PythonBackend } = await import("./backends/pythonBackend.js");
        return new PythonBackend({
          command: config.pythonCommand,
          module: config.pythonModule,
        });
      case "none":
        return new NoneBackend();
    }
  }

  // Auto-detect: HTTP URL set?
  if (config.ttsUrl) {
    const { HttpBackend } = await import("./backends/httpBackend.js");
    return new HttpBackend({
      url: config.ttsUrl,
      token: config.ttsToken,
      timeout: config.httpTimeout,
    });
  }

  // Auto-detect: Python available?
  if (config.pythonCommand || await isPythonAvailable()) {
    const { PythonBackend } = await import("./backends/pythonBackend.js");
    const backend = new PythonBackend({
      command: config.pythonCommand,
      module: config.pythonModule,
    });
    // Try health check — if python is not usable, fall through to mock
    const health = await backend.health();
    if (health.ready) return backend;
  }

  return new MockBackend();
}

// ── NoneBackend ──

export class NoneBackend implements Backend {
  readonly type = "none" as const;
  readonly ready = false;

  async health(): Promise<BackendHealth> {
    return { ready: false, details: "No backend configured" };
  }

  async synthesize(): Promise<SynthesisResult> {
    throw new Error("No backend configured — set --backend or VOICE_SOUNDBOARD_TTS_URL");
  }
}

// ── MockBackend ──

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
  buf.writeUInt32LE(16, offset); offset += 4;
  buf.writeUInt16LE(1, offset); offset += 2;
  buf.writeUInt16LE(1, offset); offset += 2;
  buf.writeUInt32LE(sampleRate, offset); offset += 4;
  buf.writeUInt32LE(sampleRate * bytesPerSample, offset); offset += 4;
  buf.writeUInt16LE(bytesPerSample, offset); offset += 2;
  buf.writeUInt16LE(16, offset); offset += 2;

  // data chunk
  buf.write("data", offset); offset += 4;
  buf.writeUInt32LE(dataSize, offset); offset += 4;

  return buf;
}

export class MockBackend implements Backend {
  readonly type = "mock" as const;
  readonly ready = true;
  readonly model = "mock-silence";
  readonly sampleRate = 24000;

  async health(): Promise<BackendHealth> {
    return { ready: true, details: "Mock backend — returns silence" };
  }

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
