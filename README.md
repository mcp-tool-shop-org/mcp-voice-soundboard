<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="assets/logo.png" alt="MCP Voice Soundboard" width="400">
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-mcp"><img src="https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-mcp" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License"></a>
  <a href="https://mcp-tool-shop-org.github.io/mcp-voice-soundboard/"><img src="https://img.shields.io/badge/Landing_Page-live-blue" alt="Landing Page"></a>
</p>

<p align="center">
  48 voices &bull; 9 languages &bull; 5 presets &bull; 8 emotions &bull; SSML-lite &bull; SFX tags &bull; multi-speaker dialogue<br>
  Swappable TTS backends. Guardrails built in. Ships as a single <code>npx</code> command.
</p>

---

## Highlights

- **MCP native** &mdash; stdio transport, works with Claude Desktop, Cursor, and any MCP client
- **5 tools** &mdash; `voice_speak`, `voice_dialogue`, `voice_status`, `voice_interrupt`, `voice_inner_monologue`
- **48 approved voices, 9 languages** &mdash; English (American + British), Japanese, Mandarin, Spanish, French, Hindi, Italian, Brazilian Portuguese. Curated presets: `narrator`, `announcer`, `whisper`, `storyteller`, `assistant`
- **Emotion spans** &mdash; 8 emotions via `[happy]...[/happy]` inline markup
- **SSML-lite** &mdash; `<break>`, `<emphasis>`, `<prosody>` without full SSML complexity
- **SFX tags** &mdash; `[ding]`, `[chime]`, `[whoosh]`, `[tada]`, `[error]`, `[click]` inline sound effects
- **Multi-speaker dialogue** &mdash; `Speaker: line` format with auto-cast and pause directives
- **Guardrails** &mdash; rate limiting, concurrency semaphore, request timeouts, path traversal protection, secret redaction
- **Swappable backends** &mdash; Mock (built-in), HTTP proxy, Python bridge, or bring your own

## Quick Start

```bash
npx @mcptoolshop/voice-soundboard-mcp
```

Or install globally:

```bash
npm install -g @mcptoolshop/voice-soundboard-mcp
voice-soundboard-mcp
```

### Claude Desktop / MCP Client Config

Add to your MCP client configuration (e.g. `claude_desktop_config.json`):

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

With options:

```json
{
  "mcpServers": {
    "voice-soundboard": {
      "command": "npx",
      "args": [
        "-y", "@mcptoolshop/voice-soundboard-mcp",
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

48 voices across 9 languages. Language is auto-inferred from the voice ID prefix — no configuration required.

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

### English — American

| ID | Name | Gender | Style |
|----|------|--------|-------|
| `af_aoede` | Aoede | Female | Musical |
| `af_bella` | Bella | Female | Warm |
| `af_heart` | Heart | Female | Caring |
| `af_jessica` | Jessica | Female | Professional |
| `af_kore` | Kore | Female | Youthful |
| `af_nicole` | Nicole | Female | Soft |
| `af_sarah` | Sarah | Female | Clear |
| `af_sky` | Sky | Female | Airy |
| `am_eric` | Eric | Male | Confident |
| `am_fenrir` | Fenrir | Male | Powerful |
| `am_liam` | Liam | Male | Friendly |
| `am_michael` | Michael | Male | Deep |
| `am_onyx` | Onyx | Male | Smooth |
| `am_puck` | Puck | Male | Playful |

### English — British

| ID | Name | Gender | Style |
|----|------|--------|-------|
| `bf_alice` | Alice | Female | Proper |
| `bf_emma` | Emma | Female | Refined |
| `bf_isabella` | Isabella | Female | Warm |
| `bm_fable` | Fable | Male | Storytelling |
| `bm_george` | George | Male | Authoritative |
| `bm_lewis` | Lewis | Male | Friendly |

### Japanese

| ID | Name | Gender | Style |
|----|------|--------|-------|
| `jf_alpha` | Alpha | Female | Clear |
| `jf_gongitsune` | Gongitsune | Female | Storytelling |
| `jf_nezuko` | Nezuko | Female | Gentle |
| `jf_tebukuro` | Tebukuro | Female | Warm |
| `jm_kumo` | Kumo | Male | Calm |

### Mandarin Chinese

| ID | Name | Gender | Style |
|----|------|--------|-------|
| `zf_xiaobei` | Xiaobei | Female | Bright |
| `zf_xiaoni` | Xiaoni | Female | Gentle |
| `zf_xiaoxiao` | Xiaoxiao | Female | Clear |
| `zf_xiaoyi` | Xiaoyi | Female | Warm |
| `zm_yunjian` | Yunjian | Male | Authoritative |
| `zm_yunxi` | Yunxi | Male | Friendly |
| `zm_yunxia` | Yunxia | Male | Calm |
| `zm_yunyang` | Yunyang | Male | Confident |

### Spanish

| ID | Name | Gender | Style |
|----|------|--------|-------|
| `ef_dora` | Dora | Female | Warm |
| `em_alex` | Alex | Male | Confident |
| `em_santa` | Santa | Male | Jolly |

### French

| ID | Name | Gender | Style |
|----|------|--------|-------|
| `ff_siwis` | Siwis | Female | Refined |

### Hindi

| ID | Name | Gender | Style |
|----|------|--------|-------|
| `hf_alpha` | Alpha | Female | Clear |
| `hf_beta` | Beta | Female | Warm |
| `hm_omega` | Omega | Male | Deep |
| `hm_psi` | Psi | Male | Calm |

### Italian

| ID | Name | Gender | Style |
|----|------|--------|-------|
| `if_sara` | Sara | Female | Warm |
| `im_nicola` | Nicola | Male | Confident |

### Brazilian Portuguese

| ID | Name | Gender | Style |
|----|------|--------|-------|
| `pf_dora` | Dora | Female | Warm |
| `pm_alex` | Alex | Male | Confident |
| `pm_santa` | Santa | Male | Jolly |

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
| [`@mcptoolshop/voice-soundboard-core`](packages/core) | Backend-agnostic core library (validation, SSML, chunking, schemas) | [![npm](https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-core)](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-core) |
| [`@mcptoolshop/voice-soundboard-mcp`](packages/mcp-server) | MCP server with CLI, guardrails, and transport | [![npm](https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-mcp)](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-mcp) |

## Development

```bash
# Install
pnpm install

# Build
pnpm build

# Test (342 tests)
pnpm test
```

> Part of [MCP Tool Shop](https://mcp-tool-shop.github.io/)

### Project Structure

```
mcp-voice-soundboard/
  packages/
    core/               @mcptoolshop/voice-soundboard-core
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
    mcp-server/         @mcptoolshop/voice-soundboard-mcp
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

## Support

- **Questions / help:** [Discussions](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/discussions)
- **Bug reports:** [Issues](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/issues)
- **Security:** [SECURITY.md](SECURITY.md)

## License

[MIT](LICENSE)

---

<p align="center">
  Built by <a href="https://github.com/mcp-tool-shop-org">mcp-tool-shop</a>
</p>
