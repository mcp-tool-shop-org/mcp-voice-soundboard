import { describe, it, expect } from "vitest";
import { validateText, validateSpeed, LimitError, LIMITS } from "../src/limits.js";

describe("validateText", () => {
  it("returns trimmed text", () => {
    expect(validateText("  hello  ")).toBe("hello");
  });

  it("rejects empty string", () => {
    expect(() => validateText("")).toThrow(LimitError);
    try { validateText(""); } catch (e) {
      expect((e as LimitError).code).toBe("TEXT_EMPTY");
    }
  });

  it("rejects whitespace-only string", () => {
    expect(() => validateText("   ")).toThrow(LimitError);
  });

  it("rejects text exceeding max length", () => {
    const long = "a".repeat(LIMITS.maxTextLength + 1);
    expect(() => validateText(long)).toThrow(LimitError);
    try { validateText(long); } catch (e) {
      expect((e as LimitError).code).toBe("TEXT_TOO_LONG");
    }
  });

  it("accepts text at exactly max length", () => {
    const exact = "a".repeat(LIMITS.maxTextLength);
    expect(validateText(exact)).toBe(exact);
  });
});

describe("validateSpeed", () => {
  it("returns default speed for undefined", () => {
    expect(validateSpeed(undefined)).toBe(1.0);
  });

  it("passes through valid speed", () => {
    expect(validateSpeed(1.5)).toBe(1.5);
  });

  it("accepts boundary values", () => {
    expect(validateSpeed(0.5)).toBe(0.5);
    expect(validateSpeed(2.0)).toBe(2.0);
  });

  it("rejects speed below minimum", () => {
    expect(() => validateSpeed(0.3)).toThrow(LimitError);
    try { validateSpeed(0.3); } catch (e) {
      expect((e as LimitError).code).toBe("SPEED_OUT_OF_RANGE");
    }
  });

  it("rejects speed above maximum", () => {
    expect(() => validateSpeed(2.5)).toThrow(LimitError);
  });
});
