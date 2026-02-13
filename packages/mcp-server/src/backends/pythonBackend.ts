/** Python child-process TTS backend — stub for commit 3. */

import type { Backend, BackendHealth, SynthesisResult } from "../backend.js";
import type { SynthesisRequest } from "@mcp-tool-shop/voice-soundboard-core";

export interface PythonBackendConfig {
  command?: string;
  module?: string;
}

export class PythonBackend implements Backend {
  readonly type = "python" as const;
  readonly ready = false;

  constructor(_config: PythonBackendConfig) {}

  async health(): Promise<BackendHealth> {
    return { ready: false, details: "Python backend not yet implemented — coming in commit 3" };
  }

  async synthesize(_request: SynthesisRequest): Promise<SynthesisResult> {
    throw new Error("Python backend not yet implemented — coming in commit 3");
  }
}
