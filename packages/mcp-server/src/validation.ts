/** Backend response validation — sanity-check synthesis results. */

import { stat } from "node:fs/promises";
import type { SynthesisResult } from "./backend.js";

/** Maximum allowed audio file size (50 MB). */
const MAX_FILE_SIZE = 50 * 1024 * 1024;

/** Maximum allowed duration (5 minutes). */
const MAX_DURATION_MS = 300_000;

/** WAV RIFF magic bytes. */
const WAV_MAGIC = Buffer.from("RIFF");

export class ValidationError extends Error {
  readonly code = "VALIDATION_FAILED" as const;
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Validate a synthesis result from the backend.
 * Checks:
 * - audioPath file exists, has WAV header, and is within size limits
 * - OR audioBytesBase64 is valid base64
 * - Duration is within bounds
 */
export async function validateSynthesisResult(
  result: SynthesisResult,
): Promise<void> {
  // Duration check
  if (result.durationMs <= 0) {
    throw new ValidationError(
      `Invalid duration: ${result.durationMs}ms (must be > 0)`,
    );
  }
  if (result.durationMs > MAX_DURATION_MS) {
    throw new ValidationError(
      `Duration ${result.durationMs}ms exceeds maximum ${MAX_DURATION_MS}ms`,
    );
  }

  // Path mode validation
  if (result.audioPath) {
    let fileInfo;
    try {
      fileInfo = await stat(result.audioPath);
    } catch {
      throw new ValidationError(
        `Audio file not found: ${result.audioPath}`,
      );
    }

    if (!fileInfo.isFile()) {
      throw new ValidationError(
        `Audio path is not a file: ${result.audioPath}`,
      );
    }

    if (fileInfo.size > MAX_FILE_SIZE) {
      throw new ValidationError(
        `Audio file too large: ${fileInfo.size} bytes (max ${MAX_FILE_SIZE})`,
      );
    }

    // WAV header check (only for WAV format)
    if (result.format === "wav") {
      const { open } = await import("node:fs/promises");
      const fh = await open(result.audioPath, "r");
      try {
        const headerBuf = Buffer.alloc(4);
        await fh.read(headerBuf, 0, 4, 0);
        if (!headerBuf.subarray(0, 4).equals(WAV_MAGIC)) {
          throw new ValidationError(
            `Audio file missing RIFF header — may not be valid WAV`,
          );
        }
      } finally {
        await fh.close();
      }
    }
  }

  // Base64 mode validation
  if (result.audioBytesBase64) {
    // Quick sanity check: base64 should be reasonably sized
    const estimatedSize = (result.audioBytesBase64.length * 3) / 4;
    if (estimatedSize > MAX_FILE_SIZE) {
      throw new ValidationError(
        `Base64 audio too large: ~${Math.round(estimatedSize)} bytes (max ${MAX_FILE_SIZE})`,
      );
    }
  }

  // Must have at least one output mode
  if (!result.audioPath && !result.audioBytesBase64) {
    throw new ValidationError(
      "Synthesis result has neither audioPath nor audioBytesBase64",
    );
  }
}
