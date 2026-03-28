/** Python child-process TTS backend — communicates via NDJSON over stdio. */

import { spawn, type ChildProcess } from "node:child_process";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import type { Backend, BackendHealth, SynthesisResult } from "../backend.js";
import { SoundboardError, type SynthesisRequest } from "@mcptoolshop/voice-soundboard-core";

export interface PythonBackendConfig {
  /** Python executable (default: "python"). */
  command?: string;
  /** Bridge module to run (default: "soundboard_bridge"). */
  module?: string;
  /** Synthesis timeout in ms (default: 30000). */
  timeout?: number;
}

const PYTHON_HINTS: Record<string, string> = {
  BACKEND_TIMEOUT: "Increase timeout or check Python process health",
  BACKEND_UNREACHABLE: "Verify Python is installed and the bridge module is available",
  BACKEND_BAD_RESPONSE: "Check Python bridge output format",
  SYNTHESIS_FAILED: "Check Python bridge logs for synthesis errors",
};

/** Error from the Python backend with a stable code. */
export class PythonBackendError extends SoundboardError {
  constructor(
    message: string,
    code: "BACKEND_TIMEOUT" | "BACKEND_UNREACHABLE" | "BACKEND_BAD_RESPONSE" | "SYNTHESIS_FAILED",
  ) {
    super(code, message, PYTHON_HINTS[code] ?? "Check backend configuration", { retryable: code === "BACKEND_TIMEOUT" });
    this.name = "PythonBackendError";
  }
}

interface PendingRequest {
  resolve: (value: Record<string, unknown>) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

const DEFAULT_TIMEOUT = 30_000;
const MAX_BUFFER_SIZE = 10 * 1024 * 1024; // 10MB — reject + clear if exceeded
const MAX_CONSECUTIVE_FAILURES = 3;
const COOLDOWN_MS = 60_000; // 60s cooldown after repeated spawn failures
const BRIDGE_MODULE_DIR = import.meta.dirname
  ? resolve(import.meta.dirname, "..", "..", "backend-python")
  : resolve("backend-python");

export class PythonBackend implements Backend {
  readonly type = "python" as const;
  private proc: ChildProcess | null = null;
  private readonly pythonCommand: string;
  private readonly bridgeModule: string;
  private readonly timeout: number;
  private pending = new Map<string, PendingRequest>();
  private buffer = "";
  private _ready = false;
  private _consecutiveFailures = 0;
  private _cooldownUntil = 0;

  get ready(): boolean {
    return this._ready;
  }

  constructor(config: PythonBackendConfig) {
    this.pythonCommand = config.command ?? "python";
    this.bridgeModule = config.module ?? "soundboard_bridge";
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
  }

  async health(): Promise<BackendHealth> {
    try {
      await this.ensureProcess();
      const resp = await this.send({ op: "health" });
      if (resp.ok) {
        return {
          ready: true,
          details: `Python backend: ${resp.model ?? "unknown model"}`,
        };
      }
      return {
        ready: false,
        details: `Python health check failed: ${resp.error ?? "unknown"}`,
      };
    } catch (e) {
      return {
        ready: false,
        details: `Python backend unavailable: ${(e as Error).message}`,
      };
    }
  }

  async synthesize(request: SynthesisRequest): Promise<SynthesisResult> {
    await this.ensureProcess();

    const payload: Record<string, unknown> = {
      op: "synthesize",
      text: request.text,
      voice: request.resolved.voice.id,
      speed: request.resolved.speed,
      format: request.artifact.format,
      output_dir: request.artifact.outputDir,
      artifact_mode: request.artifact.mode,
    };

    // Pass Piper-native prosody if present (set by mood handler for Piper engine)
    if ((request as any).piperProsody) {
      payload.piper_prosody = (request as any).piperProsody;
    }

    const resp = await this.send(payload);

    if (!resp.ok) {
      const errObj = resp.error as Record<string, unknown> | undefined;
      throw new PythonBackendError(
        String(errObj?.message ?? resp.error ?? "Synthesis failed"),
        (errObj?.code as any) ?? "SYNTHESIS_FAILED",
      );
    }

    return {
      audioPath: resp.audio_path as string | undefined,
      audioBytesBase64: resp.audio_bytes_base64 as string | undefined,
      durationMs: (resp.duration_ms as number) ?? 0,
      sampleRate: (resp.sample_rate as number) ?? 24000,
      format: (resp.format as string) ?? request.artifact.format,
    };
  }

  async interrupt(): Promise<void> {
    if (!this.proc) return;
    try {
      await this.send({ op: "interrupt" });
    } catch {
      // Best-effort
    }
  }

  /** Ensure the Python process is running. Circuit-breaker: after repeated failures, cool down. */
  private async ensureProcess(): Promise<void> {
    if (this.proc && !this.proc.killed) return;

    // Circuit-breaker: if too many consecutive failures, wait for cooldown
    if (this._consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      const now = Date.now();
      if (now < this._cooldownUntil) {
        const remainingMs = this._cooldownUntil - now;
        throw new PythonBackendError(
          `Python backend in cooldown after ${this._consecutiveFailures} consecutive spawn failures (${Math.ceil(remainingMs / 1000)}s remaining)`,
          "BACKEND_UNREACHABLE",
        );
      }
      // Cooldown expired — allow one more attempt
      process.stderr.write(`[python-backend] Cooldown expired, retrying spawn (attempt after ${this._consecutiveFailures} failures)\n`);
    }

    return new Promise<void>((resolve, reject) => {
      const env: Record<string, string> = {};
      // Pass through only necessary env vars
      if (process.env.PATH) env.PATH = process.env.PATH;
      if (process.env.PYTHONPATH) env.PYTHONPATH = process.env.PYTHONPATH;
      if (process.env.HOME) env.HOME = process.env.HOME;
      if (process.env.USERPROFILE) env.USERPROFILE = process.env.USERPROFILE;
      if (process.env.SYSTEMROOT) env.SYSTEMROOT = process.env.SYSTEMROOT;
      // Windows: Python needs APPDATA to find user site-packages
      if (process.env.APPDATA) env.APPDATA = process.env.APPDATA;
      if (process.env.LOCALAPPDATA) env.LOCALAPPDATA = process.env.LOCALAPPDATA;
      // Pass through the TTS URL in case the python bridge needs it
      if (process.env.VOICE_SOUNDBOARD_TTS_URL) env.VOICE_SOUNDBOARD_TTS_URL = process.env.VOICE_SOUNDBOARD_TTS_URL;
      // Pass output dir so Python writes artifacts to the configured location
      if (process.env.VOICE_SOUNDBOARD_OUTPUT_DIR) env.VOICE_SOUNDBOARD_OUTPUT_DIR = process.env.VOICE_SOUNDBOARD_OUTPUT_DIR;
      // Pass engine selection (kokoro or piper) and Piper model dir
      if (process.env.VOICE_SOUNDBOARD_ENGINE) env.VOICE_SOUNDBOARD_ENGINE = process.env.VOICE_SOUNDBOARD_ENGINE;
      if (process.env.VOICE_SOUNDBOARD_PIPER_MODEL_DIR) env.VOICE_SOUNDBOARD_PIPER_MODEL_DIR = process.env.VOICE_SOUNDBOARD_PIPER_MODEL_DIR;

      this.proc = spawn(this.pythonCommand, ["-m", this.bridgeModule], {
        stdio: ["pipe", "pipe", "pipe"],
        env,
        cwd: BRIDGE_MODULE_DIR,
      });

      const startTimer = setTimeout(() => {
        this._consecutiveFailures++;
        this._cooldownUntil = Date.now() + COOLDOWN_MS;
        process.stderr.write(`[python-backend] Spawn timeout (failure #${this._consecutiveFailures})\n`);
        reject(new PythonBackendError(
          "Python backend did not start within 10s",
          "BACKEND_TIMEOUT",
        ));
        this.kill();
      }, 10_000);

      this.proc.stdout!.on("data", (chunk: Buffer) => {
        this.buffer += chunk.toString();
        this.drainBuffer();
      });

      this.proc.stderr!.on("data", (chunk: Buffer) => {
        // Log stderr but don't treat as protocol data
        const text = chunk.toString().trim();
        if (text) {
          process.stderr.write(`[python-backend] ${text}\n`);
        }
      });

      this.proc.on("error", (err) => {
        clearTimeout(startTimer);
        this._ready = false;
        this._consecutiveFailures++;
        this._cooldownUntil = Date.now() + COOLDOWN_MS;
        process.stderr.write(`[python-backend] Spawn error (failure #${this._consecutiveFailures}): ${err.message}\n`);
        reject(new PythonBackendError(
          `Failed to start python: ${err.message}`,
          "BACKEND_UNREACHABLE",
        ));
      });

      this.proc.on("exit", (code) => {
        this._ready = false;
        // Reject all pending requests
        for (const [id, pending] of this.pending) {
          clearTimeout(pending.timer);
          pending.reject(new PythonBackendError(
            `Python process exited with code ${code}`,
            "BACKEND_UNREACHABLE",
          ));
        }
        this.pending.clear();
        this.proc = null;
      });

      // Send a health check to confirm startup
      const healthId = randomUUID();
      const healthMsg = JSON.stringify({ id: healthId, op: "health" }) + "\n";

      this.pending.set(healthId, {
        resolve: () => {
          clearTimeout(startTimer);
          this._ready = true;
          this._consecutiveFailures = 0;
          this._cooldownUntil = 0;
          resolve();
        },
        reject: (err) => {
          clearTimeout(startTimer);
          reject(err);
        },
        timer: startTimer,
      });

      try {
        this.proc.stdin!.write(healthMsg);
      } catch (e) {
        clearTimeout(startTimer);
        this.pending.delete(healthId);
        process.stderr.write(`[python-backend] stdin write failed during startup: ${(e as Error).message}\n`);
        this.kill();
        reject(new PythonBackendError(
          `Failed to write to Python stdin: ${(e as Error).message}`,
          "BACKEND_UNREACHABLE",
        ));
      }
    });
  }

  /** Send a request to the Python process and wait for a response. */
  private send(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      if (!this.proc || this.proc.killed) {
        reject(new PythonBackendError("Python process not running", "BACKEND_UNREACHABLE"));
        return;
      }

      const id = randomUUID();
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new PythonBackendError(
          `Request timed out after ${this.timeout}ms`,
          "BACKEND_TIMEOUT",
        ));
      }, this.timeout);

      this.pending.set(id, { resolve, reject, timer });
      const msg = JSON.stringify({ id, ...payload }) + "\n";
      try {
        this.proc.stdin!.write(msg);
      } catch (e) {
        // EPIPE or other write error — process is dead/dying
        this.pending.delete(id);
        clearTimeout(timer);
        process.stderr.write(`[python-backend] stdin write failed: ${(e as Error).message}\n`);
        this.kill();
        reject(new PythonBackendError(
          `Failed to write to Python stdin: ${(e as Error).message}`,
          "BACKEND_UNREACHABLE",
        ));
      }
    });
  }

  /** Drain the stdout buffer for complete NDJSON lines. */
  private drainBuffer(): void {
    // B-03: Guard against unbounded buffer growth
    if (this.buffer.length > MAX_BUFFER_SIZE) {
      process.stderr.write(
        `[python-backend] Buffer exceeded ${MAX_BUFFER_SIZE} bytes (${this.buffer.length}), rejecting pending requests and clearing\n`,
      );
      for (const [id, pending] of this.pending) {
        clearTimeout(pending.timer);
        pending.reject(new PythonBackendError(
          "Python backend stdout buffer overflow",
          "BACKEND_BAD_RESPONSE",
        ));
      }
      this.pending.clear();
      this.buffer = "";
      return;
    }

    const lines = this.buffer.split("\n");
    this.buffer = lines.pop()!;
    for (const line of lines) {
      if (!line.trim()) continue;
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(line) as Record<string, unknown>;
      } catch {
        // B-02: Log malformed JSON so it doesn't vanish silently
        const truncated = line.length > 200 ? line.slice(0, 200) + "..." : line;
        process.stderr.write(`[python-backend] Malformed JSON line: ${truncated}\n`);
        continue;
      }

      const id = msg.id as string;
      if (!id) continue;

      const pending = this.pending.get(id);
      if (!pending) continue;

      this.pending.delete(id);
      clearTimeout(pending.timer);
      pending.resolve(msg);
    }
  }

  /** Kill the Python process. */
  private kill(): void {
    if (this.proc && !this.proc.killed) {
      this.proc.stdin!.end();
      this.proc.kill();
    }
    this.proc = null;
    this._ready = false;
  }
}
