# Privacy Policy

## Data Handling

The MCP voice soundboard processes text locally and sends it to a configured TTS backend for synthesis. This document describes what data is handled and how.

## What Is Processed

- **Synthesis text:** Sent to the configured TTS backend (HTTP API, local Python, or mock). Not stored beyond the request lifecycle.
- **Audio output:** Written to a sandboxed temporary directory or returned as base64. Subject to retention cleanup (default: 4 hours).
- **Ambient entries:** Ephemeral inner-monologue text stored in-memory only. Auto-expires after 60 seconds. Buffer capped at 5 entries.

## What Is NOT Stored

- No user credentials or API keys are stored by the server
- No synthesis text is logged or persisted to disk
- No analytics, telemetry, or usage tracking
- No network calls except to the configured TTS backend

## Redaction Pipeline

Sensitive patterns are automatically stripped before storage in the ambient system:

- API keys and tokens (sk_*, pk_*, bearer_*, etc.)
- AWS access keys (AKIA*)
- JWT tokens (eyJ*)
- Password assignments (password=*, pwd=*, etc.)
- Sensitive file paths (.env, credentials, id_rsa, etc.)
- Email addresses
- IP addresses

Server-level error messages are also redacted before being returned to the client.

## Ambient System

The inner-monologue / ambient system is **disabled by default**. It must be explicitly enabled via:
- `--ambient` CLI flag, or
- `VOICE_SOUNDBOARD_AMBIENT_ENABLED=1` environment variable

When enabled, ambient entries are:
- Rate-limited (max 1 per 10 seconds)
- Auto-redacted for sensitive content
- Stored only in memory (never written to disk)
- Expired after 60 seconds

## TTS Backend Communication

Text is sent to the TTS backend for synthesis. The server does not control what the backend does with the text. When using an external HTTP backend, the text leaves the local machine. Users concerned about data privacy should use a local backend (Python or mock).

## Audio File Retention

Audio files written to disk use the `vsmcp_` prefix and are stored in a sandboxed temporary directory. A retention timer deletes files older than the configured threshold (default: 240 minutes). Files are never shared or uploaded.
