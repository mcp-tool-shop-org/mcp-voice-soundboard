/** Approved voice roster — single source of truth. */

export interface VoiceInfo {
  readonly id: string;
  readonly name: string;
  readonly gender: "male" | "female";
  readonly accent: string;
  readonly style: string;
  readonly language: string;
}

export const DEFAULT_VOICE = "bm_george" as const;

/**
 * Approved voice roster (48 voices, 9 languages).
 * All voices are Kokoro-compatible. Language is auto-inferred from the voice
 * ID prefix by the synthesis backend — no caller configuration required.
 *
 * Prefix → language mapping:
 *   af_ / am_  → en-us   bf_ / bm_  → en-gb
 *   jf_ / jm_  → ja      zf_ / zm_  → zh
 *   ef_ / em_  → es      ff_        → fr
 *   hf_ / hm_  → hi      if_ / im_  → it
 *   pf_ / pm_  → pt-br
 */
export const VOICES: ReadonlyMap<string, VoiceInfo> = new Map([
  // ── English: American Female ──
  ["af_aoede",      { id: "af_aoede",      name: "Aoede",      gender: "female", accent: "american",   style: "musical",       language: "en-us" }],
  ["af_bella",      { id: "af_bella",      name: "Bella",      gender: "female", accent: "american",   style: "warm",          language: "en-us" }],
  ["af_heart",      { id: "af_heart",      name: "Heart",      gender: "female", accent: "american",   style: "caring",        language: "en-us" }],
  ["af_jessica",    { id: "af_jessica",    name: "Jessica",    gender: "female", accent: "american",   style: "professional",  language: "en-us" }],
  ["af_kore",       { id: "af_kore",       name: "Kore",       gender: "female", accent: "american",   style: "youthful",      language: "en-us" }],
  ["af_nicole",     { id: "af_nicole",     name: "Nicole",     gender: "female", accent: "american",   style: "soft",          language: "en-us" }],
  ["af_sarah",      { id: "af_sarah",      name: "Sarah",      gender: "female", accent: "american",   style: "clear",         language: "en-us" }],
  ["af_sky",        { id: "af_sky",        name: "Sky",        gender: "female", accent: "american",   style: "airy",          language: "en-us" }],
  // ── English: American Male ──
  ["am_eric",       { id: "am_eric",       name: "Eric",       gender: "male",   accent: "american",   style: "confident",     language: "en-us" }],
  ["am_fenrir",     { id: "am_fenrir",     name: "Fenrir",     gender: "male",   accent: "american",   style: "powerful",      language: "en-us" }],
  ["am_liam",       { id: "am_liam",       name: "Liam",       gender: "male",   accent: "american",   style: "friendly",      language: "en-us" }],
  ["am_michael",    { id: "am_michael",    name: "Michael",    gender: "male",   accent: "american",   style: "deep",          language: "en-us" }],
  ["am_onyx",       { id: "am_onyx",       name: "Onyx",       gender: "male",   accent: "american",   style: "smooth",        language: "en-us" }],
  ["am_puck",       { id: "am_puck",       name: "Puck",       gender: "male",   accent: "american",   style: "playful",       language: "en-us" }],
  // ── English: British Female ──
  ["bf_alice",      { id: "bf_alice",      name: "Alice",      gender: "female", accent: "british",    style: "proper",        language: "en-gb" }],
  ["bf_emma",       { id: "bf_emma",       name: "Emma",       gender: "female", accent: "british",    style: "refined",       language: "en-gb" }],
  ["bf_isabella",   { id: "bf_isabella",   name: "Isabella",   gender: "female", accent: "british",    style: "warm",          language: "en-gb" }],
  // ── English: British Male ──
  ["bm_fable",      { id: "bm_fable",      name: "Fable",      gender: "male",   accent: "british",    style: "storytelling",  language: "en-gb" }],
  ["bm_george",     { id: "bm_george",     name: "George",     gender: "male",   accent: "british",    style: "authoritative", language: "en-gb" }],
  ["bm_lewis",      { id: "bm_lewis",      name: "Lewis",      gender: "male",   accent: "british",    style: "friendly",      language: "en-gb" }],
  // ── Japanese ──
  ["jf_alpha",      { id: "jf_alpha",      name: "Alpha",      gender: "female", accent: "japanese",   style: "clear",         language: "ja" }],
  ["jf_gongitsune", { id: "jf_gongitsune", name: "Gongitsune", gender: "female", accent: "japanese",   style: "storytelling",  language: "ja" }],
  ["jf_nezuko",     { id: "jf_nezuko",     name: "Nezuko",     gender: "female", accent: "japanese",   style: "gentle",        language: "ja" }],
  ["jf_tebukuro",   { id: "jf_tebukuro",   name: "Tebukuro",   gender: "female", accent: "japanese",   style: "warm",          language: "ja" }],
  ["jm_kumo",       { id: "jm_kumo",       name: "Kumo",       gender: "male",   accent: "japanese",   style: "calm",          language: "ja" }],
  // ── Mandarin Chinese ──
  ["zf_xiaobei",    { id: "zf_xiaobei",    name: "Xiaobei",    gender: "female", accent: "chinese",    style: "bright",        language: "zh" }],
  ["zf_xiaoni",     { id: "zf_xiaoni",     name: "Xiaoni",     gender: "female", accent: "chinese",    style: "gentle",        language: "zh" }],
  ["zf_xiaoxiao",   { id: "zf_xiaoxiao",   name: "Xiaoxiao",   gender: "female", accent: "chinese",    style: "clear",         language: "zh" }],
  ["zf_xiaoyi",     { id: "zf_xiaoyi",     name: "Xiaoyi",     gender: "female", accent: "chinese",    style: "warm",          language: "zh" }],
  ["zm_yunjian",    { id: "zm_yunjian",    name: "Yunjian",    gender: "male",   accent: "chinese",    style: "authoritative", language: "zh" }],
  ["zm_yunxi",      { id: "zm_yunxi",      name: "Yunxi",      gender: "male",   accent: "chinese",    style: "friendly",      language: "zh" }],
  ["zm_yunxia",     { id: "zm_yunxia",     name: "Yunxia",     gender: "male",   accent: "chinese",    style: "calm",          language: "zh" }],
  ["zm_yunyang",    { id: "zm_yunyang",    name: "Yunyang",    gender: "male",   accent: "chinese",    style: "confident",     language: "zh" }],
  // ── Spanish ──
  ["ef_dora",       { id: "ef_dora",       name: "Dora",       gender: "female", accent: "spanish",    style: "warm",          language: "es" }],
  ["em_alex",       { id: "em_alex",       name: "Alex",       gender: "male",   accent: "spanish",    style: "confident",     language: "es" }],
  ["em_santa",      { id: "em_santa",      name: "Santa",      gender: "male",   accent: "spanish",    style: "jolly",         language: "es" }],
  // ── French ──
  ["ff_siwis",      { id: "ff_siwis",      name: "Siwis",      gender: "female", accent: "french",     style: "refined",       language: "fr" }],
  // ── Hindi ──
  ["hf_alpha",      { id: "hf_alpha",      name: "Alpha",      gender: "female", accent: "hindi",      style: "clear",         language: "hi" }],
  ["hf_beta",       { id: "hf_beta",       name: "Beta",       gender: "female", accent: "hindi",      style: "warm",          language: "hi" }],
  ["hm_omega",      { id: "hm_omega",      name: "Omega",      gender: "male",   accent: "hindi",      style: "deep",          language: "hi" }],
  ["hm_psi",        { id: "hm_psi",        name: "Psi",        gender: "male",   accent: "hindi",      style: "calm",          language: "hi" }],
  // ── Italian ──
  ["if_sara",       { id: "if_sara",       name: "Sara",       gender: "female", accent: "italian",    style: "warm",          language: "it" }],
  ["im_nicola",     { id: "im_nicola",     name: "Nicola",     gender: "male",   accent: "italian",    style: "confident",     language: "it" }],
  // ── Brazilian Portuguese ──
  ["pf_dora",       { id: "pf_dora",       name: "Dora",       gender: "female", accent: "portuguese", style: "warm",          language: "pt-br" }],
  ["pm_alex",       { id: "pm_alex",       name: "Alex",       gender: "male",   accent: "portuguese", style: "confident",     language: "pt-br" }],
  ["pm_santa",      { id: "pm_santa",      name: "Santa",      gender: "male",   accent: "portuguese", style: "jolly",         language: "pt-br" }],
]);

/** All approved voice IDs as a set for O(1) lookup. */
export const APPROVED_VOICE_IDS: ReadonlySet<string> = new Set(VOICES.keys());

/** Get a voice by ID, or undefined if not in the approved roster. */
export function getVoice(id: string): VoiceInfo | undefined {
  return VOICES.get(id);
}

/** Check if a voice ID is in the approved roster. */
export function isApprovedVoice(id: string): boolean {
  return APPROVED_VOICE_IDS.has(id);
}

/** Get all voices for a given language code (e.g. "ja", "zh", "en-us"). */
export function getVoicesByLanguage(language: string): VoiceInfo[] {
  return [...VOICES.values()].filter(v => v.language === language);
}
