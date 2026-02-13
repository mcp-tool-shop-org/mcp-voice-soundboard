/** Ambient module — barrel exports. */

export {
  AMBIENT_CATEGORIES,
  type AmbientCategory,
  type AmbientEntry,
  type AmbientConfig,
  type AmbientWarning,
  type AmbientResult,
} from "./types.js";

export {
  type RedactResult,
  redactSensitive,
} from "./redact.js";

export { AmbientEmitter } from "./emitter.js";
