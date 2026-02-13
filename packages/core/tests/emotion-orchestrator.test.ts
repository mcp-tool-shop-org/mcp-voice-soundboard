import { describe, it, expect } from "vitest";
import {
  runEmotionPlan,
  type EmotionSynthesisContext,
  type ChunkArtifact,
} from "../src/orchestrator/index.js";
import { EMOTION_MAP } from "../src/emotion/index.js";

/** Mock synthesize fn that tracks calls and returns a dummy artifact. */
function mockSynthesize() {
  const calls: { text: string; chunkIndex: number; context: EmotionSynthesisContext }[] = [];

  const fn = async (
    text: string,
    chunkIndex: number,
    context: EmotionSynthesisContext,
  ): Promise<ChunkArtifact> => {
    calls.push({ text, chunkIndex, context });
    return {
      audioPath: `/tmp/chunk-${chunkIndex}.wav`,
      durationMs: 100,
      sampleRate: 24000,
      format: "wav",
    };
  };

  return { fn, calls };
}

// ── Basic emotion plan execution ──

describe("runEmotionPlan — basic", () => {
  it("synthesizes a single neutral span", async () => {
    const { fn, calls } = mockSynthesize();
    const result = await runEmotionPlan({
      text: "Hello world",
      synthesize: fn,
      options: { artifactMode: "path" },
    });

    expect(result.chunkCount).toBe(1);
    expect(result.totalDurationMs).toBe(100);
    expect(result.interrupted).toBe(false);
    expect(calls).toHaveLength(1);
    expect(calls[0].context.emotion).toBe("neutral");
    expect(calls[0].context.voiceId).toBe("bm_george");
  });

  it("synthesizes multiple emotion spans in order", async () => {
    const { fn, calls } = mockSynthesize();
    const result = await runEmotionPlan({
      text: "{joy}Happy day!{/joy} {calm}Take it easy.{/calm}",
      synthesize: fn,
      options: { artifactMode: "path" },
    });

    expect(result.chunkCount).toBe(2);
    expect(calls).toHaveLength(2);
    expect(calls[0].context.emotion).toBe("joy");
    expect(calls[0].context.voiceId).toBe(EMOTION_MAP.joy.voiceId);
    expect(calls[1].context.emotion).toBe("calm");
    expect(calls[1].context.voiceId).toBe(EMOTION_MAP.calm.voiceId);
  });

  it("handles mixed tagged and untagged text", async () => {
    const { fn, calls } = mockSynthesize();
    await runEmotionPlan({
      text: "Start. {urgent}Breaking news!{/urgent} End.",
      synthesize: fn,
      options: { artifactMode: "path" },
    });

    expect(calls).toHaveLength(3);
    expect(calls[0].context.emotion).toBe("neutral");
    expect(calls[1].context.emotion).toBe("urgent");
    expect(calls[2].context.emotion).toBe("neutral");
  });
});

// ── Voice/speed mapping ──

describe("runEmotionPlan — voice/speed", () => {
  it("passes correct voice and speed per emotion", async () => {
    const { fn, calls } = mockSynthesize();
    await runEmotionPlan({
      text: "{whisper}Quiet{/whisper} {urgent}Loud{/urgent}",
      synthesize: fn,
      options: { artifactMode: "path" },
    });

    expect(calls[0].context.voiceId).toBe("am_onyx");
    expect(calls[0].context.speed).toBe(0.92);
    expect(calls[1].context.voiceId).toBe("am_fenrir");
    expect(calls[1].context.speed).toBe(1.08);
  });
});

// ── Abort support ──

describe("runEmotionPlan — abort", () => {
  it("interrupts on abort signal", async () => {
    const controller = new AbortController();
    const { fn } = mockSynthesize();

    // Abort before starting
    controller.abort();

    const result = await runEmotionPlan({
      text: "{joy}Happy{/joy} {calm}Calm{/calm}",
      synthesize: fn,
      options: { artifactMode: "path", signal: controller.signal },
    });

    expect(result.interrupted).toBe(true);
    expect(result.chunkCount).toBe(0);
  });
});

// ── Warnings ──

describe("runEmotionPlan — warnings", () => {
  it("propagates EMOTION_UNSUPPORTED warnings", async () => {
    const { fn } = mockSynthesize();
    const result = await runEmotionPlan({
      text: "{excited}Wow!{/excited}",
      synthesize: fn,
      options: { artifactMode: "path" },
    });

    expect(result.warnings.some((w) => w.code === "EMOTION_UNSUPPORTED")).toBe(true);
  });
});

// ── Empty text ──

describe("runEmotionPlan — edge cases", () => {
  it("returns empty result for empty text", async () => {
    const { fn } = mockSynthesize();
    const result = await runEmotionPlan({
      text: "",
      synthesize: fn,
      options: { artifactMode: "path" },
    });

    expect(result.chunkCount).toBe(0);
    expect(result.totalDurationMs).toBe(0);
  });

  it("increments chunkIndex across spans", async () => {
    const { fn, calls } = mockSynthesize();
    await runEmotionPlan({
      text: "{joy}A{/joy} {calm}B{/calm} {urgent}C{/urgent}",
      synthesize: fn,
      options: { artifactMode: "path" },
    });

    expect(calls.map((c) => c.chunkIndex)).toEqual([0, 1, 2]);
  });
});
