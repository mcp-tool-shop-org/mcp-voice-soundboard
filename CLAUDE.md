# MCP Voice Soundboard — Plugin Context

Text-to-speech MCP server for AI agents. 48 voices, 9 languages, emotion spans, SSML-lite, multi-speaker dialogue, SFX tags, and built-in guardrails.

## Tools (5)

| Tool | Description |
|------|-------------|
| `voice_speak` | Synthesize speech from text. Supports voice selection, speed control, SFX tags, emotion spans, and SSML-lite markup. |
| `voice_dialogue` | Multi-speaker dialogue synthesis. Write scripts in `Speaker: line` format with optional cast mapping and pause directives. |
| `voice_status` | Engine health check. Returns available voices, presets, backend info, and configuration. |
| `voice_interrupt` | Stop or rollback active audio synthesis. Useful for cancelling long synthesis requests. |
| `voice_inner_monologue` | Ephemeral micro-utterances for ambient narration. Rate-limited, auto-redacted, volatile. Requires `VOICE_SOUNDBOARD_AMBIENT_ENABLED=1`. |

## Presets (5)

Use preset names as the `voice` parameter for quick access:

| Preset | Voice | Speed | Style |
|--------|-------|-------|-------|
| `assistant` | af_jessica | 1.0 | Friendly, helpful, conversational |
| `narrator` | bm_george | 0.95 | Calm, clear, documentary style |
| `announcer` | am_eric | 1.1 | Bold, energetic, broadcast style |
| `storyteller` | bf_emma | 0.9 | Expressive, varied pacing |
| `whisper` | af_sky | 0.85 | Soft, intimate, gentle |

## Voices (48 across 9 languages)

Voice IDs follow the pattern `{accent}{gender}_{name}`:
- `af_` / `am_` — American English (8F, 6M)
- `bf_` / `bm_` — British English (3F, 3M)
- `jf_` / `jm_` — Japanese (4F, 1M)
- `zf_` / `zm_` — Mandarin Chinese (3F, 2M)
- `ef_` / `em_` — Spanish (3F, 2M)
- `ff_` — French (2F)
- `hf_` / `hm_` — Hindi (2F, 2M)
- `if_` / `im_` — Italian (2F, 2M)
- `pf_` / `pm_` — Brazilian Portuguese (1F, 2M)

Default voice: `bm_george` (British male, authoritative)

## Emotion Spans (8 emotions)

Wrap text in emotion tags for voice routing:

```
[happy]Great news![/happy] But [sad]we lost the match[/sad].
```

Supported: `happy`, `angry`, `sad`, `fearful`, `surprised`, `urgent`, `calm`, `neutral`

## SSML-lite

Supported tags (subset of full SSML):
- `<break time="500ms"/>` — pause
- `<emphasis level="strong">word</emphasis>` — emphasis
- `<prosody rate="slow" pitch="low">text</prosody>` — rate/pitch control

## SFX Tags

Inline sound effects (pure-WAV generation, no external files):

```
[ding] Build complete! [chime] All tests passed.
```

Available: `[ding]`, `[chime]`, `[whoosh]`, `[tada]`, `[error]`, `[click]`

Enable with `sfx: true` in `voice_speak`.

## Multi-Speaker Dialogue

Write scripts with `Speaker: line` format:

```
Alice: Welcome to the show!
[pause 500ms]
Bob: Thanks for having me.
Alice: [happy]Let's get started![/happy]
```

Use `cast` parameter to map speakers to voices:
```json
{ "Alice": "bf_alice", "Bob": "bm_george" }
```

Uncast speakers are auto-assigned from the voice roster.

## Common Patterns

- **Read code aloud**: `voice_speak` with `narrator` preset
- **Announce build results**: `voice_speak` with `announcer` preset and SFX
- **Explain a concept**: `voice_speak` with `storyteller` preset
- **Quick notification**: `voice_speak` with short text
- **Conversational demo**: `voice_dialogue` with cast mapping
- **Check engine health**: `voice_status` (no arguments)

## Guardrails

Built-in safety limits:
- Rate limiting per tool
- Concurrency semaphore (max concurrent synthesis)
- Request timeouts
- Path traversal protection (sandboxed output directory)
- Secret redaction in logs and errors
- WAV validation on all audio output

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VOICE_SOUNDBOARD_AMBIENT_ENABLED` | `0` | Enable inner monologue system |
| `VOICE_SOUNDBOARD_BACKEND` | `mock` | Backend: `mock`, `http`, `python` |
| `VOICE_SOUNDBOARD_HTTP_URL` | — | HTTP backend URL |
| `VOICE_SOUNDBOARD_OUTPUT_DIR` | OS temp dir | Output root for audio files |
| `VOICE_SOUNDBOARD_ARTIFACT_MODE` | `path` | Default delivery mode: `path` or `base64` |
| `VOICE_SOUNDBOARD_TIMEOUT` | `60000` | Request timeout in ms |
| `VOICE_SOUNDBOARD_MAX_CONCURRENT` | `3` | Max concurrent synthesis requests |
