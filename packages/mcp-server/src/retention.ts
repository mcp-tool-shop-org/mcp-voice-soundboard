/** Retention cleanup — deletes stale vsmcp_* files from the output root. */

import { readdir, stat, unlink } from "node:fs/promises";
import { join } from "node:path";
import { SAFE_FILE_PREFIX } from "@mcp-tool-shop/voice-soundboard-core";

/** Default retention period in minutes. */
export const DEFAULT_RETENTION_MINUTES = 240;

/** Cleanup interval in milliseconds (runs every 60 seconds). */
const CLEANUP_INTERVAL_MS = 60_000;

/**
 * Scan the output root for stale vsmcp_* files and delete them.
 * Only deletes files with the vsmcp_ prefix (safety net).
 * Returns the number of files deleted.
 */
export async function cleanupOutputRoot(
  root: string,
  maxAgeMinutes: number = DEFAULT_RETENTION_MINUTES,
): Promise<number> {
  let deleted = 0;
  const cutoffMs = Date.now() - maxAgeMinutes * 60_000;

  let entries: string[];
  try {
    entries = await readdir(root);
  } catch {
    // Directory doesn't exist yet — nothing to clean
    return 0;
  }

  for (const entry of entries) {
    // Only touch files with our prefix
    if (!entry.startsWith(SAFE_FILE_PREFIX)) continue;

    const filePath = join(root, entry);
    try {
      const info = await stat(filePath);
      if (!info.isFile()) continue;
      if (info.mtimeMs < cutoffMs) {
        await unlink(filePath);
        deleted++;
      }
    } catch {
      // File may have been removed concurrently — ignore
    }
  }

  return deleted;
}

/**
 * Start a periodic retention cleanup timer.
 * Returns a handle that can be used to stop the timer.
 */
export function startRetentionTimer(
  root: string,
  maxAgeMinutes: number = DEFAULT_RETENTION_MINUTES,
): RetentionHandle {
  const timer = setInterval(() => {
    cleanupOutputRoot(root, maxAgeMinutes).catch(() => {
      // Swallow errors — cleanup is best-effort
    });
  }, CLEANUP_INTERVAL_MS);

  // Allow the process to exit even if the timer is running
  timer.unref();

  return {
    stop() {
      clearInterval(timer);
    },
  };
}

export interface RetentionHandle {
  stop(): void;
}
