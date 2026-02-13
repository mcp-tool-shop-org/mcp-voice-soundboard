/** Request timeout utility. */

export class TimeoutError extends Error {
  readonly code = "REQUEST_TIMEOUT" as const;
  constructor(ms: number) {
    super(`Request timed out after ${ms}ms`);
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
