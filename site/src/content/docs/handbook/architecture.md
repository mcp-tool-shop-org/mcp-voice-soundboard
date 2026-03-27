---
title: Architecture
description: Monorepo structure and packages.
sidebar:
  order: 6
---

## Packages

MCP Voice Soundboard is a pnpm monorepo with two publishable packages:

| Package | Description |
|---------|-------------|
| `@mcptoolshop/voice-soundboard-core` | Backend-agnostic core library — validation, SSML, chunking, schemas |
| `@mcptoolshop/voice-soundboard-mcp` | MCP server with CLI, guardrails, and transport |

## Project structure

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
        tools/            Individual tool handlers
```

## Development

```bash
# Install
pnpm install

# Build
pnpm build

# Test (363 tests)
pnpm test

# Build + test in one step
pnpm verify
```

## Related projects

| Project | Description |
|---------|-------------|
| [soundboard-plugin](https://github.com/mcp-tool-shop-org/soundboard-plugin) | Claude Code plugin — slash commands, emotion-aware narration |
