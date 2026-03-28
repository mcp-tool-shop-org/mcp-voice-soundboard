---
title: Beginners Guide
description: Step-by-step walkthrough for first-time users of MCP Voice Soundboard.
sidebar:
  order: 99
---

A hands-on walkthrough that takes you from zero to speaking AI agent. No prior MCP experience required.

## 1. What is MCP Voice Soundboard?

MCP Voice Soundboard is a text-to-speech server that follows the Model Context Protocol (MCP). It gives AI agents like Claude the ability to synthesize speech, run multi-speaker dialogues, and produce audio files -- all through structured tool calls over stdio or HTTP.

Key facts:

- **46 voices** across 9 languages (English, Japanese, Mandarin, Spanish, French, Hindi, Italian, Brazilian Portuguese)
- **5 tools**: `voice_speak`, `voice_dialogue`, `voice_status`, `voice_interrupt`, `voice_inner_monologue`
- **Swappable backends**: Mock (built-in, zero setup), HTTP proxy, or Python bridge (Kokoro, Coqui, etc.)
- **No telemetry**: all processing is local, no data leaves your machine except to the TTS backend you configure

## 2. Prerequisites

Before you start, make sure you have:

- **Node.js 20 or later** -- check with `node --version`
- **An MCP client** -- Claude Desktop, Cursor, or any MCP-compatible tool
- **A terminal** -- for running commands and checking output

No GPU or Python installation is needed for the default mock backend. The mock backend generates silent WAV files so you can test the full tool flow without a real TTS engine.

## 3. Installation

The fastest way to run the server:

```bash
npx @mcptoolshop/voice-soundboard-mcp
```

This downloads and starts the server in stdio mode. To install globally instead:

```bash
npm install -g @mcptoolshop/voice-soundboard-mcp
voice-soundboard-mcp
```

### Connecting to Claude Desktop

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "voice-soundboard": {
      "command": "npx",
      "args": ["-y", "@mcptoolshop/voice-soundboard-mcp"]
    }
  }
}
```

Restart Claude Desktop. The voice tools will appear in the tool list.

## 4. Your first synthesis

Once connected, try each of the main tools:

### Speak a line

```
voice_speak({ text: "Hello, world!" })
```

This uses the default voice (`bm_george`, a British male) at normal speed. The server returns a file path to the generated audio.

### Use a preset

```
voice_speak({ text: "Breaking news from the studio.", voice: "announcer" })
```

The `announcer` preset uses `am_eric` at 1.1x speed for a bold broadcast style. Five presets are available: `narrator`, `announcer`, `whisper`, `storyteller`, `assistant`.

### Run a dialogue

```
voice_dialogue({
  script: "Alice: Welcome to the show!\nBob: Thanks for having me.",
  cast: { "Alice": "bf_alice", "Bob": "bm_george" }
})
```

Each speaker gets their own voice. Omit the `cast` parameter and speakers are auto-assigned from the voice roster.

### Check engine status

```
voice_status()
```

Returns available voices, active presets, backend health, and configuration details.

## 5. Core concepts

### Voices and language prefixes

Every voice ID follows the pattern `{accent}{gender}_{name}`. The prefix determines the language automatically:

| Prefix | Language |
|--------|----------|
| `af_` / `am_` | English (American) |
| `bf_` / `bm_` | English (British) |
| `jf_` / `jm_` | Japanese |
| `zf_` / `zm_` | Mandarin Chinese |
| `ef_` / `em_` | Spanish |
| `ff_` | French |
| `hf_` / `hm_` | Hindi |
| `if_` / `im_` | Italian |
| `pf_` / `pm_` | Brazilian Portuguese |

### Emotion spans

Wrap text in curly-brace tags to change the voice and speed per segment:

```
{joy}Great news!{/joy} {calm}Let me explain.{/calm}
```

Available emotions: `neutral`, `serious`, `friendly`, `professional`, `calm`, `joy`, `urgent`, `whisper`. Each maps to a specific voice and speed. Untagged text defaults to `neutral`.

### SFX tags

Add inline sound effects with square-bracket tags:

```
[ding] Build complete! [chime] All tests passed.
```

Six tags available: `[ding]`, `[chime]`, `[whoosh]`, `[tada]`, `[pop]`, `[click]`. Enable with `sfx: true` in `voice_speak`.

### SSML-lite

For finer timing and emphasis control:

```
<break time="500ms"/> <emphasis level="strong">important</emphasis>
<prosody rate="slow">Take your time.</prosody>
```

## 6. Common patterns

| Goal | How |
|------|-----|
| Read code aloud | `voice_speak` with `narrator` preset |
| Announce build results | `voice_speak` with `announcer` preset and SFX |
| Explain a concept | `voice_speak` with `storyteller` preset |
| Quick notification | `voice_speak` with short text |
| Conversational demo | `voice_dialogue` with a cast mapping |
| Check engine health | `voice_status` (no arguments) |
| Comedy delivery | `voice_speak` with `mood: "dry"` (or `roast`, `chaotic`, `cheeky`, `cynic`, `zoomer`) |

## 7. Troubleshooting

### "Backend is not ready"

The TTS backend is not available. If you are using the default mock backend, this should not happen. For HTTP or Python backends, check that the backend URL or Python environment is reachable.

### "Voice not approved"

You passed a voice ID that is not in the 46-voice approved roster. Use `voice_status` to see the full list of valid voice IDs.

### "Text exceeds maximum length"

The text limit is 12,000 characters per request. Split long content into multiple calls.

### "Rate limited"

The server applies per-tool rate limiting. Wait a moment and retry. This is a safety guardrail to prevent runaway synthesis.

### "Busy" / concurrency errors

The concurrency semaphore is full. The default limit is 3 concurrent requests. Wait for an active request to finish, or increase the limit with `--max-concurrent`.

### Inner monologue not working

The `voice_inner_monologue` tool requires explicit opt-in. Start the server with `--ambient` or set `VOICE_SOUNDBOARD_AMBIENT_ENABLED=1`.

### Audio files accumulating on disk

The server auto-cleans files older than 240 minutes by default. Adjust with `--retention-minutes=<n>` or set to `0` to keep files indefinitely.
