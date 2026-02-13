/** MCP server — registers tools and connects transport. */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ArtifactMode } from "@mcp-tool-shop/voice-soundboard-core";
import type { Backend } from "./backend.js";
import { buildStatusResponse } from "./tools/voiceStatus.js";
import { handleSpeak } from "./tools/voiceSpeak.js";
import { handleInterrupt } from "./tools/voiceInterrupt.js";
import { handleDialogue } from "./tools/voiceDialogue.js";

export interface ServerOptions {
  backend: Backend;
  /** Default artifact mode (overridable per-call). */
  defaultArtifactMode?: ArtifactMode;
  /** Sandboxed output root directory. */
  outputRoot?: string;
}

export function createServer(options: ServerOptions): McpServer {
  const { backend, defaultArtifactMode, outputRoot } = options;

  const server = new McpServer(
    {
      name: "voice-soundboard",
      version: "0.1.0",
    },
    {
      capabilities: { tools: {} },
    },
  );

  // voice_status — no arguments
  server.tool(
    "voice_status",
    "Get engine health, available voices, presets, and backend info",
    async () => {
      const status = await buildStatusResponse(backend);
      return {
        content: [{ type: "text", text: JSON.stringify(status, null, 2) }],
      };
    },
  );

  // voice_speak
  server.tool(
    "voice_speak",
    "Synthesize speech from text",
    {
      text: z.string().describe("Text to synthesize"),
      voice: z.string().optional().describe("Voice ID or preset name"),
      speed: z.number().min(0.5).max(2.0).optional().describe("Speed multiplier (0.5-2.0)"),
      format: z.enum(["wav", "mp3", "ogg", "raw"]).optional().describe("Output audio format"),
      artifactMode: z.enum(["path", "base64"]).optional().describe("Delivery mode: file path or base64"),
      outputDir: z.string().optional().describe("Subdirectory within output root for path mode"),
    },
    async (args) => {
      const result = await handleSpeak(args, backend, {
        defaultArtifactMode,
        outputRoot,
      });
      const isError = "error" in result && result.error === true;
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        isError,
      };
    },
  );

  // voice_interrupt
  server.tool(
    "voice_interrupt",
    "Stop or rollback active audio synthesis",
    {
      streamId: z.string().optional().describe("Stream ID to interrupt"),
      reason: z.enum(["user_spoke", "context_change", "timeout", "manual"]).optional().describe("Reason for interruption"),
    },
    async (args) => {
      const result = await handleInterrupt(args);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  // voice_dialogue
  server.tool(
    "voice_dialogue",
    "Synthesize multi-speaker dialogue from a script",
    {
      script: z.string().describe("Dialogue script: 'Speaker: text' per line, with optional [pause Xms] directives"),
      cast: z.record(z.string(), z.string()).optional().describe("Speaker → voice/preset mapping (uncast speakers are auto-assigned)"),
      speed: z.number().min(0.5).max(2.0).optional().describe("Base speed multiplier for all lines"),
      concat: z.boolean().optional().describe("Concatenate all audio into a single file"),
      debug: z.boolean().optional().describe("Include cue_sheet and parse_warnings in response"),
      artifactMode: z.enum(["path", "base64"]).optional().describe("Delivery mode: file path or base64"),
      outputDir: z.string().optional().describe("Subdirectory within output root for path mode"),
    },
    async (args) => {
      const result = await handleDialogue(args as any, backend, {
        defaultArtifactMode,
        outputRoot,
      });
      const isError = "error" in result && result.error === true;
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        isError,
      };
    },
  );

  return server;
}
