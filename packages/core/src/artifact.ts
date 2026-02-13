/** Artifact mode — how synthesized audio is delivered. */

import type { ArtifactMode } from "./schemas.js";

export { type ArtifactMode };

/** Default artifact mode: write to disk, return path. */
export const DEFAULT_ARTIFACT_MODE: ArtifactMode = "path";

/** Supported output audio formats. */
export type OutputFormat = "wav" | "mp3" | "ogg" | "raw";
export const DEFAULT_OUTPUT_FORMAT: OutputFormat = "wav";

export interface ArtifactConfig {
  /** How to deliver audio: "path" writes to disk, "base64" returns inline. */
  readonly mode: ArtifactMode;
  /** Output directory for "path" mode. Defaults to OS temp dir. */
  readonly outputDir?: string;
  /** Audio format. Defaults to "wav". */
  readonly format: OutputFormat;
}

/** Build an artifact config with defaults applied. */
export function buildArtifactConfig(opts?: {
  mode?: ArtifactMode;
  outputDir?: string;
  format?: OutputFormat;
}): ArtifactConfig {
  return {
    mode: opts?.mode ?? DEFAULT_ARTIFACT_MODE,
    outputDir: opts?.outputDir,
    format: opts?.format ?? DEFAULT_OUTPUT_FORMAT,
  };
}
