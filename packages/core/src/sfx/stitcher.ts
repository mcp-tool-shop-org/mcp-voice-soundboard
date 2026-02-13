/**
 * SFX stitcher — interleave SFX WAV data with speech chunks.
 *
 * Takes parsed SFX segments (text + sfx events) and produces ChunkArtifact[]
 * with SFX WAV data inserted at the correct positions.
 */

import type { SfxSegment } from "./types.js";
import type { ChunkArtifact } from "../orchestrator/types.js";
import { generateSfxWav, getSfxDurationMs } from "./generator.js";

export interface SfxStitchWarning {
  readonly code: string;
  readonly message: string;
}

export interface SfxStitchResult {
  readonly chunks: readonly ChunkArtifact[];
  readonly warnings: readonly SfxStitchWarning[];
}

/**
 * Create ChunkArtifact entries for SFX events in a segment list.
 *
 * Text segments are skipped (they are handled by the synthesis pipeline).
 * SFX segments get inline WAV data as base64 or written to disk.
 */
export function createSfxChunks(
  segments: readonly SfxSegment[],
  mode: "path" | "base64" = "base64",
): ChunkArtifact[] {
  const chunks: ChunkArtifact[] = [];

  for (const seg of segments) {
    if (seg.type !== "sfx") continue;

    const wav = generateSfxWav(seg.tag);
    const durationMs = getSfxDurationMs(seg.tag);

    chunks.push({
      audioBytesBase64: wav.toString("base64"),
      durationMs,
      sampleRate: 24000,
      format: "wav",
    });
  }

  return chunks;
}

/**
 * Check if SFX segments are present and concat is disabled.
 * Returns a warning if so.
 */
export function checkSfxConcatRequired(
  segments: readonly SfxSegment[],
  concat: boolean,
): SfxStitchWarning | null {
  const hasSfx = segments.some((s) => s.type === "sfx");
  if (hasSfx && !concat) {
    return {
      code: "SFX_REQUIRES_CONCAT",
      message: "SFX tags are present but concat is disabled; SFX audio will be separate chunks",
    };
  }
  return null;
}
