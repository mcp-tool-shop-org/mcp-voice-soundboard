/** voice.status tool — report engine health, roster, presets. */

import {
  VOICES,
  PRESETS,
  DEFAULT_VOICE,
  type VoiceStatusResponse,
} from "@mcptoolshop/voice-soundboard-core";
import type { Backend } from "../backend.js";
import type { SynthesisSemaphore } from "../concurrency.js";
import type { ToolRateLimiter } from "../rateLimit.js";

/** Compact status: just health + queue + rate-limit info. Saves context window for AI agents. */
export interface CompactStatusResponse {
  readonly backend: {
    readonly type: string;
    readonly ready: boolean;
    readonly details?: string;
  };
  readonly queue: {
    readonly active: number;
    readonly waiting: number;
    readonly maxConcurrent: number;
  };
  readonly rateLimitInfo: string;
}

export interface StatusContext {
  semaphore: SynthesisSemaphore;
  rateLimiter: ToolRateLimiter;
  maxConcurrent: number;
}

export async function buildStatusResponse(
  backend: Backend,
  options?: { compact?: boolean; context?: StatusContext },
): Promise<VoiceStatusResponse | CompactStatusResponse> {
  const health = await backend.health();

  if (options?.compact && options.context) {
    const { semaphore, rateLimiter, maxConcurrent } = options.context;
    return {
      backend: {
        type: backend.type,
        ready: health.ready,
        details: health.details,
      },
      queue: {
        active: semaphore.active,
        waiting: semaphore.waiting,
        maxConcurrent,
      },
      rateLimitInfo: rateLimiter.status(),
    };
  }

  return {
    voices: [...VOICES.values()],
    presets: [...PRESETS.values()],
    defaultVoice: DEFAULT_VOICE,
    backend: {
      type: backend.type,
      ready: health.ready,
      model: backend.model,
      sampleRate: backend.sampleRate,
      details: health.details,
    },
  };
}
