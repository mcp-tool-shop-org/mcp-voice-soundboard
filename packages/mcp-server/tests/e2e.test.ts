/** E2E tests — spawn the server, call tools, assert contract. */

import { describe, it, expect, afterEach } from "vitest";
import { initClient, callTool, type McpTestClient } from "./helpers.js";

let client: McpTestClient;

afterEach(() => {
  client?.close();
});

describe("voice_status", () => {
  it("returns 12 voices, 5 presets, and bm_george default", async () => {
    client = await initClient();
    const { result } = await callTool(client, "voice_status");

    expect(result.voices).toHaveLength(12);
    expect(result.presets).toHaveLength(5);
    expect(result.defaultVoice).toBe("bm_george");
    expect(result.backend.type).toBe("mock");
    expect(result.backend.ready).toBe(true);
  });

  it("contains all approved voice IDs", async () => {
    client = await initClient();
    const { result } = await callTool(client, "voice_status");

    const ids = result.voices.map((v: any) => v.id).sort();
    expect(ids).toEqual([
      "af_aoede", "af_jessica", "af_sky",
      "am_eric", "am_fenrir", "am_liam", "am_onyx",
      "bf_alice", "bf_emma", "bf_isabella",
      "bm_george", "bm_lewis",
    ]);
  });

  it("contains expected preset names", async () => {
    client = await initClient();
    const { result } = await callTool(client, "voice_status");

    const names = result.presets.map((p: any) => p.name).sort();
    expect(names).toEqual(["announcer", "assistant", "narrator", "storyteller", "whisper"]);
  });
});

describe("voice_speak", () => {
  it("returns trace_id, voice_used, and path artifact", async () => {
    client = await initClient();
    const { result, isError } = await callTool(client, "voice_speak", {
      text: "Hello world",
    });

    expect(isError).toBe(false);
    expect(result.traceId).toMatch(/^[0-9a-f-]{36}$/);
    expect(result.voiceUsed).toBe("bm_george");
    expect(result.artifactMode).toBe("path");
    expect(result.audioPath).toMatch(/\.wav$/);
    expect(result.format).toBe("wav");
    expect(result.sampleRate).toBe(24000);
    expect(result.durationMs).toBeGreaterThan(0);
  });

  it("resolves a preset", async () => {
    client = await initClient();
    const { result } = await callTool(client, "voice_speak", {
      text: "Testing narrator",
      voice: "narrator",
    });

    expect(result.voiceUsed).toBe("bm_george");
    expect(result.presetUsed).toBe("narrator");
    expect(result.speed).toBe(0.95);
  });

  it("resolves a direct voice", async () => {
    client = await initClient();
    const { result } = await callTool(client, "voice_speak", {
      text: "Testing fenrir",
      voice: "am_fenrir",
    });

    expect(result.voiceUsed).toBe("am_fenrir");
    expect(result.speed).toBe(1);
  });

  it("supports base64 artifact mode", async () => {
    client = await initClient();
    const { result } = await callTool(client, "voice_speak", {
      text: "Base64 test",
      artifactMode: "base64",
    });

    expect(result.artifactMode).toBe("base64");
    expect(result.audioBytesBase64).toBeDefined();
    expect(result.audioPath).toBeUndefined();
  });
});

describe("voice_speak — error handling", () => {
  it("rejects empty text with TEXT_EMPTY", async () => {
    client = await initClient();
    const { result, isError } = await callTool(client, "voice_speak", {
      text: "   ",
    });

    expect(isError).toBe(true);
    expect(result.error).toBe(true);
    expect(result.code).toBe("TEXT_EMPTY");
  });

  it("rejects huge text with TEXT_TOO_LONG", async () => {
    client = await initClient();
    const { result, isError } = await callTool(client, "voice_speak", {
      text: "a".repeat(20_000),
    });

    expect(isError).toBe(true);
    expect(result.code).toBe("TEXT_TOO_LONG");
  });

  it("rejects unknown voice with VOICE_OR_PRESET_NOT_FOUND", async () => {
    client = await initClient();
    const { result, isError } = await callTool(client, "voice_speak", {
      text: "Hello",
      voice: "totally_fake_voice",
    });

    expect(isError).toBe(true);
    expect(result.code).toBe("VOICE_OR_PRESET_NOT_FOUND");
  });

  it("rejects non-approved voice with stable error", async () => {
    client = await initClient();
    const { result, isError } = await callTool(client, "voice_speak", {
      text: "Hello",
      voice: "af_bella",
    });

    expect(isError).toBe(true);
    // af_bella is a real Kokoro voice but not in approved roster
    expect(["VOICE_NOT_APPROVED", "VOICE_OR_PRESET_NOT_FOUND"]).toContain(result.code);
  });
});

describe("voice_interrupt", () => {
  it("returns structured interrupt response", async () => {
    client = await initClient();
    const { result } = await callTool(client, "voice_interrupt", {
      reason: "manual",
    });

    expect(result.interrupted).toBe(false);
    expect(result.reason).toBe("manual");
  });
});
