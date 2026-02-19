<p align="center">
  <a href="README.md">English</a> | <a href="README.ja.md">日本語</a> | <strong>中文</strong> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/mcp-voice-soundboard/main/assets/logo-dark.jpg" alt="MCP Voice Soundboard" width="420" />
</p>

<h3 align="center">面向 AI 代理的文本转语音 MCP 服务器。</h3>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/mcp-tool-shop-org/mcp-voice-soundboard/ci.yml?branch=main&style=flat-square&label=CI" alt="CI"></a>
  <a href="https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-mcp"><img src="https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-mcp?style=flat-square&color=cb3837&logo=npm" alt="npm"></a>
  <img src="https://img.shields.io/badge/node-%E2%89%A520-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js 20+">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License: MIT"></a>
</p>

<p align="center">
  48 种语音 &bull; 9 种语言 &bull; 5 种预设 &bull; 8 种情感 &bull; SSML-lite &bull; 音效标签 &bull; 多角色对话<br>
  可切换 TTS 后端。内置安全防护。通过单条 <code>npx</code> 命令即可运行。
</p>

---

## 亮点

- **MCP 原生** &mdash; stdio 传输，兼容 Claude Desktop、Cursor 及任何 MCP 客户端
- **5 个工具** &mdash; `voice_speak`、`voice_dialogue`、`voice_status`、`voice_interrupt`、`voice_inner_monologue`
- **48 种精选语音，9 种语言** &mdash; 英语（美式 + 英式）、日语、普通话、西班牙语、法语、印地语、意大利语、巴西葡萄牙语。精选预设：`narrator`、`announcer`、`whisper`、`storyteller`、`assistant`
- **情感标记** &mdash; 通过 `[happy]...[/happy]` 行内标记实现 8 种情感
- **SSML-lite** &mdash; 支持 `<break>`、`<emphasis>`、`<prosody>`，无需完整 SSML 的复杂性
- **音效标签** &mdash; `[ding]`、`[chime]`、`[whoosh]`、`[tada]`、`[error]`、`[click]` 行内音效
- **多角色对话** &mdash; `角色名: 台词` 格式，支持自动分配语音和暂停指令
- **安全防护** &mdash; 速率限制、并发信号量、请求超时、路径遍历防护、敏感信息脱敏
- **可切换后端** &mdash; Mock（内置）、HTTP 代理、Python 桥接，或自行接入

## 快速开始

```bash
npx @mcptoolshop/voice-soundboard-mcp
```

或全局安装：

```bash
npm install -g @mcptoolshop/voice-soundboard-mcp
voice-soundboard-mcp
```

### Claude Desktop / MCP 客户端配置

将以下内容添加到 MCP 客户端配置文件中（例如 `claude_desktop_config.json`）：

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

带可选参数：

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

将文本合成为语音。

```
text:         "Hello world!"
voice?:       "am_fenrir"          # 语音 ID 或预设名称
speed?:       1.0                  # 0.5 - 2.0
format?:      "wav"                # wav | mp3 | ogg | raw
artifactMode?: "path"             # path | base64
sfx?:         true                # 启用 [ding]、[chime] 等音效
```

### `voice_dialogue`

多角色对话合成。

```
script:       "Alice: Hello!\nBob: Hey there!"
cast?:        { "Alice": "af_sky", "Bob": "am_fenrir" }
speed?:       1.0
concat?:      true                 # 合并为单个文件
debug?:       true                 # 包含 cue_sheet
```

### `voice_status`

返回引擎状态、可用语音、预设及后端信息。无需参数。

### `voice_interrupt`

停止或回退正在进行的合成。

```
streamId?:    "stream-123"
reason?:      "user_spoke"         # user_spoke | context_change | timeout | manual
```

### `voice_inner_monologue`

用于环境叙述的短暂微语音。需要 `--ambient` 标志或设置 `VOICE_SOUNDBOARD_AMBIENT_ENABLED=1`。

```
text:         "Interesting..."     # 最多 500 字符，自动脱敏
category?:    "thinking"           # general | thinking | observation | debug
```

## 语音

48 种语音覆盖 9 种语言。语言根据语音 ID 前缀自动推断——无需额外配置。

| 前缀 | 语言 |
|--------|----------|
| `af_` / `am_` | 英语（美式） |
| `bf_` / `bm_` | 英语（英式） |
| `jf_` / `jm_` | 日语 |
| `zf_` / `zm_` | 普通话 |
| `ef_` / `em_` | 西班牙语 |
| `ff_` | 法语 |
| `hf_` / `hm_` | 印地语 |
| `if_` / `im_` | 意大利语 |
| `pf_` / `pm_` | 巴西葡萄牙语 |

### 英语 — 美式

| ID | 名称 | 性别 | 风格 |
|----|------|--------|-------|
| `af_aoede` | Aoede | 女 | 音乐感 |
| `af_bella` | Bella | 女 | 温暖 |
| `af_heart` | Heart | 女 | 关怀 |
| `af_jessica` | Jessica | 女 | 专业 |
| `af_kore` | Kore | 女 | 年轻 |
| `af_nicole` | Nicole | 女 | 柔和 |
| `af_sarah` | Sarah | 女 | 清晰 |
| `af_sky` | Sky | 女 | 空灵 |
| `am_eric` | Eric | 男 | 自信 |
| `am_fenrir` | Fenrir | 男 | 力量感 |
| `am_liam` | Liam | 男 | 友善 |
| `am_michael` | Michael | 男 | 低沉 |
| `am_onyx` | Onyx | 男 | 圆润 |
| `am_puck` | Puck | 男 | 俏皮 |

### 英语 — 英式

| ID | 名称 | 性别 | 风格 |
|----|------|--------|-------|
| `bf_alice` | Alice | 女 | 端庄 |
| `bf_emma` | Emma | 女 | 优雅 |
| `bf_isabella` | Isabella | 女 | 温暖 |
| `bm_fable` | Fable | 男 | 讲述感 |
| `bm_george` | George | 男 | 权威 |
| `bm_lewis` | Lewis | 男 | 友善 |

### 日语

| ID | 名称 | 性别 | 风格 |
|----|------|--------|-------|
| `jf_alpha` | Alpha | 女 | 清晰 |
| `jf_gongitsune` | Gongitsune | 女 | 讲述感 |
| `jf_nezuko` | Nezuko | 女 | 温柔 |
| `jf_tebukuro` | Tebukuro | 女 | 温暖 |
| `jm_kumo` | Kumo | 男 | 沉稳 |

### 普通话

| ID | 名称 | 性别 | 风格 |
|----|------|--------|-------|
| `zf_xiaobei` | Xiaobei | 女 | 明亮 |
| `zf_xiaoni` | Xiaoni | 女 | 温柔 |
| `zf_xiaoxiao` | Xiaoxiao | 女 | 清晰 |
| `zf_xiaoyi` | Xiaoyi | 女 | 温暖 |
| `zm_yunjian` | Yunjian | 男 | 权威 |
| `zm_yunxi` | Yunxi | 男 | 友善 |
| `zm_yunxia` | Yunxia | 男 | 沉稳 |
| `zm_yunyang` | Yunyang | 男 | 自信 |

### 西班牙语

| ID | 名称 | 性别 | 风格 |
|----|------|--------|-------|
| `ef_dora` | Dora | 女 | 温暖 |
| `em_alex` | Alex | 男 | 自信 |
| `em_santa` | Santa | 男 | 欢快 |

### 法语

| ID | 名称 | 性别 | 风格 |
|----|------|--------|-------|
| `ff_siwis` | Siwis | 女 | 优雅 |

### 印地语

| ID | 名称 | 性别 | 风格 |
|----|------|--------|-------|
| `hf_alpha` | Alpha | 女 | 清晰 |
| `hf_beta` | Beta | 女 | 温暖 |
| `hm_omega` | Omega | 男 | 低沉 |
| `hm_psi` | Psi | 男 | 沉稳 |

### 意大利语

| ID | 名称 | 性别 | 风格 |
|----|------|--------|-------|
| `if_sara` | Sara | 女 | 温暖 |
| `im_nicola` | Nicola | 男 | 自信 |

### 巴西葡萄牙语

| ID | 名称 | 性别 | 风格 |
|----|------|--------|-------|
| `pf_dora` | Dora | 女 | 温暖 |
| `pm_alex` | Alex | 男 | 自信 |
| `pm_santa` | Santa | 男 | 欢快 |

### 预设

| 预设 | 语音 | 速度 | 描述 |
|--------|-------|-------|-------------|
| `narrator` | `bm_george` | 0.95 | 沉稳的纪录片风格 |
| `announcer` | `am_onyx` | 1.05 | 新闻主播的活力感 |
| `whisper` | `af_aoede` | 0.85 | 柔和、私密 |
| `storyteller` | `bf_emma` | 0.90 | 温暖的睡前故事感 |
| `assistant` | `af_jessica` | 1.0 | 中性、亲切 |

## 情感标记

使用情感标签包裹文本以控制语调：

```
[happy]好消息！[/happy] 但是 [sad]我得走了。[/sad]
```

支持的情感：`happy`、`sad`、`angry`、`fearful`、`surprised`、`disgusted`、`calm`、`excited`

## 命令行参数

| 参数 | 默认值 | 描述 |
|------|---------|-------------|
| `--artifact=path\|base64` | `path` | 音频输出模式 |
| `--output-dir=<path>` | `<tmpdir>/voice-soundboard/` | 输出目录 |
| `--backend=mock\|http` | `mock` | 后端选择 |
| `--backend-url=<url>` | &mdash; | HTTP 后端 URL |
| `--ambient` | 关闭 | 启用内心独白系统 |
| `--max-concurrent=<n>` | `1` | 最大并发合成请求数 |
| `--timeout=<ms>` | `20000` | 单次请求超时时间 |
| `--retention-minutes=<n>` | `240` | 自动清理时限（设为 0 禁用） |

## 包

这是一个包含两个可发布包的 pnpm monorepo：

| 包 | 描述 | npm |
|---------|-------------|-----|
| [`@mcptoolshop/voice-soundboard-core`](packages/core) | 后端无关的核心库（校验、SSML、分块、Schema） | [![npm](https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-core?style=flat-square)](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-core) |
| [`@mcptoolshop/voice-soundboard-mcp`](packages/mcp-server) | MCP 服务器，含 CLI、安全防护和传输层 | [![npm](https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-mcp?style=flat-square)](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-mcp) |

## 开发

```bash
# 安装依赖
pnpm install

# 构建
pnpm build

# 测试（342 个测试）
pnpm test
```

> 隶属于 [MCP Tool Shop](https://mcp-tool-shop.github.io/)

### 项目结构

```
mcp-voice-soundboard/
  packages/
    core/               @mcptoolshop/voice-soundboard-core
      src/
        limits.ts         SHIP_LIMITS，文本/分块限制
        schemas.ts        VoiceRequest、VoiceResponse、错误码
        artifact.ts       resolveOutputDir，路径沙箱
        voices.ts         批准的语音注册表 + 预设
        emotion.ts        情感标记解析器
        ssml/             SSML-lite 解析器 + 限制
        chunking/         文本分块器
        sfx/              音效标签解析器 + 注册表
        sandbox.ts        安全文件名、符号链接检查
        ambient.ts        内心独白的 AmbientEmitter
        redact.ts         PII/敏感信息脱敏
    mcp-server/         @mcptoolshop/voice-soundboard-mcp
      src/
        server.ts         MCP 工具注册 + 安全防护接线
        cli.ts            CLI 入口（stdio 传输）
        backend.ts        后端抽象 + mock/HTTP
        concurrency.ts    SynthesisSemaphore
        rateLimit.ts      ToolRateLimiter（滑动窗口）
        timeout.ts        withTimeout 工具函数
        retention.ts      输出文件清理定时器
        redact.ts         服务器层脱敏
        validation.ts     合成结果校验
        tools/            各工具处理函数
  assets/               Logo、音频事件清单
  docs/                 架构文档
```

## 安全

漏洞报告请参阅 [SECURITY.md](SECURITY.md)。

完整威胁面分析请参阅 [THREAT_MODEL.md](THREAT_MODEL.md)。

## 相关项目

| 项目 | 描述 |
|---------|-------------|
| [soundboard-plugin](https://github.com/mcp-tool-shop-org/soundboard-plugin) | Claude Code 插件 &mdash; 斜杠命令、情感感知叙述 |

## 支持

- **问题 / 帮助：** [讨论区](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/discussions)
- **Bug 报告：** [Issues](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/issues)
- **安全：** [SECURITY.md](SECURITY.md)

## 许可证

[MIT](LICENSE)

---

<p align="center">
  由 <a href="https://github.com/mcp-tool-shop-org">mcp-tool-shop</a> 构建
</p>
