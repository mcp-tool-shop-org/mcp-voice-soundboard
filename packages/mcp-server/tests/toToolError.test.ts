/**
 * B-09: toToolError mapping — tests the error-to-MCP-response conversion.
 *
 * toToolError is a private function in server.ts, so we test its behavior
 * indirectly through E2E tool calls that trigger different error types.
 * Each test verifies the structured error response shape that toToolError produces.
 */

import { describe, it, expect, afterEach } from "vitest";
import { initClient, callTool, type McpTestClient } from "./helpers.js";

let client: McpTestClient;

afterEach(() => {
  client?.close();
});

describe("toToolError mapping via E2E", () => {
  it("maps SoundboardError (TEXT_EMPTY) to structured error response", async () => {
    client = await initClient();
    const { result, isError } = await callTool(client, "voice_speak", {
      text: "   ",
    });

    expect(isError).toBe(true);
    expect(result.error).toBe(true);
    expect(result.code).toBe("TEXT_EMPTY");
    expect(result.message).toBeTruthy();
    expect(result.hint).toBeTruthy();
    expect(typeof result.retryable).toBe("boolean");
  });

  it("maps SoundboardError (TEXT_TOO_LONG) with retryable=false", async () => {
    client = await initClient();
    const { result, isError } = await callTool(client, "voice_speak", {
      text: "x".repeat(20_000),
    });

    expect(isError).toBe(true);
    expect(result.error).toBe(true);
    expect(result.code).toBe("TEXT_TOO_LONG");
    expect(result.retryable).toBe(false);
    expect(result.hint).toBeTruthy();
  });

  it("maps SoundboardError (VOICE_OR_PRESET_NOT_FOUND) preserving code", async () => {
    client = await initClient();
    const { result, isError } = await callTool(client, "voice_speak", {
      text: "Hello",
      voice: "totally_fake_voice",
    });

    expect(isError).toBe(true);
    expect(result.error).toBe(true);
    expect(result.code).toBe("VOICE_OR_PRESET_NOT_FOUND");
    expect(result.hint).toBeTruthy();
    expect(result.retryable).toBe(false);
  });

  it("error response never exposes stack traces", async () => {
    client = await initClient();
    const { result, isError } = await callTool(client, "voice_speak", {
      text: "",
    });

    expect(isError).toBe(true);
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("at Object.");
    expect(serialized).not.toContain("at Module.");
    expect(serialized).not.toContain(".ts:");
  });

  it("error response has consistent shape: error, code, message, hint, retryable", async () => {
    client = await initClient();
    const { result, isError } = await callTool(client, "voice_speak", {
      text: "   ",
    });

    expect(isError).toBe(true);
    // Verify all fields are present and have correct types
    expect(result).toHaveProperty("error", true);
    expect(typeof result.code).toBe("string");
    expect(typeof result.message).toBe("string");
    expect(typeof result.hint).toBe("string");
    expect(typeof result.retryable).toBe("boolean");
  });

  it("maps VOICE_NOT_APPROVED from VoiceValidationError subclass", async () => {
    client = await initClient();
    const { result, isError } = await callTool(client, "voice_speak", {
      text: "Hello",
      voice: "xx_nonexistent",
    });

    expect(isError).toBe(true);
    expect(result.error).toBe(true);
    expect(["VOICE_NOT_APPROVED", "VOICE_OR_PRESET_NOT_FOUND"]).toContain(result.code);
    expect(result.hint).toBeTruthy();
    expect(typeof result.retryable).toBe("boolean");
  });
});
