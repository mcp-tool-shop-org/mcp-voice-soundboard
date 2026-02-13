import { describe, it, expect, beforeEach } from "vitest";
import { SynthesisSemaphore, BusyError } from "../src/concurrency.js";
import { ToolRateLimiter, RateLimitError } from "../src/rateLimit.js";
import { withTimeout, TimeoutError } from "../src/timeout.js";

// ── SynthesisSemaphore ──

describe("SynthesisSemaphore", () => {
  let sem: SynthesisSemaphore;

  beforeEach(() => {
    sem = new SynthesisSemaphore(1);
  });

  it("allows one concurrent task", async () => {
    const result = await sem.run(async () => "ok");
    expect(result).toBe("ok");
    expect(sem.active).toBe(0);
  });

  it("queues a second caller while first is running", async () => {
    let resolve1!: () => void;
    const p1 = sem.run(
      () => new Promise<string>((r) => { resolve1 = () => r("first"); }),
    );

    // Second should queue
    const p2 = sem.run(async () => "second");
    expect(sem.active).toBe(1);
    expect(sem.waiting).toBe(1);

    // Release first
    resolve1();
    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toBe("first");
    expect(r2).toBe("second");
  });

  it("rejects a third caller with BusyError", async () => {
    let resolve1!: () => void;
    const p1 = sem.run(
      () => new Promise<void>((r) => { resolve1 = r; }),
    );

    // Second queues
    const p2 = sem.run(async () => "second");

    // Third should be rejected
    await expect(sem.run(async () => "third")).rejects.toThrow(BusyError);

    resolve1();
    await Promise.all([p1, p2]);
  });

  it("releases slot on error", async () => {
    await expect(
      sem.run(async () => { throw new Error("oops"); }),
    ).rejects.toThrow("oops");

    // Should be able to run again
    const result = await sem.run(async () => "recovered");
    expect(result).toBe("recovered");
  });

  it("reports active and waiting counts", async () => {
    expect(sem.active).toBe(0);
    expect(sem.waiting).toBe(0);

    let resolve1!: () => void;
    sem.run(() => new Promise<void>((r) => { resolve1 = r; }));

    // Give the microtask a tick
    await Promise.resolve();
    expect(sem.active).toBe(1);

    resolve1();
  });
});

// ── ToolRateLimiter ──

describe("ToolRateLimiter", () => {
  it("allows calls within limit", () => {
    const limiter = new ToolRateLimiter({ maxCalls: 3, windowMs: 1000 });
    expect(limiter.check("voice_speak", 1000)).toBe(true);
    expect(limiter.check("voice_speak", 1001)).toBe(true);
    expect(limiter.check("voice_speak", 1002)).toBe(true);
  });

  it("rejects calls exceeding limit", () => {
    const limiter = new ToolRateLimiter({ maxCalls: 2, windowMs: 1000 });
    expect(limiter.check("voice_speak", 1000)).toBe(true);
    expect(limiter.check("voice_speak", 1001)).toBe(true);
    expect(limiter.check("voice_speak", 1002)).toBe(false);
  });

  it("allows calls after window expires", () => {
    const limiter = new ToolRateLimiter({ maxCalls: 1, windowMs: 100 });
    expect(limiter.check("voice_speak", 1000)).toBe(true);
    expect(limiter.check("voice_speak", 1050)).toBe(false);
    // After window expires
    expect(limiter.check("voice_speak", 1101)).toBe(true);
  });

  it("tracks tools independently", () => {
    const limiter = new ToolRateLimiter({ maxCalls: 1, windowMs: 1000 });
    expect(limiter.check("voice_speak", 1000)).toBe(true);
    expect(limiter.check("voice_dialogue", 1000)).toBe(true);
    // voice_speak is still limited
    expect(limiter.check("voice_speak", 1001)).toBe(false);
  });

  it("clear resets all state", () => {
    const limiter = new ToolRateLimiter({ maxCalls: 1, windowMs: 10000 });
    expect(limiter.check("voice_speak", 1000)).toBe(true);
    expect(limiter.check("voice_speak", 1001)).toBe(false);
    limiter.clear();
    expect(limiter.check("voice_speak", 1002)).toBe(true);
  });
});

// ── withTimeout ──

describe("withTimeout", () => {
  it("resolves when function completes in time", async () => {
    const result = await withTimeout(async () => "done", 1000);
    expect(result).toBe("done");
  });

  it("rejects with TimeoutError when function exceeds timeout", async () => {
    await expect(
      withTimeout(
        () => new Promise((resolve) => setTimeout(resolve, 500)),
        10,
      ),
    ).rejects.toThrow(TimeoutError);
  });

  it("propagates function errors", async () => {
    await expect(
      withTimeout(async () => { throw new Error("boom"); }, 1000),
    ).rejects.toThrow("boom");
  });

  it("skips timeout when ms <= 0", async () => {
    const result = await withTimeout(async () => "no-timeout", 0);
    expect(result).toBe("no-timeout");
  });

  it("TimeoutError has correct code", async () => {
    try {
      await withTimeout(
        () => new Promise((resolve) => setTimeout(resolve, 500)),
        5,
      );
    } catch (e) {
      expect(e).toBeInstanceOf(TimeoutError);
      expect((e as TimeoutError).code).toBe("REQUEST_TIMEOUT");
    }
  });
});
