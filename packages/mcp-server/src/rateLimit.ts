/** Per-tool rate limiter using sliding window. */

import { SoundboardError } from "@mcptoolshop/voice-soundboard-core";

export interface RateLimitConfig {
  /** Maximum calls allowed within the window. Default: 30. */
  readonly maxCalls: number;
  /** Window duration in milliseconds. Default: 60_000. */
  readonly windowMs: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxCalls: 30,
  windowMs: 60_000,
};

export class ToolRateLimiter {
  private readonly buckets = new Map<string, number[]>();
  private readonly config: RateLimitConfig;

  constructor(config?: Partial<RateLimitConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Check if a tool call is allowed. If allowed, records the call.
   * Returns true if allowed, false if rate-limited.
   */
  check(toolName: string, now: number = Date.now()): boolean {
    let timestamps = this.buckets.get(toolName);
    if (!timestamps) {
      timestamps = [];
      this.buckets.set(toolName, timestamps);
    }

    // Prune expired entries
    const cutoff = now - this.config.windowMs;
    while (timestamps.length > 0 && timestamps[0] <= cutoff) {
      timestamps.shift();
    }

    if (timestamps.length >= this.config.maxCalls) {
      return false;
    }

    timestamps.push(now);
    return true;
  }

  /** Reset all rate limit state. */
  clear(): void {
    this.buckets.clear();
  }
}

export class RateLimitError extends SoundboardError {
  constructor(toolName: string) {
    super("RATE_LIMITED", `Rate limit exceeded for tool: ${toolName}`, "Wait 60 seconds before retrying", { retryable: true });
    this.name = "RateLimitError";
  }
}
