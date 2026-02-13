/** voice.speak tool — synthesize speech. */

import {
  buildSynthesisRequest,
  errorResponse,
  VoiceValidationError,
  LimitError,
  type VoiceSpeakResponse,
  type VoiceErrorResponse,
  type ArtifactMode,
  type OutputFormat,
} from "@mcp-tool-shop/voice-soundboard-core";
import type { Backend } from "../backend.js";
import { HttpBackendError } from "../backends/httpBackend.js";

export interface SpeakArgs {
  text: string;
  voice?: string;
  speed?: number;
  format?: string;
  artifactMode?: string;
  outputDir?: string;
}

export async function handleSpeak(
  args: SpeakArgs,
  backend: Backend,
): Promise<VoiceSpeakResponse | VoiceErrorResponse> {
  let request;
  try {
    request = buildSynthesisRequest({
      text: args.text,
      voice: args.voice,
      speed: args.speed,
      format: (args.format as OutputFormat) ?? undefined,
      artifactMode: (args.artifactMode as ArtifactMode) ?? undefined,
      outputDir: args.outputDir,
    });
  } catch (e) {
    if (e instanceof VoiceValidationError) {
      return errorResponse(
        e.code as any,
        e.message,
        undefined,
        e.context,
      );
    }
    if (e instanceof LimitError) {
      return errorResponse(
        e.code as any,
        e.message,
        undefined,
        e.context,
      );
    }
    return errorResponse("INTERNAL_ERROR", String(e));
  }

  if (!backend.ready) {
    return errorResponse("BACKEND_UNAVAILABLE", "Backend is not ready", request.traceId);
  }

  try {
    const result = await backend.synthesize(request);
    return {
      traceId: request.traceId,
      voiceUsed: request.resolved.voice.id,
      presetUsed: request.resolved.presetName,
      speed: request.resolved.speed,
      artifactMode: request.artifact.mode,
      audioPath: result.audioPath,
      audioBytesBase64: result.audioBytesBase64,
      durationMs: result.durationMs,
      sampleRate: result.sampleRate,
      format: result.format,
    };
  } catch (e) {
    if (e instanceof HttpBackendError) {
      return errorResponse(e.code as any, e.message, request.traceId);
    }
    return errorResponse("SYNTHESIS_FAILED", String(e), request.traceId);
  }
}
