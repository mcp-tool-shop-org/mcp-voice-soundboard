# Scorecard

**Repo:** mcp-voice-soundboard
**Date:** 2026-02-27
**Type tags:** `[npm]` `[mcp]` `[cli]`

## Pre-Remediation Assessment

| Category | Score | Notes |
|----------|-------|-------|
| A. Security | 8/10 | SECURITY.md + THREAT_MODEL.md + redaction existed pre-session. Missing: explicit no-telemetry statement |
| B. Error Handling | 5/10 | Errors had code + message but no hint/retryable. instanceof chains, no base class. CLI exits 0/1 only |
| C. Operator Docs | 8/10 | README thorough, HANDBOOK exists, CHANGELOG existed but stale. No --help flag |
| D. Shipping Hygiene | 6/10 | CI passes, dependabot exists but had stale pip entry. No verify script. Version drift (0.2.1/0.2.3/0.2.4). Stale v2.x tags |
| E. Identity (soft) | 9/10 | Logo, translations, landing page, topics all present but description stale ("12 voices") |
| **Overall** | **36/50** | |

## Key Gaps

1. Error contract missing hint + retryable — callers couldn't distinguish retryable errors from permanent ones
2. Version drift — core 0.2.3, server 0.2.4, MCP handshake 0.2.1, stale v2.x tags
3. No `verify` script — no single command to validate before publish
4. No explicit no-telemetry statement despite being a privacy-respecting tool
5. Repo description outdated ("12 voices" vs 48)

## Remediation Priority

| Priority | Item | Estimated effort |
|----------|------|-----------------|
| 1 | Error shape alignment (SoundboardError + fromError + toToolError) | 45 min |
| 2 | Version sync + stale tag cleanup + CHANGELOG | 10 min |
| 3 | Add verify script | 5 min |
| 4 | No-telemetry statement in README | 5 min |
| 5 | Repo metadata cleanup | 5 min |

## Post-Remediation

| Category | Before | After |
|----------|--------|-------|
| A. Security | 8/10 | 10/10 |
| B. Error Handling | 5/10 | 8/10 |
| C. Operator Docs | 8/10 | 9/10 |
| D. Shipping Hygiene | 6/10 | 9/10 |
| E. Identity (soft) | 9/10 | 10/10 |
| **Overall** | **36/50** | **46/50** |

### What moved

- **A +2:** Added explicit no-telemetry statement
- **B +3:** SoundboardError base class, hint + retryable fields, fromError() pattern, toToolError() pattern, golden-contract tests verify error shape. Remaining: CLI --help, exit codes, --debug
- **C +1:** CHANGELOG updated for 0.3.0, test count updated. Remaining: CLI --help
- **D +3:** Verify script added, all versions aligned to 0.3.0, stale tags deleted, dependabot cleaned (removed pip entry)
- **E +1:** Repo description updated to "48 voices, 9 languages", stale topics removed, relevant topics added
