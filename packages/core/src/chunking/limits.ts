/** Chunking limits. */

export const CHUNK_LIMITS = {
  /** Maximum characters per chunk. */
  maxChunkChars: 600,
  /** Minimum characters for a chunk to stand alone (merged with neighbor if smaller). */
  minChunkChars: 20,
  /** Maximum total characters across all chunks. */
  maxTotalChars: 12_000,
  /** Maximum number of chunks. */
  maxChunks: 50,
} as const;
