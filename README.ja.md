<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/mcp-voice-soundboard/readme.png" alt="MCP Voice Soundboard" width="400">
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

- **MCPネイティブ**：stdioトランスポートに対応し、Claude Desktop、Cursor、およびその他のMCPクライアントで使用可能
- **5つのツール**：`voice_speak`、`voice_dialogue`、`voice_status`、`voice_interrupt`、`voice_inner_monologue`
- **48種類の音声、9言語**：英語（アメリカ英語 + イギリス英語）、日本語、中国語（北京語）、スペイン語、フランス語、ヒンディー語、イタリア語、ブラジルポルトガル語。プリセット：`narrator`、`announcer`、`whisper`、`storyteller`、`assistant`
- **感情表現**：`[happy]...[/happy]`というインラインマークアップで、8種類の感情を表現可能
- **SSML-lite**：`<break>`、`<emphasis>`、`<prosody>`などのタグを、完全なSSMLの複雑さなしで使用可能
- **効果音タグ**：`[ding]`、`[chime]`、`[whoosh]`、`[tada]`、`[error]`、`[click]`などのインライン効果音
- **マルチスピーカー対話**：`Speaker: line`形式で、自動キャストと一時停止指示に対応
- **セキュリティ機能**：レート制限、同時実行制御、リクエストタイムアウト、パス穿越防御、機密情報マスキング
- **交換可能なバックエンド**：Mock（内蔵）、HTTPプロキシ、Pythonブリッジ、または独自のバックエンドを使用可能

## クイックスタート

```bash
npx @mcptoolshop/voice-soundboard-mcp
```

または、グローバルにインストールします。

```bash
npm install -g @mcptoolshop/voice-soundboard-mcp
voice-soundboard-mcp
```

### Claude Desktop / MCPクライアントの設定

MCPクライアントの設定ファイル（例：`claude_desktop_config.json`）に追加します。

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

オプションを設定できます。

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

## MCPツール

### `voice_speak`

テキストから音声を合成します。

```
text:         "Hello world!"
voice?:       "am_fenrir"          # Voice ID or preset name
speed?:       1.0                  # 0.5 - 2.0
format?:      "wav"                # wav | mp3 | ogg | raw
artifactMode?: "path"             # path | base64
sfx?:         true                # Enable [ding], [chime] etc.
```

### `voice_dialogue`

マルチスピーカー対話の音声合成を行います。

```
script:       "Alice: Hello!\nBob: Hey there!"
cast?:        { "Alice": "af_sky", "Bob": "am_fenrir" }
speed?:       1.0
concat?:      true                 # Combine into single file
debug?:       true                 # Include cue_sheet
```

### `voice_status`

エンジン状態、利用可能な音声、プリセット、およびバックエンド情報を返します。引数は不要です。

### `voice_interrupt`

音声合成を停止またはロールバックします。

```
streamId?:    "stream-123"
reason?:      "user_spoke"         # user_spoke | context_change | timeout | manual
```

### `voice_inner_monologue`

環境音として再生される短い音声。`--ambient`フラグまたは`VOICE_SOUNDBOARD_AMBIENT_ENABLED=1`が必要です。

```
text:         "Interesting..."     # Max 500 chars, auto-redacted
category?:    "thinking"           # general | thinking | observation | debug
```

## 音声

9言語、合計48種類の音声があります。言語は音声IDのプレフィックスから自動的に判別されます。設定は不要です。

| プレフィックス | 言語 |
|--------|----------|
| `af_` / `am_` | 英語（アメリカ） |
| `bf_` / `bm_` | 英語（イギリス） |
| `jf_` / `jm_` | 日本語 |
| `zf_` / `zm_` | 中国語（普通話） |
| `ef_` / `em_` | スペイン語 |
| `ff_` | フランス語 |
| `hf_` / `hm_` | ヒンディー語 |
| `if_` / `im_` | イタリア語 |
| `pf_` / `pm_` | ブラジルポルトガル語 |

### 英語 — アメリカ

| ID | 名前 | 性別 | スタイル |
|----|------|--------|-------|
| `af_aoede` | Aoede | 女性 | ミュージカル |
| `af_bella` | Bella | 女性 | Warm |
| `af_heart` | Heart | 女性 | 優しい |
| `af_jessica` | ジェシカ | 女性 | プロフェッショナル |
| `af_kore` | Kore | 女性 | 若々しい |
| `af_nicole` | ニコル | 女性 | Soft |
| `af_sarah` | Sarah | 女性 | Clear |
| `af_sky` | Sky | 女性 | Airy |
| `am_eric` | Eric | 男性 | 自信がある |
| `am_fenrir` | フェンリル | 男性 | 力強い |
| `am_liam` | Liam | 男性 | フレンドリー |
| `am_michael` | マイケル | 男性 | Deep |
| `am_onyx` | Onyx | 男性 | 滑らかな |
| `am_puck` | Puck | 男性 | 遊び心のある |

### 英語 — イギリス

| ID | 名前 | 性別 | スタイル |
|----|------|--------|-------|
| `bf_alice` | Alice | 女性 | 上品な |
| `bf_emma` | Emma | 女性 | 洗練された |
| `bf_isabella` | イザベラ | 女性 | Warm |
| `bm_fable` | Fable | 男性 | 物語 |
| `bm_george` | ジョージ | 男性 | 権威がある |
| `bm_lewis` | Lewis | 男性 | フレンドリー |

### 日本語

| ID | 名前 | 性別 | スタイル |
|----|------|--------|-------|
| `jf_alpha` | Alpha | 女性 | Clear |
| `jf_gongitsune` | Gongitsune | 女性 | 物語 |
| `jf_nezuko` | 禰豆子 | 女性 | 優しい |
| `jf_tebukuro` | Tebukuro | 女性 | Warm |
| `jm_kumo` | Kumo | 男性 | Calm |

### 中国語（普通話）

| ID | 名前 | 性別 | スタイル |
|----|------|--------|-------|
| `zf_xiaobei` | Xiaobei | 女性 | 明るい |
| `zf_xiaoni` | Xiaoni | 女性 | 優しい |
| `zf_xiaoxiao` | Xiaoxiao | 女性 | Clear |
| `zf_xiaoyi` | Xiaoyi | 女性 | Warm |
| `zm_yunjian` | Yunjian | 男性 | 権威がある |
| `zm_yunxi` | Yunxi | 男性 | フレンドリー |
| `zm_yunxia` | Yunxia | 男性 | Calm |
| `zm_yunyang` | Yunyang | 男性 | 自信がある |

### スペイン語

| ID | 名前 | 性別 | スタイル |
|----|------|--------|-------|
| `ef_dora` | Dora | 女性 | Warm |
| `em_alex` | Alex | 男性 | 自信がある |
| `em_santa` | Santa | 男性 | Jolly |

### フランス語

| ID | 名前 | 性別 | スタイル |
|----|------|--------|-------|
| `ff_siwis` | Siwis | 女性 | 洗練された |

### ヒンディー語

| ID | 名前 | 性別 | スタイル |
|----|------|--------|-------|
| `hf_alpha` | Alpha | 女性 | Clear |
| `hf_beta` | Beta | 女性 | Warm |
| `hm_omega` | Omega | 男性 | Deep |
| `hm_psi` | Psi | 男性 | Calm |

### イタリア語

| ID | 名前 | 性別 | スタイル |
|----|------|--------|-------|
| `if_sara` | Sara | 女性 | Warm |
| `im_nicola` | Nicola | 男性 | 自信がある |

### ブラジルポルトガル語

| ID | 名前 | 性別 | スタイル |
|----|------|--------|-------|
| `pf_dora` | Dora | 女性 | Warm |
| `pm_alex` | Alex | 男性 | 自信がある |
| `pm_santa` | Santa | 男性 | Jolly |

### プリセット

| プリセット | Voice | Speed | 説明 |
|--------|-------|-------|-------------|
| `narrator` | `bm_george` | 0.95 | 落ち着いたドキュメンタリー風 |
| `announcer` | `am_onyx` | 1.05 | ニュースキャスターのような雰囲気 |
| `whisper` | `af_aoede` | 0.85 | 柔らかく、親密 |
| `storyteller` | `bf_emma` | 0.90 | 温かいおとぎ話のような雰囲気 |
| `assistant` | `af_jessica` | 1.0 | 中立的で、親切 |

## 感情の範囲

発話の抑揚を制御するために、感情タグでテキストを囲みます。

```
[happy]Great news![/happy] But [sad]I have to go.[/sad]
```

対応：`happy`、`sad`、`angry`、`fearful`、`surprised`、`disgusted`、`calm`、`excited`

## CLIフラグ

| Flag | デフォルト | 説明 |
|------|---------|-------------|
| `--artifact=path\ | base64` | `path` | 音声配信モード |
| `--output-dir=<path>` | `<tmpdir>/voice-soundboard/` | 出力ディレクトリ |
| `--backend=mock\ | http | `mock` | バックエンドの選択 |
| `--backend-url=<url>` | &mdash; | HTTPバックエンドURL |
| `--ambient` | オフ | 内部モノローグシステムを有効にする |
| `--max-concurrent=<n>` | `1` | 最大同時合成リクエスト数 |
| `--timeout=<ms>` | `20000` | リクエストごとのタイムアウト |
| `--retention-minutes=<n>` | `240` | 自動クリーンアップ期間（0で無効） |

## パッケージ

これは、公開可能なパッケージが2つあるpnpmモノレポです。

| パッケージ | 説明 | npm |
|---------|-------------|-----|
| [`@mcptoolshop/voice-soundboard-core`](packages/core) | 検証、SSML、チャンキング、スキーマを含む、バックエンドに依存しないコアライブラリ | [![npm](https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-core)](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-core) |
| [`@mcptoolshop/voice-soundboard-mcp`](packages/mcp-server) | CLI、ガードレール、トランスポートを備えたMCPサーバー | [![npm](https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-mcp)](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-mcp) |

## 開発

```bash
# Install
pnpm install

# Build
pnpm build

# Test (344 tests)
pnpm test

# Build + test in one step
pnpm verify
```

> [MCP Tool Shop](https://mcp-tool-shop.github.io/)の一部

### プロジェクト構造

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

## プライバシー

**テレメトリー機能はありません。** このツールは、利用状況データは一切収集せず、分析情報を送信せず、設定されたTTSバックエンドへのネットワーク接続以外は行いません。すべての処理はローカルで行われます。

## セキュリティ

脆弱性報告については、[SECURITY.md](SECURITY.md)を参照してください。

完全な脅威分析については、[THREAT_MODEL.md](THREAT_MODEL.md)を参照してください。

## 関連

| プロジェクト | 説明 |
|---------|-------------|
| [soundboard-plugin](https://github.com/mcp-tool-shop-org/soundboard-plugin) | Claude Codeプラグイン &mdash; スラッシュコマンド、感情を認識したナレーション |

## サポート

- **質問 / ヘルプ:** [ディスカッション](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/discussions)
- **バグ報告:** [イシュー](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/issues)
- **セキュリティ:** [SECURITY.md](SECURITY.md)

## 評価

| カテゴリ | 評価 | 備考 |
|----------|-------|-------|
| A. セキュリティ | 10/10 | SECURITY.md、THREAT_MODEL.md、機密情報保護、テレメトリー機能なし |
| B. エラー処理 | 8/10 | 構造化されたエラーハンドリング（コード/ヒント/再試行可能）、toToolErrorパターン |
| C. 運用ドキュメント | 9/10 | README、CHANGELOG、ハンドブック、ツールドキュメント |
| D. リリース時の品質管理 | 9/10 | CI、検証スクリプト、dependabot、ロックファイル |
| E. 識別 | 10/10 | ロゴ、翻訳、ランディングページ、メタデータ |
| **Total** | **46/50** | |

## ライセンス

[MIT](LICENSE)

---

<p align="center">
  Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
</p>
