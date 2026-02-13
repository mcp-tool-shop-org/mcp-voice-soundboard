/** Python child-process TTS backend — communicates via NDJSON over stdio. */

import { spawn, type ChildProcess } from "node:child_process";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import type { Backend, BackendHealth, SynthesisResult } from "../backend.js";
import type { SynthesisRequest } from "@mcptoolshop/voice-soundboard-core";

export interface PythonBackendConfig {
  /** Python executable (default: "python"). */
  command?: string;
  /** Bridge module to run (default: "soundboard_bridge"). */
  module?: string;
  /** Synthesis timeout in ms (default: 30000). */
  timeout?: number;
}

/** Error from the Python backend with a stable code. */
export class PythonBackendError extends Error {
  constructor(
    message: string,
    public readonly code: "BACKEND_TIMEOUT" | "BACKEND_UNREACHABLE" | "BACKEND_BAD_RESPONSE" | "SYNTHESIS_FAILED",
  ) {
    super(message);
    this.name = "PythonBackendError";
  }
}

interface PendingRequest {
  resolve: (value: Record<string, unknown>) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

const DEFAULT_TIMEOUT = 30_000;
const BRIDGE_MODULE_DIR = resolve(import.meta.dirname, "..", "..", "backend-python");

export class PythonBackend implements Backend {
  readonly type = "python" as const;
  private proc: ChildProcess | null = null;
  private readonly pythonCommand: string;
  private readonly bridgeModule: string;
  private readonly timeout: number;
  private pending = new Map<string, PendingRequest>();
  private buffer = "";
  private _ready = false;

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

    const resp = await this.send({
      op: "synthesize",
      text: request.text,
      voice: request.resolved.voice.id,
      speed: request.resolved.speed,
      format: request.artifact.format,
      output_dir: request.artifact.outputDir,
      artifact_mode: request.artifact.mode,
    });

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

  /** Ensure the Python process is running. */
  private async ensureProcess(): Promise<void> {
    if (this.proc && !this.proc.killed) return;

    return new Promise<void>((resolve, reject) => {
      const env: Record<string, string> = {};
      // Pass through only necessary env vars
      if (process.env.PATH) env.PATH = process.env.PATH;
      if (process.env.PYTHONPATH) env.PYTHONPATH = process.env.PYTHONPATH;
      if (process.env.HOME) env.HOME = process.env.HOME;
      if (process.env.USERPROFILE) env.USERPROFILE = process.env.USERPROFILE;
      if (process.env.SYSTEMROOT) env.SYSTEMROOT = process.env.SYSTEMROOT;
      // Pass through the TTS URL in case the python bridge needs it
      if (process.env.VOICE_SOUNDBOARD_TTS_URL) env.VOICE_SOUNDBOARD_TTS_URL = process.env.VOICE_SOUNDBOARD_TTS_URL;

      this.proc = spawn(this.pythonCommand, ["-m", this.bridgeModule], {
        stdio: ["pipe", "pipe", "pipe"],
        env,
        cwd: BRIDGE_MODULE_DIR,
      });

      const startTimer = setTimeout(() => {
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
          resolve();
        },
        reject: (err) => {
          clearTimeout(startTimer);
          reject(err);
        },
        timer: startTimer,
      });

      this.proc.stdin!.write(healthMsg);
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
      this.proc.stdin!.write(msg);
    });
  }

  /** Drain the stdout buffer for complete NDJSON lines. */
  private drainBuffer(): void {
    const lines = this.buffer.split("\n");
    this.buffer = lines.pop()!;
    for (const line of lines) {
      if (!line.trim()) continue;
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(line) as Record<string, unknown>;
      } catch {
        continue; // Skip malformed lines
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
