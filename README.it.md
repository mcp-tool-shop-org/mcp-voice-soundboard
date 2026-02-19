<p align="center">
  <a href="README.md">English</a> | <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <strong>Italiano</strong> | <a href="README.pt-BR.md">Português</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/mcp-voice-soundboard/main/assets/logo-dark.jpg" alt="MCP Voice Soundboard" width="420" />
</p>

<h3 align="center">Server MCP text-to-speech per agenti AI.</h3>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/mcp-tool-shop-org/mcp-voice-soundboard/ci.yml?branch=main&style=flat-square&label=CI" alt="CI"></a>
  <a href="https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-mcp"><img src="https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-mcp?style=flat-square&color=cb3837&logo=npm" alt="npm"></a>
  <img src="https://img.shields.io/badge/node-%E2%89%A520-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js 20+">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License: MIT"></a>
</p>

<p align="center">
  48 voci &bull; 9 lingue &bull; 5 preset &bull; 8 emozioni &bull; SSML-lite &bull; tag SFX &bull; dialogo multi-parlante<br>
  Backend TTS intercambiabili. Protezioni integrate. Distribuito come singolo comando <code>npx</code>.
</p>

---

## Punti di forza

- **Nativo MCP** &mdash; trasporto stdio, compatibile con Claude Desktop, Cursor e qualsiasi client MCP
- **5 strumenti** &mdash; `voice_speak`, `voice_dialogue`, `voice_status`, `voice_interrupt`, `voice_inner_monologue`
- **48 voci approvate, 9 lingue** &mdash; Inglese (americano + britannico), giapponese, cinese mandarino, spagnolo, francese, hindi, italiano, portoghese brasiliano. Preset curati: `narrator`, `announcer`, `whisper`, `storyteller`, `assistant`
- **Span emozionali** &mdash; 8 emozioni tramite markup inline `[happy]...[/happy]`
- **SSML-lite** &mdash; `<break>`, `<emphasis>`, `<prosody>` senza la complessita del SSML completo
- **Tag SFX** &mdash; effetti sonori inline `[ding]`, `[chime]`, `[whoosh]`, `[tada]`, `[error]`, `[click]`
- **Dialogo multi-parlante** &mdash; formato `Parlante: battuta` con assegnazione automatica e direttive di pausa
- **Protezioni** &mdash; limitazione di frequenza, semaforo di concorrenza, timeout delle richieste, protezione da path traversal, redazione di segreti
- **Backend intercambiabili** &mdash; Mock (integrato), proxy HTTP, bridge Python, oppure porta il tuo

## Avvio rapido

```bash
npx @mcptoolshop/voice-soundboard-mcp
```

Oppure installa globalmente:

```bash
npm install -g @mcptoolshop/voice-soundboard-mcp
voice-soundboard-mcp
```

### Configurazione Claude Desktop / Client MCP

Aggiungi alla configurazione del tuo client MCP (es. `claude_desktop_config.json`):

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

Con opzioni:

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

Sintetizza il parlato da testo.

```
text:         "Hello world!"
voice?:       "am_fenrir"          # ID voce o nome preset
speed?:       1.0                  # 0.5 - 2.0
format?:      "wav"                # wav | mp3 | ogg | raw
artifactMode?: "path"             # path | base64
sfx?:         true                # Abilita [ding], [chime] ecc.
```

### `voice_dialogue`

Sintesi di dialogo multi-parlante.

```
script:       "Alice: Hello!\nBob: Hey there!"
cast?:        { "Alice": "af_sky", "Bob": "am_fenrir" }
speed?:       1.0
concat?:      true                 # Combina in un singolo file
debug?:       true                 # Include cue_sheet
```

### `voice_status`

Restituisce stato del motore, voci disponibili, preset e informazioni sul backend. Nessun argomento.

### `voice_interrupt`

Interrompe o annulla la sintesi attiva.

```
streamId?:    "stream-123"
reason?:      "user_spoke"         # user_spoke | context_change | timeout | manual
```

### `voice_inner_monologue`

Micro-espressioni effimere per narrazione ambientale. Richiede il flag `--ambient` o `VOICE_SOUNDBOARD_AMBIENT_ENABLED=1`.

```
text:         "Interesting..."     # Max 500 caratteri, redazione automatica
category?:    "thinking"           # general | thinking | observation | debug
```

## Voci

48 voci in 9 lingue. La lingua viene rilevata automaticamente dal prefisso dell'ID voce — nessuna configurazione necessaria.

| Prefisso | Lingua |
|----------|--------|
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

| ID | Nome | Genere | Stile |
|----|------|--------|-------|
| `af_aoede` | Aoede | Femminile | Musicale |
| `af_bella` | Bella | Femminile | Calda |
| `af_heart` | Heart | Femminile | Premurosa |
| `af_jessica` | Jessica | Femminile | Professionale |
| `af_kore` | Kore | Femminile | Giovanile |
| `af_nicole` | Nicole | Femminile | Delicata |
| `af_sarah` | Sarah | Femminile | Chiara |
| `af_sky` | Sky | Femminile | Ariosa |
| `am_eric` | Eric | Maschile | Sicura |
| `am_fenrir` | Fenrir | Maschile | Potente |
| `am_liam` | Liam | Maschile | Amichevole |
| `am_michael` | Michael | Maschile | Profonda |
| `am_onyx` | Onyx | Maschile | Vellutata |
| `am_puck` | Puck | Maschile | Giocosa |

### Inglese — Britannico

| ID | Nome | Genere | Stile |
|----|------|--------|-------|
| `bf_alice` | Alice | Femminile | Composta |
| `bf_emma` | Emma | Femminile | Raffinata |
| `bf_isabella` | Isabella | Femminile | Calda |
| `bm_fable` | Fable | Maschile | Narrativa |
| `bm_george` | George | Maschile | Autorevole |
| `bm_lewis` | Lewis | Maschile | Amichevole |

### Giapponese

| ID | Nome | Genere | Stile |
|----|------|--------|-------|
| `jf_alpha` | Alpha | Femminile | Chiara |
| `jf_gongitsune` | Gongitsune | Femminile | Narrativa |
| `jf_nezuko` | Nezuko | Femminile | Gentile |
| `jf_tebukuro` | Tebukuro | Femminile | Calda |
| `jm_kumo` | Kumo | Maschile | Pacata |

### Cinese Mandarino

| ID | Nome | Genere | Stile |
|----|------|--------|-------|
| `zf_xiaobei` | Xiaobei | Femminile | Luminosa |
| `zf_xiaoni` | Xiaoni | Femminile | Gentile |
| `zf_xiaoxiao` | Xiaoxiao | Femminile | Chiara |
| `zf_xiaoyi` | Xiaoyi | Femminile | Calda |
| `zm_yunjian` | Yunjian | Maschile | Autorevole |
| `zm_yunxi` | Yunxi | Maschile | Amichevole |
| `zm_yunxia` | Yunxia | Maschile | Pacata |
| `zm_yunyang` | Yunyang | Maschile | Sicura |

### Spagnolo

| ID | Nome | Genere | Stile |
|----|------|--------|-------|
| `ef_dora` | Dora | Femminile | Calda |
| `em_alex` | Alex | Maschile | Sicura |
| `em_santa` | Santa | Maschile | Allegra |

### Francese

| ID | Nome | Genere | Stile |
|----|------|--------|-------|
| `ff_siwis` | Siwis | Femminile | Raffinata |

### Hindi

| ID | Nome | Genere | Stile |
|----|------|--------|-------|
| `hf_alpha` | Alpha | Femminile | Chiara |
| `hf_beta` | Beta | Femminile | Calda |
| `hm_omega` | Omega | Maschile | Profonda |
| `hm_psi` | Psi | Maschile | Pacata |

### Italiano

| ID | Nome | Genere | Stile |
|----|------|--------|-------|
| `if_sara` | Sara | Femminile | Calda |
| `im_nicola` | Nicola | Maschile | Sicura |

### Portoghese Brasiliano

| ID | Nome | Genere | Stile |
|----|------|--------|-------|
| `pf_dora` | Dora | Femminile | Calda |
| `pm_alex` | Alex | Maschile | Sicura |
| `pm_santa` | Santa | Maschile | Allegra |

### Preset

| Preset | Voce | Velocita | Descrizione |
|--------|------|----------|-------------|
| `narrator` | `bm_george` | 0.95 | Stile documentaristico pacato |
| `announcer` | `am_onyx` | 1.05 | Energia da telegiornale |
| `whisper` | `af_aoede` | 0.85 | Soffice, intima |
| `storyteller` | `bf_emma` | 0.90 | Atmosfera calda da favola della buonanotte |
| `assistant` | `af_jessica` | 1.0 | Neutrale, disponibile |

## Span Emozionali

Racchiudi il testo in tag emozionali per controllare la prosodia:

```
[happy]Ottime notizie![/happy] Ma [sad]devo andare.[/sad]
```

Supportati: `happy`, `sad`, `angry`, `fearful`, `surprised`, `disgusted`, `calm`, `excited`

## Flag CLI

| Flag | Predefinito | Descrizione |
|------|-------------|-------------|
| `--artifact=path\|base64` | `path` | Modalita di consegna audio |
| `--output-dir=<path>` | `<tmpdir>/voice-soundboard/` | Directory di output |
| `--backend=mock\|http` | `mock` | Selezione backend |
| `--backend-url=<url>` | &mdash; | URL del backend HTTP |
| `--ambient` | disattivato | Abilita il sistema di monologo interiore |
| `--max-concurrent=<n>` | `1` | Richieste di sintesi concorrenti massime |
| `--timeout=<ms>` | `20000` | Timeout per richiesta |
| `--retention-minutes=<n>` | `240` | Durata pulizia automatica (0 per disabilitare) |

## Pacchetti

Questo e un monorepo pnpm con due pacchetti pubblicabili:

| Pacchetto | Descrizione | npm |
|-----------|-------------|-----|
| [`@mcptoolshop/voice-soundboard-core`](packages/core) | Libreria core indipendente dal backend (validazione, SSML, chunking, schemi) | [![npm](https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-core?style=flat-square)](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-core) |
| [`@mcptoolshop/voice-soundboard-mcp`](packages/mcp-server) | Server MCP con CLI, protezioni e trasporto | [![npm](https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-mcp?style=flat-square)](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-mcp) |

## Sviluppo

```bash
# Installazione
pnpm install

# Build
pnpm build

# Test (342 test)
pnpm test
```

> Parte di [MCP Tool Shop](https://mcp-tool-shop.github.io/)

### Struttura del Progetto

```
mcp-voice-soundboard/
  packages/
    core/               @mcptoolshop/voice-soundboard-core
      src/
        limits.ts         SHIP_LIMITS, limiti testo/chunk
        schemas.ts        VoiceRequest, VoiceResponse, codici di errore
        artifact.ts       resolveOutputDir, sandbox dei percorsi
        voices.ts         Registro voci approvate + preset
        emotion.ts        Parser span emozionali
        ssml/             Parser SSML-lite + limiti
        chunking/         Chunker del testo
        sfx/              Parser tag SFX + registro
        sandbox.ts        Nomi file sicuri, controlli symlink
        ambient.ts        AmbientEmitter per monologo interiore
        redact.ts         Redazione PII/segreti
    mcp-server/         @mcptoolshop/voice-soundboard-mcp
      src/
        server.ts         Registrazione strumenti MCP + cablaggio protezioni
        cli.ts            Punto di ingresso CLI (trasporto stdio)
        backend.ts        Astrazione backend + mock/HTTP
        concurrency.ts    SynthesisSemaphore
        rateLimit.ts      ToolRateLimiter (finestra scorrevole)
        timeout.ts        Utilita withTimeout
        retention.ts      Timer pulizia file di output
        redact.ts         Redazione a livello server
        validation.ts     Validazione risultati sintesi
        tools/            Handler dei singoli strumenti
  assets/               Logo, manifesti eventi audio
  docs/                 Documentazione architettura
```

## Sicurezza

Consulta [SECURITY.md](SECURITY.md) per la segnalazione di vulnerabilita.

Consulta [THREAT_MODEL.md](THREAT_MODEL.md) per l'analisi completa della superficie di minaccia.

## Correlati

| Progetto | Descrizione |
|----------|-------------|
| [soundboard-plugin](https://github.com/mcp-tool-shop-org/soundboard-plugin) | Plugin Claude Code &mdash; comandi slash, narrazione consapevole delle emozioni |

## Supporto

- **Domande / aiuto:** [Discussioni](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/discussions)
- **Segnalazione bug:** [Issue](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/issues)
- **Sicurezza:** [SECURITY.md](SECURITY.md)

## Licenza

[MIT](LICENSE)

---

<p align="center">
  Realizzato da <a href="https://github.com/mcp-tool-shop-org">mcp-tool-shop</a>
</p>
