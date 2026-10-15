# Changelog: @mcptoolshop/voice-soundboard-mcp

The full history of the repository, including the Python package, is in the [repository CHANGELOG](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/blob/main/CHANGELOG.md).

## [1.0.3] - 2026-10-15

The first npm release of both packages (`1.0.2` was never published to npm).

- `@mcptoolshop/voice-soundboard-core` and `@mcptoolshop/voice-soundboard-mcp` publish from CI through npm Trusted Publishing, with provenance.
- Each package has its own README. The core package's README described the server; both now match the code: 46 voices (not 48), the eight emotions and their `{emotion}` syntax, the six sound-effect tags, the presets, and how the server picks its speech backend.
- `voice-soundboard-mcp --help` lists the environment variables the server reads (`VOICE_SOUNDBOARD_TTS_URL`, not `_HTTP_URL`) and its real defaults (backend chosen automatically, 1 concurrent synthesis, a 20,000 ms timeout).
- `LICENSE` and `CHANGELOG.md` are in each package, as `files` already listed.
- Includes the 2.5.5 security fixes in `@mcptoolshop/voice-soundboard-core`.
