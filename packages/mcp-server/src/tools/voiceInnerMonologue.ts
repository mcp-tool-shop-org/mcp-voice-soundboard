/** voice_inner_monologue tool — submit ephemeral inner-monologue entries. */

import {
  AmbientEmitter,
  type AmbientCategory,
  type AmbientResult,
} from "@mcptoolshop/voice-soundboard-core";

export interface InnerMonologueArgs {
  text: string;
  category?: string;
}

export function handleInnerMonologue(
  args: InnerMonologueArgs,
  emitter: AmbientEmitter,
): AmbientResult {
  const category = (args.category as AmbientCategory) ?? "general";
  return emitter.emitThought(args.text, category);
}
