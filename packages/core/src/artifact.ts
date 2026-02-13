/** Artifact mode — how synthesized audio is delivered. */

import { tmpdir } from "node:os";
import { resolve, relative, isAbsolute } from "node:path";
import { mkdir, access, constants } from "node:fs/promises";
import type { ArtifactMode } from "./schemas.js";
import { isSymlink } from "./sandbox.js";

export { type ArtifactMode };

/** Default artifact mode: write to disk, return path. */
export const DEFAULT_ARTIFACT_MODE: ArtifactMode = "path";

/** Supported output audio formats. */
export type OutputFormat = "wav" | "mp3" | "ogg" | "raw";
export const DEFAULT_OUTPUT_FORMAT: OutputFormat = "wav";

export interface ArtifactConfig {
  /** How to deliver audio: "path" writes to disk, "base64" returns inline. */
  readonly mode: ArtifactMode;
  /** Output directory for "path" mode (resolved and validated). */
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

// ── Output dir sandboxing ──

export class OutputDirError extends Error {
  constructor(
    message: string,
    public readonly code: string = "OUTPUT_DIR_INVALID",
  ) {
    super(message);
    this.name = "OutputDirError";
  }
}

/** Default sandboxed output root: <tmpdir>/voice-soundboard/ */
export function defaultOutputRoot(): string {
  return resolve(tmpdir(), "voice-soundboard");
}

/**
 * Resolve and validate an output directory within the sandbox root.
 *
 * - If outputDir is undefined, returns `<root>/` (the sandbox root).
 * - If outputDir is provided, it must resolve inside the root (no traversal).
 * - Ensures the directory exists and is writable.
 */
export async function resolveOutputDir(
  outputDir: string | undefined,
  root: string,
): Promise<string> {
  const resolved = outputDir
    ? resolve(root, outputDir)
    : root;

  // Traversal check: resolved path must be inside root
  const rel = relative(root, resolved);
  if (rel.startsWith("..") || isAbsolute(rel)) {
    throw new OutputDirError(
      `Output directory "${outputDir}" escapes sandbox root "${root}"`,
    );
  }

  // Symlink check: reject if target is a symlink (prevents escape via symlink)
  if (await isSymlink(resolved)) {
    throw new OutputDirError(
      `Output directory "${resolved}" is a symlink — not allowed`,
    );
  }

  // Ensure it exists
  await mkdir(resolved, { recursive: true });

  // Ensure it's writable
  try {
    await access(resolved, constants.W_OK);
  } catch {
    throw new OutputDirError(
      `Output directory "${resolved}" is not writable`,
    );
  }

  return resolved;
}
