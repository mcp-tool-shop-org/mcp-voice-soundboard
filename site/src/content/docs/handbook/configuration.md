---
title: Configuration
description: CLI flags, backends, and guardrails.
sidebar:
  order: 5
---

## CLI flags

| Flag | Default | Description |
|------|---------|-------------|
| `--artifact=path\|base64` | `path` | Audio delivery mode |
| `--output-dir=<path>` | `<tmpdir>/voice-soundboard/` | Output directory |
| `--backend=mock\|http\|python` | `mock` | Backend selection |
| `--ambient` | off | Enable inner-monologue system |
| `--max-concurrent=<n>` | `3` | Max concurrent synthesis requests |
| `--timeout=<ms>` | `60000` | Per-request timeout |
| `--retention-minutes=<n>` | `240` | Auto-cleanup age (0 to disable) |

## Environment variables

All CLI flags have equivalent environment variables. Environment variables are lower precedence than CLI flags.

| Variable | Default | Description |
|----------|---------|-------------|
| `VOICE_SOUNDBOARD_BACKEND` | `mock` | Same as `--backend` |
| `VOICE_SOUNDBOARD_TTS_URL` | — | HTTP backend URL |
| `VOICE_SOUNDBOARD_TTS_TOKEN` | — | HTTP backend auth token |
| `VOICE_SOUNDBOARD_OUTPUT_DIR` | OS temp dir | Same as `--output-dir` |
| `VOICE_SOUNDBOARD_AMBIENT_ENABLED` | `0` | Set to `1` to enable ambient mode |
| `VOICE_SOUNDBOARD_TIMEOUT` | `60000` | Same as `--timeout` |
| `VOICE_SOUNDBOARD_MAX_CONCURRENT` | `3` | Same as `--max-concurrent` |
| `VOICE_SOUNDBOARD_PYTHON` | `python` | Python command for python backend |
| `VOICE_SOUNDBOARD_PYTHON_MODULE` | — | Python bridge module path |
| `PORT` | — | Set to enable HTTP transport mode (for remote deployment) |

## Backends

**Mock** (default) — Built-in backend that generates silent WAV files. Zero setup, useful for development and testing.

**HTTP proxy** — Forward synthesis requests to an external TTS API. Set `--backend=http` and the `VOICE_SOUNDBOARD_TTS_URL` environment variable.

**Python bridge** — Connect to a Python-based TTS engine (Kokoro, Coqui, etc.) via a bridge process. Set `--backend=python`. The server auto-detects Python availability when no explicit backend is set.

## Guardrails

Built-in safety features that cannot be disabled:

- **Rate limiting** — Sliding window rate limiter per tool
- **Concurrency semaphore** — Controls max concurrent synthesis requests
- **Request timeouts** — Per-request timeout with configurable duration
- **Path traversal protection** — Output directory sandboxing
- **Secret redaction** — PII and secret patterns are redacted from inner monologue output

## Privacy

No telemetry. This tool collects no usage data, sends no analytics, and makes no network requests except to the TTS backend you configure. All processing is local.
