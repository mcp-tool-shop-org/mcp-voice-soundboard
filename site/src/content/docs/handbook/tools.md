---
title: Tools
description: All 5 MCP tools in detail.
sidebar:
  order: 2
---

## voice_speak

Synthesize speech from text.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `text` | (required) | Text to synthesize |
| `voice` | — | Voice ID or preset name |
| `speed` | `1.0` | Speed multiplier (0.5–2.0) |
| `format` | `"wav"` | Output format: wav, mp3, ogg, raw |
| `artifactMode` | `"path"` | Delivery mode: path or base64 |
| `sfx` | `true` | Enable `[ding]`, `[chime]` etc. |

## voice_dialogue

Multi-speaker dialogue synthesis using `Speaker: line` format.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `script` | (required) | Dialogue in `Speaker: line` format |
| `cast` | — | Speaker-to-voice mapping, e.g. `{ "Alice": "af_sky" }` |
| `speed` | `1.0` | Speed multiplier |
| `concat` | `true` | Combine all lines into a single file |
| `debug` | `false` | Include `cue_sheet` in response |

When no cast is provided, speakers are auto-assigned voices from the approved list.

## voice_status

Returns engine health, available voices, presets, and backend info. Takes no arguments.

Use this to check what voices are available, which backend is active, and whether the engine is healthy.

## voice_interrupt

Stop or rollback active synthesis.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `streamId` | — | Specific stream to interrupt |
| `reason` | — | Why: `user_spoke`, `context_change`, `timeout`, `manual` |

## voice_inner_monologue

Ephemeral micro-utterances for ambient narration. Requires `--ambient` flag or `VOICE_SOUNDBOARD_AMBIENT_ENABLED=1`.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `text` | (required) | Max 500 chars, auto-redacted |
| `category` | `"general"` | One of: general, thinking, observation, debug |
