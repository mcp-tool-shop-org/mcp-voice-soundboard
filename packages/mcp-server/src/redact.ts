/** Server-level redaction — strips secrets from error messages and logs. */

import { redactSensitive } from "@mcp-tool-shop/voice-soundboard-core";

/**
 * Additional patterns for server-level redaction (beyond core ambient patterns).
 * Targets connection strings, URLs with credentials, and authorization headers.
 */
const SERVER_PATTERNS: readonly RegExp[] = [
  // Connection strings with credentials (postgres://user:pass@host, mongodb://, redis://, etc.)
  /\b\w+:\/\/[^:]+:[^@]+@[^\s]+/gi,
  // Authorization header values
  /(?:authorization|x-api-key)\s*[:=]\s*\S+/gi,
];

/**
 * Redact sensitive content from log/error text.
 * Applies both core ambient patterns and server-specific patterns.
 */
export function redactForLog(text: string): string {
  // First pass: core patterns
  let result = redactSensitive(text).text;

  // Second pass: server-specific patterns
  for (const pattern of SERVER_PATTERNS) {
    pattern.lastIndex = 0;
    result = result.replace(pattern, "[REDACTED]");
  }

  return result;
}
