/** Orchestrator types — multi-chunk synthesis pipeline. */

import type { SpeechPlan, SsmlWarning } from "../ssml/types.js";
import type { ChunkWarning } from "../chunking/types.js";
import type { ArtifactMode } from "../schemas.js";

/** A function that synthesizes a single text chunk. */
export type SynthesizeFn = (
  text: string,
  chunkIndex: number,
) => Promise<ChunkArtifact>;

/** Result from synthesizing a single chunk. */
export interface ChunkArtifact {
  readonly audioPath?: string;
  readonly audioBytesBase64?: string;
  readonly durationMs: number;
  readonly sampleRate: number;
  readonly format: string;
}

/** Options for running a speech plan. */
export interface RunPlanOptions {
  /** Artifact delivery mode. */
  readonly artifactMode: ArtifactMode;
  /** Whether to concatenate multi-chunk audio into a single file. */
  readonly concat?: boolean;
  /** Output directory for path-mode artifacts. */
  readonly outputDir?: string;
  /** Signal to abort remaining chunks. */
  readonly signal?: AbortSignal;
}

/** Full result of running a speech plan through the orchestrator. */
export interface SpeechResult {
  /** Individual chunk artifacts (omitted when concat=true). */
  readonly chunks: readonly ChunkArtifact[];
  /** Concatenated artifact (only present when concat=true and mode=path). */
  readonly concatPath?: string;
  /** Concatenated base64 (only present when concat=true and mode=base64). */
  readonly concatBase64?: string;
  /** Total duration across all chunks (ms). */
  readonly totalDurationMs: number;
  /** Number of chunks synthesized. */
  readonly chunkCount: number;
  /** Whether synthesis was interrupted. */
  readonly interrupted: boolean;
  /** All warnings from SSML parsing + chunking + synthesis. */
  readonly warnings: readonly (SsmlWarning | ChunkWarning | OrchestratorWarning)[];
}

export interface OrchestratorWarning {
  readonly code: string;
  readonly message: string;
}
