#!/usr/bin/env node
/** CLI entrypoint — starts the MCP server over stdio. */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";
import { MockBackend } from "./backend.js";

async function main(): Promise<void> {
  const backend = new MockBackend();
  const server = createServer({ backend });
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("voice-soundboard-mcp fatal:", error);
  process.exit(1);
});
