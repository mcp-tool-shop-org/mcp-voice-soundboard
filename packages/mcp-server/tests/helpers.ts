/** Test helpers — spawn the MCP server and send JSON-RPC messages. */

import { spawn, type ChildProcess } from "node:child_process";
import { resolve } from "node:path";

const CLI_PATH = resolve(import.meta.dirname, "..", "dist", "cli.js");

export interface McpTestClient {
  send(message: Record<string, unknown>): void;
  receive(): Promise<Record<string, unknown>>;
  close(): void;
}

export interface SpawnOptions {
  /** Extra CLI args (e.g. ["--backend=http"]). */
  args?: string[];
  /** Extra env vars to set. */
  env?: Record<string, string>;
}

/**
 * Spawn the MCP server and return a simple test client.
 * Messages are newline-delimited JSON over stdio.
 */
export function spawnServer(opts?: SpawnOptions): McpTestClient {
  const cliArgs = opts?.args ?? [];
  const extraEnv = opts?.env ?? {};

  const proc: ChildProcess = spawn("node", [CLI_PATH, ...cliArgs], {
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env, ...extraEnv },
  });

  let buffer = "";
  const messageQueue: Record<string, unknown>[] = [];
  let resolver: ((msg: Record<string, unknown>) => void) | null = null;

  proc.stdout!.on("data", (chunk: Buffer) => {
    buffer += chunk.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop()!;
    for (const line of lines) {
      if (line.trim()) {
        const msg = JSON.parse(line) as Record<string, unknown>;
        if (resolver) {
          const r = resolver;
          resolver = null;
          r(msg);
        } else {
          messageQueue.push(msg);
        }
      }
    }
  });

  return {
    send(message) {
      proc.stdin!.write(JSON.stringify(message) + "\n");
    },

    receive() {
      if (messageQueue.length > 0) {
        return Promise.resolve(messageQueue.shift()!);
      }
      return new Promise((resolve) => {
        resolver = resolve;
      });
    },

    close() {
      proc.stdin!.end();
      proc.kill();
    },
  };
}

/** Initialize the MCP handshake and return the client ready for tool calls. */
export async function initClient(opts?: SpawnOptions): Promise<McpTestClient> {
  const client = spawnServer(opts);

  client.send({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-03-26",
      capabilities: {},
      clientInfo: { name: "e2e-test", version: "1.0.0" },
    },
  });

  const initResp = await client.receive();
  if ((initResp as any).error) {
    throw new Error(`Init failed: ${JSON.stringify(initResp)}`);
  }

  client.send({
    jsonrpc: "2.0",
    method: "notifications/initialized",
  });

  return client;
}

let callId = 100;

/** Call a tool and return the parsed result. */
export async function callTool(
  client: McpTestClient,
  name: string,
  args: Record<string, unknown> = {},
): Promise<{ result: any; isError?: boolean }> {
  const id = ++callId;
  client.send({
    jsonrpc: "2.0",
    id,
    method: "tools/call",
    params: { name, arguments: args },
  });

  const resp = (await client.receive()) as any;
  if (resp.error) {
    throw new Error(`RPC error: ${JSON.stringify(resp.error)}`);
  }

  const content = resp.result?.content?.[0];
  const text = content?.text;
  return {
    result: text ? JSON.parse(text) : resp.result,
    isError: resp.result?.isError,
  };
}
