# Release Checklist

## Pre-Release

- [ ] Version bump in `packages/core/package.json`
- [ ] Version bump in `packages/mcp-server/package.json`
- [ ] Update server version string in `packages/mcp-server/src/server.ts`
- [ ] All tests pass: `pnpm test`
- [ ] TypeScript compiles cleanly: `pnpm build`
- [ ] No type errors: `pnpm --filter core exec tsc --noEmit && pnpm --filter mcp-server exec tsc --noEmit`
- [ ] CI pipeline green on `main`

## Package Audit

- [ ] `npm pack --dry-run` in both packages shows expected files only
- [ ] No secrets, credentials, or `.env` files in package contents
- [ ] `package.json` `files` field is correctly scoped to `dist/`
- [ ] LICENSE file present in both packages

## Documentation

- [ ] CHANGELOG.md updated with release notes
- [ ] README.md reflects current feature set
- [ ] SECURITY.md contact info is current
- [ ] THREAT_MODEL.md matches current mitigations

## Publish

- [ ] `npm publish` from `packages/core` (if changed)
- [ ] `npm publish` from `packages/mcp-server`
- [ ] Git tag: `git tag v<version>`
- [ ] Push tag: `git push origin v<version>`
- [ ] GitHub release created from tag

## Post-Release

- [ ] Verify package is available on npm
- [ ] Test installation: `npx @mcp-tool-shop/voice-soundboard-mcp --backend=mock`
- [ ] Update any downstream consumers
