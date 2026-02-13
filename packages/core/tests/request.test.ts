import { describe, it, expect } from "vitest";
import { buildSynthesisRequest, errorResponse } from "../src/request.js";
import { VoiceValidationError } from "../src/validate.js";
import { LimitError } from "../src/limits.js";

describe("buildSynthesisRequest", () => {
  it("builds a valid request with defaults", () => {
    const req = buildSynthesisRequest({ text: "Hello world" });
    expect(req.traceId).toMatch(/^[0-9a-f-]{36}$/);
    expect(req.text).toBe("Hello world");
    expect(req.resolved.voice.id).toBe("bm_george");
    expect(req.resolved.speed).toBe(1.0);
    expect(req.artifact.mode).toBe("path");
    expect(req.artifact.format).toBe("wav");
  });

  it("resolves a preset", () => {
    const req = buildSynthesisRequest({ text: "Hello", voice: "narrator" });
    expect(req.resolved.voice.id).toBe("bm_george");
    expect(req.resolved.speed).toBe(0.95);
    expect(req.resolved.source).toBe("preset");
  });

  it("resolves a direct voice", () => {
    const req = buildSynthesisRequest({ text: "Hello", voice: "am_fenrir" });
    expect(req.resolved.voice.id).toBe("am_fenrir");
    expect(req.resolved.source).toBe("voice");
  });

  it("applies speed override", () => {
    const req = buildSynthesisRequest({ text: "Hello", speed: 1.5 });
    expect(req.resolved.speed).toBe(1.5);
  });

  it("applies artifact mode", () => {
    const req = buildSynthesisRequest({ text: "Hello", artifactMode: "base64" });
    expect(req.artifact.mode).toBe("base64");
  });

  it("applies output format", () => {
    const req = buildSynthesisRequest({ text: "Hello", format: "mp3" });
    expect(req.artifact.format).toBe("mp3");
  });

  it("throws VoiceValidationError for unknown voice", () => {
    expect(() => buildSynthesisRequest({ text: "Hello", voice: "fake" })).toThrow(VoiceValidationError);
  });

  it("throws LimitError for empty text", () => {
    expect(() => buildSynthesisRequest({ text: "" })).toThrow(LimitError);
  });

  it("throws LimitError for out-of-range speed", () => {
    expect(() => buildSynthesisRequest({ text: "Hello", speed: 5.0 })).toThrow(LimitError);
  });

  it("generates unique trace IDs", () => {
    const a = buildSynthesisRequest({ text: "A" });
    const b = buildSynthesisRequest({ text: "B" });
    expect(a.traceId).not.toBe(b.traceId);
  });
});

describe("errorResponse", () => {
  it("builds a stable error response", () => {
    const err = errorResponse("TEXT_EMPTY", "Text is empty");
    expect(err.error).toBe(true);
    expect(err.code).toBe("TEXT_EMPTY");
    expect(err.message).toBe("Text is empty");
    expect(err.traceId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("includes context when provided", () => {
    const err = errorResponse("TEXT_TOO_LONG", "Too long", undefined, { max: 10000 });
    expect(err.context).toEqual({ max: 10000 });
  });

  it("uses provided traceId", () => {
    const err = errorResponse("INTERNAL_ERROR", "Boom", "my-trace");
    expect(err.traceId).toBe("my-trace");
  });
});
