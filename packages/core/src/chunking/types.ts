/** Chunking types — split text into manageable synthesis chunks. */

export interface ChunkingOptions {
  /** Maximum characters per chunk (default 600). */
  readonly maxChunkChars?: number;
  /** Minimum characters for a chunk to stand on its own (default 20). */
  readonly minChunkChars?: number;
  /** Maximum total characters across all chunks (default 10000). */
  readonly maxTotalChars?: number;
  /** Maximum number of chunks allowed (default 50). */
  readonly maxChunks?: number;
}

export interface ChunkResult {
  /** The ordered text chunks. */
  readonly chunks: readonly string[];
  /** Whether the original text was chunked. */
  readonly wasChunked: boolean;
  /** Whether the text was truncated due to limits. */
  readonly wasTruncated: boolean;
  /** Non-fatal warnings. */
  readonly warnings: readonly ChunkWarning[];
}

export interface ChunkWarning {
  readonly code: string;
  readonly message: string;
}
