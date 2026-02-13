/** voice.interrupt tool — stop/rollback active audio. */

import type { VoiceInterruptResponse } from "@mcp-tool-shop/voice-soundboard-core";

export interface InterruptArgs {
  streamId?: string;
  reason?: string;
}

export async function handleInterrupt(
  args: InterruptArgs,
): Promise<VoiceInterruptResponse> {
  // Mock implementation — no active streams to interrupt
  return {
    interrupted: false,
    streamId: args.streamId,
    reason: args.reason ?? "manual",
  };
}
