/**
 * Base error type for the voice soundboard stack.
 *
 * Every error carries:
 *   code      — machine-readable, stable once released
 *   message   — what went wrong
 *   hint      — what the user should do about it
 *   retryable — can the caller safely retry?
 *   cause     — original error (optional)
 *
 * See: https://github.com/mcp-tool-shop-org/shipcheck/blob/main/contracts/error-contract.md
 */

import type { VoiceErrorCode } from "./schemas.js";

export class SoundboardError extends Error {
  readonly code: string;
  readonly hint: string;
  readonly retryable: boolean;
  override readonly cause?: Error;

  constructor(
    code: string,
    message: string,
    hint: string,
    opts?: { retryable?: boolean; cause?: Error },
  ) {
    super(message);
    this.name = "SoundboardError";
    this.code = code;
    this.hint = hint;
    this.retryable = opts?.retryable ?? false;
    this.cause = opts?.cause;
  }

  /** Safe output — no stack traces. For MCP responses. */
  toSafeText(): string {
    const lines = [`Error [${this.code}]: ${this.message}`, `Hint: ${this.hint}`];
    if (this.cause) lines.push(`Cause: ${this.cause.message}`);
    return lines.join("\n");
  }

  /** Debug output — includes stack. For --debug / stderr. */
  toDebugText(): string {
    const lines = [`[${this.code}] ${this.message}`, `  Hint: ${this.hint}`];
    if (this.cause) {
      lines.push(`  Cause: ${this.cause.message}`);
      if (this.cause.stack) lines.push(`  Stack: ${this.cause.stack}`);
    }
    return lines.join("\n");
  }
}

/** Wrap any thrown value into a SoundboardError. */
export function wrapError(err: unknown, code: string, hint: string): SoundboardError {
  if (err instanceof SoundboardError) return err;
  const cause = err instanceof Error ? err : new Error(String(err));
  return new SoundboardError(code, cause.message, hint, { cause });
}
