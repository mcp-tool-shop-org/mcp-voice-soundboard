#!/usr/bin/env node
/** CLI entrypoint — starts the MCP server over stdio. */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { defaultOutputRoot, type ArtifactMode } from "@mcptoolshop/voice-soundboard-core";
import { createServer } from "./server.js";
import { readBackendConfig, selectBackend } from "./backend.js";

function parseCliFlags(argv: string[]): {
  artifactMode?: ArtifactMode;
  outputRoot?: string;
  ambient?: boolean;
  maxConcurrent?: number;
  requestTimeoutMs?: number;
  retentionMinutes?: number;
} {
  let artifactMode: ArtifactMode | undefined;
  let outputRoot: string | undefined;
  let ambient: boolean | undefined;
  let maxConcurrent: number | undefined;
  let requestTimeoutMs: number | undefined;
  let retentionMinutes: number | undefined;

  for (const arg of argv) {
    if (arg.startsWith("--artifact=")) {
      const val = arg.slice("--artifact=".length);
      if (val === "path" || val === "base64") {
        artifactMode = val;
      }
    }
    if (arg.startsWith("--output-dir=")) {
      outputRoot = arg.slice("--output-dir=".length);
    }
    if (arg === "--ambient") {
      ambient = true;
    }
    if (arg.startsWith("--max-concurrent=")) {
      const val = parseInt(arg.slice("--max-concurrent=".length), 10);
      if (val > 0) maxConcurrent = val;
    }
    if (arg.startsWith("--timeout=")) {
      const val = parseInt(arg.slice("--timeout=".length), 10);
      if (val > 0) requestTimeoutMs = val;
    }
    if (arg.startsWith("--retention-minutes=")) {
      const val = parseInt(arg.slice("--retention-minutes=".length), 10);
      if (val >= 0) retentionMinutes = val;
    }
  }

  return { artifactMode, outputRoot, ambient, maxConcurrent, requestTimeoutMs, retentionMinutes };
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const backendConfig = readBackendConfig(argv);
  const { artifactMode, outputRoot, ambient, maxConcurrent, requestTimeoutMs, retentionMinutes } = parseCliFlags(argv);

  const backend = await selectBackend(backendConfig);
  const server = createServer({
    backend,
    defaultArtifactMode: artifactMode,
    outputRoot: outputRoot ?? defaultOutputRoot(),
    ambient,
    maxConcurrent,
    requestTimeoutMs,
    retentionMinutes,
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("voice-soundboard-mcp fatal:", error);
  process.exit(1);
});
