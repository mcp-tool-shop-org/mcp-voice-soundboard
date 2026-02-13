import { describe, it, expect, beforeEach } from "vitest";
import {
  AmbientEmitter,
  AMBIENT_CATEGORIES,
  redactSensitive,
} from "../src/ambient/index.js";

// ── Redaction ──

describe("redactSensitive", () => {
  it("redacts API keys", () => {
    const result = redactSensitive("my key is token_fake_xxxxxxxxxxxxxxxxxxxxxxxxx");
    expect(result.redacted).toBe(true);
    expect(result.text).toContain("[REDACTED]");
    expect(result.text).not.toContain("token_fake_xxx");
  });

  it("redacts JWT tokens", () => {
    const jwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U";
    const result = redactSensitive(`Token: ${jwt}`);
    expect(result.redacted).toBe(true);
    expect(result.text).toContain("[REDACTED]");
  });

  it("redacts password assignments", () => {
    const result = redactSensitive("password=mySecretP@ss!");
    expect(result.redacted).toBe(true);
    expect(result.text).not.toContain("mySecretP@ss");
  });

  it("redacts sensitive file paths", () => {
    const result = redactSensitive("Loading /home/user/.env.local");
    expect(result.redacted).toBe(true);
    expect(result.text).toContain("[REDACTED]");
  });

  it("redacts email addresses", () => {
    const result = redactSensitive("Contact user@example.com for details");
    expect(result.redacted).toBe(true);
    expect(result.text).not.toContain("user@example.com");
  });

  it("redacts IP addresses", () => {
    const result = redactSensitive("Server at 192.168.1.100");
    expect(result.redacted).toBe(true);
    expect(result.text).not.toContain("192.168.1.100");
  });

  it("leaves clean text unchanged", () => {
    const result = redactSensitive("Just a normal thought about code architecture");
    expect(result.redacted).toBe(false);
    expect(result.text).toBe("Just a normal thought about code architecture");
  });
});

// ── AmbientEmitter — disabled ──

describe("AmbientEmitter — disabled", () => {
  it("rejects when disabled (default)", () => {
    const emitter = new AmbientEmitter();
    const result = emitter.emitThought("Hello");
    expect(result.accepted).toBe(false);
    if (!result.accepted) {
      expect(result.code).toBe("AMBIENT_DISABLED");
    }
  });

  it("reports enabled=false", () => {
    const emitter = new AmbientEmitter();
    expect(emitter.enabled).toBe(false);
  });
});

// ── AmbientEmitter — enabled ──

describe("AmbientEmitter — enabled", () => {
  let emitter: AmbientEmitter;

  beforeEach(() => {
    emitter = new AmbientEmitter({
      enabled: true,
      globalCooldownMs: 0,
      categoryCooldownMs: 0,
      maxBufferSize: 5,
      ttlMs: 60_000,
    });
  });

  it("accepts a thought", () => {
    const result = emitter.emitThought("Thinking about the problem");
    expect(result.accepted).toBe(true);
    if (result.accepted) {
      expect(result.entry.text).toBe("Thinking about the problem");
      expect(result.entry.category).toBe("general");
      expect(result.entry.id).toBeTruthy();
    }
  });

  it("uses specified category", () => {
    const result = emitter.emitThought("Debug info", "debug");
    expect(result.accepted).toBe(true);
    if (result.accepted) {
      expect(result.entry.category).toBe("debug");
    }
  });

  it("rejects empty text", () => {
    const result = emitter.emitThought("");
    expect(result.accepted).toBe(false);
    if (!result.accepted) {
      expect(result.code).toBe("AMBIENT_EMPTY");
    }
  });

  it("rejects text exceeding max length", () => {
    const longText = "x".repeat(501);
    const result = emitter.emitThought(longText);
    expect(result.accepted).toBe(false);
    if (!result.accepted) {
      expect(result.code).toBe("AMBIENT_TOO_LONG");
    }
  });

  it("fills buffer and evicts oldest", () => {
    for (let i = 0; i < 6; i++) {
      emitter.emitThought(`Thought ${i}`);
    }
    expect(emitter.size).toBe(5);
    // Oldest (Thought 0) should be evicted
    expect(emitter.entries[0].text).toBe("Thought 1");
  });

  it("redacts sensitive content", () => {
    const result = emitter.emitThought("Using key token_fake_xxxxxxxxxxxxxxxxxxxxxxxxx");
    expect(result.accepted).toBe(true);
    if (result.accepted) {
      expect(result.entry.redacted).toBe(true);
      expect(result.entry.text).toContain("[REDACTED]");
    }
  });

  it("clear resets buffer and cooldowns", () => {
    emitter.emitThought("First");
    expect(emitter.size).toBe(1);
    emitter.clear();
    expect(emitter.size).toBe(0);
  });
});

// ── AmbientEmitter — rate limiting ──

describe("AmbientEmitter — rate limiting", () => {
  it("enforces global cooldown", () => {
    const emitter = new AmbientEmitter({
      enabled: true,
      globalCooldownMs: 10_000,
      categoryCooldownMs: 0,
    });
    const first = emitter.emitThought("First");
    expect(first.accepted).toBe(true);

    const second = emitter.emitThought("Second");
    expect(second.accepted).toBe(false);
    if (!second.accepted) {
      expect(second.code).toBe("AMBIENT_RATE_LIMITED");
    }
  });

  it("enforces category cooldown", () => {
    const emitter = new AmbientEmitter({
      enabled: true,
      globalCooldownMs: 0,
      categoryCooldownMs: 10_000,
    });
    const first = emitter.emitThought("First", "debug");
    expect(first.accepted).toBe(true);

    // Same category should be blocked
    const second = emitter.emitThought("Second", "debug");
    expect(second.accepted).toBe(false);
    if (!second.accepted) {
      expect(second.code).toBe("AMBIENT_CATEGORY_COOLDOWN");
    }

    // Different category should be allowed
    const third = emitter.emitThought("Third", "thinking");
    expect(third.accepted).toBe(true);
  });
});

// ── Categories ──

describe("AMBIENT_CATEGORIES", () => {
  it("has 4 categories", () => {
    expect(AMBIENT_CATEGORIES).toHaveLength(4);
    expect(AMBIENT_CATEGORIES).toContain("general");
    expect(AMBIENT_CATEGORIES).toContain("thinking");
    expect(AMBIENT_CATEGORIES).toContain("observation");
    expect(AMBIENT_CATEGORIES).toContain("debug");
  });
});
