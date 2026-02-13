/** E2E tests for voice_dialogue MCP tool. */

import { describe, it, expect, afterEach } from "vitest";
import { initClient, callTool, type McpTestClient } from "./helpers.js";

let client: McpTestClient;

afterEach(() => {
  client?.close();
});

describe("voice_dialogue — basic", () => {
  it("synthesizes a two-speaker dialogue", async () => {
    client = await initClient();
    const { result, isError } = await callTool(client, "voice_dialogue", {
      script: "Alice: Hello there!\nBob: Hi Alice!",
    });

    expect(isError).toBe(false);
    expect(result.lineCount).toBe(2);
    expect(result.speakers).toEqual(["Alice", "Bob"]);
    expect(result.cast).toBeDefined();
    expect(result.cast.Alice).toBeDefined();
    expect(result.cast.Bob).toBeDefined();
    expect(result.artifacts).toHaveLength(2);
    expect(result.totalDurationMs).toBeGreaterThan(0);
  });

  it("each line has an audio artifact", async () => {
    client = await initClient();
    const { result } = await callTool(client, "voice_dialogue", {
      script: "Alice: Hello\nBob: Hey",
    });

    for (const artifact of result.artifacts) {
      expect(artifact.speaker).toBeDefined();
      expect(artifact.voiceId).toBeDefined();
      expect(artifact.audioPath).toMatch(/\.wav$/);
      expect(artifact.durationMs).toBeGreaterThan(0);
    }
  });
});

describe("voice_dialogue — explicit casting", () => {
  it("uses explicit voice IDs", async () => {
    client = await initClient();
    const { result } = await callTool(client, "voice_dialogue", {
      script: "Alice: Hello\nBob: Hey",
      cast: { Alice: "bf_alice", Bob: "bm_george" },
    });

    expect(result.cast.Alice).toBe("bf_alice");
    expect(result.cast.Bob).toBe("bm_george");
    expect(result.artifacts[0].voiceId).toBe("bf_alice");
    expect(result.artifacts[1].voiceId).toBe("bm_george");
  });

  it("resolves preset names in cast", async () => {
    client = await initClient();
    const { result } = await callTool(client, "voice_dialogue", {
      script: "Narrator: Once upon a time\nHelper: Can I help?",
      cast: { Narrator: "narrator", Helper: "assistant" },
    });

    // narrator preset → bm_george, assistant → af_jessica
    expect(result.cast.Narrator).toBe("bm_george");
    expect(result.cast.Helper).toBe("af_jessica");
  });
});

describe("voice_dialogue — pauses", () => {
  it("includes pause events in artifacts", async () => {
    client = await initClient();
    const { result } = await callTool(client, "voice_dialogue", {
      script: "Alice: Hello\n[pause 500ms]\nBob: Hey",
    });

    expect(result.artifacts).toHaveLength(3);
    expect(result.artifacts[1]).toEqual({ type: "pause", durationMs: 500 });
  });
});

describe("voice_dialogue — base64 mode", () => {
  it("returns base64 artifacts", async () => {
    client = await initClient({ args: ["--artifact=base64"] });
    const { result } = await callTool(client, "voice_dialogue", {
      script: "Alice: Hello\nBob: Hey",
    });

    for (const artifact of result.artifacts) {
      if (artifact.type !== "pause") {
        expect(artifact.audioBytesBase64).toBeDefined();
        expect(typeof artifact.audioBytesBase64).toBe("string");
        expect(artifact.audioPath).toBeUndefined();
      }
    }
  });
});

describe("voice_dialogue — debug mode", () => {
  it("includes cueSheet when debug=true", async () => {
    client = await initClient();
    const { result } = await callTool(client, "voice_dialogue", {
      script: "Alice: Hello\nBob: Hey",
      debug: true,
    });

    expect(result.cueSheet).toBeDefined();
    expect(result.cueSheet).toHaveLength(2);
    expect(result.cueSheet[0]).toMatchObject({
      type: "line",
      speaker: "Alice",
    });
  });
});

describe("voice_dialogue — error cases", () => {
  it("returns error for empty script", async () => {
    client = await initClient();
    const { result, isError } = await callTool(client, "voice_dialogue", {
      script: "",
    });

    expect(isError).toBe(true);
    expect(result.error).toBe(true);
    expect(result.code).toBe("DIALOGUE_PARSE_FAILED");
  });

  it("returns error for script with only comments", async () => {
    client = await initClient();
    const { result, isError } = await callTool(client, "voice_dialogue", {
      script: "# just a comment",
    });

    expect(isError).toBe(true);
    expect(result.code).toBe("DIALOGUE_PARSE_FAILED");
  });
});
