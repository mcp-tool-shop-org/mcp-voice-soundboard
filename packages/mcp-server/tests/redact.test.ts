import { describe, it, expect } from "vitest";
import { redactForLog } from "../src/redact.js";

describe("redactForLog", () => {
  it("redacts API keys (from core patterns)", () => {
    const result = redactForLog("Error with token_fake_xxxxxxxxxxxxxxxxxxxxxxxxx");
    expect(result).toContain("[REDACTED]");
    expect(result).not.toContain("token_fake_xxx");
  });

  it("redacts JWT tokens (from core patterns)", () => {
    const jwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U";
    const result = redactForLog(`Bearer ${jwt}`);
    expect(result).toContain("[REDACTED]");
  });

  it("redacts connection strings", () => {
    const result = redactForLog("postgres://admin:secret123@db.example.com:5432/mydb");
    expect(result).toContain("[REDACTED]");
    expect(result).not.toContain("secret123");
  });

  it("redacts authorization headers", () => {
    const result = redactForLog("authorization: Bearer sk_live_supersecretkey");
    expect(result).toContain("[REDACTED]");
    expect(result).not.toContain("supersecretkey");
  });

  it("redacts x-api-key headers", () => {
    const result = redactForLog("x-api-key=my_very_secret_api_key_12345678");
    expect(result).toContain("[REDACTED]");
  });

  it("redacts email addresses", () => {
    const result = redactForLog("Contact admin@secret.internal.corp");
    expect(result).toContain("[REDACTED]");
    expect(result).not.toContain("admin@secret");
  });

  it("leaves clean text unchanged", () => {
    const text = "Synthesis completed successfully in 250ms";
    expect(redactForLog(text)).toBe(text);
  });
});
