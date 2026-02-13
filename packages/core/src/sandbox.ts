/** Filesystem sandbox utilities — safe filenames and symlink checks. */

import { lstat } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import type { OutputFormat } from "./artifact.js";

/** File prefix used for all generated audio files. */
export const SAFE_FILE_PREFIX = "vsmcp_";

/**
 * Generate a safe, non-guessable filename with the vsmcp_ prefix.
 * Format: vsmcp_<uuid8>_<timestamp>.<format>
 */
export function generateSafeFilename(format: OutputFormat = "wav"): string {
  return `${SAFE_FILE_PREFIX}${randomUUID().slice(0, 8)}_${Date.now()}.${format}`;
}

/**
 * Check if a path is a symlink.
 * Returns true if the path exists and is a symlink, false otherwise.
 */
export async function isSymlink(path: string): Promise<boolean> {
  try {
    const stats = await lstat(path);
    return stats.isSymbolicLink();
  } catch {
    // Path doesn't exist — not a symlink
    return false;
  }
}
