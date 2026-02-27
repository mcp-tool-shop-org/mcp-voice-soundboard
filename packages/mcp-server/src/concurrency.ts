/** Synthesis concurrency semaphore — limits parallel synthesis requests. */

import { SoundboardError } from "@mcptoolshop/voice-soundboard-core";

export class SynthesisSemaphore {
  private running = 0;
  private queue: Array<() => void> = [];

  constructor(private readonly maxConcurrent: number = 1) {}

  /** Current number of running tasks. */
  get active(): number {
    return this.running;
  }

  /** Current number of queued waiters. */
  get waiting(): number {
    return this.queue.length;
  }

  /**
   * Run a function with concurrency control.
   * Rejects immediately with BUSY if the queue already has a waiter.
   */
  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.running >= this.maxConcurrent) {
      // Allow exactly 1 waiter in queue; reject additional callers
      if (this.queue.length >= 1) {
        throw new BusyError();
      }
      await new Promise<void>((resolve) => {
        this.queue.push(resolve);
      });
    }

    this.running++;
    try {
      return await fn();
    } finally {
      this.running--;
      const next = this.queue.shift();
      if (next) next();
    }
  }
}

export class BusyError extends SoundboardError {
  constructor() {
    super("BUSY", "Server is busy — concurrent synthesis limit reached", "Wait a moment and retry", { retryable: true });
    this.name = "BusyError";
  }
}
