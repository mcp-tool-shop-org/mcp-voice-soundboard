<p align="center">
  <a href="README.md">English</a> | <strong>日本語</strong> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/mcp-voice-soundboard/main/assets/logo-dark.jpg" alt="MCP Voice Soundboard" width="420" />
</p>

<h3 align="center">AIエージェント向けテキスト読み上げMCPサーバー</h3>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/mcp-tool-shop-org/mcp-voice-soundboard/ci.yml?branch=main&style=flat-square&label=CI" alt="CI"></a>
  <a href="https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-mcp"><img src="https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-mcp?style=flat-square&color=cb3837&logo=npm" alt="npm"></a>
  <img src="https://img.shields.io/badge/node-%E2%89%A520-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js 20+">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License: MIT"></a>
</p>

<p align="center">
  48種類の音声 &bull; 9言語 &bull; 5つのプリセット &bull; 8つの感情表現 &bull; SSML-lite &bull; 効果音タグ &bull; 複数話者の対話<br>
  交換可能なTTSバックエンド。ガードレール内蔵。単一の<code>npx</code>コマンドで実行可能。
</p>

---

## 主な特徴

- **MCPネイティブ** &mdash; stdioトランスポート対応。Claude Desktop、Cursor、その他すべてのMCPクライアントで動作
- **5つのツール** &mdash; `voice_speak`、`voice_dialogue`、`voice_status`、`voice_interrupt`、`voice_inner_monologue`
- **48種類の厳選音声、9言語対応** &mdash; 英語（アメリカ＋イギリス）、日本語、中国語（普通話）、スペイン語、フランス語、ヒンディー語、イタリア語、ブラジルポルトガル語。厳選プリセット：`narrator`、`announcer`、`whisper`、`storyteller`、`assistant`
- **感情スパン** &mdash; `[happy]...[/happy]`のインラインマークアップで8種類の感情を表現
- **SSML-lite** &mdash; 完全なSSMLの複雑さなしに`<break>`、`<emphasis>`、`<prosody>`を利用可能
- **効果音タグ** &mdash; `[ding]`、`[chime]`、`[whoosh]`、`[tada]`、`[error]`、`[click]`のインライン効果音
- **複数話者の対話** &mdash; `Speaker: line`形式で自動キャスティングとポーズ指示に対応
- **ガードレール** &mdash; レート制限、同時実行セマフォ、リクエストタイムアウト、パストラバーサル保護、シークレット秘匿化
- **交換可能なバックエンド** &mdash; Mock（組み込み）、HTTPプロキシ、Pythonブリッジ、または独自実装

## クイックスタート

```bash
npx @mcptoolshop/voice-soundboard-mcp
```

グローバルインストールの場合：

```bash
npm install -g @mcptoolshop/voice-soundboard-mcp
voice-soundboard-mcp
```

### Claude Desktop / MCPクライアントの設定

MCPクライアントの設定ファイル（例：`claude_desktop_config.json`）に以下を追加してください：

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

オプション付きの場合：

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
voice?:       "am_fenrir"          # 音声IDまたはプリセット名
speed?:       1.0                  # 0.5 - 2.0
format?:      "wav"                # wav | mp3 | ogg | raw
artifactMode?: "path"             # path | base64
sfx?:         true                # [ding]、[chime]等を有効化
```

### `voice_dialogue`

複数話者の対話を合成します。

```
script:       "Alice: Hello!\nBob: Hey there!"
cast?:        { "Alice": "af_sky", "Bob": "am_fenrir" }
speed?:       1.0
concat?:      true                 # 単一ファイルに結合
debug?:       true                 # cue_sheetを含める
```

### `voice_status`

エンジンの状態、利用可能な音声、プリセット、バックエンド情報を返します。引数なし。

### `voice_interrupt`

実行中の合成を停止またはロールバックします。

```
streamId?:    "stream-123"
reason?:      "user_spoke"         # user_spoke | context_change | timeout | manual
```

### `voice_inner_monologue`

アンビエントナレーション用の一時的なマイクロ発話。`--ambient`フラグまたは`VOICE_SOUNDBOARD_AMBIENT_ENABLED=1`が必要です。

```
text:         "Interesting..."     # 最大500文字、自動秘匿化
category?:    "thinking"           # general | thinking | observation | debug
```

## 音声

9言語にわたる48種類の音声。音声IDのプレフィックスから言語が自動推定されるため、設定は不要です。

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
| `af_aoede` | Aoede | 女性 | 音楽的 |
| `af_bella` | Bella | 女性 | 温かみのある |
| `af_heart` | Heart | 女性 | 思いやりのある |
| `af_jessica` | Jessica | 女性 | プロフェッショナル |
| `af_kore` | Kore | 女性 | 若々しい |
| `af_nicole` | Nicole | 女性 | 柔らかい |
| `af_sarah` | Sarah | 女性 | 明瞭 |
| `af_sky` | Sky | 女性 | 軽やか |
| `am_eric` | Eric | 男性 | 自信のある |
| `am_fenrir` | Fenrir | 男性 | 力強い |
| `am_liam` | Liam | 男性 | 親しみやすい |
| `am_michael` | Michael | 男性 | 深みのある |
| `am_onyx` | Onyx | 男性 | なめらか |
| `am_puck` | Puck | 男性 | 遊び心のある |

### 英語 — イギリス

| ID | 名前 | 性別 | スタイル |
|----|------|--------|-------|
| `bf_alice` | Alice | 女性 | 上品 |
| `bf_emma` | Emma | 女性 | 洗練された |
| `bf_isabella` | Isabella | 女性 | 温かみのある |
| `bm_fable` | Fable | 男性 | 物語調 |
| `bm_george` | George | 男性 | 威厳のある |
| `bm_lewis` | Lewis | 男性 | 親しみやすい |

### 日本語

| ID | 名前 | 性別 | スタイル |
|----|------|--------|-------|
| `jf_alpha` | Alpha | 女性 | 明瞭 |
| `jf_gongitsune` | Gongitsune | 女性 | 物語調 |
| `jf_nezuko` | Nezuko | 女性 | 穏やか |
| `jf_tebukuro` | Tebukuro | 女性 | 温かみのある |
| `jm_kumo` | Kumo | 男性 | 落ち着いた |

### 中国語（普通話）

| ID | 名前 | 性別 | スタイル |
|----|------|--------|-------|
| `zf_xiaobei` | Xiaobei | 女性 | 明るい |
| `zf_xiaoni` | Xiaoni | 女性 | 穏やか |
| `zf_xiaoxiao` | Xiaoxiao | 女性 | 明瞭 |
| `zf_xiaoyi` | Xiaoyi | 女性 | 温かみのある |
| `zm_yunjian` | Yunjian | 男性 | 威厳のある |
| `zm_yunxi` | Yunxi | 男性 | 親しみやすい |
| `zm_yunxia` | Yunxia | 男性 | 落ち着いた |
| `zm_yunyang` | Yunyang | 男性 | 自信のある |

### スペイン語

| ID | 名前 | 性別 | スタイル |
|----|------|--------|-------|
| `ef_dora` | Dora | 女性 | 温かみのある |
| `em_alex` | Alex | 男性 | 自信のある |
| `em_santa` | Santa | 男性 | 陽気 |

### フランス語

| ID | 名前 | 性別 | スタイル |
|----|------|--------|-------|
| `ff_siwis` | Siwis | 女性 | 洗練された |

### ヒンディー語

| ID | 名前 | 性別 | スタイル |
|----|------|--------|-------|
| `hf_alpha` | Alpha | 女性 | 明瞭 |
| `hf_beta` | Beta | 女性 | 温かみのある |
| `hm_omega` | Omega | 男性 | 深みのある |
| `hm_psi` | Psi | 男性 | 落ち着いた |

### イタリア語

| ID | 名前 | 性別 | スタイル |
|----|------|--------|-------|
| `if_sara` | Sara | 女性 | 温かみのある |
| `im_nicola` | Nicola | 男性 | 自信のある |

### ブラジルポルトガル語

| ID | 名前 | 性別 | スタイル |
|----|------|--------|-------|
| `pf_dora` | Dora | 女性 | 温かみのある |
| `pm_alex` | Alex | 男性 | 自信のある |
| `pm_santa` | Santa | 男性 | 陽気 |

### プリセット

| プリセット | 音声 | 速度 | 説明 |
|--------|-------|-------|-------------|
| `narrator` | `bm_george` | 0.95 | 落ち着いたドキュメンタリー調 |
| `announcer` | `am_onyx` | 1.05 | ニュースキャスター風 |
| `whisper` | `af_aoede` | 0.85 | 柔らかく親密な語り |
| `storyteller` | `bf_emma` | 0.90 | 温かい読み聞かせ風 |
| `assistant` | `af_jessica` | 1.0 | ニュートラルで丁寧 |

## 感情スパン

テキストを感情タグで囲むことで韻律を制御できます：

```
[happy]嬉しいお知らせです！[/happy] でも[sad]お別れしなければなりません。[/sad]
```

対応する感情：`happy`、`sad`、`angry`、`fearful`、`surprised`、`disgusted`、`calm`、`excited`

## CLIフラグ

| フラグ | デフォルト | 説明 |
|------|---------|-------------|
| `--artifact=path\|base64` | `path` | 音声の出力モード |
| `--output-dir=<path>` | `<tmpdir>/voice-soundboard/` | 出力ディレクトリ |
| `--backend=mock\|http` | `mock` | バックエンドの選択 |
| `--backend-url=<url>` | &mdash; | HTTPバックエンドのURL |
| `--ambient` | 無効 | 内部モノローグ機能を有効化 |
| `--max-concurrent=<n>` | `1` | 最大同時合成リクエスト数 |
| `--timeout=<ms>` | `20000` | リクエストごとのタイムアウト |
| `--retention-minutes=<n>` | `240` | 自動クリーンアップまでの時間（0で無効） |

## パッケージ

本プロジェクトは2つの公開パッケージを含むpnpmモノレポです：

| パッケージ | 説明 | npm |
|---------|-------------|-----|
| [`@mcptoolshop/voice-soundboard-core`](packages/core) | バックエンド非依存のコアライブラリ（バリデーション、SSML、チャンキング、スキーマ） | [![npm](https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-core?style=flat-square)](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-core) |
| [`@mcptoolshop/voice-soundboard-mcp`](packages/mcp-server) | CLI、ガードレール、トランスポートを備えたMCPサーバー | [![npm](https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-mcp?style=flat-square)](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-mcp) |

## 開発

```bash
# インストール
pnpm install

# ビルド
pnpm build

# テスト（342件）
pnpm test
```

> [MCP Tool Shop](https://mcp-tool-shop.github.io/) の一部です

### プロジェクト構成

```
mcp-voice-soundboard/
  packages/
    core/               @mcptoolshop/voice-soundboard-core
      src/
        limits.ts         SHIP_LIMITS、テキスト/チャンクの制限値
        schemas.ts        VoiceRequest、VoiceResponse、エラーコード
        artifact.ts       resolveOutputDir、パスサンドボックス
        voices.ts         承認済み音声レジストリ + プリセット
        emotion.ts        感情スパンパーサー
        ssml/             SSML-liteパーサー + 制限
        chunking/         テキストチャンカー
        sfx/              効果音タグパーサー + レジストリ
        sandbox.ts        安全なファイル名、シンボリックリンク検査
        ambient.ts        内部モノローグ用AmbientEmitter
        redact.ts         PII/シークレット秘匿化
    mcp-server/         @mcptoolshop/voice-soundboard-mcp
      src/
        server.ts         MCPツール登録 + ガードレール接続
        cli.ts            CLIエントリーポイント（stdioトランスポート）
        backend.ts        バックエンド抽象化 + mock/HTTP
        concurrency.ts    SynthesisSemaphore
        rateLimit.ts      ToolRateLimiter（スライディングウィンドウ）
        timeout.ts        withTimeoutユーティリティ
        retention.ts      出力ファイルクリーンアップタイマー
        redact.ts         サーバーレベルの秘匿化
        validation.ts     合成結果のバリデーション
        tools/            各ツールのハンドラー
  assets/               ロゴ、オーディオイベントマニフェスト
  docs/                 アーキテクチャドキュメント
```

## セキュリティ

脆弱性の報告については [SECURITY.md](SECURITY.md) をご覧ください。

脅威モデルの詳細な分析については [THREAT_MODEL.md](THREAT_MODEL.md) をご覧ください。

## 関連プロジェクト

| プロジェクト | 説明 |
|---------|-------------|
| [soundboard-plugin](https://github.com/mcp-tool-shop-org/soundboard-plugin) | Claude Codeプラグイン &mdash; スラッシュコマンド、感情対応ナレーション |

## サポート

- **質問・ヘルプ：** [Discussions](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/discussions)
- **バグ報告：** [Issues](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/issues)
- **セキュリティ：** [SECURITY.md](SECURITY.md)

## ライセンス

[MIT](LICENSE)

---

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org">mcp-tool-shop</a> が開発
</p>
