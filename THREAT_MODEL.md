# Threat Model

## Architecture Overview

The MCP voice soundboard runs as a local stdio server. An LLM client sends tool calls; the server validates input, synthesizes audio via a backend (HTTP API, Python bridge, or mock), and returns file paths or base64 audio.

```
LLM Client  --stdio-->  MCP Server  --HTTP/subprocess-->  TTS Backend
                              |
                         Local filesystem (sandboxed output root)
```

## Threat Surface

### T1: Path Traversal (FS Sandbox Escape)

**Attack:** Malicious `outputDir` parameter like `../../etc/` to write files outside the sandbox.

**Mitigations:**
- `resolveOutputDir()` normalizes paths and checks `relative(root, resolved)` rejects `..` traversal
- Symlink check via `lstat()` prevents symlink-based escapes
- Output filenames use `vsmcp_` prefix + UUID (not user-controlled)
- Retention cleanup only deletes `vsmcp_*` files (prefix safety net)

**Residual risk:** Low. The sandbox root defaults to `<tmpdir>/voice-soundboard/`.

### T2: Input Amplification (Resource Exhaustion)

**Attack:** Extremely long text, deeply nested SSML, or thousands of SFX tags to consume memory/CPU.

**Mitigations:**
- Text length cap: 12,000 chars
- SSML node cap: 400 nodes
- Chunk cap: 50 chunks per request
- SFX event cap: 30 per text
- Break duration cap: 2,000ms
- Emotion span cap: 100 spans
- Concurrency semaphore: max 1 concurrent synthesis
- Request timeout: 20s (per-request), 10s (per-chunk)
- Tool rate limiter: 30 calls/minute per tool

### T3: Secret Leakage via TTS Text

**Attack:** Sensitive data (API keys, passwords, PII) passed as text to synthesize, potentially logged or sent to external TTS backend.

**Mitigations:**
- Ambient/inner-monologue system applies `redactSensitive()` before storage
- Server-level `redactForLog()` strips secrets from error messages
- Patterns: API keys, JWT tokens, passwords, AWS keys, emails, IPs, connection strings
- Backend requests contain only text needed for synthesis (no system context)

**Residual risk:** Medium. Text sent to TTS backends is not redacted (would break synthesis). Users should avoid passing secrets as synthesis text.

### T4: Backend Trust Boundary

**Attack:** Malicious or compromised TTS backend returns crafted responses (oversized files, invalid audio, path injection in response fields).

**Mitigations:**
- `validateSynthesisResult()` checks WAV RIFF header, file size (<50MB), duration bounds
- HTTP backend: response size cap (50MB), timeout (15s default)
- Python backend: subprocess timeout (30s), stderr capture
- Backend responses are not trusted for filesystem paths (server generates its own filenames)

### T5: Ambient Side-Channel

**Attack:** Using `voice_inner_monologue` to exfiltrate data or flood the system.

**Mitigations:**
- Ambient system is OFF by default (requires explicit `--ambient` flag or env var)
- Global rate limit: 1 emission per 10 seconds
- Per-category cooldown: 15 seconds
- Buffer cap: 5 entries (FIFO eviction)
- TTL: entries expire after 60 seconds
- Auto-redaction of sensitive patterns before storage
- Max text length: 500 characters

### T6: Denial of Service via Concurrent Requests

**Attack:** Flooding the server with simultaneous synthesis requests.

**Mitigations:**
- Synthesis semaphore (max 1 concurrent, 1 queued)
- Per-tool rate limiter (30/min)
- Request-level timeout (20s)
- BUSY error returned immediately when queue is full

## Trust Boundaries

| Boundary | Trust Level | Validation |
|----------|------------|------------|
| LLM Client → MCP Server | Untrusted input | Full input validation, limits, rate limiting |
| MCP Server → TTS Backend | Semi-trusted | Response validation, size/timeout caps |
| MCP Server → Filesystem | Controlled | Sandbox, traversal check, symlink check, prefix-scoped cleanup |
| Ambient Emitter → Buffer | Rate-limited | Cooldowns, redaction, TTL, buffer cap |
