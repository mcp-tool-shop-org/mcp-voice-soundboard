<p align="center">
  <img src="assets/logo-dark.jpg" alt="Voice Soundboard" width="420" />
</p>

<h3 align="center">Text-to-speech for AI agents and developers.</h3>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/actions"><img src="https://img.shields.io/github/actions/workflow/status/mcp-tool-shop-org/mcp-voice-soundboard/ci.yml?style=flat-square&label=tests" alt="Tests"></a>
  <a href="https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/releases"><img src="https://img.shields.io/github/v/release/mcp-tool-shop-org/mcp-voice-soundboard?style=flat-square&color=blue" alt="Release"></a>
  <img src="https://img.shields.io/badge/python-3.10%2B-3776ab?style=flat-square&logo=python&logoColor=white" alt="Python 3.10+">
  <img src="https://img.shields.io/badge/architecture-Compiler%E2%86%92Graph%E2%86%92Engine-8A2BE2?style=flat-square" alt="Compiler-Graph-Engine">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License: MIT"></a>
</p>

<p align="center">
  Compiler &rarr; Graph &rarr; Engine architecture.<br>
  Zero runtime feature cost. Swappable backends. Same API since v1.
</p>

---

## Highlights

- **Compiler/Engine separation** &mdash; features compile to a `ControlGraph`, engine just synthesizes
- **Zero runtime feature cost** &mdash; emotion, style, SSML are compile-time transforms
- **Swappable backends** &mdash; Kokoro (local GPU), Piper (local CPU), OpenAI, Azure, ElevenLabs, Coqui
- **MCP native** &mdash; embedded MCP server with tool registration, sessions, and interrupt semantics
- **Spatial audio** &mdash; HRTF-based 3D positioning with distance attenuation and animation
- **Plugin system** &mdash; compiler, audio, and backend plugins with sandboxed execution
- **Production ready** &mdash; rate limiting, audit logging, secret management, distributed synthesis

## Quick Start

```bash
pip install voice-soundboard
```

```python
from voice_soundboard import VoiceEngine

engine = VoiceEngine()
result = engine.speak("Hello world!")
print(result.audio_path)
```

## Architecture

```
compile_request("text", emotion="happy")
        |
    ControlGraph (pure data, frozen v1 ABI)
        |
    engine.synthesize(graph)
        |
    PCM audio (numpy array)
```

**The compiler** transforms intent (text + emotion + style) into a `ControlGraph`.
**The engine** transforms the graph into audio. It knows nothing about emotions or styles.

Key invariant: `engine/` never imports from `compiler/`.

## Usage

### Basic

```python
from voice_soundboard import VoiceEngine

engine = VoiceEngine()

# Simple
result = engine.speak("Hello world!")

# With voice
result = engine.speak("Cheerio!", voice="bm_george")

# With preset
result = engine.speak("Breaking news!", preset="announcer")

# With emotion
result = engine.speak("I'm so happy!", emotion="excited")

# With natural language style
result = engine.speak("Good morning!", style="warmly and cheerfully")
```

### Streaming

```python
from voice_soundboard.compiler import compile_stream
from voice_soundboard.runtime import StreamingSynthesizer

backend = load_backend()
streamer = StreamingSynthesizer(backend)

for graph in compile_stream(text_chunks()):
    for audio_chunk in streamer.stream(graph):
        play(audio_chunk)
```

### MCP Server

```python
from voice_soundboard.mcp import create_mcp_server

engine = VoiceEngine()
server = create_mcp_server(engine)
await server.run()
```

### CLI

```bash
voice-soundboard speak "Hello world!"
voice-soundboard speak "Breaking news!" --preset announcer --speed 1.1
voice-soundboard voices
voice-soundboard presets
voice-soundboard emotions
```

## Backends

| Backend | Quality | Speed | Install |
|---------|---------|-------|---------|
| Kokoro | Best | Fast (GPU) | `pip install voice-soundboard[kokoro]` |
| Piper | Great | Fast (CPU) | `pip install voice-soundboard[piper]` |
| OpenAI | Best | Cloud | `pip install voice-soundboard[openai]` |
| Azure Neural | Great | Cloud | `pip install voice-soundboard[azure]` |
| ElevenLabs | Premium | Cloud | `pip install voice-soundboard[elevenlabs]` |
| Coqui | Good | GPU | `pip install voice-soundboard[coqui]` |
| Mock | N/A | Instant | Built-in (testing) |

### Kokoro Setup (Local, Recommended)

```bash
pip install voice-soundboard[kokoro]

mkdir models && cd models
curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
```

## Package Structure

```
voice_soundboard/
|-- graph/           ControlGraph, TokenEvent, SpeakerRef
|-- compiler/        Text -> Graph (all features live here)
|   |-- text.py      Tokenization, normalization
|   |-- emotion.py   Emotion -> prosody
|   |-- style.py     Natural language style
|   +-- compile.py   Main entry point
|-- engine/          Graph -> PCM (no features, just synthesis)
|   +-- backends/    Kokoro, Piper, OpenAI, Azure, ElevenLabs, Coqui, Mock
|-- runtime/         Streaming, scheduling, ducking, cache, timeline
|   +-- registrar/   Tool registration and lifecycle
|-- mcp/             MCP server, sessions, interrupts, observability, policy
|-- intelligence/    Emotion detection, adaptive pacing, smart silence
|-- spatial/         HRTF spatialization, 3D positioning, scene mixing
|-- accessibility/   Screen readers, captions, navigation, motor/cognitive support
|-- security/        Sandbox, rate limiting, audit, secrets, validation
|-- distributed/     Cluster, queue, shard (horizontal scaling)
|-- plugins/         Plugin system (compiler, audio, backend plugins)
|-- adapters/        CLI, API, audio events
|-- testing/         Mock backend, assertions, fixtures
+-- v3/              Audio graph, spatial, presets, validation (next gen)
```

## Related Projects

| Project | Description |
|---------|-------------|
| [soundboard-plugin](https://github.com/mcp-tool-shop-org/soundboard-plugin) | Claude Code plugin &mdash; slash commands, emotion-aware narration, workflow notifications |

## Documentation

| Document | Description |
|----------|-------------|
| [CHANGELOG.md](CHANGELOG.md) | Version history and release notes |
| [SECURITY.md](SECURITY.md) | Security policy and vulnerability reporting |
| [Migration Guide](docs/MIGRATION_v1_to_v2.md) | Upgrading from v1 to v2 |
| [Registrar Architecture](docs/REGISTRAR_ARCHITECTURE.md) | Tool registration system |
| [Audio Events](docs/audio_events.md) | Paralinguistic event system |
| [Spatial Audio](docs/v32_spatial_audio.md) | 3D audio positioning |
| [State Model](docs/STATE_MODEL_REFERENCE.md) | Engine state machine |

## License

[MIT](LICENSE)

---

<p align="center">
  Built by <a href="https://github.com/mcp-tool-shop-org">mcp-tool-shop</a>
</p>
