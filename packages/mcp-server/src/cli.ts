#!/usr/bin/env node
/**
 * CLI entrypoint — starts the MCP server over stdio or HTTP.
 *
 * Mode selection:
 * - PORT env var set → HTTP mode (for Fly.io / remote deployment)
 * - No PORT → STDIO mode (for local Claude Desktop / CLI usage)
 */

import { randomUUID } from "node:crypto";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { defaultOutputRoot, type ArtifactMode } from "@mcptoolshop/voice-soundboard-core";
import { createServer, type ServerOptions } from "./server.js";
import { readBackendConfig, selectBackend, type Backend } from "./backend.js";

const SERVER_NAME = "voice-soundboard-mcp";

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

function buildServerOptions(backend: Backend, flags: ReturnType<typeof parseCliFlags>): ServerOptions {
  return {
    backend,
    defaultArtifactMode: flags.artifactMode,
    outputRoot: flags.outputRoot ?? defaultOutputRoot(),
    ambient: flags.ambient,
    maxConcurrent: flags.maxConcurrent,
    requestTimeoutMs: flags.requestTimeoutMs,
    retentionMinutes: flags.retentionMinutes,
  };
}

async function startHttpServer(backend: Backend, flags: ReturnType<typeof parseCliFlags>, port: number): Promise<void> {
  const { default: express } = await import("express");

  const app = express();
  app.use(express.json());

  // Health check for Fly.io / load balancers
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", server: SERVER_NAME, version: "0.1.2" });
  });

  // Session management
  const sessions = new Map<string, StreamableHTTPServerTransport>();

  app.post("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    let transport: StreamableHTTPServerTransport;

    if (sessionId && sessions.has(sessionId)) {
      transport = sessions.get(sessionId)!;
    } else if (!sessionId) {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => {
          sessions.set(id, transport);
          console.error(`[${SERVER_NAME}] Session created: ${id}`);
        },
      });
      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid) {
          sessions.delete(sid);
          console.error(`[${SERVER_NAME}] Session closed: ${sid}`);
        }
      };
      const server = createServer(buildServerOptions(backend, flags));
      await server.connect(transport);
    } else {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    await transport.handleRequest(req, res, req.body);
  });

  app.get("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !sessions.has(sessionId)) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    await sessions.get(sessionId)!.handleRequest(req, res);
  });

  app.delete("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !sessions.has(sessionId)) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    await sessions.get(sessionId)!.handleRequest(req, res);
  });

  app.listen(port, "0.0.0.0", () => {
    console.error(`[${SERVER_NAME}] Transport: HTTP (Streamable)`);
    console.error(`[${SERVER_NAME}] Listening on http://0.0.0.0:${port}/mcp`);
    console.error(`[${SERVER_NAME}] Health check: http://0.0.0.0:${port}/health`);
  });
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const backendConfig = readBackendConfig(argv);
  const flags = parseCliFlags(argv);

  const backend = await selectBackend(backendConfig);
  console.error(`[${SERVER_NAME}] Backend: ${backend.type} (ready: ${backend.ready})`);

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : undefined;

  if (port) {
    await startHttpServer(backend, flags, port);
  } else {
    const server = createServer(buildServerOptions(backend, flags));
    const transport = new StdioServerTransport();
    console.error(`[${SERVER_NAME}] Transport: stdio`);
    await server.connect(transport);
  }
}

main().catch((error) => {
  console.error("voice-soundboard-mcp fatal:", error);
  process.exit(1);
});
