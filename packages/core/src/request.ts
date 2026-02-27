/** Synthesis request builder — transforms validated inputs into a backend call descriptor. */

import { randomUUID } from "node:crypto";
import { resolveVoiceOrPreset, type ResolvedVoice } from "./validate.js";
import { validateText, validateSpeed } from "./limits.js";
import { buildArtifactConfig, type ArtifactConfig, type OutputFormat } from "./artifact.js";
import { SoundboardError } from "./errors.js";
import type { ArtifactMode, VoiceErrorResponse, VoiceErrorCode } from "./schemas.js";

export interface SynthesisRequest {
  readonly traceId: string;
  readonly text: string;
  readonly resolved: ResolvedVoice;
  readonly artifact: ArtifactConfig;
}

export interface SpeakInput {
  text: string;
  voice?: string;
  speed?: number;
  artifactMode?: ArtifactMode;
  outputDir?: string;
  format?: OutputFormat;
}

/**
 * Build a validated SynthesisRequest from raw speak input.
 * Throws on invalid input with stable error codes.
 */
export function buildSynthesisRequest(input: SpeakInput): SynthesisRequest {
  const traceId = randomUUID();
  const text = validateText(input.text);
  // Only pass speed override if explicitly provided (so preset speeds are preserved)
  const speedOverride = input.speed !== undefined ? validateSpeed(input.speed) : undefined;
  const resolved = resolveVoiceOrPreset(input.voice, speedOverride);
  const artifact = buildArtifactConfig({
    mode: input.artifactMode,
    outputDir: input.outputDir,
    format: input.format,
  });

  return { traceId, text, resolved, artifact };
}

/** Create a stable error response. */
export function errorResponse(
  code: VoiceErrorCode,
  message: string,
  traceId?: string,
  context?: Record<string, unknown>,
): VoiceErrorResponse {
  return {
    error: true,
    code,
    message,
    hint: "Check voice_status for engine health",
    retryable: false,
    traceId: traceId ?? randomUUID(),
    ...(context ? { context } : {}),
  };
}

/**
 * Convert a caught error into a VoiceErrorResponse.
 * Extracts hint + retryable from SoundboardError subclasses.
 */
export function fromError(
  err: unknown,
  traceId?: string,
): VoiceErrorResponse {
  if (err instanceof SoundboardError) {
    return {
      error: true,
      code: err.code,
      message: err.message,
      hint: err.hint,
      retryable: err.retryable,
      traceId: traceId ?? randomUUID(),
      ...("context" in err && err.context ? { context: err.context as Record<string, unknown> } : {}),
    };
  }
  return errorResponse(
    "INTERNAL_ERROR",
    err instanceof Error ? err.message : String(err),
    traceId,
  );
}
