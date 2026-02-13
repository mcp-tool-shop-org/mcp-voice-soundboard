/** Golden API contract tests — ensure schema stability. */

import { describe, it, expect, afterEach } from "vitest";
import { initClient, callTool, type McpTestClient } from "./helpers.js";

let client: McpTestClient;

afterEach(() => {
  client?.close();
});

describe("golden: voice_status schema", () => {
  it("has exactly these top-level keys", async () => {
    client = await initClient();
    const { result } = await callTool(client, "voice_status");

    expect(Object.keys(result).sort()).toEqual(
      ["backend", "defaultVoice", "presets", "voices"],
    );
  });

  it("backend has type, ready, and details", async () => {
    client = await initClient();
    const { result } = await callTool(client, "voice_status");

    expect(result.backend).toHaveProperty("type");
    expect(result.backend).toHaveProperty("ready");
    expect(typeof result.backend.type).toBe("string");
    expect(typeof result.backend.ready).toBe("boolean");
  });

  it("voice objects have stable shape", async () => {
    client = await initClient();
    const { result } = await callTool(client, "voice_status");

    for (const voice of result.voices) {
      expect(voice).toHaveProperty("id");
      expect(voice).toHaveProperty("name");
      expect(voice).toHaveProperty("gender");
      expect(voice).toHaveProperty("accent");
      expect(voice).toHaveProperty("style");
      expect(voice).toHaveProperty("language");
      expect(typeof voice.id).toBe("string");
    }
  });

  it("preset objects have stable shape", async () => {
    client = await initClient();
    const { result } = await callTool(client, "voice_status");

    for (const preset of result.presets) {
      expect(preset).toHaveProperty("name");
      expect(preset).toHaveProperty("voice");
      expect(preset).toHaveProperty("speed");
      expect(preset).toHaveProperty("description");
      expect(typeof preset.name).toBe("string");
      expect(typeof preset.speed).toBe("number");
    }
  });
});

describe("golden: voice_speak schema (path mode)", () => {
  it("success response has stable keys", async () => {
    client = await initClient();
    const { result } = await callTool(client, "voice_speak", { text: "Golden" });

    expect(result).toHaveProperty("traceId");
    expect(result).toHaveProperty("voiceUsed");
    expect(result).toHaveProperty("speed");
    expect(result).toHaveProperty("artifactMode");
    expect(result).toHaveProperty("audioPath");
    expect(result).toHaveProperty("format");
    expect(result).toHaveProperty("durationMs");
    expect(result).toHaveProperty("sampleRate");
    expect(result.traceId).toMatch(/^[0-9a-f-]{36}$/);
    expect(result.artifactMode).toBe("path");
  });
});

describe("golden: voice_speak schema (base64 mode)", () => {
  it("success response has stable keys", async () => {
    client = await initClient({ args: ["--artifact=base64"] });
    const { result } = await callTool(client, "voice_speak", { text: "Golden b64" });

    expect(result).toHaveProperty("traceId");
    expect(result).toHaveProperty("voiceUsed");
    expect(result).toHaveProperty("artifactMode");
    expect(result).toHaveProperty("audioBytesBase64");
    expect(result.artifactMode).toBe("base64");
    expect(typeof result.audioBytesBase64).toBe("string");
    expect(result.audioPath).toBeUndefined();
  });
});

describe("golden: error schema", () => {
  it("error responses have stable keys", async () => {
    client = await initClient();
    const { result, isError } = await callTool(client, "voice_speak", {
      text: "",
    });

    expect(isError).toBe(true);
    expect(result).toHaveProperty("error", true);
    expect(result).toHaveProperty("code");
    expect(result).toHaveProperty("message");
    expect(result).toHaveProperty("traceId");
    expect(typeof result.code).toBe("string");
    expect(typeof result.message).toBe("string");
  });

  const errorCases = [
    { name: "TEXT_EMPTY", args: { text: "   " } },
    { name: "TEXT_TOO_LONG", args: { text: "x".repeat(20_000) } },
    { name: "VOICE_OR_PRESET_NOT_FOUND", args: { text: "Hi", voice: "nonexistent" } },
  ];

  for (const { name, args } of errorCases) {
    it(`stable error code: ${name}`, async () => {
      client = await initClient();
      const { result, isError } = await callTool(client, "voice_speak", args);

      expect(isError).toBe(true);
      expect(result.code).toBe(name);
    });
  }
});

describe("golden: voice_interrupt schema", () => {
  it("response has stable keys", async () => {
    client = await initClient();
    const { result } = await callTool(client, "voice_interrupt", { reason: "manual" });

    expect(result).toHaveProperty("interrupted");
    expect(result).toHaveProperty("reason");
    expect(typeof result.interrupted).toBe("boolean");
    expect(typeof result.reason).toBe("string");
  });
});
