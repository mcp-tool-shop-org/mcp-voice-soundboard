<p align="center">
  <img src="assets/logo-dark.jpg" alt="MCP Voice Soundboard" width="420" />
</p>

<h3 align="center">Text-to-speech MCP server for AI agents.</h3>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/actions"><img src="https://img.shields.io/github/actions/workflow/status/mcp-tool-shop-org/mcp-voice-soundboard/ci.yml?style=flat-square&label=CI" alt="CI"></a>
  <a href="https://www.npmjs.com/package/@mcp-tool-shop/voice-soundboard-mcp"><img src="https://img.shields.io/npm/v/@mcp-tool-shop/voice-soundboard-mcp?style=flat-square&color=cb3837&logo=npm" alt="npm"></a>
  <img src="https://img.shields.io/badge/node-%E2%89%A520-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js 20+">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License: MIT"></a>
</p>

<p align="center">
  12 voices &bull; 5 presets &bull; 8 emotions &bull; SSML-lite &bull; SFX tags &bull; multi-speaker dialogue<br>
  Swappable TTS backends. Guardrails built in. Ships as a single <code>npx</code> command.
</p>

---

## Highlights

- **MCP native** &mdash; stdio transport, works with Claude Desktop, Cursor, and any MCP client
- **5 tools** &mdash; `voice_speak`, `voice_dialogue`, `voice_status`, `voice_interrupt`, `voice_inner_monologue`
- **12 approved voices** &mdash; curated set with presets (`narrator`, `announcer`, `whisper`, `storyteller`, `assistant`)
- **Emotion spans** &mdash; 8 emotions via `[happy]...[/happy]` inline markup
- **SSML-lite** &mdash; `<break>`, `<emphasis>`, `<prosody>` without full SSML complexity
- **SFX tags** &mdash; `[ding]`, `[chime]`, `[whoosh]`, `[tada]`, `[error]`, `[click]` inline sound effects
- **Multi-speaker dialogue** &mdash; `Speaker: line` format with auto-cast and pause directives
- **Guardrails** &mdash; rate limiting, concurrency semaphore, request timeouts, path traversal protection, secret redaction
- **Swappable backends** &mdash; Mock (built-in), HTTP proxy, Python bridge, or bring your own

## Quick Start

```bash
npx @mcp-tool-shop/voice-soundboard-mcp
```

Or install globally:

```bash
npm install -g @mcp-tool-shop/voice-soundboard-mcp
voice-soundboard-mcp
```

### Claude Desktop / MCP Client Config

Add to your MCP client configuration (e.g. `claude_desktop_config.json`):

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

With options:

```json
{
  "mcpServers": {
    "voice-soundboard": {
      "command": "npx",
      "args": [
        "-y", "@mcp-tool-shop/voice-soundboard-mcp",
        "--artifact=path",
        "--output-dir=/tmp/voice-output",
        "--timeout=30000",
        "--max-concurrent=2"
      ]
    }
  }
}
```

## MCP Tools

### `voice_speak`

Synthesize speech from text.

```
text:         "Hello world!"
voice?:       "am_fenrir"          # Voice ID or preset name
speed?:       1.0                  # 0.5 - 2.0
format?:      "wav"                # wav | mp3 | ogg | raw
artifactMode?: "path"             # path | base64
sfx?:         true                # Enable [ding], [chime] etc.
```

### `voice_dialogue`

Multi-speaker dialogue synthesis.

```
script:       "Alice: Hello!\nBob: Hey there!"
cast?:        { "Alice": "af_sky", "Bob": "am_fenrir" }
speed?:       1.0
concat?:      true                 # Combine into single file
debug?:       true                 # Include cue_sheet
```

### `voice_status`

Returns engine health, available voices, presets, and backend info. No arguments.

### `voice_interrupt`

Stop or rollback active synthesis.

```
streamId?:    "stream-123"
reason?:      "user_spoke"         # user_spoke | context_change | timeout | manual
```

### `voice_inner_monologue`

Ephemeral micro-utterances for ambient narration. Requires `--ambient` flag or `VOICE_SOUNDBOARD_AMBIENT_ENABLED=1`.

```
text:         "Interesting..."     # Max 500 chars, auto-redacted
category?:    "thinking"           # general | thinking | observation | debug
```

## Voices

| ID | Name | Accent | Gender |
|----|------|--------|--------|
| `af_aoede` | Aoede | American | Female |
| `af_jessica` | Jessica | American | Female |
| `af_sky` | Sky | American | Female |
| `am_eric` | Eric | American | Male |
| `am_fenrir` | Fenrir | American | Male |
| `am_liam` | Liam | American | Male |
| `am_onyx` | Onyx | American | Male |
| `bf_alice` | Alice | British | Female |
| `bf_emma` | Emma | British | Female |
| `bf_isabella` | Isabella | British | Female |
| `bm_george` | George | British | Male |
| `bm_lewis` | Lewis | British | Male |

### Presets

| Preset | Voice | Speed | Description |
|--------|-------|-------|-------------|
| `narrator` | `bm_george` | 0.95 | Calm documentary style |
| `announcer` | `am_onyx` | 1.05 | News anchor energy |
| `whisper` | `af_aoede` | 0.85 | Soft, intimate |
| `storyteller` | `bf_emma` | 0.90 | Warm bedtime-story feel |
| `assistant` | `af_jessica` | 1.0 | Neutral, helpful |

## Emotion Spans

Wrap text in emotion tags to control prosody:

```
[happy]Great news![/happy] But [sad]I have to go.[/sad]
```

Supported: `happy`, `sad`, `angry`, `fearful`, `surprised`, `disgusted`, `calm`, `excited`

## CLI Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--artifact=path\|base64` | `path` | Audio delivery mode |
| `--output-dir=<path>` | `<tmpdir>/voice-soundboard/` | Output directory |
| `--backend=mock\|http` | `mock` | Backend selection |
| `--backend-url=<url>` | &mdash; | HTTP backend URL |
| `--ambient` | off | Enable inner-monologue system |
| `--max-concurrent=<n>` | `1` | Max concurrent synthesis requests |
| `--timeout=<ms>` | `20000` | Per-request timeout |
| `--retention-minutes=<n>` | `240` | Auto-cleanup age (0 to disable) |

## Packages

This is a pnpm monorepo with two publishable packages:

| Package | Description | npm |
|---------|-------------|-----|
| [`@mcp-tool-shop/voice-soundboard-core`](packages/core) | Backend-agnostic core library (validation, SSML, chunking, schemas) | [![npm](https://img.shields.io/npm/v/@mcp-tool-shop/voice-soundboard-core?style=flat-square)](https://www.npmjs.com/package/@mcp-tool-shop/voice-soundboard-core) |
| [`@mcp-tool-shop/voice-soundboard-mcp`](packages/mcp-server) | MCP server with CLI, guardrails, and transport | [![npm](https://img.shields.io/npm/v/@mcp-tool-shop/voice-soundboard-mcp?style=flat-square)](https://www.npmjs.com/package/@mcp-tool-shop/voice-soundboard-mcp) |

## Development

```bash
# Install
pnpm install

# Build
pnpm build

# Test (342 tests)
pnpm test

# Lint
pnpm --filter @mcp-tool-shop/voice-soundboard-core exec ruff check .  # Python legacy
pnpm exec ruff check voice_soundboard/ tests/ --ignore=E501             # Python legacy
```

### Project Structure

```
mcp-voice-soundboard/
  packages/
    core/               @mcp-tool-shop/voice-soundboard-core
      src/
        limits.ts         SHIP_LIMITS, text/chunk limits
        schemas.ts        VoiceRequest, VoiceResponse, error codes
        artifact.ts       resolveOutputDir, path sandbox
        voices.ts         Approved voice registry + presets
        emotion.ts        Emotion span parser
        ssml/             SSML-lite parser + limits
        chunking/         Text chunker
        sfx/              SFX tag parser + registry
        sandbox.ts        Safe filenames, symlink checks
        ambient.ts        AmbientEmitter for inner monologue
        redact.ts         PII/secret redaction
    mcp-server/         @mcp-tool-shop/voice-soundboard-mcp
      src/
        server.ts         MCP tool registration + guardrail wiring
        cli.ts            CLI entrypoint (stdio transport)
        backend.ts        Backend abstraction + mock/HTTP
        concurrency.ts    SynthesisSemaphore
        rateLimit.ts      ToolRateLimiter (sliding window)
        timeout.ts        withTimeout utility
        retention.ts      Output file cleanup timer
        redact.ts         Server-level redaction
        validation.ts     Synthesis result validation
        tools/            Individual tool handlers
  assets/               Logo, audio event manifests
  docs/                 Architecture docs
```

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting.

See [THREAT_MODEL.md](THREAT_MODEL.md) for the full threat surface analysis.

## Related

| Project | Description |
|---------|-------------|
| [soundboard-plugin](https://github.com/mcp-tool-shop-org/soundboard-plugin) | Claude Code plugin &mdash; slash commands, emotion-aware narration |

## License

[MIT](LICENSE)

---

<p align="center">
  Built by <a href="https://github.com/mcp-tool-shop-org">mcp-tool-shop</a>
</p>
