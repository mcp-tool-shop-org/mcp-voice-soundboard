<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/mcp-voice-soundboard/main/assets/logo-dark.jpg" alt="MCP Voice Soundboard" width="420" />
</p>

<h3 align="center">@mcptoolshop/voice-soundboard-core</h3>

<p align="center">
  <a href="https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-core"><img src="https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-core?style=flat-square&color=cb3837&logo=npm" alt="npm"></a>
  <a href="https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/mcp-tool-shop-org/mcp-voice-soundboard/ci.yml?branch=main&style=flat-square&label=CI" alt="CI"></a>
  <img src="https://img.shields.io/badge/node-%E2%89%A520-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js 20+">
  <a href="https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License: MIT"></a>
</p>

The engine-agnostic half of [MCP Voice Soundboard](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard). It turns what an agent asks for into a plan a speech engine can carry out, and refuses what it shouldn't:

- **the voice registry:** 46 approved voices in 9 languages, and 5 presets;
- **input rules:** text, speed and output limits, with structured errors;
- **markup:** SSML-lite, emotion spans and sound-effect tags;
- **dialogue:** `Speaker: line` scripts with pauses and casting;
- **planning:** text chunking and a plan runner that calls your synthesizer chunk by chunk and joins the WAV output.

It has no runtime dependencies and makes no sound by itself. Bring a synthesizer, or use the ready-made MCP server, [`@mcptoolshop/voice-soundboard-mcp`](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-mcp), which is built on this package.

## Install

```bash
npm install @mcptoolshop/voice-soundboard-core
```

Node.js 20 or later. ES module.

## Usage

```ts
import {
  validateText,
  resolveVoiceOrPreset,
  parseEmotionSpans,
  parseSsmlLite,
  parseDialogue,
  chunkText,
} from "@mcptoolshop/voice-soundboard-core";

// Limits: throws a LimitError (with a hint) for empty or oversized text.
const text = validateText("Welcome back. {joy}The build is green!{/joy}");

// A voice ID or a preset name; an empty input gets the default voice.
const { voice, speed } = resolveVoiceOrPreset("narrator"); // bm_george at 0.95

// Emotion spans: each span carries the voice and speed for that emotion.
const { spans } = parseEmotionSpans(text);

// SSML-lite: <speak>, <break>, <prosody> and <emphasis>, with a plain-text fallback.
const plan = parseSsmlLite('<speak>Hello <break time="300ms"/> world</speak>');

// Dialogue: "Speaker: line" per line, [pause 350ms] between lines.
const sheet = parseDialogue("Alice: Hi there.\n[pause 300ms]\nBob: Hello!", {
  cast: { Alice: "af_sky", Bob: "narrator" },
});

// Chunking for engines with a per-call text limit.
const { chunks } = chunkText(text);
```

## What's in it

| Area | Exports |
|---|---|
| Voices and presets | `VOICES`, `APPROVED_VOICE_IDS`, `DEFAULT_VOICE`, `getVoice`, `isApprovedVoice`, `PRESETS`, `PRESET_NAMES`, `getPreset` |
| Validation and limits | `validateText`, `validateSpeed`, `resolveVoiceOrPreset`, `assertApprovedVoice`, `LIMITS`, `SHIP_LIMITS` |
| Requests and errors | `buildSynthesisRequest`, `errorResponse`, `fromError`, `SoundboardError`, `wrapError` |
| Output | `buildArtifactConfig`, `resolveOutputDir`, `defaultOutputRoot`, `generateSafeFilename` |
| SSML-lite | `parseSsmlLite`, `looksLikeSsml`, `SSML_LIMITS` |
| Emotion spans | `parseEmotionSpans`, `hasEmotionTags`, `PUBLIC_EMOTIONS`, `EMOTION_MAP` |
| Sound effects | `parseSfxTags`, `hasSfxTags`, `SFX_TAGS`, `generateSfxWav` |
| Dialogue | `parseDialogue` |
| Planning and audio | `chunkText`, `runPlan`, `runEmotionPlan`, `buildWavFile`, `concatWavFiles` |
| Ambient narration | `AmbientEmitter`, `redactSensitive` |

Every error extends `SoundboardError` and carries a `code`, a `hint` and a `retryable` flag. `fromError()` turns any caught error into the response shape the server sends to MCP clients.

## The markup

| Markup | Syntax | Values |
|---|---|---|
| Emotion | `{joy}Great news!{/joy}` | `neutral`, `serious`, `friendly`, `professional`, `calm`, `joy`, `urgent`, `whisper` |
| Sound effect | `[ding]` | `ding`, `chime`, `whoosh`, `click`, `pop`, `tada` (parsed only when SFX is enabled) |
| SSML-lite | `<break time="300ms"/>` | `<speak>`, `<break>`, `<prosody>`, `<emphasis>` |
| Dialogue | `Alice: Hello!` | one line per cue, `[pause 350ms]` between cues |

## Limits

Each request is held to `SHIP_LIMITS`:
- 12,000 characters of text in total;
- 50 chunks;
- 100 emotion spans;
- 400 SSML nodes;
- 30 sound effects;
- breaks of 2 seconds or less;
- one synthesis at a time;
- a 20-second timeout per request.

## Related

- [`@mcptoolshop/voice-soundboard-mcp`](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-mcp): the MCP server built on this library.
- [Source, issues and security policy](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard).

## License

[MIT](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/blob/main/LICENSE). Part of [MCP Tool Shop](https://mcptoolshop.com/).
