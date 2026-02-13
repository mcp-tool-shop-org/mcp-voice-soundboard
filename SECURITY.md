# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.x     | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Preferred:** Open a [private Security Advisory](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/security/advisories/new) on GitHub.

**Alternative:** Email 64996768+mcp-tool-shop@users.noreply.github.com

**Response timeline:**
- Acknowledgment within 72 hours
- Assessment and severity classification within 7 days
- Fix or mitigation plan within 30 days for confirmed issues

**What to include:**
- Description of the vulnerability
- Steps to reproduce
- Affected version(s)
- Potential impact assessment

**Please do not:**
- Open public GitHub issues for security vulnerabilities
- Exploit the vulnerability beyond proof-of-concept
- Share details before a fix is available

## Scope

This policy covers the `@mcp-tool-shop/voice-soundboard-core` and `@mcp-tool-shop/voice-soundboard-mcp` npm packages, including:

- Input validation and sanitization
- Filesystem sandbox (output directory traversal)
- Backend communication (HTTP/Python bridge)
- Secret/PII redaction pipeline
- Rate limiting and resource exhaustion protections

## Security Design

See [THREAT_MODEL.md](THREAT_MODEL.md) for the full threat surface analysis.
