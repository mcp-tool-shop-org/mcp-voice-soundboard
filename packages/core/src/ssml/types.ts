/** SSML-lite types — backend-agnostic speech plan representation. */

// ── Speech plan events ──

export interface BreakEvent {
  readonly type: "break";
  /** Duration in milliseconds. */
  readonly timeMs: number;
}

export interface ProsodyEvent {
  readonly type: "prosody";
  /** Speed multiplier (e.g. 0.8 for slow, 1.2 for fast). */
  readonly rate: number;
}

export interface ProsodyEndEvent {
  readonly type: "prosody_end";
}

export interface EmphasisEvent {
  readonly type: "emphasis";
  readonly level: "strong" | "moderate" | "reduced" | "none";
}

export interface EmphasisEndEvent {
  readonly type: "emphasis_end";
}

export type SpeechEvent =
  | BreakEvent
  | ProsodyEvent
  | ProsodyEndEvent
  | EmphasisEvent
  | EmphasisEndEvent;

// ── Speech plan segments ──

export interface TextSegment {
  readonly type: "text";
  readonly value: string;
}

export interface EventSegment {
  readonly type: "event";
  readonly event: SpeechEvent;
}

export type PlanSegment = TextSegment | EventSegment;

// ── Speech plan ──

export interface SsmlWarning {
  readonly code: string;
  readonly message: string;
}

export interface SpeechPlan {
  /** Ordered segments: text and events interleaved. */
  readonly segments: readonly PlanSegment[];
  /** Plain text with SSML stripped (for backends that don't support events). */
  readonly plainText: string;
  /** Whether the input was SSML (even if fallback occurred). */
  readonly wasSSML: boolean;
  /** Non-fatal warnings (e.g. SSML_PARSE_FAILED for fallback). */
  readonly warnings: readonly SsmlWarning[];
}
