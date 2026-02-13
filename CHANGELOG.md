# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-13

### Overview

**Initial release** &mdash; Node.js/TypeScript MCP server for text-to-speech.

Complete rewrite from the original Python prototype into a pnpm monorepo with two
publishable npm packages: `@mcp-tool-shop/voice-soundboard-core` and
`@mcp-tool-shop/voice-soundboard-mcp`.

### Packages

- **@mcp-tool-shop/voice-soundboard-core** (v0.1.0) &mdash; Backend-agnostic core library
- **@mcp-tool-shop/voice-soundboard-mcp** (v0.1.0) &mdash; MCP server with CLI

### Added

#### MCP Tools
- `voice_speak` &mdash; Synthesize speech from text with voice, speed, format options
- `voice_dialogue` &mdash; Multi-speaker dialogue synthesis with cast mapping
- `voice_status` &mdash; Engine health, available voices, presets, backend info
- `voice_interrupt` &mdash; Stop/rollback active synthesis
- `voice_inner_monologue` &mdash; Ephemeral micro-utterances (ambient system, opt-in)

#### Core Features
- 12 approved voices (4 American female, 4 American male, 3 British female, 2 British male)
- 5 voice presets (narrator, announcer, whisper, storyteller, assistant)
- 8 emotion spans via `[happy]...[/happy]` inline markup
- SSML-lite parser (`<break>`, `<emphasis>`, `<prosody>`)
- SFX tags (`[ding]`, `[chime]`, `[whoosh]`, `[tada]`, `[error]`, `[click]`)
- Text chunking with sentence/paragraph boundaries
- WAV concatenation for multi-segment output
- Base64 and file-path artifact delivery modes
- Output directory sandboxing with path traversal protection

#### Security & Guardrails
- `SynthesisSemaphore` &mdash; configurable max concurrent synthesis (default 1)
- `ToolRateLimiter` &mdash; per-tool sliding window rate limit (30 calls/60s)
- `withTimeout` &mdash; per-request timeout (default 20s)
- Path traversal protection (resolveOutputDir with symlink checks)
- Secret/PII redaction in logs and error messages
- Synthesis result validation (WAV header, duration, file size)
- Output file retention cleanup (default 4 hours)

#### Backend System
- `Backend` interface with `synthesize()`, `voices()`, `health()`
- MockBackend (built-in, deterministic WAV generation)
- HTTP proxy backend (delegate to external TTS service)
- Python bridge backend (connect to Python Kokoro/Piper engines)

#### Developer Experience
- 342 tests (252 core + 90 server)
- Abuse battery (adversarial input testing)
- CI pipeline: Node.js 20+22 matrix, type-check, npm pack dry-run
- Dependabot for npm dependency updates
- Architecture invariant enforcement (engine never imports compiler)

### Architecture

```
@mcp-tool-shop/voice-soundboard-core
  limits.ts       SHIP_LIMITS consolidation
  schemas.ts      VoiceRequest, VoiceResponse, error codes
  voices.ts       Approved voice registry + presets
  emotion.ts      Emotion span parser
  ssml/           SSML-lite parser
  chunking/       Text chunker
  sfx/            SFX tag parser
  artifact.ts     Output directory sandboxing
  sandbox.ts      Safe filenames, symlink checks
  ambient.ts      AmbientEmitter
  redact.ts       PII/secret redaction

@mcp-tool-shop/voice-soundboard-mcp
  server.ts       MCP tool registration + guardrails
  cli.ts          CLI entrypoint (stdio transport)
  backend.ts      Backend abstraction
  concurrency.ts  SynthesisSemaphore
  rateLimit.ts    ToolRateLimiter
  timeout.ts      withTimeout
  retention.ts    Output cleanup timer
  validation.ts   Result validation
  redact.ts       Server-level redaction
```

---

## Pre-0.1.0 (Python)

The original Python implementation (`voice_soundboard/`) with Compiler-Graph-Engine
architecture is preserved in the repository but is not part of the npm packages.
See git history for the full Python changelog.
