import { describe, it, expect } from "vitest";
import {
  VOICES,
  DEFAULT_VOICE,
  APPROVED_VOICE_IDS,
  getVoice,
  isApprovedVoice,
} from "../src/voices.js";

describe("voices", () => {
  it("has exactly 12 approved voices", () => {
    expect(VOICES.size).toBe(12);
    expect(APPROVED_VOICE_IDS.size).toBe(12);
  });

  it("default voice is bm_george", () => {
    expect(DEFAULT_VOICE).toBe("bm_george");
  });

  it("default voice is in the approved roster", () => {
    expect(isApprovedVoice(DEFAULT_VOICE)).toBe(true);
  });

  it("getVoice returns info for approved voice", () => {
    const voice = getVoice("am_fenrir");
    expect(voice).toBeDefined();
    expect(voice!.name).toBe("Fenrir");
    expect(voice!.gender).toBe("male");
    expect(voice!.accent).toBe("american");
  });

  it("getVoice returns undefined for non-approved voice", () => {
    expect(getVoice("af_bella")).toBeUndefined();
    expect(getVoice("nonexistent")).toBeUndefined();
  });

  it("isApprovedVoice rejects non-roster voices", () => {
    expect(isApprovedVoice("af_bella")).toBe(false);
    expect(isApprovedVoice("am_adam")).toBe(false);
    expect(isApprovedVoice("")).toBe(false);
  });

  it("all voice IDs follow naming convention", () => {
    for (const [id, info] of VOICES) {
      expect(id).toMatch(/^[ab][fm]_[a-z]+$/);
      expect(info.id).toBe(id);
      expect(info.language).toBe("en");
    }
  });

  it("contains the exact approved 12", () => {
    const expected = [
      "af_aoede", "af_jessica", "af_sky",
      "am_eric", "am_fenrir", "am_liam", "am_onyx",
      "bf_alice", "bf_emma", "bf_isabella",
      "bm_george", "bm_lewis",
    ];
    expect([...APPROVED_VOICE_IDS].sort()).toEqual(expected.sort());
  });
});
