/** Chunking module — split long text for sequential synthesis. */

export {
  type ChunkingOptions,
  type ChunkResult,
  type ChunkWarning,
} from "./types.js";

export { CHUNK_LIMITS } from "./limits.js";

export { chunkText } from "./chunker.js";
