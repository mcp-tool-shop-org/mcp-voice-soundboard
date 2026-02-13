/** Conservative limits for synthesis requests. */

export const LIMITS = {
  /** Maximum text length in characters. */
  maxTextLength: 10_000,
  /** Maximum speed multiplier. */
  maxSpeed: 2.0,
  /** Minimum speed multiplier. */
  minSpeed: 0.5,
  /** Default speed multiplier. */
  defaultSpeed: 1.0,
} as const;

export class LimitError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "LimitError";
  }
}

/** Validate text is non-empty and within length limits. */
export function validateText(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    throw new LimitError("Text must not be empty", "TEXT_EMPTY");
  }
  if (trimmed.length > LIMITS.maxTextLength) {
    throw new LimitError(
      `Text exceeds maximum length of ${LIMITS.maxTextLength} characters (got ${trimmed.length})`,
      "TEXT_TOO_LONG",
      { maxLength: LIMITS.maxTextLength, actualLength: trimmed.length },
    );
  }
  return trimmed;
}

/** Validate speed is within allowed range. */
export function validateSpeed(speed: number | undefined): number {
  if (speed === undefined) return LIMITS.defaultSpeed;
  if (speed < LIMITS.minSpeed || speed > LIMITS.maxSpeed) {
    throw new LimitError(
      `Speed must be between ${LIMITS.minSpeed} and ${LIMITS.maxSpeed} (got ${speed})`,
      "SPEED_OUT_OF_RANGE",
      { min: LIMITS.minSpeed, max: LIMITS.maxSpeed, actual: speed },
    );
  }
  return speed;
}
