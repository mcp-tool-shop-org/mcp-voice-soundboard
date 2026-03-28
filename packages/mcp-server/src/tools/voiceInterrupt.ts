/** voice.interrupt tool — stop/rollback active audio. */

import type { VoiceInterruptResponse } from "@mcptoolshop/voice-soundboard-core";
import type { Backend } from "../backend.js";
import { synthesisRegistry } from "../synthesisRegistry.js";

export interface InterruptArgs {
  streamId?: string;
  reason?: string;
}

export async function handleInterrupt(
  args: InterruptArgs,
  backend?: Backend,
): Promise<VoiceInterruptResponse> {
  const reason = args.reason ?? "manual";

  // If a specific streamId (traceId) is given, abort just that one
  if (args.streamId) {
    const aborted = synthesisRegistry.abort(args.streamId);
    // Also notify the backend to cancel any in-flight work
    if (aborted && backend?.interrupt) {
      await backend.interrupt().catch(() => {/* best-effort */});
    }
    return {
      interrupted: aborted,
      streamId: args.streamId,
      reason,
      message: aborted
        ? `Interrupted synthesis ${args.streamId}`
        : `No active synthesis found for ${args.streamId}`,
    };
  }

  // No streamId — abort all active synthesis
  const count = synthesisRegistry.abortAll();
  // Notify the backend to cancel any in-flight work
  if (count > 0 && backend?.interrupt) {
    await backend.interrupt().catch(() => {/* best-effort */});
  }
  return {
    interrupted: count > 0,
    reason,
    message: count > 0
      ? `Interrupted ${count} active synthesis operation(s)`
      : "No active synthesis to interrupt",
  };
}
