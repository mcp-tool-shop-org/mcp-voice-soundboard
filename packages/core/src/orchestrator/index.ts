/** Orchestrator module — multi-chunk synthesis pipeline. */

export {
  type SynthesizeFn,
  type ChunkArtifact,
  type RunPlanOptions,
  type SpeechResult,
  type OrchestratorWarning,
} from "./types.js";

export {
  type RunPlanInput,
  runPlan,
} from "./runner.js";

export { concatWavFiles, concatWavBase64 } from "./concat.js";
