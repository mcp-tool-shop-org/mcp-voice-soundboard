/**
 * Emotion-aware plan runner — synthesizes emotion spans with per-span voice/speed.
 *
 * Each emotion span is chunked independently and synthesized with the
 * span's mapped voice and speed. Results are collected sequentially
 * and optionally concatenated.
 */

import type { EmotionSpan, EmotionWarning } from "../emotion/types.js";
import { parseEmotionSpans } from "../emotion/parser.js";
import { chunkText } from "../chunking/chunker.js";
import type { ChunkingOptions } from "../chunking/types.js";
import type {
  ChunkArtifact,
  RunPlanOptions,
  SpeechResult,
  OrchestratorWarning,
} from "./types.js";
import { concatWavFiles, concatWavBase64 } from "./concat.js";

/** Context passed to the emotion-aware synthesize function. */
export interface EmotionSynthesisContext {
  readonly emotion: string;
  readonly voiceId: string;
  readonly speed: number;
  readonly spanIndex: number;
}

/** A synthesize function that receives emotion context. */
export type EmotionSynthesizeFn = (
  text: string,
  chunkIndex: number,
  context: EmotionSynthesisContext,
) => Promise<ChunkArtifact>;

export interface RunEmotionPlanInput {
  /** Raw text with emotion tags. */
  text: string;
  /** Function to synthesize a single text chunk with emotion context. */
  synthesize: EmotionSynthesizeFn;
  /** Orchestrator options. */
  options: RunPlanOptions;
  /** Chunking options (optional overrides). */
  chunkingOptions?: ChunkingOptions;
}

/**
 * Run emotion-tagged text through the synthesis pipeline.
 *
 * 1. Parse emotion spans from text
 * 2. For each span: chunk text → synthesize with span's voice/speed
 * 3. Collect all artifacts in order
 * 4. Optionally concatenate
 */
export async function runEmotionPlan(input: RunEmotionPlanInput): Promise<SpeechResult> {
  const { text, synthesize, options, chunkingOptions } = input;
  const warnings: (OrchestratorWarning | EmotionWarning)[] = [];

  // Parse emotion spans
  const parseResult = parseEmotionSpans(text);
  warnings.push(...parseResult.warnings);

  if (parseResult.spans.length === 0) {
    return {
      chunks: [],
      totalDurationMs: 0,
      chunkCount: 0,
      interrupted: false,
      warnings,
    };
  }

  // Synthesize each span
  const artifacts: ChunkArtifact[] = [];
  let interrupted = false;
  let globalChunkIndex = 0;

  for (let spanIdx = 0; spanIdx < parseResult.spans.length; spanIdx++) {
    if (options.signal?.aborted) {
      interrupted = true;
      warnings.push({
        code: "SYNTHESIS_INTERRUPTED",
        message: `Synthesis interrupted at span ${spanIdx} of ${parseResult.spans.length}`,
      });
      break;
    }

    const span = parseResult.spans[spanIdx];
    const context: EmotionSynthesisContext = {
      emotion: span.emotion,
      voiceId: span.voiceId,
      speed: span.speed,
      spanIndex: spanIdx,
    };

    // Chunk the span text
    const chunkResult = chunkText(span.text, chunkingOptions);
    warnings.push(...chunkResult.warnings);

    for (const chunk of chunkResult.chunks) {
      if (options.signal?.aborted) {
        interrupted = true;
        warnings.push({
          code: "SYNTHESIS_INTERRUPTED",
          message: `Synthesis interrupted at chunk ${globalChunkIndex}`,
        });
        break;
      }

      const artifact = await synthesize(chunk, globalChunkIndex, context);
      artifacts.push(artifact);
      globalChunkIndex++;
    }

    if (interrupted) break;
  }

  const totalDurationMs = artifacts.reduce((sum, a) => sum + a.durationMs, 0);

  // Concatenate if requested
  if (options.concat && artifacts.length > 1 && !interrupted) {
    try {
      if (options.artifactMode === "base64") {
        const { base64, durationMs } = await concatWavBase64(artifacts);
        return {
          chunks: artifacts,
          concatBase64: base64,
          totalDurationMs: durationMs,
          chunkCount: artifacts.length,
          interrupted,
          warnings,
        };
      } else if (options.outputDir) {
        const { path, durationMs } = await concatWavFiles(artifacts, options.outputDir);
        return {
          chunks: artifacts,
          concatPath: path,
          totalDurationMs: durationMs,
          chunkCount: artifacts.length,
          interrupted,
          warnings,
        };
      }
    } catch (err) {
      warnings.push({
        code: "CONCAT_FAILED",
        message: `WAV concatenation failed: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  return {
    chunks: artifacts,
    totalDurationMs,
    chunkCount: artifacts.length,
    interrupted,
    warnings,
  };
}
