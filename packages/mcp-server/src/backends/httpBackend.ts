/** HTTP TTS backend — POST to any TTS endpoint with timeouts + schema checks. */

import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import type { Backend, BackendHealth, SynthesisResult } from "../backend.js";
import type { SynthesisRequest } from "@mcp-tool-shop/voice-soundboard-core";

export interface HttpBackendConfig {
  url: string;
  token?: string;
  /** Request timeout in ms (default: 15000). */
  timeout?: number;
  /** Max response body size in bytes (default: 50MB). */
  maxResponseSize?: number;
}

/** Error thrown by the HTTP backend with a stable code. */
export class HttpBackendError extends Error {
  constructor(
    message: string,
    public readonly code: "BACKEND_TIMEOUT" | "BACKEND_BAD_RESPONSE" | "BACKEND_UNREACHABLE",
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "HttpBackendError";
  }
}

const DEFAULT_TIMEOUT = 15_000;
const DEFAULT_MAX_RESPONSE = 50 * 1024 * 1024; // 50MB

export class HttpBackend implements Backend {
  readonly type = "http" as const;
  readonly ready: boolean;
  private readonly url: string;
  private readonly token?: string;
  private readonly timeout: number;
  private readonly maxResponseSize: number;

  constructor(config: HttpBackendConfig) {
    this.url = config.url;
    this.token = config.token;
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
    this.maxResponseSize = config.maxResponseSize ?? DEFAULT_MAX_RESPONSE;
    this.ready = !!config.url;
  }

  async health(): Promise<BackendHealth> {
    if (!this.url) {
      return { ready: false, details: "No TTS URL configured" };
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const resp = await fetch(this.url, {
        method: "GET",
        signal: controller.signal,
        headers: this.buildHeaders(),
      });
      clearTimeout(timer);
      return {
        ready: resp.ok,
        details: `HTTP ${resp.status} from ${this.url}`,
      };
    } catch (e) {
      return {
        ready: false,
        details: `Cannot reach ${this.url}: ${(e as Error).message}`,
      };
    }
  }

  async synthesize(request: SynthesisRequest): Promise<SynthesisResult> {
    if (!this.url) {
      throw new HttpBackendError("No TTS URL configured", "BACKEND_UNREACHABLE");
    }

    const payload = {
      text: request.text,
      voice: request.resolved.voice.id,
      speed: request.resolved.speed,
      format: request.artifact.format,
      trace_id: request.traceId,
      artifact_mode: request.artifact.mode,
    };

    let resp: Response;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeout);
      resp = await fetch(this.url, {
        method: "POST",
        body: JSON.stringify(payload),
        signal: controller.signal,
        headers: {
          ...this.buildHeaders(),
          "Content-Type": "application/json",
        },
      });
      clearTimeout(timer);
    } catch (e) {
      const err = e as Error;
      if (err.name === "AbortError") {
        throw new HttpBackendError(
          `Request timed out after ${this.timeout}ms`,
          "BACKEND_TIMEOUT",
        );
      }
      throw new HttpBackendError(
        `Cannot reach TTS backend: ${err.message}`,
        "BACKEND_UNREACHABLE",
      );
    }

    if (!resp.ok) {
      let body = "";
      try { body = await resp.text(); } catch {}
      throw new HttpBackendError(
        `Backend returned HTTP ${resp.status}: ${body.slice(0, 200)}`,
        "BACKEND_BAD_RESPONSE",
        resp.status,
      );
    }

    // Read body with size check
    const contentLength = resp.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > this.maxResponseSize) {
      throw new HttpBackendError(
        `Response too large: ${contentLength} bytes exceeds ${this.maxResponseSize}`,
        "BACKEND_BAD_RESPONSE",
      );
    }

    const body = await this.readResponseBody(resp);
    return this.parseResponse(body, request);
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    return headers;
  }

  private async readResponseBody(resp: Response): Promise<Record<string, unknown>> {
    const contentType = resp.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const text = await resp.text();
      if (text.length > this.maxResponseSize) {
        throw new HttpBackendError(
          `Response body too large: ${text.length} chars`,
          "BACKEND_BAD_RESPONSE",
        );
      }
      try {
        return JSON.parse(text) as Record<string, unknown>;
      } catch {
        throw new HttpBackendError(
          "Backend returned invalid JSON",
          "BACKEND_BAD_RESPONSE",
        );
      }
    }

    // Binary audio response — treat as raw bytes
    if (contentType.includes("audio/") || contentType.includes("application/octet-stream")) {
      const arrayBuf = await resp.arrayBuffer();
      if (arrayBuf.byteLength > this.maxResponseSize) {
        throw new HttpBackendError(
          `Binary response too large: ${arrayBuf.byteLength} bytes`,
          "BACKEND_BAD_RESPONSE",
        );
      }
      const buf = Buffer.from(arrayBuf);
      validateWavHeader(buf);
      return { audio_bytes_base64: buf.toString("base64"), _binary: true };
    }

    throw new HttpBackendError(
      `Unexpected content type: ${contentType}`,
      "BACKEND_BAD_RESPONSE",
    );
  }

  private async parseResponse(
    body: Record<string, unknown>,
    request: SynthesisRequest,
  ): Promise<SynthesisResult> {
    // Accept three shapes:
    // 1. { audio_bytes_base64: string }
    // 2. { audio_url: string }
    // 3. { audio_path: string }

    const sampleRate = typeof body.sample_rate === "number" ? body.sample_rate : 24000;
    const durationMs = typeof body.duration_ms === "number" ? body.duration_ms : 0;
    const format = typeof body.format === "string" ? body.format : request.artifact.format;

    if (typeof body.audio_bytes_base64 === "string") {
      const bytes = Buffer.from(body.audio_bytes_base64, "base64");
      validateWavHeader(bytes);

      if (request.artifact.mode === "base64") {
        return {
          audioBytesBase64: body.audio_bytes_base64,
          durationMs,
          sampleRate,
          format,
        };
      }

      // Client wants path — write to disk
      const outputDir = request.artifact.outputDir ?? tmpdir();
      const filename = `vsmcp_${randomUUID().slice(0, 8)}.${format}`;
      const audioPath = join(outputDir, filename);
      await writeFile(audioPath, bytes);
      return { audioPath, durationMs, sampleRate, format };
    }

    if (typeof body.audio_path === "string") {
      if (request.artifact.mode === "base64") {
        // Would need to read the file — for now, return the path with a note
        // Real implementation would read + encode
        throw new HttpBackendError(
          "Backend returned a path but client requested base64 — not yet supported for remote paths",
          "BACKEND_BAD_RESPONSE",
        );
      }
      return {
        audioPath: body.audio_path,
        durationMs,
        sampleRate,
        format,
      };
    }

    if (typeof body.audio_url === "string") {
      // Download the audio from the URL
      const audioResp = await fetch(body.audio_url as string);
      if (!audioResp.ok) {
        throw new HttpBackendError(
          `Failed to download audio from ${body.audio_url}: HTTP ${audioResp.status}`,
          "BACKEND_BAD_RESPONSE",
        );
      }
      const audioBytes = Buffer.from(await audioResp.arrayBuffer());
      validateWavHeader(audioBytes);

      if (request.artifact.mode === "base64") {
        return {
          audioBytesBase64: audioBytes.toString("base64"),
          durationMs,
          sampleRate,
          format,
        };
      }

      const outputDir = request.artifact.outputDir ?? tmpdir();
      const filename = `vsmcp_${randomUUID().slice(0, 8)}.${format}`;
      const audioPath = join(outputDir, filename);
      await writeFile(audioPath, audioBytes);
      return { audioPath, durationMs, sampleRate, format };
    }

    throw new HttpBackendError(
      "Backend response missing audio_bytes_base64, audio_path, or audio_url",
      "BACKEND_BAD_RESPONSE",
    );
  }
}

/**
 * Validate that bytes look like a WAV file (RIFF....WAVE header).
 * Only checks WAV — other formats pass through unchecked.
 */
function validateWavHeader(buf: Buffer): void {
  if (buf.length < 12) return; // Too small to validate
  const riff = buf.subarray(0, 4).toString("ascii");
  const wave = buf.subarray(8, 12).toString("ascii");
  if (riff === "RIFF" && wave !== "WAVE") {
    throw new HttpBackendError(
      "Response has RIFF header but is not WAVE format",
      "BACKEND_BAD_RESPONSE",
    );
  }
}
