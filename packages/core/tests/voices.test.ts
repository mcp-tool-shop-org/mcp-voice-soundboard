import { describe, it, expect } from "vitest";
import {
  VOICES,
  DEFAULT_VOICE,
  APPROVED_VOICE_IDS,
  getVoice,
  isApprovedVoice,
  getVoicesByLanguage,
} from "../src/voices.js";

describe("voices", () => {
  it("has 46 approved voices across 9 languages", () => {
    expect(VOICES.size).toBe(46);
    expect(APPROVED_VOICE_IDS.size).toBe(46);
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

  it("getVoice returns undefined for non-existent voice", () => {
    expect(getVoice("nonexistent")).toBeUndefined();
    expect(getVoice("xx_fake")).toBeUndefined();
  });

  it("isApprovedVoice rejects non-roster voices", () => {
    expect(isApprovedVoice("xx_fake")).toBe(false);
    expect(isApprovedVoice("am_adam")).toBe(false);
    expect(isApprovedVoice("")).toBe(false);
  });

  it("all voice IDs follow naming convention", () => {
    for (const [id, info] of VOICES) {
      expect(id).toMatch(/^[a-z]{2}_[a-z]+$/);
      expect(info.id).toBe(id);
      expect(info.language).toBeTruthy();
    }
  });

  it("covers all 9 languages", () => {
    const languages = new Set([...VOICES.values()].map(v => v.language));
    expect(languages).toEqual(new Set([
      "en-us", "en-gb", "ja", "zh", "es", "fr", "hi", "it", "pt-br",
    ]));
  });

  it("getVoicesByLanguage returns correct voices", () => {
    const japanese = getVoicesByLanguage("ja");
    expect(japanese.length).toBe(5);
    expect(japanese.every(v => v.language === "ja")).toBe(true);

    const french = getVoicesByLanguage("fr");
    expect(french.length).toBe(1);
    expect(french[0].id).toBe("ff_siwis");
  });

  it("contains all original English voices", () => {
    const originalEnglish = [
      "af_aoede", "af_jessica", "af_sky",
      "am_eric", "am_fenrir", "am_liam", "am_onyx",
      "bf_alice", "bf_emma", "bf_isabella",
      "bm_george", "bm_lewis",
    ];
    for (const id of originalEnglish) {
      expect(isApprovedVoice(id)).toBe(true);
    }
  });
});
