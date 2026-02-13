import { describe, it, expect } from "vitest";
import {
  parseDialogue,
  DialogueParseError,
  type CueSheet,
} from "../src/dialogue/index.js";
import { APPROVED_VOICE_IDS } from "../src/voices.js";

// ── Basic parsing ──

describe("parseDialogue — basic", () => {
  it("parses simple two-speaker dialogue", () => {
    const script = `Alice: Hello there!
Bob: Hi Alice, how are you?`;
    const sheet = parseDialogue(script);

    expect(sheet.speakers).toEqual(["Alice", "Bob"]);
    expect(sheet.cues).toHaveLength(2);
    expect(sheet.cues[0]).toMatchObject({
      type: "line",
      speaker: "Alice",
      text: "Hello there!",
    });
    expect(sheet.cues[1]).toMatchObject({
      type: "line",
      speaker: "Bob",
      text: "Hi Alice, how are you?",
    });
  });

  it("auto-casts speakers to approved voices", () => {
    const sheet = parseDialogue("Alice: Hi\nBob: Hey");
    for (const [, voiceId] of sheet.cast) {
      expect(APPROVED_VOICE_IDS.has(voiceId)).toBe(true);
    }
    // Different speakers should get different voices
    const voices = [...sheet.cast.values()];
    expect(voices[0]).not.toBe(voices[1]);
  });

  it("assigns different genders for contrast", () => {
    const sheet = parseDialogue("Alice: Hi\nBob: Hey");
    const voices = [...sheet.cast.values()];
    // First auto-cast is male (bm_george), second is female (af_jessica)
    expect(voices[0]).toBe("bm_george");
    expect(voices[1]).toBe("af_jessica");
  });
});

// ── Pause directives ──

describe("parseDialogue — pauses", () => {
  it("parses [pause Xms] directive", () => {
    const script = `Alice: Hello
[pause 500ms]
Bob: Hey there`;
    const sheet = parseDialogue(script);

    expect(sheet.cues).toHaveLength(3);
    expect(sheet.cues[1]).toEqual({ type: "pause", durationMs: 500 });
  });

  it("parses [pause X] without ms suffix", () => {
    const script = `Alice: Hi
[pause 350]
Bob: Hello`;
    const sheet = parseDialogue(script);
    expect(sheet.cues[1]).toEqual({ type: "pause", durationMs: 350 });
  });

  it("clamps pause duration to 5000ms", () => {
    const sheet = parseDialogue("Alice: Hi\n[pause 99999ms]\nBob: Hey");
    expect(sheet.cues[1]).toEqual({ type: "pause", durationMs: 5000 });
  });
});

// ── Comments and blank lines ──

describe("parseDialogue — comments and blanks", () => {
  it("skips comments", () => {
    const script = `# This is a comment
Alice: Hello
# Another comment
Bob: Hey`;
    const sheet = parseDialogue(script);
    expect(sheet.cues).toHaveLength(2);
  });

  it("skips blank lines", () => {
    const script = `Alice: Hello

Bob: Hey

`;
    const sheet = parseDialogue(script);
    expect(sheet.cues).toHaveLength(2);
  });
});

// ── Explicit casting ──

describe("parseDialogue — explicit casting", () => {
  it("uses explicit voice IDs", () => {
    const sheet = parseDialogue("Alice: Hi\nBob: Hey", {
      cast: { Alice: "bf_alice", Bob: "bm_george" },
    });
    expect(sheet.cast.get("Alice")).toBe("bf_alice");
    expect(sheet.cast.get("Bob")).toBe("bm_george");
  });

  it("resolves preset names in cast", () => {
    const sheet = parseDialogue("Narrator: Once upon a time\nAssistant: Hello", {
      cast: { Narrator: "narrator", Assistant: "assistant" },
    });
    // narrator preset → bm_george, assistant preset → af_jessica
    expect(sheet.cast.get("Narrator")).toBe("bm_george");
    expect(sheet.cast.get("Assistant")).toBe("af_jessica");
  });

  it("warns on invalid cast and auto-assigns", () => {
    const sheet = parseDialogue("Alice: Hi", {
      cast: { Alice: "nonexistent_voice" },
    });
    // Should have a warning
    expect(sheet.warnings.some((w) => w.code === "DIALOGUE_CAST_INVALID")).toBe(true);
    // Should still get a valid voice
    expect(APPROVED_VOICE_IDS.has(sheet.cast.get("Alice")!)).toBe(true);
  });
});

// ── Voice ID applied to cues ──

describe("parseDialogue — voice IDs in cues", () => {
  it("applies resolved voice IDs to line cues", () => {
    const sheet = parseDialogue("Alice: Hi\nBob: Hey", {
      cast: { Alice: "bf_alice", Bob: "am_eric" },
    });

    for (const cue of sheet.cues) {
      if (cue.type === "line") {
        expect(cue.voiceId).toBeTruthy();
        expect(APPROVED_VOICE_IDS.has(cue.voiceId)).toBe(true);
      }
    }
  });
});

// ── Error cases ──

describe("parseDialogue — errors", () => {
  it("throws on empty script", () => {
    expect(() => parseDialogue("")).toThrow(DialogueParseError);
  });

  it("throws on script with only comments", () => {
    expect(() => parseDialogue("# just a comment\n# another")).toThrow(DialogueParseError);
  });

  it("throws on too many speakers", () => {
    const lines = Array.from({ length: 12 }, (_, i) => `Speaker${i}: Line ${i}`).join("\n");
    expect(() => parseDialogue(lines, { maxSpeakers: 5 })).toThrow(DialogueParseError);
  });

  it("throws on too many cues", () => {
    const lines = Array.from({ length: 120 }, () => "Alice: Hello").join("\n");
    expect(() => parseDialogue(lines, { maxCues: 50 })).toThrow(DialogueParseError);
  });
});

// ── Unrecognized lines ──

describe("parseDialogue — unrecognized lines", () => {
  it("warns on unrecognized line format", () => {
    const script = `Alice: Hello
This is just floating text
Bob: Hey`;
    const sheet = parseDialogue(script);
    expect(sheet.warnings.some((w) => w.code === "DIALOGUE_UNRECOGNIZED_LINE")).toBe(true);
    expect(sheet.cues).toHaveLength(2); // Only the valid lines
  });
});

// ── Complex scripts ──

describe("parseDialogue — complex scripts", () => {
  it("handles a full dialogue with pauses and comments", () => {
    const script = `# A short play
Alice: Welcome to the show everyone!
[pause 500ms]
Bob: Thanks for having me, Alice.
Alice: So tell us about your new project.
[pause 250ms]
Bob: Well, it's been quite a journey.
# End of scene`;
    const sheet = parseDialogue(script, {
      cast: { Alice: "af_jessica", Bob: "bm_george" },
    });

    expect(sheet.speakers).toEqual(["Alice", "Bob"]);
    expect(sheet.cues).toHaveLength(6); // 4 lines + 2 pauses
    expect(sheet.cast.get("Alice")).toBe("af_jessica");
    expect(sheet.cast.get("Bob")).toBe("bm_george");
    expect(sheet.warnings).toHaveLength(0);
  });
});
