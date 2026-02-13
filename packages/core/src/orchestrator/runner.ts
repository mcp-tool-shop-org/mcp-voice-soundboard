/**
 * Plan runner — sequentially synthesizes chunks from a SpeechPlan.
 *
 * Supports:
 *   - Sequential chunk synthesis with abort support
 *   - Path and base64 artifact modes
 *   - Optional WAV concatenation
 */

import type { SpeechPlan } from "../ssml/types.js";
import { chunkText } from "../chunking/chunker.js";
import type { ChunkingOptions } from "../chunking/types.js";
import type {
  SynthesizeFn,
  RunPlanOptions,
  SpeechResult,
  ChunkArtifact,
  OrchestratorWarning,
} from "./types.js";
import { concatWavFiles, concatWavBase64 } from "./concat.js";

export interface RunPlanInput {
  /** The speech plan (from SSML parser or plain text). */
  plan: SpeechPlan;
  /** Function to synthesize a single text chunk. */
  synthesize: SynthesizeFn;
  /** Orchestrator options. */
  options: RunPlanOptions;
  /** Chunking options (optional overrides). */
  chunkingOptions?: ChunkingOptions;
}

/**
 * Run a speech plan through the synthesis pipeline.
 *
 * 1. Extract plain text from plan
 * 2. Chunk the text
 * 3. Synthesize each chunk sequentially
 * 4. Optionally concatenate results
 */
export async function runPlan(input: RunPlanInput): Promise<SpeechResult> {
  const { plan, synthesize, options, chunkingOptions } = input;
  const warnings: OrchestratorWarning[] = [
    ...plan.warnings,
  ];

  // Extract text to synthesize
  const text = plan.plainText;
  if (!text) {
    return {
      chunks: [],
      totalDurationMs: 0,
      chunkCount: 0,
      interrupted: false,
      warnings,
    };
  }

  // Chunk the text
  const chunkResult = chunkText(text, chunkingOptions);
  warnings.push(...chunkResult.warnings);

  if (chunkResult.chunks.length === 0) {
    return {
      chunks: [],
      totalDurationMs: 0,
      chunkCount: 0,
      interrupted: false,
      warnings,
    };
  }

  // Synthesize each chunk sequentially
  const artifacts: ChunkArtifact[] = [];
  let interrupted = false;

  for (let i = 0; i < chunkResult.chunks.length; i++) {
    // Check for abort
    if (options.signal?.aborted) {
      interrupted = true;
      warnings.push({
        code: "SYNTHESIS_INTERRUPTED",
        message: `Synthesis interrupted after ${i} of ${chunkResult.chunks.length} chunks`,
      });
      break;
    }

    const chunk = chunkResult.chunks[i];
    const artifact = await synthesize(chunk, i);
    artifacts.push(artifact);
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
