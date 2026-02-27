# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-27

### Overview

**First stable release.** Structured error contract, Ship Gate audit (46/50), version alignment, and v1 README.

### Added

- **Structured error contract** — all errors now carry `hint` (actionable guidance) and `retryable` (safe to retry?) fields
- `SoundboardError` base class in core — extends `Error` with `code`, `hint`, `retryable`, `cause`
- `fromError()` helper — converts any caught error into a `VoiceErrorResponse`, extracting hint + retryable from `SoundboardError` subclasses
- `toToolError()` pattern in MCP server — converts errors into MCP tool error responses with structured fields, never exposes stack traces
- `wrapError()` utility — wraps unknown thrown values into `SoundboardError`
- `pnpm verify` script (build + test in one command)
- Explicit "No telemetry" privacy statement in README
- SHIP_GATE.md and SCORECARD.md for product quality tracking

### Changed

- All 11 error classes across core and server now extend `SoundboardError`
- `VoiceErrorResponse` schema now includes `hint: string` and `retryable: boolean`
- `voiceSpeak` and `voiceDialogue` handlers migrated from manual `instanceof` chains to `fromError()`
- Golden-contract tests now verify `hint` and `retryable` fields in error responses
- MCP server version string aligned with package version
- Repo description and topics updated (48 voices, 9 languages)

### Fixed

- MCP handshake version was stuck at `0.2.1` — now aligned at `1.0.0`
- Error responses from `BusyError`, `RateLimitError`, `TimeoutError` now correctly report `retryable: true`
- Stale v2.x git tags deleted
- Dependabot cleaned (removed stale pip ecosystem entry)

## [0.2.1] - 2026-02-18

### Fixed

- README in `@mcptoolshop/voice-soundboard-core` npm tarball still showed 12 voices — corrected to 48 voices, 9 languages
- Broken Development section in root README (stray `> Part of MCP Tool Shop` line inside code block)

## [0.2.0] - 2026-02-18

### Overview

**Multilingual expansion** — 48 voices across 9 languages.

### Added

- **48 voices** — expanded from 12 English-only to 48 across 9 languages
- **9 languages** — English US, English UK, Japanese, Mandarin Chinese, Spanish, French, Hindi, Italian, Brazilian Portuguese
- **`getVoicesByLanguage(language)`** — new helper in `@mcptoolshop/voice-soundboard-core` to filter voices by language code
- Language is auto-inferred by the synthesis backend from the voice ID prefix — no caller changes required

### Changed

- `VoiceInfo.accent` field widened from `"american" | "british"` to `string` to accommodate new languages
- `VoiceInfo.language` values now use BCP-47 style codes (`"en-us"`, `"en-gb"`, `"ja"`, `"zh"`, etc.) instead of `"en"`
- Server version string updated to `0.2.0`
- Package descriptions updated to reflect 48 voices and 9 languages

---

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
