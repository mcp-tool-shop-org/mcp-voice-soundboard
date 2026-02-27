/** Request timeout utility. */

import { SoundboardError } from "@mcptoolshop/voice-soundboard-core";

export class TimeoutError extends SoundboardError {
  constructor(ms: number) {
    super("REQUEST_TIMEOUT", `Request timed out after ${ms}ms`, "Try shorter text or check backend health", { retryable: true });
    this.name = "TimeoutError";
  }
}

/**
 * Wrap an async function with a timeout.
 * Rejects with TimeoutError if the function doesn't complete within `ms` milliseconds.
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  ms: number,
): Promise<T> {
  if (ms <= 0) return fn();

  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new TimeoutError(ms));
    }, ms);

    fn().then(
      (result) => {
        clearTimeout(timer);
        resolve(result);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
