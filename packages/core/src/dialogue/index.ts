/** Dialogue module — multi-speaker script parsing and casting. */

export {
  type DialogueLine,
  type DialoguePause,
  type DialogueCue,
  type CueSheet,
  type DialogueWarning,
  type CastMap,
} from "./types.js";

export {
  parseDialogue,
  DialogueParseError,
  type ParseDialogueOptions,
} from "./parser.js";
