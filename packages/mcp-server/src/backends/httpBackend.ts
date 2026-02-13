/** HTTP TTS backend — stub for commit 2. */

import type { Backend, BackendHealth, SynthesisResult } from "../backend.js";
import type { SynthesisRequest } from "@mcp-tool-shop/voice-soundboard-core";

export interface HttpBackendConfig {
  url: string;
  token?: string;
  timeout?: number;
}

export class HttpBackend implements Backend {
  readonly type = "http" as const;
  readonly ready: boolean;
  private config: HttpBackendConfig;

  constructor(config: HttpBackendConfig) {
    this.config = config;
    this.ready = !!config.url;
  }

  async health(): Promise<BackendHealth> {
    if (!this.config.url) {
      return { ready: false, details: "No TTS URL configured" };
    }
    return { ready: true, details: `HTTP backend: ${this.config.url}` };
  }

  async synthesize(_request: SynthesisRequest): Promise<SynthesisResult> {
    throw new Error("HTTP backend not yet implemented — coming in commit 2");
  }
}
