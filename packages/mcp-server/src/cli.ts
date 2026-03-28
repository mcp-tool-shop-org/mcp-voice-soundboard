#!/usr/bin/env node
/**
 * CLI entrypoint — starts the MCP server over stdio or HTTP.
 *
 * Mode selection:
 * - PORT env var set → HTTP mode (for Fly.io / remote deployment)
 * - No PORT → STDIO mode (for local Claude Desktop / CLI usage)
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { defaultOutputRoot, type ArtifactMode } from "@mcptoolshop/voice-soundboard-core";
import { createServer, type ServerOptions } from "./server.js";
import { readBackendConfig, selectBackend, type Backend } from "./backend.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(__dirname, "..", "package.json"), "utf-8"));

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

  // Env var fallbacks for timeout and max-concurrent (HX-012)
  if (requestTimeoutMs == null && process.env.VOICE_SOUNDBOARD_TIMEOUT) {
    const val = parseInt(process.env.VOICE_SOUNDBOARD_TIMEOUT, 10);
    if (val > 0) requestTimeoutMs = val;
  }
  if (maxConcurrent == null && process.env.VOICE_SOUNDBOARD_MAX_CONCURRENT) {
    const val = parseInt(process.env.VOICE_SOUNDBOARD_MAX_CONCURRENT, 10);
    if (val > 0) maxConcurrent = val;
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

  // CORS — allow browser clients (e.g. Registry Pulse dashboard) to call the MCP endpoint
  app.use((_req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, mcp-session-id");
    res.setHeader("Access-Control-Expose-Headers", "mcp-session-id");
    if (_req.method === "OPTIONS") { res.status(204).end(); return; }
    next();
  });

  // Health check for Fly.io / load balancers
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", server: SERVER_NAME, version: pkg.version });
  });

  // Session management with limits (MCP-008)
  const MAX_SESSIONS = 100;
  const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
  const sessions = new Map<string, StreamableHTTPServerTransport>();
  const sessionLastActive = new Map<string, number>();

  // Periodic cleanup of idle sessions
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [sid, lastActive] of sessionLastActive) {
      if (now - lastActive > SESSION_IDLE_TIMEOUT_MS) {
        const transport = sessions.get(sid);
        if (transport) {
          transport.close?.();
        }
        sessions.delete(sid);
        sessionLastActive.delete(sid);
        console.error(`[${SERVER_NAME}] Session expired (idle): ${sid}`);
      }
    }
  }, 60_000); // Check every minute
  cleanupInterval.unref(); // Don't prevent process exit

  app.post("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    let transport: StreamableHTTPServerTransport;

    if (sessionId && sessions.has(sessionId)) {
      transport = sessions.get(sessionId)!;
      sessionLastActive.set(sessionId, Date.now());
    } else if (!sessionId) {
      // Reject if session limit reached
      if (sessions.size >= MAX_SESSIONS) {
        res.status(503).json({ error: "Too many active sessions" });
        return;
      }
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => {
          sessions.set(id, transport);
          sessionLastActive.set(id, Date.now());
          console.error(`[${SERVER_NAME}] Session created: ${id}`);
        },
      });
      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid) {
          sessions.delete(sid);
          sessionLastActive.delete(sid);
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

  const httpServer = app.listen(port, "0.0.0.0", () => {
    console.error(`[${SERVER_NAME}] Transport: HTTP (Streamable)`);
    console.error(`[${SERVER_NAME}] Listening on http://0.0.0.0:${port}/mcp`);
    console.error(`[${SERVER_NAME}] Health check: http://0.0.0.0:${port}/health`);
  });

  // PH-013: Graceful shutdown — stop accepting, drain sessions, exit
  let shuttingDown = false;
  const gracefulShutdown = (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.error(`[${SERVER_NAME}] ${signal} received, shutting down gracefully...`);
    clearInterval(cleanupInterval);

    // Stop accepting new connections
    httpServer.close(() => {
      console.error(`[${SERVER_NAME}] HTTP server closed`);
    });

    // Close all active sessions
    for (const [sid, transport] of sessions) {
      transport.close?.();
      sessions.delete(sid);
      sessionLastActive.delete(sid);
    }

    // Allow a brief drain period, then force exit
    setTimeout(() => {
      console.error(`[${SERVER_NAME}] Shutdown complete`);
      process.exit(0);
    }, 3000);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);

  if (argv.includes("--version") || argv.includes("-V")) {
    console.log(`voice-soundboard-mcp ${pkg.version}`);
    process.exit(0);
  }

  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(`voice-soundboard-mcp ${pkg.version} — MCP server for text-to-speech

Usage:
  voice-soundboard-mcp [options]         Start MCP server (stdio)
  PORT=8080 voice-soundboard-mcp         Start MCP server (HTTP)

Options:
  --version, -V                  Print version and exit
  --help, -h                     Show this help
  --backend=<type>               Backend: mock | http | python (default: mock)
  --artifact=<mode>              Delivery: path | base64 (default: path)
  --output-dir=<path>            Audio output directory
  --ambient                      Enable inner monologue system
  --max-concurrent=<n>           Max concurrent synthesis (default: 3)
  --timeout=<ms>                 Request timeout in ms (default: 60000)
  --retention-minutes=<n>        Audio file retention (0 = keep forever)

Environment variables:
  PORT                              Set to enable HTTP mode
  VOICE_SOUNDBOARD_BACKEND          Same as --backend
  VOICE_SOUNDBOARD_HTTP_URL         HTTP backend URL
  VOICE_SOUNDBOARD_OUTPUT_DIR       Same as --output-dir
  VOICE_SOUNDBOARD_AMBIENT_ENABLED  1 to enable ambient mode
  VOICE_SOUNDBOARD_TIMEOUT          Same as --timeout
  VOICE_SOUNDBOARD_MAX_CONCURRENT   Same as --max-concurrent`);
    process.exit(0);
  }

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
