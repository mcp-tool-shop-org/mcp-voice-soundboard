/** voice_dialogue tool — synthesize multi-speaker dialogue. */

import {
  parseDialogue,
  errorResponse,
  fromError,
  buildSynthesisRequest,
  defaultOutputRoot,
  resolveOutputDir,
  hasEmotionTags,
  runEmotionPlan,
  type ArtifactMode,
  type CastMap,
  type EmotionSynthesisContext,
} from "@mcptoolshop/voice-soundboard-core";
import type { Backend, SynthesisResult } from "../backend.js";
import { validateSynthesisResult } from "../validation.js";

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
    return fromError(e);
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
      return fromError(e);
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
            await validateSynthesisResult(sr);
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
        return fromError(e);
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
      return fromError(e);
    }

    let result: SynthesisResult;
    try {
      result = await backend.synthesize(request);
      // MCP-011: Validate synthesis result before using
      await validateSynthesisResult(result);
    } catch (e) {
      return fromError(e, request.traceId);
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
