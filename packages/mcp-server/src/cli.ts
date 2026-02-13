#!/usr/bin/env node
/** CLI entrypoint — starts the MCP server over stdio. */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";
import { readBackendConfig, selectBackend } from "./backend.js";

async function main(): Promise<void> {
  const config = readBackendConfig(process.argv.slice(2));
  const backend = await selectBackend(config);
  const server = createServer({ backend });
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("voice-soundboard-mcp fatal:", error);
  process.exit(1);
});
