<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="assets/logo.png" alt="MCP Voice Soundboard" width="400">
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-mcp"><img src="https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-mcp" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License"></a>
  <a href="https://mcp-tool-shop-org.github.io/mcp-voice-soundboard/"><img src="https://img.shields.io/badge/Landing_Page-live-blue" alt="Landing Page"></a>
</p>

<p align="center">
  48 voices &bull; 9 languages &bull; 5 presets &bull; 8 emotions &bull; SSML-lite &bull; SFX tags &bull; multi-speaker dialogue<br>
  Swappable TTS backends. Guardrails built in. Ships as a single <code>npx</code> command.
</p>

---

## Highlights

- **原生 MCP 支持**：支持 stdio 传输，可与 Claude Desktop、Cursor 以及任何 MCP 客户端配合使用。
- **5 个工具**：`voice_speak`、`voice_dialogue`、`voice_status`、`voice_interrupt`、`voice_inner_monologue`。
- **48 种已批准的语音，9 种语言**：美式英语、英式英语、日语、普通话、西班牙语、法语、印地语、意大利语、巴西葡萄牙语。 预设选项：`narrator`（旁白）、`announcer`（播报员）、`whisper`（低语）、`storyteller`（故事讲述者）、`assistant`（助手）。
- **情感标记**：通过 `[happy]...[/happy]` 形式添加 8 种情感。
- **简化版 SSML**：支持 `<break>`、`<emphasis>`、`<prosody>` 标签，但简化了 SSML 的复杂性。
- **音效标签**：支持 `[ding]`、`[chime]`、`[whoosh]`、`[tada]`、`[error]`、`[click]` 等音效。
- **多说话人对话**：支持 `Speaker: line` 格式，并自动进行角色分配和暂停。
- **安全机制**：包括速率限制、并发信号量、请求超时、路径遍历保护、敏感信息脱敏等。
- **可替换的后端**：支持 Mock（内置）、HTTP 代理、Python 桥接，或自定义后端。

## 快速开始

```bash
npx @mcptoolshop/voice-soundboard-mcp
```

或者全局安装：

```bash
npm install -g @mcptoolshop/voice-soundboard-mcp
voice-soundboard-mcp
```

### Claude Desktop / MCP 客户端配置

将以下内容添加到您的 MCP 客户端配置文件（例如 `claude_desktop_config.json`）：

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

包含以下选项：

```json
{
  "mcpServers": {
    "voice-soundboard": {
      "command": "npx",
      "args": [
        "-y", "@mcptoolshop/voice-soundboard-mcp",
        "--artifact=path",
        "--output-dir=/tmp/voice-output",
        "--timeout=30000",
        "--max-concurrent=2"
      ]
    }
  }
}
```

## MCP 工具

### `voice_speak`

从文本合成语音。

```
text:         "Hello world!"
voice?:       "am_fenrir"          # Voice ID or preset name
speed?:       1.0                  # 0.5 - 2.0
format?:      "wav"                # wav | mp3 | ogg | raw
artifactMode?: "path"             # path | base64
sfx?:         true                # Enable [ding], [chime] etc.
```

### `voice_dialogue`

多说话人语音合成。

```
script:       "Alice: Hello!\nBob: Hey there!"
cast?:        { "Alice": "af_sky", "Bob": "am_fenrir" }
speed?:       1.0
concat?:      true                 # Combine into single file
debug?:       true                 # Include cue_sheet
```

### `voice_status`

返回引擎状态、可用语音、预设选项和后端信息。 不接受任何参数。

### `voice_interrupt`

停止或回滚正在进行的语音合成。

```
streamId?:    "stream-123"
reason?:      "user_spoke"         # user_spoke | context_change | timeout | manual
```

### `voice_inner_monologue`

用于环境叙述的短暂的微型语音。 需要 `--ambient` 标志或 `VOICE_SOUNDBOARD_AMBIENT_ENABLED=1`。

```
text:         "Interesting..."     # Max 500 chars, auto-redacted
category?:    "thinking"           # general | thinking | observation | debug
```

## 语音

提供 48 种语音，涵盖 9 种语言。 语音的语言将自动从语音 ID 前缀推断，无需任何配置。

| 前缀 | 语言 |
| -------- | ---------- |
| `af_` / `am_` | 美式英语 |
| `bf_` / `bm_` | 英式英语 |
| `jf_` / `jm_` | 日语 |
| `zf_` / `zm_` | 普通话 |
| `ef_` / `em_` | 西班牙语 |
| `ff_` | 法语 |
| `hf_` / `hm_` | Hindi |
| `if_` / `im_` | 意大利语 |
| `pf_` / `pm_` | 巴西葡萄牙语 |

### 美式英语

| ID | Name | 性别 | Style |
|----| ------ | -------- | ------- |
| `af_aoede` | Aoede | 女性 | 音乐 |
| `af_bella` | Bella | 女性 | Warm |
| `af_heart` | Heart | 女性 | 关怀 |
| `af_jessica` | Jessica | 女性 | 专业 |
| `af_kore` | Kore | 女性 | 年轻 |
| `af_nicole` | Nicole | 女性 | Soft |
| `af_sarah` | Sarah | 女性 | Clear |
| `af_sky` | Sky | 女性 | Airy |
| `am_eric` | Eric | Male | 自信 |
| `am_fenrir` | Fenrir | Male | 强大 |
| `am_liam` | Liam | Male | 友好 |
| `am_michael` | Michael | Male | Deep |
| `am_onyx` | Onyx | Male | 流畅 |
| `am_puck` | Puck | Male | 活泼 |

### 英式英语

| ID | Name | 性别 | Style |
|----| ------ | -------- | ------- |
| `bf_alice` | Alice | 女性 | 正式 |
| `bf_emma` | Emma | 女性 | 优雅 |
| `bf_isabella` | Isabella | 女性 | Warm |
| `bm_fable` | Fable | Male | 故事讲述 |
| `bm_george` | George | Male | 权威 |
| `bm_lewis` | Lewis | Male | 友好 |

### 日语

| ID | Name | 性别 | Style |
|----| ------ | -------- | ------- |
| `jf_alpha` | Alpha | 女性 | Clear |
| `jf_gongitsune` | Gongitsune | 女性 | 讲故事 |
| `jf_nezuko` | 禰豆子 | 女性 | 温柔 |
| `jf_tebukuro` | Tebukuro | 女性 | Warm |
| `jm_kumo` | Kumo | Male | Calm |

### 普通话

| ID | Name | 性别 | Style |
|----| ------ | -------- | ------- |
| `zf_xiaobei` | Xiaobei | 女性 | 开朗 |
| `zf_xiaoni` | Xiaoni | 女性 | 温柔 |
| `zf_xiaoxiao` | Xiaoxiao | 女性 | Clear |
| `zf_xiaoyi` | Xiaoyi | 女性 | Warm |
| `zm_yunjian` | Yunjian | Male | 权威 |
| `zm_yunxi` | Yunxi | Male | 友善 |
| `zm_yunxia` | Yunxia | Male | Calm |
| `zm_yunyang` | Yunyang | Male | 自信 |

### 西班牙语

| ID | Name | 性别 | Style |
|----| ------ | -------- | ------- |
| `ef_dora` | Dora | 女性 | Warm |
| `em_alex` | Alex | Male | 自信 |
| `em_santa` | Santa | Male | Jolly |

### 法语

| ID | Name | 性别 | Style |
|----| ------ | -------- | ------- |
| `ff_siwis` | Siwis | 女性 | 优雅 |

### 印地语

| ID | Name | 性别 | Style |
|----| ------ | -------- | ------- |
| `hf_alpha` | Alpha | 女性 | Clear |
| `hf_beta` | Beta | 女性 | Warm |
| `hm_omega` | Omega | Male | Deep |
| `hm_psi` | Psi | Male | Calm |

### 意大利语

| ID | Name | 性别 | Style |
|----| ------ | -------- | ------- |
| `if_sara` | Sara | 女性 | Warm |
| `im_nicola` | Nicola | Male | 自信 |

### 巴西葡萄牙语

| ID | Name | 性别 | Style |
|----| ------ | -------- | ------- |
| `pf_dora` | Dora | 女性 | Warm |
| `pm_alex` | Alex | Male | 自信 |
| `pm_santa` | Santa | Male | Jolly |

### 预设

| 预设 | Voice | Speed | 描述 |
| -------- | ------- | ------- | ------------- |
| `narrator` | `bm_george` | 0.95 | 平静的纪录片风格 |
| `announcer` | `am_onyx` | 1.05 | 新闻主播的语调 |
| `whisper` | `af_aoede` | 0.85 | 柔和、亲密 |
| `storyteller` | `bf_emma` | 0.90 | 温暖的睡前故事感 |
| `assistant` | `af_jessica` | 1.0 | 中立、乐于助人 |

## 情感范围

使用情感标签包裹文本以控制韵律：

```
[happy]Great news![/happy] But [sad]I have to go.[/sad]
```

支持：`happy`（高兴）, `sad`（悲伤）, `angry`（生气）, `fearful`（恐惧）, `surprised`（惊讶）, `disgusted`（厌恶）, `calm`（平静）, `excited`（兴奋）

## 命令行标志

| Flag | 默认值 | 描述 |
| ------ | --------- | ------------- |
| `--artifact=path\ | base64` | `path` | 音频传输模式 |
| `--output-dir=<path>` | `<tmpdir>/voice-soundboard/` | 输出目录 |
| `--backend=mock\ |http` | `mock` | 后端选择 |
| `--backend-url=<url>` | &mdash; | HTTP后端URL |
| `--ambient` | off | 启用内部独白系统 |
| `--max-concurrent=<n>` | `1` | 最大并发合成请求数 |
| `--timeout=<ms>` | `20000` | 每个请求的超时时间 |
| `--retention-minutes=<n>` | `240` | 自动清理时长（0 表示禁用） |

## 包

这是一个 pnpm monorepo，包含两个可发布的包：

| 包 | 描述 | npm |
| --------- | ------------- |-----|
| [`@mcptoolshop/voice-soundboard-core`](packages/core) | 不依赖特定后端的核心库（验证、SSML、分块、模式） | [![npm](https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-core)](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-core) |
| [`@mcptoolshop/voice-soundboard-mcp`](packages/mcp-server) | 带有 CLI、安全机制和传输的 MCP 服务器 | [![npm](https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-mcp)](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-mcp) |

## 开发

```bash
# Install
pnpm install

# Build
pnpm build

# Test (342 tests)
pnpm test
```

> 它是 [MCP Tool Shop](https://mcp-tool-shop.github.io/) 的一部分

### 项目结构

```
mcp-voice-soundboard/
  packages/
    core/               @mcptoolshop/voice-soundboard-core
      src/
        limits.ts         SHIP_LIMITS, text/chunk limits
        schemas.ts        VoiceRequest, VoiceResponse, error codes
        artifact.ts       resolveOutputDir, path sandbox
        voices.ts         Approved voice registry + presets
        emotion.ts        Emotion span parser
        ssml/             SSML-lite parser + limits
        chunking/         Text chunker
        sfx/              SFX tag parser + registry
        sandbox.ts        Safe filenames, symlink checks
        ambient.ts        AmbientEmitter for inner monologue
        redact.ts         PII/secret redaction
    mcp-server/         @mcptoolshop/voice-soundboard-mcp
      src/
        server.ts         MCP tool registration + guardrail wiring
        cli.ts            CLI entrypoint (stdio transport)
        backend.ts        Backend abstraction + mock/HTTP
        concurrency.ts    SynthesisSemaphore
        rateLimit.ts      ToolRateLimiter (sliding window)
        timeout.ts        withTimeout utility
        retention.ts      Output file cleanup timer
        redact.ts         Server-level redaction
        validation.ts     Synthesis result validation
        tools/            Individual tool handlers
  assets/               Logo, audio event manifests
  docs/                 Architecture docs
```

## 安全

请参阅 [SECURITY.md](SECURITY.md) 以报告漏洞。

请参阅 [THREAT_MODEL.md](THREAT_MODEL.md) 以获取完整的威胁面分析。

## 相关

| 项目 | 描述 |
| --------- | ------------- |
| [soundboard-plugin](https://github.com/mcp-tool-shop-org/soundboard-plugin) | Claude 代码插件 &mdash;  slash 命令，具有情感意识的叙述 |

## 支持

- **问题/帮助：** [讨论](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/discussions)
- **错误报告：** [问题](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/issues)
- **安全：** [SECURITY.md](SECURITY.md)

## 许可证

[MIT](LICENSE)

---

<p align="center">
  Built by <a href="https://github.com/mcp-tool-shop-org">mcp-tool-shop</a>
</p>
