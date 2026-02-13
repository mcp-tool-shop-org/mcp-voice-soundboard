/**
 * AmbientEmitter — manages ephemeral inner-monologue entries.
 *
 * Features:
 * - Global rate limiting (min interval between emissions)
 * - Per-category cooldowns
 * - FIFO buffer with max size
 * - TTL-based expiry
 * - Sensitive content redaction
 */

import { randomUUID } from "node:crypto";
import type {
  AmbientCategory,
  AmbientConfig,
  AmbientEntry,
  AmbientResult,
} from "./types.js";
import { redactSensitive } from "./redact.js";

const DEFAULT_CONFIG: AmbientConfig = {
  enabled: false,
  globalCooldownMs: 10_000,
  categoryCooldownMs: 15_000,
  maxBufferSize: 5,
  ttlMs: 60_000,
  maxTextLength: 500,
};

export class AmbientEmitter {
  private readonly config: AmbientConfig;
  private readonly buffer: AmbientEntry[] = [];
  private lastEmitTime = 0;
  private readonly categoryCooldowns = new Map<AmbientCategory, number>();

  constructor(config?: Partial<AmbientConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /** Whether the ambient system is enabled. */
  get enabled(): boolean {
    return this.config.enabled;
  }

  /** Current buffer contents (expired entries are pruned). */
  get entries(): readonly AmbientEntry[] {
    this.pruneExpired();
    return [...this.buffer];
  }

  /** Number of entries in the buffer. */
  get size(): number {
    this.pruneExpired();
    return this.buffer.length;
  }

  /**
   * Submit a thought for emission.
   * Returns accepted entry or rejection reason.
   */
  emitThought(text: string, category: AmbientCategory = "general"): AmbientResult {
    if (!this.config.enabled) {
      return { accepted: false, reason: "Ambient system is disabled", code: "AMBIENT_DISABLED" };
    }

    if (!text || !text.trim()) {
      return { accepted: false, reason: "Empty text", code: "AMBIENT_EMPTY" };
    }

    // Enforce text length limit
    const trimmed = text.trim();
    if (trimmed.length > this.config.maxTextLength) {
      return {
        accepted: false,
        reason: `Text exceeds max length (${this.config.maxTextLength} chars)`,
        code: "AMBIENT_TOO_LONG",
      };
    }

    // Check global rate limit
    const now = Date.now();
    if (now - this.lastEmitTime < this.config.globalCooldownMs) {
      const waitMs = this.config.globalCooldownMs - (now - this.lastEmitTime);
      return {
        accepted: false,
        reason: `Rate limited (global cooldown, ${Math.ceil(waitMs / 1000)}s remaining)`,
        code: "AMBIENT_RATE_LIMITED",
      };
    }

    // Check per-category cooldown
    const lastCategorySend = this.categoryCooldowns.get(category) ?? 0;
    if (now - lastCategorySend < this.config.categoryCooldownMs) {
      const waitMs = this.config.categoryCooldownMs - (now - lastCategorySend);
      return {
        accepted: false,
        reason: `Rate limited (${category} cooldown, ${Math.ceil(waitMs / 1000)}s remaining)`,
        code: "AMBIENT_CATEGORY_COOLDOWN",
      };
    }

    // Redact sensitive content
    const { text: redactedText, redacted } = redactSensitive(trimmed);

    // Create entry
    const entry: AmbientEntry = {
      id: randomUUID().slice(0, 8),
      text: redactedText,
      category,
      createdAt: now,
      expiresAt: now + this.config.ttlMs,
      redacted,
    };

    // Add to buffer (FIFO eviction if full)
    this.pruneExpired();
    while (this.buffer.length >= this.config.maxBufferSize) {
      this.buffer.shift();
    }
    this.buffer.push(entry);

    // Update cooldowns
    this.lastEmitTime = now;
    this.categoryCooldowns.set(category, now);

    return { accepted: true, entry };
  }

  /** Remove expired entries from the buffer. */
  private pruneExpired(): void {
    const now = Date.now();
    let i = 0;
    while (i < this.buffer.length) {
      if (this.buffer[i].expiresAt <= now) {
        this.buffer.splice(i, 1);
      } else {
        i++;
      }
    }
  }

  /** Clear all entries and reset cooldowns. */
  clear(): void {
    this.buffer.length = 0;
    this.lastEmitTime = 0;
    this.categoryCooldowns.clear();
  }
}
