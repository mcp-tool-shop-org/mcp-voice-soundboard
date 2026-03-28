import { describe, it, expect } from "vitest";
import { SoundboardError, wrapError } from "../src/errors.js";
import { fromError } from "../src/request.js";

// ── SoundboardError constructor ──

describe("SoundboardError", () => {
  it("sets code, message, hint, and retryable=false by default", () => {
    const err = new SoundboardError("TEST_CODE", "something broke", "try again");
    expect(err.code).toBe("TEST_CODE");
    expect(err.message).toBe("something broke");
    expect(err.hint).toBe("try again");
    expect(err.retryable).toBe(false);
    expect(err.cause).toBeUndefined();
    expect(err.name).toBe("SoundboardError");
    expect(err).toBeInstanceOf(Error);
  });

  it("sets retryable=true when provided", () => {
    const err = new SoundboardError("RETRY", "transient", "retry", { retryable: true });
    expect(err.retryable).toBe(true);
  });

  it("stores a cause error", () => {
    const cause = new Error("root cause");
    const err = new SoundboardError("WRAP", "wrapped", "hint", { cause });
    expect(err.cause).toBe(cause);
    expect(err.cause!.message).toBe("root cause");
  });
});

// ── toSafeText ──

describe("SoundboardError.toSafeText", () => {
  it("formats code + message + hint without stack", () => {
    const err = new SoundboardError("FAIL", "it failed", "check logs");
    const text = err.toSafeText();
    expect(text).toContain("Error [FAIL]: it failed");
    expect(text).toContain("Hint: check logs");
    expect(text).not.toContain("at "); // no stack trace lines
  });

  it("includes cause message when present", () => {
    const cause = new Error("disk full");
    const err = new SoundboardError("IO", "write failed", "free space", { cause });
    const text = err.toSafeText();
    expect(text).toContain("Cause: disk full");
  });

  it("omits cause line when no cause", () => {
    const err = new SoundboardError("CLEAN", "clean error", "no cause");
    const text = err.toSafeText();
    expect(text).not.toContain("Cause:");
  });
});

// ── toDebugText ──

describe("SoundboardError.toDebugText", () => {
  it("formats with code prefix and indented hint", () => {
    const err = new SoundboardError("DBG", "debug msg", "debug hint");
    const text = err.toDebugText();
    expect(text).toContain("[DBG] debug msg");
    expect(text).toContain("  Hint: debug hint");
  });

  it("includes cause message and stack when present", () => {
    const cause = new Error("underlying issue");
    const err = new SoundboardError("DEEP", "deep error", "dig deeper", { cause });
    const text = err.toDebugText();
    expect(text).toContain("  Cause: underlying issue");
    expect(text).toContain("  Stack:");
  });

  it("omits cause and stack lines when no cause", () => {
    const err = new SoundboardError("SOLO", "solo error", "standalone");
    const text = err.toDebugText();
    expect(text).not.toContain("Cause:");
    expect(text).not.toContain("Stack:");
  });
});

// ── wrapError ──

describe("wrapError", () => {
  it("passes through a SoundboardError unchanged", () => {
    const original = new SoundboardError("ORIG", "original", "orig hint");
    const result = wrapError(original, "WRAP_CODE", "wrap hint");
    expect(result).toBe(original);
    expect(result.code).toBe("ORIG");
  });

  it("wraps a plain Error with the given code and hint", () => {
    const plain = new Error("plain failure");
    const result = wrapError(plain, "WRAPPED", "do this instead");
    expect(result).toBeInstanceOf(SoundboardError);
    expect(result.code).toBe("WRAPPED");
    expect(result.message).toBe("plain failure");
    expect(result.hint).toBe("do this instead");
    expect(result.cause).toBe(plain);
  });

  it("wraps a string into a SoundboardError", () => {
    const result = wrapError("string error", "STR_CODE", "str hint");
    expect(result).toBeInstanceOf(SoundboardError);
    expect(result.code).toBe("STR_CODE");
    expect(result.message).toBe("string error");
    expect(result.cause).toBeInstanceOf(Error);
    expect(result.cause!.message).toBe("string error");
  });

  it("wraps a non-Error value (number) into a SoundboardError", () => {
    const result = wrapError(42, "NUM_CODE", "num hint");
    expect(result).toBeInstanceOf(SoundboardError);
    expect(result.message).toBe("42");
    expect(result.cause).toBeInstanceOf(Error);
  });

  it("wraps undefined into a SoundboardError", () => {
    const result = wrapError(undefined, "UNDEF", "undef hint");
    expect(result).toBeInstanceOf(SoundboardError);
    expect(result.message).toBe("undefined");
  });

  it("wraps null into a SoundboardError", () => {
    const result = wrapError(null, "NULL", "null hint");
    expect(result).toBeInstanceOf(SoundboardError);
    expect(result.message).toBe("null");
  });
});

// ── fromError ──

describe("fromError", () => {
  it("extracts fields from a SoundboardError", () => {
    const err = new SoundboardError("MY_CODE", "msg", "my hint", { retryable: true });
    const resp = fromError(err, "trace-123");
    expect(resp.error).toBe(true);
    expect(resp.code).toBe("MY_CODE");
    expect(resp.message).toBe("msg");
    expect(resp.hint).toBe("my hint");
    expect(resp.retryable).toBe(true);
    expect(resp.traceId).toBe("trace-123");
  });

  it("wraps a plain Error as INTERNAL_ERROR", () => {
    const err = new Error("plain boom");
    const resp = fromError(err);
    expect(resp.error).toBe(true);
    expect(resp.code).toBe("INTERNAL_ERROR");
    expect(resp.message).toBe("plain boom");
    expect(resp.retryable).toBe(false);
    expect(resp.traceId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("wraps a non-Error value as INTERNAL_ERROR", () => {
    const resp = fromError("string thrown");
    expect(resp.code).toBe("INTERNAL_ERROR");
    expect(resp.message).toBe("string thrown");
  });

  it("wraps a number as INTERNAL_ERROR", () => {
    const resp = fromError(404);
    expect(resp.code).toBe("INTERNAL_ERROR");
    expect(resp.message).toBe("404");
  });

  it("generates a traceId when none provided", () => {
    const resp = fromError(new Error("x"));
    expect(resp.traceId).toMatch(/^[0-9a-f-]{36}$/);
  });
});
