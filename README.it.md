<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  
            <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/mcp-voice-soundboard/readme.png"
           alt="MCP Voice Soundboard" width="400">
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

- **Compatibilità nativa con MCP** &mdash; Trasporto tramite stdio, funziona con Claude Desktop, Cursor e qualsiasi client MCP.
- **5 strumenti** &mdash; `voice_speak`, `voice_dialogue`, `voice_status`, `voice_interrupt`, `voice_inner_monologue`.
- **48 voci disponibili, 9 lingue** &mdash; Inglese (americano e britannico), giapponese, cinese mandarino, spagnolo, francese, hindi, italiano, portoghese brasiliano. Preset predefiniti: `narratore`, `annunciatore`, `sussurro`, `narratore di storie`, `assistente`.
- **Indicazioni di emozione** &mdash; 8 emozioni tramite markup inline `[felice]...[/felice]`.
- **SSML-lite** &mdash; `<break>`, `<emphasis>`, `<prosody>` senza la complessità completa di SSML.
- **Tag di effetti sonori (SFX)** &mdash; Effetti sonori inline `[ding]`, `[chime]`, `[whoosh]`, `[tada]`, `[error]`, `[click]`.
- **Dialogo con più altoparlanti** &mdash; Formato `Altoparlante: riga` con direttive automatiche di assegnazione e pausa.
- **Misure di sicurezza** &mdash; Limitazione della velocità, semaforo di concorrenza, timeout delle richieste, protezione contro l'accesso non autorizzato, rimozione di informazioni sensibili.
- **Backend intercambiabili** &mdash; Mock (integrato), proxy HTTP, bridge Python o utilizzare il proprio.

## Guida rapida

```bash
npx @mcptoolshop/voice-soundboard-mcp
```

Oppure, installare globalmente:

```bash
npm install -g @mcptoolshop/voice-soundboard-mcp
voice-soundboard-mcp
```

### Configurazione di Claude Desktop / Client MCP

Aggiungere quanto segue alla configurazione del client MCP (ad esempio, `claude_desktop_config.json`):

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

Con le seguenti opzioni:

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

## Strumenti MCP

### `voice_speak`

Sintetizza il parlato a partire da un testo.

```
text:         "Hello world!"
voice?:       "am_fenrir"          # Voice ID or preset name
speed?:       1.0                  # 0.5 - 2.0
format?:      "wav"                # wav | mp3 | ogg | raw
artifactMode?: "path"             # path | base64
sfx?:         true                # Enable [ding], [chime] etc.
```

### `voice_dialogue`

Sintesi di dialoghi con più altoparlanti.

```
script:       "Alice: Hello!\nBob: Hey there!"
cast?:        { "Alice": "af_sky", "Bob": "am_fenrir" }
speed?:       1.0
concat?:      true                 # Combine into single file
debug?:       true                 # Include cue_sheet
```

### `voice_status`

Restituisce lo stato del motore, le voci disponibili, i preset e le informazioni sul backend. Non richiede argomenti.

### `voice_interrupt`

Interrompe o annulla la sintesi in corso.

```
streamId?:    "stream-123"
reason?:      "user_spoke"         # user_spoke | context_change | timeout | manual
```

### `voice_inner_monologue`

Micro-enunciati effimeri per una narrazione di sottofondo. Richiede il flag `--ambient` o `VOICE_SOUNDBOARD_AMBIENT_ENABLED=1`.

```
text:         "Interesting..."     # Max 500 chars, auto-redacted
category?:    "thinking"           # general | thinking | observation | debug
```

## Voci

48 voci in 9 lingue. La lingua viene dedotta automaticamente dal prefisso dell'ID della voce; non è necessaria alcuna configurazione.

| Prefisso | Lingua |
| -------- | ---------- |
| `af_` / `am_` | Inglese (americano) |
| `bf_` / `bm_` | Inglese (britannico) |
| `jf_` / `jm_` | Giapponese |
| `zf_` / `zm_` | Cinese mandarino |
| `ef_` / `em_` | Spagnolo |
| `ff_` | Francese |
| `hf_` / `hm_` | Hindi |
| `if_` / `im_` | Italiano |
| `pf_` / `pm_` | Portoghese brasiliano |

### Inglese — Americano

| ID | Name | Genere | Style |
|----| ------ | -------- | ------- |
| `af_aoede` | Aoede | Femminile | Musicale |
| `af_bella` | Bella | Femminile | Warm |
| `af_heart` | Heart | Femminile | Premurosa |
| `af_jessica` | Jessica | Femminile | Professionale |
| `af_kore` | Kore | Femminile | Giovanile |
| `af_nicole` | Nicole | Femminile | Soft |
| `af_sarah` | Sarah | Femminile | Clear |
| `af_sky` | Sky | Femminile | Airy |
| `am_eric` | Eric | Male | Sicura |
| `am_fenrir` | Fenrir | Male | Potente |
| `am_liam` | Liam | Male | Amichevole |
| `am_michael` | Michael | Male | Deep |
| `am_onyx` | Onyx | Male | Armoniosa |
| `am_puck` | Puck | Male | Giocosa |

### Inglese — Britannico

| ID | Name | Genere | Style |
|----| ------ | -------- | ------- |
| `bf_alice` | Alice | Femminile | Corretta |
| `bf_emma` | Emma | Femminile | Raffinata |
| `bf_isabella` | Isabella | Femminile | Warm |
| `bm_fable` | Fable | Male | Narrativa |
| `bm_george` | George | Male | Autoritaria |
| `bm_lewis` | Lewis | Male | Amichevole |

### Giapponese

| ID | Name | Genere | Style |
|----| ------ | -------- | ------- |
| `jf_alpha` | Alpha | Femmina | Clear |
| `jf_gongitsune` | Gongitsune | Femmina | Narrazione di storie |
| `jf_nezuko` | Nezuko | Femmina | Gentile |
| `jf_tebukuro` | Tebukuro | Femmina | Warm |
| `jm_kumo` | Kumo | Male | Calm |

### Cinese mandarino

| ID | Name | Genere | Style |
|----| ------ | -------- | ------- |
| `zf_xiaobei` | Xiaobei | Femmina | Vivace |
| `zf_xiaoni` | Xiaoni | Femmina | Gentile |
| `zf_xiaoxiao` | Xiaoxiao | Femmina | Clear |
| `zf_xiaoyi` | Xiaoyi | Femmina | Warm |
| `zm_yunjian` | Yunjian | Male | Autoritaria |
| `zm_yunxi` | Yunxi | Male | Amichevole |
| `zm_yunxia` | Yunxia | Male | Calm |
| `zm_yunyang` | Yunyang | Male | Sicura |

### Spagnolo

| ID | Name | Genere | Style |
|----| ------ | -------- | ------- |
| `ef_dora` | Dora | Femmina | Warm |
| `em_alex` | Alex | Male | Sicura |
| `em_santa` | Santa | Male | Jolly |

### Francese

| ID | Name | Genere | Style |
|----| ------ | -------- | ------- |
| `ff_siwis` | Siwis | Femmina | Raffinata |

### Hindi

| ID | Name | Genere | Style |
|----| ------ | -------- | ------- |
| `hf_alpha` | Alpha | Femmina | Clear |
| `hf_beta` | Beta | Femmina | Warm |
| `hm_omega` | Omega | Male | Deep |
| `hm_psi` | Psi | Male | Calm |

### Italiano

| ID | Name | Genere | Style |
|----| ------ | -------- | ------- |
| `if_sara` | Sara | Femmina | Warm |
| `im_nicola` | Nicola | Male | Sicura |

### Portoghese brasiliano

| ID | Name | Genere | Style |
|----| ------ | -------- | ------- |
| `pf_dora` | Dora | Femmina | Warm |
| `pm_alex` | Alex | Male | Sicura |
| `pm_santa` | Santa | Male | Jolly |

### Impostazioni predefinite

| Impostazione predefinita | Voice | Speed | Descrizione |
| -------- | ------- | ------- | ------------- |
| `narrator` | `bm_george` | 0.95 | Stile documentaristico calmo |
| `announcer` | `am_onyx` | 1.05 | Energia di un conduttore di notizie |
| `whisper` | `af_aoede` | 0.85 | Morbido, intimo |
| `storyteller` | `bf_emma` | 0.90 | Atmosfera calda da favola della buonanotte |
| `assistant` | `af_jessica` | 1.0 | Neutro, utile |

## Intervalli di emozione

Inserire il testo all'interno di tag di emozione per controllare la prosodia:

```
[happy]Great news![/happy] But [sad]I have to go.[/sad]
```

Supportato: `felice`, `triste`, `arrabbiato`, `spaventato`, `sorpreso`, `disgustato`, `calmo`, `eccitato`

## Flag della riga di comando

| Flag | Predefinito | Descrizione |
| ------ | --------- | ------------- |
| `--artifact=path\ | base64` | `path` | Modalità di consegna audio |
| `--output-dir=<path>` | `<tmpdir>/voice-soundboard/` | Directory di output |
| `--backend=mock\ |http` | `mock` | Selezione del backend |
| `--backend-url=<url>` | &mdash; | URL del backend HTTP |
| `--ambient` | off | Abilitare il sistema del monologo interiore |
| `--max-concurrent=<n>` | `1` | Richieste di sintesi concorrenti massime |
| `--timeout=<ms>` | `20000` | Timeout per richiesta |
| `--retention-minutes=<n>` | `240` | Età di pulizia automatica (0 per disabilitare) |

## Pacchetti

Questo è un monorepo pnpm con due pacchetti pubblicabili:

| Pacchetto | Descrizione | npm |
| --------- | ------------- |-----|
| [`@mcptoolshop/voice-soundboard-core`](packages/core) | Libreria principale indipendente dal backend (validazione, SSML, suddivisione, schemi) | [![npm](https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-core)](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-core) |
| [`@mcptoolshop/voice-soundboard-mcp`](packages/mcp-server) | Server MCP con CLI, protezioni e trasporto | [![npm](https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-mcp)](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-mcp) |

## Sviluppo

```bash
# Install
pnpm install

# Build
pnpm build

# Test (342 tests)
pnpm test
```

> Parte di [MCP Tool Shop](https://mcp-tool-shop.github.io/)

### Struttura del progetto

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

## Sicurezza

Consultare [SECURITY.md](SECURITY.md) per la segnalazione di vulnerabilità.

Consultare [THREAT_MODEL.md](THREAT_MODEL.md) per l'analisi completa della superficie di attacco.

## Correlati

| Progetto | Descrizione |
| --------- | ------------- |
| [soundboard-plugin](https://github.com/mcp-tool-shop-org/soundboard-plugin) | Plugin Claude Code &mdash; comandi slash, narrazione consapevole delle emozioni |

## Supporto

- **Domande / assistenza:** [Discussioni](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/discussions)
- **Segnalazione di bug:** [Problemi](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/issues)
- **Sicurezza:** [SECURITY.md](SECURITY.md)

## Licenza

[MIT](LICENSE)

---

<p align="center">
  Built by <a href="https://github.com/mcp-tool-shop-org">mcp-tool-shop</a>
</p>
