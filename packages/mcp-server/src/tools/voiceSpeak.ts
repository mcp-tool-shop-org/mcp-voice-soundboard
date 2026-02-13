/** voice.speak tool — synthesize speech. */

import {
  buildSynthesisRequest,
  errorResponse,
  VoiceValidationError,
  LimitError,
  OutputDirError,
  defaultOutputRoot,
  resolveOutputDir,
  hasEmotionTags,
  runEmotionPlan,
  type VoiceSpeakResponse,
  type VoiceErrorResponse,
  type ArtifactMode,
  type OutputFormat,
  type EmotionSynthesisContext,
} from "@mcptoolshop/voice-soundboard-core";
import type { Backend } from "../backend.js";
import { HttpBackendError } from "../backends/httpBackend.js";
import { PythonBackendError } from "../backends/pythonBackend.js";

export interface SpeakArgs {
  text: string;
  voice?: string;
  speed?: number;
  format?: string;
  artifactMode?: string;
  outputDir?: string;
}

export interface SpeakDefaults {
  defaultArtifactMode?: ArtifactMode;
  outputRoot?: string;
}

export async function handleSpeak(
  args: SpeakArgs,
  backend: Backend,
  defaults?: SpeakDefaults,
): Promise<VoiceSpeakResponse | VoiceErrorResponse> {
  // Resolve artifact mode: per-call > server default > core default
  const artifactMode = (args.artifactMode as ArtifactMode)
    ?? defaults?.defaultArtifactMode
    ?? undefined;

  // Resolve output dir with sandboxing (only for path mode)
  let resolvedOutputDir: string | undefined;
  if (artifactMode !== "base64") {
    const root = defaults?.outputRoot ?? defaultOutputRoot();
    try {
      resolvedOutputDir = await resolveOutputDir(args.outputDir, root);
    } catch (e) {
      if (e instanceof OutputDirError) {
        return errorResponse(e.code as any, e.message);
      }
      return errorResponse("OUTPUT_DIR_INVALID", String(e));
    }
  }

  // Emotion-aware path: if text contains emotion tags, route through runEmotionPlan
  if (hasEmotionTags(args.text)) {
    return handleEmotionSpeak(args, backend, artifactMode ?? "path", resolvedOutputDir);
  }

  let request;
  try {
    request = buildSynthesisRequest({
      text: args.text,
      voice: args.voice,
      speed: args.speed,
      format: (args.format as OutputFormat) ?? undefined,
      artifactMode,
      outputDir: resolvedOutputDir,
    });
  } catch (e) {
    if (e instanceof VoiceValidationError) {
      return errorResponse(e.code as any, e.message, undefined, e.context);
    }
    if (e instanceof LimitError) {
      return errorResponse(e.code as any, e.message, undefined, e.context);
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
    if (e instanceof PythonBackendError) {
      return errorResponse(e.code as any, e.message, request.traceId);
    }
    return errorResponse("SYNTHESIS_FAILED", String(e), request.traceId);
  }
}

async function handleEmotionSpeak(
  args: SpeakArgs,
  backend: Backend,
  artifactMode: ArtifactMode,
  outputDir?: string,
): Promise<VoiceSpeakResponse | VoiceErrorResponse> {
  if (!backend.ready) {
    return errorResponse("BACKEND_UNAVAILABLE", "Backend is not ready");
  }

  try {
    const result = await runEmotionPlan({
      text: args.text,
      synthesize: async (text: string, _chunkIndex: number, ctx: EmotionSynthesisContext) => {
        const request = buildSynthesisRequest({
          text,
          voice: ctx.voiceId,
          speed: args.speed != null ? args.speed * ctx.speed : ctx.speed,
          artifactMode,
          outputDir,
        });
        const synthResult = await backend.synthesize(request);
        return {
          audioPath: synthResult.audioPath,
          audioBytesBase64: synthResult.audioBytesBase64,
          durationMs: synthResult.durationMs,
          sampleRate: synthResult.sampleRate,
          format: synthResult.format,
        };
      },
      options: {
        artifactMode,
        outputDir,
        concat: true,
      },
    });

    // Return the first chunk's info for the response
    const firstChunk = result.chunks[0];
    return {
      traceId: "emotion-plan",
      voiceUsed: "emotion-mapped",
      speed: 1.0,
      artifactMode,
      audioPath: result.concatPath ?? firstChunk?.audioPath,
      audioBytesBase64: result.concatBase64 ?? firstChunk?.audioBytesBase64,
      durationMs: result.totalDurationMs,
      sampleRate: firstChunk?.sampleRate,
      format: firstChunk?.format ?? "wav",
    };
  } catch (e) {
    if (e instanceof HttpBackendError) {
      return errorResponse(e.code as any, e.message);
    }
    if (e instanceof PythonBackendError) {
      return errorResponse(e.code as any, e.message);
    }
    return errorResponse("SYNTHESIS_FAILED", String(e));
  }
}
