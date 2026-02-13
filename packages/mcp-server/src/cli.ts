#!/usr/bin/env node
/** CLI entrypoint — starts the MCP server over stdio. */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { defaultOutputRoot, type ArtifactMode } from "@mcp-tool-shop/voice-soundboard-core";
import { createServer } from "./server.js";
import { readBackendConfig, selectBackend } from "./backend.js";

function parseCliFlags(argv: string[]): {
  artifactMode?: ArtifactMode;
  outputRoot?: string;
} {
  let artifactMode: ArtifactMode | undefined;
  let outputRoot: string | undefined;

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
  }

  return { artifactMode, outputRoot };
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const backendConfig = readBackendConfig(argv);
  const { artifactMode, outputRoot } = parseCliFlags(argv);

  const backend = await selectBackend(backendConfig);
  const server = createServer({
    backend,
    defaultArtifactMode: artifactMode,
    outputRoot: outputRoot ?? defaultOutputRoot(),
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("voice-soundboard-mcp fatal:", error);
  process.exit(1);
});
