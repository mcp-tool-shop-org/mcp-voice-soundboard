import { describe, it, expect } from "vitest";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  buildArtifactConfig,
  resolveOutputDir,
  defaultOutputRoot,
  OutputDirError,
} from "../src/artifact.js";

describe("buildArtifactConfig", () => {
  it("applies defaults", () => {
    const config = buildArtifactConfig();
    expect(config.mode).toBe("path");
    expect(config.format).toBe("wav");
    expect(config.outputDir).toBeUndefined();
  });

  it("accepts overrides", () => {
    const config = buildArtifactConfig({
      mode: "base64",
      format: "mp3",
      outputDir: "/some/dir",
    });
    expect(config.mode).toBe("base64");
    expect(config.format).toBe("mp3");
    expect(config.outputDir).toBe("/some/dir");
  });
});

describe("defaultOutputRoot", () => {
  it("returns a path under OS temp dir", () => {
    const root = defaultOutputRoot();
    expect(root).toContain("voice-soundboard");
  });
});

describe("resolveOutputDir", () => {
  it("returns root when outputDir is undefined", async () => {
    const root = join(tmpdir(), "vsmcp-test-sandbox");
    const resolved = await resolveOutputDir(undefined, root);
    expect(resolved).toBe(root);
  });

  it("resolves subdirectory within root", async () => {
    const root = join(tmpdir(), "vsmcp-test-sandbox");
    const resolved = await resolveOutputDir("subdir", root);
    expect(resolved).toBe(join(root, "subdir"));
  });

  it("rejects path traversal", async () => {
    const root = join(tmpdir(), "vsmcp-test-sandbox");
    await expect(resolveOutputDir("../../etc", root)).rejects.toThrow(OutputDirError);
  });

  it("rejects absolute paths outside root", async () => {
    const root = join(tmpdir(), "vsmcp-test-sandbox");
    // On Windows, an absolute path like C:\Windows would escape
    // On Unix, /etc would escape
    const absPath = process.platform === "win32" ? "C:\\Windows" : "/etc";
    await expect(resolveOutputDir(absPath, root)).rejects.toThrow(OutputDirError);
  });
});
