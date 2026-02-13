/** HTTP backend E2E tests — uses an in-process test server. */

import { describe, it, expect, afterEach, beforeAll, afterAll } from "vitest";
import { initClient, callTool, type McpTestClient } from "./helpers.js";
import { startTtsTestServer } from "./httpTestServer.js";

let testServer: { url: string; close: () => Promise<void> };
let client: McpTestClient;

beforeAll(async () => {
  testServer = await startTtsTestServer();
});

afterAll(async () => {
  await testServer.close();
});

afterEach(() => {
  client?.close();
});

describe("HTTP backend — voice_status", () => {
  it("reports backend type as http", async () => {
    client = await initClient({
      args: ["--backend=http"],
      env: { VOICE_SOUNDBOARD_TTS_URL: testServer.url },
    });
    const { result } = await callTool(client, "voice_status");

    expect(result.backend.type).toBe("http");
    expect(result.backend.ready).toBe(true);
    expect(result.voices).toHaveLength(12);
    expect(result.defaultVoice).toBe("bm_george");
  });
});

describe("HTTP backend — voice_speak", () => {
  it("synthesizes via HTTP and returns path artifact", async () => {
    client = await initClient({
      args: ["--backend=http"],
      env: { VOICE_SOUNDBOARD_TTS_URL: testServer.url },
    });
    const { result, isError } = await callTool(client, "voice_speak", {
      text: "HTTP backend test",
    });

    expect(isError).toBe(false);
    expect(result.traceId).toMatch(/^[0-9a-f-]{36}$/);
    expect(result.voiceUsed).toBe("bm_george");
    expect(result.artifactMode).toBe("path");
    expect(result.audioPath).toMatch(/\.wav$/);
    expect(result.audioPath).toContain("voice-soundboard");
  });

  it("synthesizes via HTTP and returns base64 artifact", async () => {
    client = await initClient({
      args: ["--backend=http", "--artifact=base64"],
      env: { VOICE_SOUNDBOARD_TTS_URL: testServer.url },
    });
    const { result, isError } = await callTool(client, "voice_speak", {
      text: "Base64 HTTP test",
    });

    expect(isError).toBe(false);
    expect(result.artifactMode).toBe("base64");
    expect(result.audioBytesBase64).toBeDefined();
    expect(typeof result.audioBytesBase64).toBe("string");
    expect(result.audioPath).toBeUndefined();
  });
});

describe("HTTP backend — error cases", () => {
  it("returns BACKEND_UNREACHABLE for bad URL", async () => {
    client = await initClient({
      args: ["--backend=http"],
      env: { VOICE_SOUNDBOARD_TTS_URL: "http://127.0.0.1:1" },
    });
    const { result, isError } = await callTool(client, "voice_speak", {
      text: "Should fail",
    });

    expect(isError).toBe(true);
    expect(["BACKEND_UNREACHABLE", "BACKEND_UNAVAILABLE"]).toContain(result.code);
  });

  it("returns BACKEND_BAD_RESPONSE for garbage JSON", async () => {
    const garbage = await startTtsTestServer({ returnGarbage: true });
    try {
      client = await initClient({
        args: ["--backend=http"],
        env: { VOICE_SOUNDBOARD_TTS_URL: garbage.url },
      });
      const { result, isError } = await callTool(client, "voice_speak", {
        text: "Should fail",
      });

      expect(isError).toBe(true);
      expect(result.code).toBe("BACKEND_BAD_RESPONSE");
    } finally {
      await garbage.close();
    }
  });
});
