/** In-process HTTP test server that mimics a TTS backend. */

import { createServer, type Server, type IncomingMessage, type ServerResponse } from "node:http";

export interface TtsTestServerOptions {
  /** Response delay in ms (for timeout testing). */
  delay?: number;
  /** Return garbage instead of valid JSON. */
  returnGarbage?: boolean;
  /** Return audio_bytes_base64 in response. */
  returnBase64?: boolean;
}

/**
 * Start a minimal HTTP TTS test server.
 * Returns the base URL and a close function.
 */
export async function startTtsTestServer(
  opts?: TtsTestServerOptions,
): Promise<{ url: string; close: () => Promise<void> }> {
  const delay = opts?.delay ?? 0;
  const returnGarbage = opts?.returnGarbage ?? false;
  const returnBase64 = opts?.returnBase64 ?? true;

  const server: Server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    // Health check (GET)
    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok" }));
      return;
    }

    // Synthesize (POST)
    if (req.method === "POST") {
      // Read body
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(chunk as Buffer);
      }
      const body = JSON.parse(Buffer.concat(chunks).toString());

      if (delay > 0) {
        await new Promise((r) => setTimeout(r, delay));
      }

      if (returnGarbage) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end("NOT VALID JSON {{{");
        return;
      }

      // Generate minimal WAV (silence)
      const wav = generateMockWav();

      if (returnBase64) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          audio_bytes_base64: wav.toString("base64"),
          duration_ms: 100,
          sample_rate: 24000,
          format: body.format ?? "wav",
          trace_id: body.trace_id,
        }));
      } else {
        // Return binary audio
        res.writeHead(200, { "Content-Type": "audio/wav" });
        res.end(wav);
      }
      return;
    }

    res.writeHead(404);
    res.end();
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address() as { port: number };
      const url = `http://127.0.0.1:${addr.port}`;
      resolve({
        url,
        close: () => new Promise<void>((res) => server.close(() => res())),
      });
    });
  });
}

function generateMockWav(): Buffer {
  const sampleRate = 24000;
  const numSamples = Math.floor(sampleRate * 0.1);
  const bytesPerSample = 2;
  const dataSize = numSamples * bytesPerSample;
  const fileSize = 44 + dataSize;
  const buf = Buffer.alloc(fileSize);
  let o = 0;
  buf.write("RIFF", o); o += 4;
  buf.writeUInt32LE(fileSize - 8, o); o += 4;
  buf.write("WAVE", o); o += 4;
  buf.write("fmt ", o); o += 4;
  buf.writeUInt32LE(16, o); o += 4;
  buf.writeUInt16LE(1, o); o += 2;
  buf.writeUInt16LE(1, o); o += 2;
  buf.writeUInt32LE(sampleRate, o); o += 4;
  buf.writeUInt32LE(sampleRate * bytesPerSample, o); o += 4;
  buf.writeUInt16LE(bytesPerSample, o); o += 2;
  buf.writeUInt16LE(16, o); o += 2;
  buf.write("data", o); o += 4;
  buf.writeUInt32LE(dataSize, o); o += 4;
  return buf;
}
