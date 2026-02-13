# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 2.5.x   | Yes       |
| 2.4.x   | Yes       |
| < 2.4   | No        |

## Overview

Voice Soundboard is a **local text-to-speech engine** with optional cloud backend
support. The core engine runs entirely on the user's machine. Cloud backends
(OpenAI, Azure, ElevenLabs) make network requests only when explicitly configured.

## Security Properties

- **Input validation**: SSML injection prevention with tag whitelisting and
  attribute validation. Text length limits enforced at the compiler layer.
- **Plugin sandboxing**: RestrictedPython-based isolation prevents plugins from
  accessing the filesystem, network, or OS primitives.
- **Rate limiting**: Token bucket and sliding window algorithms with per-user,
  per-IP, and per-API-key enforcement.
- **Audit logging**: Structured security event tracking with tamper detection.
- **Secret management**: API keys for cloud backends are handled through
  environment variables or memory-only storage. No secrets are written to disk
  or included in logs.
- **Engine isolation**: The engine layer never imports from the compiler layer,
  preventing feature logic from accessing synthesis internals.

## Cloud Backend Security

When using cloud backends (OpenAI, Azure, ElevenLabs):
- API keys are read from environment variables only
- TLS is enforced for all API communication
- No audio data is cached after synthesis unless explicitly configured
- Cloud backend usage is opt-in and requires installing the corresponding extra

## Reporting Vulnerabilities

If you discover a security vulnerability, please report it responsibly:

1. **Preferred**: Open a [private Security Advisory](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/security/advisories/new) on GitHub.
2. **Alternative**: Email security concerns to the maintainer via GitHub profile.

Please **do not** open public issues for security vulnerabilities.

We aim to acknowledge reports within 48 hours and provide a fix or mitigation
plan within 7 days for confirmed vulnerabilities.
