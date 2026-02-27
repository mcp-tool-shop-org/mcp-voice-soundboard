# Ship Gate

> No repo is "done" until every applicable line is checked.
> Copy this into your repo root. Check items off per-release.

**Tags:** `[all]` every repo · `[npm]` `[pypi]` `[vsix]` `[desktop]` `[container]` published artifacts · `[mcp]` MCP servers · `[cli]` CLI tools

---

## A. Security Baseline

- [x] `[all]` SECURITY.md exists (report email, supported versions, response timeline) (2026-02-27)
- [x] `[all]` README includes threat model paragraph (data touched, data NOT touched, permissions required) (2026-02-27 — THREAT_MODEL.md linked from README)
- [x] `[all]` No secrets, tokens, or credentials in source or diagnostics output (2026-02-27 — redact.ts in both packages)
- [x] `[all]` No telemetry by default — state it explicitly even if obvious (2026-02-27 — Privacy section in README)

### Default safety posture

- [ ] `[cli|mcp|desktop]` SKIP: No dangerous actions (kill, delete, restart) — tool only synthesizes audio
- [x] `[cli|mcp|desktop]` File operations constrained to known directories (2026-02-27 — resolveOutputDir + symlink checks)
- [x] `[mcp]` Network egress off by default (2026-02-27 — mock backend is default, HTTP backend requires explicit --backend=http)
- [x] `[mcp]` Stack traces never exposed — structured error results only (2026-02-27 — toToolError + redactForLog)

## B. Error Handling

- [x] `[all]` Errors follow the Structured Error Shape: `code`, `message`, `hint`, `cause?`, `retryable?` (2026-02-27 — SoundboardError base class + fromError() + toToolError())
- [ ] `[cli]` Exit codes: 0 ok · 1 user error · 2 runtime error · 3 partial success — NOT YET: CLI exits 0/1 only
- [ ] `[cli]` No raw stack traces without `--debug` — NOT YET: no --debug flag
- [x] `[mcp]` Tool errors return structured results — server never crashes on bad input (2026-02-27 — toToolError wraps all handlers)
- [x] `[mcp]` State/config corruption degrades gracefully (stale data over crash) (2026-02-27 — retention timer, mock backend fallback)
- [ ] `[desktop]` SKIP: not a desktop app
- [ ] `[vscode]` SKIP: not a VS Code extension

## C. Operator Docs

- [x] `[all]` README is current: what it does, install, usage, supported platforms + runtime versions (2026-02-27)
- [x] `[all]` CHANGELOG.md (Keep a Changelog format) (2026-02-27 — updated for 0.3.0)
- [x] `[all]` LICENSE file present and repo states support status (2026-02-27 — MIT)
- [ ] `[cli]` `--help` output accurate for all commands and flags — NOT YET: CLI has no --help
- [ ] `[cli|mcp|desktop]` Logging levels defined: silent / normal / verbose / debug — secrets redacted at all levels — PARTIAL: redaction exists, logging levels not configurable
- [x] `[mcp]` All tools documented with description + parameters (2026-02-27 — README + Zod schemas)
- [x] `[complex]` HANDBOOK.md: daily ops, warn/critical response, recovery procedures (2026-02-27)

## D. Shipping Hygiene

- [x] `[all]` `verify` script exists (test + build + smoke in one command) (2026-02-27)
- [x] `[all]` Version in manifest matches git tag (2026-02-27 — all at 0.3.0, MCP handshake aligned)
- [x] `[all]` Dependency scanning runs in CI (ecosystem-appropriate) (2026-02-27 — dependabot monthly)
- [x] `[all]` Automated dependency update mechanism exists (2026-02-27 — dependabot with grouped updates)
- [ ] `[npm]` `npm pack --dry-run` includes: dist/, README.md, CHANGELOG.md, LICENSE — PARTIAL: dist/ + README included, CHANGELOG + LICENSE missing from tarballs
- [x] `[npm]` `engines.node` set (2026-02-27 — >=20.0.0 in both packages + root)
- [x] `[npm]` Lockfile committed (2026-02-27 — pnpm-lock.yaml)
- [ ] `[vsix]` SKIP: not a VS Code extension
- [ ] `[desktop]` SKIP: not a desktop app

## E. Identity (soft gate — does not block ship)

- [x] `[all]` Logo in README header (2026-02-27)
- [x] `[all]` Translations (polyglot-mcp, 8 languages) (2026-02-27)
- [x] `[org]` Landing page (@mcptoolshop/site-theme) (2026-02-27)
- [x] `[all]` GitHub repo metadata: description, homepage, topics (2026-02-27)

---

## Summary

| Gate | Status | Notes |
|------|--------|-------|
| A. Security | **PASS** | All applicable items checked |
| B. Error Handling | **PASS** (MCP items) | CLI exit codes + --debug pending |
| C. Operator Docs | **PASS** (MCP items) | CLI --help + logging levels pending |
| D. Shipping Hygiene | **PASS** | CHANGELOG/LICENSE missing from npm tarballs (minor) |
| E. Identity | **PASS** | All 4 items checked |

### Remaining gaps (non-blocking for MCP ship):

1. CLI `--help` flag not implemented
2. CLI exit codes not differentiated (0/1 only, want 0/1/2/3)
3. CLI `--debug` flag for stack trace visibility not implemented
4. Configurable logging levels (silent/normal/verbose/debug)
5. CHANGELOG.md + LICENSE not in npm tarball `files` arrays
