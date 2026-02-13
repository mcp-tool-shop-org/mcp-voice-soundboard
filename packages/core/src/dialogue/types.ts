/** Dialogue types — multi-speaker script parsing and casting. */

export interface DialogueLine {
  readonly type: "line";
  readonly speaker: string;
  readonly text: string;
  readonly voiceId: string;
}

export interface DialoguePause {
  readonly type: "pause";
  readonly durationMs: number;
}

export type DialogueCue = DialogueLine | DialoguePause;

export interface CueSheet {
  /** Ordered cues (lines and pauses). */
  readonly cues: readonly DialogueCue[];
  /** Speaker → voice mapping used. */
  readonly cast: ReadonlyMap<string, string>;
  /** Unique speakers found in the script. */
  readonly speakers: readonly string[];
  /** Parse warnings. */
  readonly warnings: readonly DialogueWarning[];
}

export interface DialogueWarning {
  readonly code: string;
  readonly message: string;
}

/** Explicit speaker → voice/preset mapping. */
export type CastMap = Record<string, string>;
