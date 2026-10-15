<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/mcp-voice-soundboard/main/assets/logo-dark.jpg" alt="MCP Voice Soundboard" width="420" />
</p>

<h3 align="center">Text-to-speech for AI agents, as an MCP server.</h3>

<p align="center">
  <a href="https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-mcp"><img src="https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-mcp?style=flat-square&color=cb3837&logo=npm" alt="npm"></a>
  <a href="https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/mcp-tool-shop-org/mcp-voice-soundboard/ci.yml?branch=main&style=flat-square&label=CI" alt="CI"></a>
  <img src="https://img.shields.io/badge/node-%E2%89%A520-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js 20+">
  <a href="https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License: MIT"></a>
</p>

<p align="center">
  46 voices &bull; 9 languages &bull; 5 presets &bull; 8 emotions &bull; SSML-lite &bull; sound effects &bull; multi-speaker dialogue
</p>

Give an agent a voice. Claude Desktop, Cursor or any MCP client can speak a line, perform a scripted dialogue between several speakers, and drop a chime where it belongs. Speech comes from **Kokoro-82M** (Apache-2.0) through **kokoro-onnx**, so it runs on your own machine with no account and no API key. Every request passes the same guardrails: rate limits, one synthesis at a time, timeouts, a sandboxed output folder and redaction of secrets.

## Quick start

```bash
npx -y @mcptoolshop/voice-soundboard-mcp
```

Add it to your MCP client, for example `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "voice-soundboard": {
      "command": "npx",
      "args": ["-y", "@mcptoolshop/voice-soundboard-mcp"]
    }
  }
}
```

The server speaks MCP over stdio. Set `PORT` to serve it over HTTP instead.

## Where the speech comes from

The server picks a backend when it starts and logs which one:

1. **HTTP:** when `VOICE_SOUNDBOARD_TTS_URL` is set, it sends synthesis to that endpoint (with `VOICE_SOUNDBOARD_TTS_TOKEN` as a bearer token if you set one).
2. **Python bridge (Kokoro):** otherwise, when `python` is on your `PATH` (or `VOICE_SOUNDBOARD_PYTHON` names one), it starts the bundled bridge.
   - On first use the bridge installs `kokoro-onnx` with `pip install --user` and downloads the model (`kokoro-v1.0.onnx`, about 310 MB, and `voices-v1.0.bin`, about 26 MB) into `~/.cache/voice-soundboard`.
   - After that it runs offline.
3. **Mock:** with neither, it answers with silent WAV files, so the tools still work end to end while you wire things up.

Choose one explicitly with `--backend=http|python|mock|none`.

## Tools

### `voice_speak`

Speak text with one voice.

```
text:          "Hello world!"
voice?:        "am_fenrir"     # a voice ID or a preset name
speed?:        1.0             # 0.5 to 2.0
format?:       "wav"           # wav | mp3 | ogg | raw
artifactMode?: "path"          # path | base64
outputDir?:    "clips"         # a subfolder of the output root, in path mode
sfx?:          true            # turn on [ding], [chime] and the other sound-effect tags
```

### `voice_dialogue`

Perform a script with several speakers.

```
script:        "Alice: Hello!\n[pause 300ms]\nBob: Hey there!"
cast?:         { "Alice": "af_sky", "Bob": "narrator" }   # anyone not cast is assigned a voice
speed?:        1.0
concat?:       true            # one audio file for the whole scene
debug?:        true            # include the cue sheet and parse warnings
artifactMode?: "path"
outputDir?:    "scenes"
```

### `voice_status`

The backend and its health, the voices, the presets and the default voice. No arguments.

### `voice_interrupt`

Stop speech in progress.

```
streamId?:     "stream-123"
reason?:       "user_spoke"    # user_spoke | context_change | timeout | manual
```

### `voice_inner_monologue`

Short, throwaway utterances for ambient narration: up to 500 characters, rate-limited, with secrets redacted. Off unless the server runs with `--ambient` or `VOICE_SOUNDBOARD_AMBIENT_ENABLED=1`.

```
text:          "Interesting..."
category?:     "thinking"      # general | thinking | observation | debug
```

## Markup

| Markup | Syntax | Values |
|---|---|---|
| Emotion | `{joy}Great news!{/joy}` | `neutral`, `serious`, `friendly`, `professional`, `calm`, `joy`, `urgent`, `whisper` |
| Sound effect | `[ding]` (with `sfx: true`) | `ding`, `chime`, `whoosh`, `click`, `pop`, `tada` |
| SSML-lite | `<break time="300ms"/>` | `<speak>`, `<break>`, `<prosody>`, `<emphasis>` |
| Dialogue | `Alice: Hello!` | one line per cue, `[pause 350ms]` between cues |

Each emotion maps to a voice and speed. For example, `joy` uses `am_eric` at 1.03 and `urgent` uses `am_fenrir` at 1.08.

## Voices

46 voices in 9 languages. The language follows from the voice ID's prefix, so there's nothing to configure. The default voice is `bm_george`.

### Presets

| Preset | Voice | Speed | Character |
|---|---|---|---|
| `assistant` | `af_jessica` | 1.0 | Friendly, helpful, conversational |
| `narrator` | `bm_george` | 0.95 | Calm, clear, documentary style |
| `announcer` | `am_eric` | 1.1 | Bold, energetic, broadcast style |
| `storyteller` | `bf_emma` | 0.9 | Expressive, varied pacing |
| `whisper` | `af_sky` | 0.85 | Soft, intimate, gentle |

#### English (American) (14)

| Voice | Name | Gender | Style |
|---|---|---|---|
| `af_aoede` | Aoede | female | musical |
| `af_bella` | Bella | female | warm |
| `af_heart` | Heart | female | caring |
| `af_jessica` | Jessica | female | professional |
| `af_kore` | Kore | female | youthful |
| `af_nicole` | Nicole | female | soft |
| `af_sarah` | Sarah | female | clear |
| `af_sky` | Sky | female | airy |
| `am_eric` | Eric | male | confident |
| `am_fenrir` | Fenrir | male | powerful |
| `am_liam` | Liam | male | friendly |
| `am_michael` | Michael | male | deep |
| `am_onyx` | Onyx | male | smooth |
| `am_puck` | Puck | male | playful |

#### English (British) (6)

| Voice | Name | Gender | Style |
|---|---|---|---|
| `bf_alice` | Alice | female | proper |
| `bf_emma` | Emma | female | refined |
| `bf_isabella` | Isabella | female | warm |
| `bm_fable` | Fable | male | storytelling |
| `bm_george` | George | male | authoritative |
| `bm_lewis` | Lewis | male | friendly |

#### Japanese (5)

| Voice | Name | Gender | Style |
|---|---|---|---|
| `jf_alpha` | Alpha | female | clear |
| `jf_gongitsune` | Gongitsune | female | storytelling |
| `jf_nezuko` | Nezuko | female | gentle |
| `jf_tebukuro` | Tebukuro | female | warm |
| `jm_kumo` | Kumo | male | calm |

#### Mandarin Chinese (8)

| Voice | Name | Gender | Style |
|---|---|---|---|
| `zf_xiaobei` | Xiaobei | female | bright |
| `zf_xiaoni` | Xiaoni | female | gentle |
| `zf_xiaoxiao` | Xiaoxiao | female | clear |
| `zf_xiaoyi` | Xiaoyi | female | warm |
| `zm_yunjian` | Yunjian | male | authoritative |
| `zm_yunxi` | Yunxi | male | friendly |
| `zm_yunxia` | Yunxia | male | calm |
| `zm_yunyang` | Yunyang | male | confident |

#### Spanish (3)

| Voice | Name | Gender | Style |
|---|---|---|---|
| `ef_dora` | Dora | female | warm |
| `em_alex` | Alex | male | confident |
| `em_santa` | Santa | male | jolly |

#### French (1)

| Voice | Name | Gender | Style |
|---|---|---|---|
| `ff_siwis` | Siwis | female | refined |

#### Hindi (4)

| Voice | Name | Gender | Style |
|---|---|---|---|
| `hf_alpha` | Alpha | female | clear |
| `hf_beta` | Beta | female | warm |
| `hm_omega` | Omega | male | deep |
| `hm_psi` | Psi | male | calm |

#### Italian (2)

| Voice | Name | Gender | Style |
|---|---|---|---|
| `if_sara` | Sara | female | warm |
| `im_nicola` | Nicola | male | confident |

#### Brazilian Portuguese (3)

| Voice | Name | Gender | Style |
|---|---|---|---|
| `pf_dora` | Dora | female | warm |
| `pm_alex` | Alex | male | confident |
| `pm_santa` | Santa | male | jolly |

## Options

| Flag | Default | What it does |
|---|---|---|
| `--backend=<type>` | chosen automatically (see above) | `http`, `python`, `mock` or `none` |
| `--artifact=path\|base64` | `path` | Return audio as a file path or as base64 |
| `--output-dir=<path>` | `<tmpdir>/voice-soundboard` | Where audio files are written |
| `--max-concurrent=<n>` | `1` | Syntheses at the same time |
| `--timeout=<ms>` | `20000` | Timeout per request |
| `--retention-minutes=<n>` | `240` | Delete audio older than this (`0` keeps it) |
| `--ambient` | off | Enable `voice_inner_monologue` |
| `--version`, `--help` | | Print the version or the usage |

| Environment variable | What it does |
|---|---|
| `PORT` | Serve over HTTP on this port instead of stdio |
| `VOICE_SOUNDBOARD_TTS_URL` | HTTP backend endpoint (selects the HTTP backend) |
| `VOICE_SOUNDBOARD_TTS_TOKEN` | Bearer token for the HTTP backend |
| `VOICE_SOUNDBOARD_HTTP_TIMEOUT` | HTTP backend timeout in milliseconds |
| `VOICE_SOUNDBOARD_PYTHON` | Python command for the bridge |
| `VOICE_SOUNDBOARD_PYTHON_MODULE` | Bridge module to run |
| `VOICE_SOUNDBOARD_OUTPUT_DIR` | Output folder for the Python bridge |
| `VOICE_SOUNDBOARD_AMBIENT_ENABLED` | `1` enables `voice_inner_monologue` |

## Limits and safety

- **Request size:** 12,000 characters of text, 50 chunks, 100 emotion spans, 400 SSML nodes, 30 sound effects and breaks of 2 seconds or less.
- **Output:** audio is written only inside the output root. Paths that climb out of it, and symlinks, are refused, and file names are generated by the server.
- **Errors:** each one comes back with a code, a hint and whether it's safe to retry, never a stack trace.
- **Privacy:** no telemetry, and nothing leaves your machine except calls to the HTTP backend you configure, and the bridge's one-time install and model download.

See the [threat model](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/blob/main/THREAT_MODEL.md) and the [security policy](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/blob/main/SECURITY.md).

## Related

- [`@mcptoolshop/voice-soundboard-core`](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-core): the engine-agnostic library this server is built on, for your own integrations.
- [Source](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard), [discussions](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/discussions) and [issues](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/issues).

## Credits and license

Speech is generated by [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) (Apache-2.0) through [kokoro-onnx](https://github.com/thewh1teagle/kokoro-onnx) (MIT).

This package is [MIT](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/blob/main/LICENSE). Part of [MCP Tool Shop](https://mcptoolshop.com/).
