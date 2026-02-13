/** SFX types — sound effect tag parsing and generation. */

export const SFX_TAGS = [
  "ding",
  "chime",
  "whoosh",
  "click",
  "pop",
  "tada",
] as const;

export type SfxTag = (typeof SFX_TAGS)[number];

export interface SfxEvent {
  readonly type: "sfx";
  readonly tag: SfxTag;
}

export interface SfxTextSegment {
  readonly type: "text";
  readonly value: string;
}

export type SfxSegment = SfxEvent | SfxTextSegment;

export interface SfxWarning {
  readonly code: string;
  readonly message: string;
}

export interface SfxParseResult {
  readonly segments: readonly SfxSegment[];
  readonly warnings: readonly SfxWarning[];
  readonly sfxCount: number;
}
