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
| `--backend=mock\|http` | `mock` | Backend selection |
| `--backend-url=<url>` | — | HTTP backend URL |
| `--ambient` | off | Enable inner-monologue system |
| `--max-concurrent=<n>` | `1` | Max concurrent synthesis requests |
| `--timeout=<ms>` | `20000` | Per-request timeout |
| `--retention-minutes=<n>` | `240` | Auto-cleanup age (0 to disable) |

## Backends

**Mock** (default) — Built-in backend that generates silent WAV files. Zero setup, useful for development and testing.

**HTTP proxy** — Forward synthesis requests to an external TTS API. Set `--backend=http` and `--backend-url=<url>`.

**Python bridge** — Connect to a Python-based TTS engine (Kokoro, Coqui, etc.) via a bridge process.

## Guardrails

Built-in safety features that cannot be disabled:

- **Rate limiting** — Sliding window rate limiter per tool
- **Concurrency semaphore** — Controls max concurrent synthesis requests
- **Request timeouts** — Per-request timeout with configurable duration
- **Path traversal protection** — Output directory sandboxing
- **Secret redaction** — PII and secret patterns are redacted from inner monologue output

## Privacy

No telemetry. This tool collects no usage data, sends no analytics, and makes no network requests except to the TTS backend you configure. All processing is local.
