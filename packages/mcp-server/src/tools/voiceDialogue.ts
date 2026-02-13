/** voice_dialogue tool — synthesize multi-speaker dialogue. */

import {
  parseDialogue,
  DialogueParseError,
  errorResponse,
  buildSynthesisRequest,
  VoiceValidationError,
  LimitError,
  defaultOutputRoot,
  resolveOutputDir,
  OutputDirError,
  hasEmotionTags,
  runEmotionPlan,
  type ArtifactMode,
  type CastMap,
  type EmotionSynthesisContext,
} from "@mcp-tool-shop/voice-soundboard-core";
import type { Backend, SynthesisResult } from "../backend.js";
import { HttpBackendError } from "../backends/httpBackend.js";
import { PythonBackendError } from "../backends/pythonBackend.js";

export interface DialogueArgs {
  script: string;
  cast?: Record<string, string>;
  speed?: number;
  concat?: boolean;
  debug?: boolean;
  artifactMode?: string;
  outputDir?: string;
}

export interface DialogueDefaults {
  defaultArtifactMode?: ArtifactMode;
  outputRoot?: string;
}

export interface DialogueLineResult {
  readonly speaker: string;
  readonly voiceId: string;
  readonly text: string;
  readonly audioPath?: string;
  readonly audioBytesBase64?: string;
  readonly durationMs: number;
}

export interface DialoguePauseResult {
  readonly type: "pause";
  readonly durationMs: number;
}

export interface DialogueResponse {
  readonly lineCount: number;
  readonly speakers: readonly string[];
  readonly cast: Record<string, string>;
  readonly artifacts: readonly (DialogueLineResult | DialoguePauseResult)[];
  readonly totalDurationMs: number;
  readonly cueSheet?: readonly Record<string, unknown>[];
  readonly warnings?: readonly Record<string, unknown>[];
}

export async function handleDialogue(
  args: DialogueArgs,
  backend: Backend,
  defaults?: DialogueDefaults,
): Promise<DialogueResponse | ReturnType<typeof errorResponse>> {
  // Parse the script
  let cueSheet;
  try {
    cueSheet = parseDialogue(args.script, {
      cast: args.cast as CastMap,
    });
  } catch (e) {
    if (e instanceof DialogueParseError) {
      return errorResponse(e.code as any, e.message);
    }
    return errorResponse("INTERNAL_ERROR", String(e));
  }

  // Resolve artifact mode
  const artifactMode = (args.artifactMode as ArtifactMode)
    ?? defaults?.defaultArtifactMode
    ?? "path";

  // Resolve output dir for path mode
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

  if (!backend.ready) {
    return errorResponse("BACKEND_UNAVAILABLE", "Backend is not ready");
  }

  // Synthesize each line cue
  const artifacts: (DialogueLineResult | DialoguePauseResult)[] = [];
  let totalDurationMs = 0;

  for (const cue of cueSheet.cues) {
    if (cue.type === "pause") {
      artifacts.push({ type: "pause", durationMs: cue.durationMs });
      totalDurationMs += cue.durationMs;
      continue;
    }

    // If line text contains emotion tags, route through emotion pipeline
    if (hasEmotionTags(cue.text)) {
      try {
        const emotionResult = await runEmotionPlan({
          text: cue.text,
          synthesize: async (text: string, _idx: number, ctx: EmotionSynthesisContext) => {
            const req = buildSynthesisRequest({
              text,
              voice: ctx.voiceId,
              speed: args.speed != null ? args.speed * ctx.speed : ctx.speed,
              artifactMode,
              outputDir: resolvedOutputDir,
            });
            const sr = await backend.synthesize(req);
            return {
              audioPath: sr.audioPath,
              audioBytesBase64: sr.audioBytesBase64,
              durationMs: sr.durationMs,
              sampleRate: sr.sampleRate,
              format: sr.format,
            };
          },
          options: { artifactMode, outputDir: resolvedOutputDir, concat: true },
        });
        artifacts.push({
          speaker: cue.speaker,
          voiceId: cue.voiceId,
          text: cue.text,
          audioPath: emotionResult.concatPath ?? emotionResult.chunks[0]?.audioPath,
          audioBytesBase64: emotionResult.concatBase64 ?? emotionResult.chunks[0]?.audioBytesBase64,
          durationMs: emotionResult.totalDurationMs,
        });
        totalDurationMs += emotionResult.totalDurationMs;
      } catch (e) {
        if (e instanceof HttpBackendError || e instanceof PythonBackendError) {
          return errorResponse((e as any).code, e.message);
        }
        return errorResponse("SYNTHESIS_FAILED", String(e));
      }
      continue;
    }

    // Standard (non-emotion) synthesis for this line
    let request;
    try {
      request = buildSynthesisRequest({
        text: cue.text,
        voice: cue.voiceId,
        speed: args.speed,
        artifactMode,
        outputDir: resolvedOutputDir,
      });
    } catch (e) {
      if (e instanceof VoiceValidationError || e instanceof LimitError) {
        return errorResponse(e.code as any, e.message, undefined, (e as any).context);
      }
      return errorResponse("INTERNAL_ERROR", String(e));
    }

    let result: SynthesisResult;
    try {
      result = await backend.synthesize(request);
    } catch (e) {
      if (e instanceof HttpBackendError) {
        return errorResponse(e.code as any, e.message, request.traceId);
      }
      if (e instanceof PythonBackendError) {
        return errorResponse(e.code as any, e.message, request.traceId);
      }
      return errorResponse("SYNTHESIS_FAILED", String(e), request.traceId);
    }

    artifacts.push({
      speaker: cue.speaker,
      voiceId: cue.voiceId,
      text: cue.text,
      audioPath: result.audioPath,
      audioBytesBase64: result.audioBytesBase64,
      durationMs: result.durationMs,
    });
    totalDurationMs += result.durationMs;
  }

  // Build cast as plain object
  const castObj: Record<string, string> = {};
  for (const [speaker, voice] of cueSheet.cast) {
    castObj[speaker] = voice;
  }

  const lineCount = cueSheet.cues.filter((c) => c.type === "line").length;

  const response: DialogueResponse = {
    lineCount,
    speakers: cueSheet.speakers,
    cast: castObj,
    artifacts,
    totalDurationMs,
  };

  // Optionally include debug info
  if (args.debug) {
    (response as any).cueSheet = cueSheet.cues.map((c) => {
      if (c.type === "pause") return { type: "pause", durationMs: c.durationMs };
      return { type: "line", speaker: c.speaker, voiceId: c.voiceId, text: c.text };
    });
    if (cueSheet.warnings.length > 0) {
      (response as any).warnings = cueSheet.warnings;
    }
  }

  return response;
}
