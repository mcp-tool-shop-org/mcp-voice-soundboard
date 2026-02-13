/** Stable response schemas for MCP tool outputs. */

import type { VoiceInfo } from "./voices.js";
import type { PresetConfig } from "./presets.js";

// ── voice.status ──

export interface BackendInfo {
  readonly type: string;
  readonly ready: boolean;
  readonly model?: string;
  readonly sampleRate?: number;
  readonly details?: string;
}

export interface VoiceStatusResponse {
  readonly voices: VoiceInfo[];
  readonly presets: PresetConfig[];
  readonly defaultVoice: string;
  readonly backend: BackendInfo;
}

// ── voice.speak ──

export interface VoiceSpeakResponse {
  readonly traceId: string;
  readonly voiceUsed: string;
  readonly presetUsed?: string;
  readonly speed: number;
  readonly artifactMode: ArtifactMode;
  readonly audioPath?: string;
  readonly audioBytesBase64?: string;
  readonly durationMs?: number;
  readonly sampleRate?: number;
  readonly format: string;
}

export type ArtifactMode = "path" | "base64";

// ── voice.interrupt ──

export interface VoiceInterruptResponse {
  readonly interrupted: boolean;
  readonly streamId?: string;
  readonly reason: string;
}

// ── voice.stream ──

export interface VoiceStreamResponse {
  readonly streamId: string;
  readonly voiceUsed: string;
  readonly status: "started" | "completed" | "interrupted";
}

// ── Errors ──

export interface VoiceErrorResponse {
  readonly error: true;
  readonly code: string;
  readonly message: string;
  readonly traceId: string;
  readonly context?: Record<string, unknown>;
}

/** All possible stable error codes. */
export type VoiceErrorCode =
  | "VOICE_NOT_APPROVED"
  | "VOICE_OR_PRESET_NOT_FOUND"
  | "TEXT_TOO_LONG"
  | "TEXT_EMPTY"
  | "SPEED_OUT_OF_RANGE"
  | "BACKEND_UNAVAILABLE"
  | "BACKEND_TIMEOUT"
  | "BACKEND_BAD_RESPONSE"
  | "BACKEND_UNREACHABLE"
  | "SYNTHESIS_FAILED"
  | "STREAM_NOT_FOUND"
  | "OUTPUT_DIR_INVALID"
  | "INTERNAL_ERROR";
