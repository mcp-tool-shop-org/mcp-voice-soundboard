import { describe, it, expect } from "vitest";
import { generateSafeFilename, SAFE_FILE_PREFIX, isSymlink } from "../src/sandbox.js";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("generateSafeFilename", () => {
  it("starts with vsmcp_ prefix", () => {
    const name = generateSafeFilename();
    expect(name.startsWith(SAFE_FILE_PREFIX)).toBe(true);
  });

  it("ends with .wav by default", () => {
    const name = generateSafeFilename();
    expect(name.endsWith(".wav")).toBe(true);
  });

  it("ends with specified format", () => {
    expect(generateSafeFilename("mp3").endsWith(".mp3")).toBe(true);
    expect(generateSafeFilename("ogg").endsWith(".ogg")).toBe(true);
    expect(generateSafeFilename("raw").endsWith(".raw")).toBe(true);
  });

  it("generates unique names", () => {
    const names = new Set(Array.from({ length: 100 }, () => generateSafeFilename()));
    expect(names.size).toBe(100);
  });

  it("contains a timestamp", () => {
    const before = Date.now();
    const name = generateSafeFilename();
    const after = Date.now();

    // Extract timestamp from name: vsmcp_<uuid8>_<timestamp>.wav
    const parts = name.replace(".wav", "").split("_");
    const ts = parseInt(parts[parts.length - 1], 10);
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });
});

describe("SAFE_FILE_PREFIX", () => {
  it("is vsmcp_", () => {
    expect(SAFE_FILE_PREFIX).toBe("vsmcp_");
  });
});

describe("isSymlink", () => {
  it("returns false for non-existent path", async () => {
    const result = await isSymlink(join(tmpdir(), "nonexistent_path_xyz_12345"));
    expect(result).toBe(false);
  });

  it("returns false for a real directory", async () => {
    const result = await isSymlink(tmpdir());
    expect(result).toBe(false);
  });
});
