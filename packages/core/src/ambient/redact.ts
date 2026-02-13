/** Ambient redaction — strip sensitive patterns from monologue text. */

export interface RedactResult {
  readonly text: string;
  readonly redacted: boolean;
}

/**
 * Patterns that indicate sensitive content.
 * Each regex is applied globally; matched content is replaced with [REDACTED].
 */
const SENSITIVE_PATTERNS: readonly RegExp[] = [
  // API keys and tokens (common formats: sk_live_xxx, pk_test_xxx, api_key_xxx, etc.)
  /\b(?:sk|pk|api|key|token|secret|bearer)[_-][a-zA-Z0-9_-]{16,}\b/gi,
  // AWS-style keys
  /\bAKIA[A-Z0-9]{16}\b/g,
  // JWT tokens
  /\beyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b/g,
  // Passwords in common formats
  /(?:password|passwd|pwd)\s*[:=]\s*\S+/gi,
  // File paths with sensitive names
  /(?:\/|\\)(?:\.env|credentials|secrets?|private[_-]?key|id_rsa)[^\s]*/gi,
  // Email addresses (potential PII)
  /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
  // IP addresses
  /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
];

/**
 * Redact sensitive patterns from text.
 * Returns the redacted text and whether any redaction occurred.
 */
export function redactSensitive(text: string): RedactResult {
  let result = text;
  let redacted = false;

  for (const pattern of SENSITIVE_PATTERNS) {
    // Reset lastIndex for global regexps
    pattern.lastIndex = 0;
    if (pattern.test(result)) {
      redacted = true;
      pattern.lastIndex = 0;
      result = result.replace(pattern, "[REDACTED]");
    }
  }

  return { text: result, redacted };
}
