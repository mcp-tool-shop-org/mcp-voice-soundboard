import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, writeFile, readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { cleanupOutputRoot, startRetentionTimer } from "../src/retention.js";

describe("cleanupOutputRoot", () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), "retention-test-"));
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it("deletes stale vsmcp_ files", async () => {
    // Create a file and backdate its mtime
    const filePath = join(testDir, "vsmcp_abc12345_1000.wav");
    await writeFile(filePath, "fake audio data");

    // Set mtime to 5 hours ago (> 240 min default)
    const fiveHoursAgo = Date.now() - 5 * 60 * 60 * 1000;
    const { utimes } = await import("node:fs/promises");
    const date = new Date(fiveHoursAgo);
    await utimes(filePath, date, date);

    const deleted = await cleanupOutputRoot(testDir, 240);
    expect(deleted).toBe(1);

    const remaining = await readdir(testDir);
    expect(remaining).toHaveLength(0);
  });

  it("keeps recent vsmcp_ files", async () => {
    const filePath = join(testDir, "vsmcp_abc12345_recent.wav");
    await writeFile(filePath, "recent audio data");

    const deleted = await cleanupOutputRoot(testDir, 240);
    expect(deleted).toBe(0);

    const remaining = await readdir(testDir);
    expect(remaining).toHaveLength(1);
  });

  it("ignores non-vsmcp_ files", async () => {
    const safeFile = join(testDir, "important_data.txt");
    await writeFile(safeFile, "do not delete");

    // Backdate the file
    const oldDate = new Date(Date.now() - 10 * 60 * 60 * 1000);
    const { utimes } = await import("node:fs/promises");
    await utimes(safeFile, oldDate, oldDate);

    const deleted = await cleanupOutputRoot(testDir, 240);
    expect(deleted).toBe(0);

    const remaining = await readdir(testDir);
    expect(remaining).toHaveLength(1);
  });

  it("returns 0 for non-existent directory", async () => {
    const deleted = await cleanupOutputRoot("/nonexistent/path/xyz");
    expect(deleted).toBe(0);
  });

  it("respects custom maxAgeMinutes", async () => {
    const filePath = join(testDir, "vsmcp_test_1.wav");
    await writeFile(filePath, "data");

    // Backdate 10 minutes
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
    const { utimes } = await import("node:fs/promises");
    await utimes(filePath, tenMinAgo, tenMinAgo);

    // 60 min retention — file should survive
    expect(await cleanupOutputRoot(testDir, 60)).toBe(0);

    // 5 min retention — file should be deleted
    expect(await cleanupOutputRoot(testDir, 5)).toBe(1);
  });
});

describe("startRetentionTimer", () => {
  it("returns a handle with stop method", () => {
    const handle = startRetentionTimer(tmpdir(), 240);
    expect(typeof handle.stop).toBe("function");
    handle.stop(); // Clean up
  });
});
