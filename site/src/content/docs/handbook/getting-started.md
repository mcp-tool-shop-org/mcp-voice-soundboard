---
title: Getting Started
description: Install MCP Voice Soundboard and speak your first line.
sidebar:
  order: 1
---

MCP Voice Soundboard is a text-to-speech MCP server that gives AI agents the ability to speak. It works with Claude Desktop, Cursor, and any MCP client via stdio transport.

## Quick start

```bash
npx @mcptoolshop/voice-soundboard-mcp
```

Or install globally:

```bash
npm install -g @mcptoolshop/voice-soundboard-mcp
voice-soundboard-mcp
```

## MCP client configuration

Add to your MCP client config (e.g. `claude_desktop_config.json`):

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

## Your first synthesis

Once connected, ask your AI agent to speak:

```
voice_speak({ text: "Hello world!", voice: "narrator" })
```

The `narrator` preset uses the `bm_george` voice at 0.95x speed — a calm documentary style.

## What ships in the box

- 48 approved voices across 9 languages
- 5 curated presets (narrator, announcer, whisper, storyteller, assistant)
- 8 emotion spans for prosody control
- SSML-lite support for timing and emphasis
- 6 SFX tags for inline sound effects
- Multi-speaker dialogue with automatic cast assignment
- Built-in guardrails: rate limiting, concurrency control, timeouts, path traversal protection
