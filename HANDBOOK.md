# Voice Soundboard Handbook

Everything you need to know about MCP Voice Soundboard — what it does, how to set it up, how to use every feature, and how it all works under the hood.

---

## What Is This?

MCP Voice Soundboard is a **text-to-speech server** that plugs into AI assistants (like Claude) using the [Model Context Protocol](https://modelcontextprotocol.io) (MCP). You give it text, it gives you audio. It runs locally on your machine over stdio — no cloud, no API keys, no accounts.

It ships as a single npm package you can run with `npx`.

---

## Setup

### Requirements

- **Node.js 20 or later** ([download](https://nodejs.org))
- An MCP-compatible client (Claude Desktop, Cursor, VS Code with MCP extension, etc.)

### Option 1: Zero-Install (npx)

No installation needed. Just add this to your MCP client config:

```json
{
  "mcpServers": {
    "voice-soundboard": {
      "command": "npx",
      "args": ["-y", "@mcp-tool-shop/voice-soundboard-mcp"]
    }
  }
}
```

Where does this config file live?

| Client | Config location |
|--------|----------------|
| Claude Desktop | `claude_desktop_config.json` (Settings > Developer > Edit Config) |
| Cursor | `.cursor/mcp.json` in your project root |
| Claude Code | `.claude/settings.json` or `~/.claude.json` |

Save the file, restart the client, and the voice tools appear automatically.

### Option 2: Global Install

```bash
npm install -g @mcp-tool-shop/voice-soundboard-mcp
```

Then use `voice-soundboard-mcp` as the command in your config instead of `npx`.

### Option 3: From Source (Development)

```bash
git clone https://github.com/mcp-tool-shop-org/mcp-voice-soundboard.git
cd mcp-voice-soundboard
pnpm install
pnpm build
```

Point your MCP config at the built CLI:

```json
{
  "mcpServers": {
    "voice-soundboard": {
      "command": "node",
      "args": ["path/to/mcp-voice-soundboard/packages/mcp-server/dist/cli.js"]
    }
  }
}
```

---

## Features

### 5 MCP Tools

These are the tools your AI assistant sees and can call:

#### `voice_speak` — Say something

The main tool. Give it text, get audio back.

```
text:    "Hello, world!"       (required)
voice:   "am_fenrir"           (optional — voice ID or preset name)
speed:   1.2                   (optional — 0.5 to 2.0)
format:  "wav"                 (optional — wav, mp3, ogg, raw)
sfx:     true                  (optional — enable sound effect tags)
```

#### `voice_dialogue` — Multi-speaker conversation

Synthesize a script with multiple speakers. Each line is `Speaker: text`.

```
script: "Alice: Good morning!\nBob: Hey, how's it going?\nAlice: Great, thanks!"
cast:   { "Alice": "af_sky", "Bob": "am_fenrir" }
concat: true                   (combine into one file)
```

Speakers not in the `cast` map get auto-assigned voices. You can also add pause directives between lines: `[pause 500ms]`.

#### `voice_status` — Check what's available

Returns the full list of voices, presets, backend health, and server config. No arguments needed. This is typically the first tool an agent calls to discover what's available.

#### `voice_interrupt` — Stop playback

Halts active synthesis. Useful when the user starts talking or context changes.

```
reason: "user_spoke"           (user_spoke, context_change, timeout, manual)
```

#### `voice_inner_monologue` — Ambient narration

Ephemeral micro-utterances for "thinking out loud" effects. Rate-limited, auto-redacted, and volatile (nothing is saved). Requires the `--ambient` flag to be enabled.

```
text:     "Hmm, interesting..."
category: "thinking"           (general, thinking, observation, debug)
```

### 12 Voices

All voices are English, Kokoro-compatible, and curated for quality.

**American Female:**
| ID | Name | Style |
|----|------|-------|
| `af_aoede` | Aoede | Musical, lyrical |
| `af_jessica` | Jessica | Professional, clean |
| `af_sky` | Sky | Airy, light |

**American Male:**
| ID | Name | Style |
|----|------|-------|
| `am_eric` | Eric | Confident |
| `am_fenrir` | Fenrir | Powerful, deep |
| `am_liam` | Liam | Friendly |
| `am_onyx` | Onyx | Smooth |

**British Female:**
| ID | Name | Style |
|----|------|-------|
| `bf_alice` | Alice | Proper |
| `bf_emma` | Emma | Refined, warm |
| `bf_isabella` | Isabella | Warm |

**British Male:**
| ID | Name | Style |
|----|------|-------|
| `bm_george` | George | Authoritative (default voice) |
| `bm_lewis` | Lewis | Friendly |

### 5 Presets

Presets are shortcuts that combine a voice with a speed setting:

| Preset | Voice | Speed | Good for |
|--------|-------|-------|----------|
| `narrator` | George | 0.95x | Documentaries, explainers |
| `announcer` | Onyx | 1.05x | News, alerts, notifications |
| `whisper` | Aoede | 0.85x | Intimate, ASMR-style |
| `storyteller` | Emma | 0.90x | Bedtime stories, fiction |
| `assistant` | Jessica | 1.0x | General-purpose, neutral |

Use them by name: `voice: "narrator"` instead of a voice ID.

### 8 Emotion Spans

Wrap any section of text in emotion tags to change how it sounds:

```
[happy]I got the job![/happy] But [sad]I have to relocate.[/sad]
```

Available emotions: `happy`, `sad`, `angry`, `fearful`, `surprised`, `disgusted`, `calm`, `excited`

Emotions affect prosody (pitch, rate, volume) — they don't change the voice itself. You can nest them, and you can use multiple emotions in one request.

### SFX Tags

Inline sound effect markers (feature-flagged, pass `sfx: true` to enable):

```
Welcome back! [ding] You have three new messages. [chime]
```

Available: `[ding]`, `[chime]`, `[whoosh]`, `[tada]`, `[error]`, `[click]`

SFX tags get parsed out of the text and placed as audio events at the right positions.

### SSML-Lite

A subset of SSML that works without full XML complexity:

```xml
<speak>
  Hello <break time="500ms"/> world.
  <emphasis level="strong">This is important.</emphasis>
  <prosody rate="slow" pitch="low">Take your time.</prosody>
</speak>
```

Supported elements: `<break>`, `<emphasis>`, `<prosody>`, `<speak>`. Anything else is stripped. Break times are capped at 2 seconds.

### Text Chunking

Long text is automatically split into chunks at sentence and paragraph boundaries. Each chunk is synthesized separately and then concatenated. The system handles up to 12,000 characters per request and up to 50 chunks.

### Artifact Modes

Audio can be delivered two ways:

- **`path`** (default) — writes a WAV file to disk and returns the file path
- **`base64`** — returns the raw audio bytes as a base64 string in the response

Set globally with `--artifact=path|base64` or per-call with the `artifactMode` parameter.

---

## Backends

The server needs a TTS backend to actually generate audio. It auto-detects what's available:

| Backend | What it does | When it's used |
|---------|-------------|----------------|
| **Mock** | Returns silence (valid WAV, zero audio) | Default fallback, testing, development |
| **HTTP** | Proxies requests to an external TTS API | When `VOICE_SOUNDBOARD_TTS_URL` is set |
| **Python** | Bridges to Python Kokoro/Piper engines | When Python is available on PATH |

**Mock** is the default. It generates valid WAV files containing silence — useful for testing the full pipeline without needing a real TTS engine.

To use a real TTS engine, set the environment variable:

```bash
# HTTP backend (point to your TTS service)
VOICE_SOUNDBOARD_TTS_URL=http://localhost:8080/synthesize

# Or explicitly choose
--backend=http --backend-url=http://localhost:8080/synthesize
```

---

## CLI Flags

All flags go in the `args` array of your MCP config:

| Flag | Default | What it does |
|------|---------|-------------|
| `--backend=mock\|http\|python` | auto-detect | Which TTS backend to use |
| `--backend-url=<url>` | — | URL for HTTP backend |
| `--artifact=path\|base64` | `path` | How audio is delivered |
| `--output-dir=<path>` | `<tmpdir>/voice-soundboard/` | Where audio files go |
| `--ambient` | off | Enable inner-monologue system |
| `--max-concurrent=<n>` | `1` | Max simultaneous synthesis requests |
| `--timeout=<ms>` | `20000` | Per-request timeout |
| `--retention-minutes=<n>` | `240` | Auto-delete audio files older than this (0 = keep forever) |

Example with multiple flags:

```json
{
  "mcpServers": {
    "voice-soundboard": {
      "command": "npx",
      "args": [
        "-y", "@mcp-tool-shop/voice-soundboard-mcp",
        "--backend=http",
        "--artifact=path",
        "--output-dir=/tmp/voice-output",
        "--timeout=30000"
      ],
      "env": {
        "VOICE_SOUNDBOARD_TTS_URL": "http://localhost:8080/synthesize"
      }
    }
  }
}
```

---

## Environment Variables

| Variable | What it does |
|----------|-------------|
| `VOICE_SOUNDBOARD_TTS_URL` | HTTP backend URL (auto-selects HTTP backend) |
| `VOICE_SOUNDBOARD_TTS_TOKEN` | Auth token sent as `Authorization: Bearer <token>` |
| `VOICE_SOUNDBOARD_HTTP_TIMEOUT` | HTTP request timeout in ms |
| `VOICE_SOUNDBOARD_PYTHON` | Python executable path (default: `python`) |
| `VOICE_SOUNDBOARD_PYTHON_MODULE` | Python bridge module name |
| `VOICE_SOUNDBOARD_AMBIENT_ENABLED` | Set to `1` to enable inner-monologue (same as `--ambient`) |

---

## Guardrails

The server has built-in safety measures so an AI agent can't accidentally abuse it:

- **Rate limiting** — 30 calls per tool per 60-second window
- **Concurrency** — Only 1 synthesis runs at a time (configurable with `--max-concurrent`)
- **Timeouts** — Each request must complete in 20 seconds (configurable with `--timeout`)
- **Text limits** — Maximum 12,000 characters per request
- **Path traversal protection** — Output paths are sandboxed; `../../etc/passwd` is rejected
- **Symlink checks** — Output directories can't be symlinks pointing outside the sandbox
- **Secret redaction** — API keys, tokens, and connection strings are scrubbed from error messages and logs
- **Result validation** — Generated audio is checked for valid WAV headers, sane duration, and file size under 50MB
- **Retention cleanup** — Audio files are auto-deleted after 4 hours (configurable)

---

## Project Structure

This is a pnpm monorepo with two npm packages:

```
mcp-voice-soundboard/
  packages/
    core/                 @mcp-tool-shop/voice-soundboard-core
      src/
        limits.ts           Text/chunk limits + SHIP_LIMITS
        schemas.ts          Request/response types, error codes
        voices.ts           12 approved voices + presets
        artifact.ts         Output directory sandboxing
        sandbox.ts          Safe filenames, symlink checks
        ssml/               SSML-lite parser
        chunking/           Text chunker
        sfx/                SFX tag parser
        ambient.ts          Inner-monologue emitter
        redact.ts           Secret/PII redaction
    mcp-server/           @mcp-tool-shop/voice-soundboard-mcp
      src/
        server.ts           MCP tool registration + guardrails
        cli.ts              CLI entrypoint
        backend.ts          Backend interface + mock
        backends/           HTTP and Python backends
        concurrency.ts      Synthesis semaphore
        rateLimit.ts        Sliding-window rate limiter
        timeout.ts          Request timeout wrapper
        retention.ts        Output file cleanup
        validation.ts       Result validation
        redact.ts           Server-level redaction
        tools/              Individual tool handlers
  assets/                 Logo
  docs/                   Architecture docs
```

**Core** has zero runtime dependencies — it's pure TypeScript with validation, parsing, and schemas. **MCP Server** depends on core plus `@modelcontextprotocol/sdk` and `zod`.

---

## ELI5 (Explain Like I'm 5)

Imagine you have a robot friend (like Claude) who can read and write, but can't talk. Voice Soundboard gives your robot friend a mouth.

**Here's how it works:**

1. Your robot friend wants to say "Hello!" out loud
2. It asks Voice Soundboard: "Hey, can you turn this into sound?"
3. Voice Soundboard picks a voice (like choosing between a deep voice, a soft voice, or a British accent)
4. It makes an audio file — like a tiny recording of someone saying "Hello!"
5. Your robot friend gets the recording back

**The cool parts:**

- **Voices** — It's like having 12 different actors on speed-dial. George sounds like a news anchor, Sky sounds light and airy, Fenrir sounds powerful and deep.
- **Presets** — Shortcuts! Instead of picking a voice and speed, just say "use the storyteller" and it picks the perfect combo for bedtime stories.
- **Emotions** — You can tell it "say this part happily and that part sadly" and the voice changes to match, like an actor reading a script.
- **Dialogue** — You can write a whole conversation between characters (like a play) and it uses different voices for each person.
- **Sound effects** — Sprinkle in `[ding]` or `[tada]` and it drops little sound effects into the audio at the right spots.

**Why is it safe?**

- It can only make a limited number of recordings per minute (so it can't go crazy)
- It can only save files in one specific folder (so it can't mess up your computer)
- It scrubs any passwords or secrets out of its logs (so nothing leaks)
- Old recordings get cleaned up automatically (so your disk doesn't fill up)

**One-line summary:** Voice Soundboard turns text into speech for AI assistants, with different voices, emotions, and sound effects, and it's designed so nothing can go wrong.
