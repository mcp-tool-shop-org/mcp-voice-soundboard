/** voice.speak tool — synthesize speech. */

import { randomUUID } from "node:crypto";
import {
  buildSynthesisRequest,
  errorResponse,
  fromError,
  defaultOutputRoot,
  resolveOutputDir,
  hasEmotionTags,
  runEmotionPlan,
  getHumorPreset,
  wrapWithProsody,
  HUMOR_MOODS,
  type VoiceSpeakResponse,
  type VoiceErrorResponse,
  type ArtifactMode,
  type OutputFormat,
  type HumorMood,
  type PiperProsodyConfig,
  type EmotionSynthesisContext,
} from "@mcptoolshop/voice-soundboard-core";
import type { Backend } from "../backend.js";
import { validateSynthesisResult } from "../validation.js";

export interface SpeakArgs {
  text: string;
  voice?: string;
  speed?: number;
  format?: string;
  artifactMode?: string;
  outputDir?: string;
  /** Humor mood — resolves to a humor preset with voice + prosody. Overrides voice/speed if set. */
  mood?: string;
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
      return fromError(e);
    }
  }

  // Mood-aware path: resolve humor preset → voice + prosody-wrapped text
  let speakText = args.text;
  let speakVoice = args.voice;
  let speakSpeed = args.speed;
  let moodUsed: string | undefined;
  let piperProsody: PiperProsodyConfig | undefined;

  if (args.mood) {
    const mood = args.mood.toLowerCase() as HumorMood;
    if (!HUMOR_MOODS.includes(mood)) {
      return errorResponse(
        "INVALID_MOOD" as any,
        `Unknown humor mood "${args.mood}". Valid: ${HUMOR_MOODS.join(", ")}`,
      );
    }
    const preset = getHumorPreset(mood);
    if (preset) {
      speakVoice = speakVoice ?? preset.name;  // resolve via preset name → voice
      speakSpeed = speakSpeed ?? preset.speed;
      // If preset has Piper-native prosody, pass it through for Piper backend
      if (preset.piperProsody) {
        piperProsody = preset.piperProsody;
      }
      // Still wrap SSML for non-Piper backends (Kokoro, Azure, etc.)
      speakText = wrapWithProsody(args.text, preset.prosody);
      moodUsed = mood;
    }
  }

  // Emotion-aware path: if text contains emotion tags, route through runEmotionPlan
  if (hasEmotionTags(speakText)) {
    return handleEmotionSpeak({ ...args, text: speakText, voice: speakVoice, speed: speakSpeed }, backend, artifactMode ?? "path", resolvedOutputDir);
  }

  let request;
  try {
    request = buildSynthesisRequest({
      text: speakText,
      voice: speakVoice,
      speed: speakSpeed,
      format: (args.format as OutputFormat) ?? undefined,
      artifactMode,
      outputDir: resolvedOutputDir,
    });
  } catch (e) {
    return fromError(e);
  }

  // Attach Piper prosody to request for Python backend passthrough
  if (piperProsody) {
    (request as any).piperProsody = piperProsody;
  }

  if (!backend.ready) {
    return errorResponse("BACKEND_UNAVAILABLE", `Backend '${backend.type}' is not ready`, request.traceId);
  }

  try {
    const result = await backend.synthesize(request);
    // MCP-011: Validate synthesis result before returning
    await validateSynthesisResult(result);
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
      ...(moodUsed ? { moodUsed } : {}),
    };
  } catch (e) {
    return fromError(e, request.traceId);
  }
}

async function handleEmotionSpeak(
  args: SpeakArgs,
  backend: Backend,
  artifactMode: ArtifactMode,
  outputDir?: string,
): Promise<VoiceSpeakResponse | VoiceErrorResponse> {
  if (!backend.ready) {
    return errorResponse("BACKEND_UNAVAILABLE", `Backend '${backend.type}' is not ready`);
  }

  try {
    let firstVoiceUsed: string | undefined;
    const result = await runEmotionPlan({
      text: args.text,
      synthesize: async (text: string, _chunkIndex: number, ctx: EmotionSynthesisContext) => {
        if (!firstVoiceUsed) firstVoiceUsed = ctx.voiceId;
        const request = buildSynthesisRequest({
          text,
          voice: ctx.voiceId,
          speed: args.speed != null ? args.speed * ctx.speed : ctx.speed,
          artifactMode,
          outputDir,
        });
        const synthResult = await backend.synthesize(request);
        await validateSynthesisResult(synthResult);
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
      traceId: randomUUID(),
      voiceUsed: firstVoiceUsed ?? "emotion-mapped",
      speed: 1.0,
      artifactMode,
      audioPath: result.concatPath ?? firstChunk?.audioPath,
      audioBytesBase64: result.concatBase64 ?? firstChunk?.audioBytesBase64,
      durationMs: result.totalDurationMs,
      sampleRate: firstChunk?.sampleRate,
      format: firstChunk?.format ?? "wav",
    };
  } catch (e) {
    return fromError(e);
  }
}
