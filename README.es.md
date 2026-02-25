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

- **Compatible con MCP nativo:** Utiliza el transporte stdio y funciona con Claude Desktop, Cursor y cualquier cliente MCP.
- **5 herramientas:** `voice_speak`, `voice_dialogue`, `voice_status`, `voice_interrupt`, `voice_inner_monologue`.
- **48 voces disponibles, en 9 idiomas:** Inglés (americano y británico), japonés, mandarín, español, francés, hindi, italiano, portugués brasileño. Presets predefinidos: `narrador`, `anunciador`, `susurro`, `cuentacuentos`, `asistente`.
- **Marcadores de emoción:** 8 emociones mediante el uso de etiquetas `[feliz]...[/feliz]` dentro del texto.
- **SSML-lite:** Soporte para `<break>`, `<emphasis>`, `<prosody>` sin la complejidad completa de SSML.
- **Etiquetas de efectos de sonido (SFX):** `[ding]`, `[chime]`, `[whoosh]`, `[tada]`, `[error]`, `[click]` para insertar efectos de sonido directamente en el texto.
- **Diálogo con múltiples voces:** Formato `Voz: línea` con directivas de asignación automática de voz y pausas.
- **Mecanismos de seguridad:** Limitación de velocidad, semáforo de concurrencia, tiempos de espera de solicitudes, protección contra recorrido de rutas, eliminación de información confidencial.
- **Backends intercambiables:** Mock (integrado), proxy HTTP, puente de Python, o utiliza tu propia implementación.

## Inicio rápido

```bash
npx @mcptoolshop/voice-soundboard-mcp
```

O instálalo globalmente:

```bash
npm install -g @mcptoolshop/voice-soundboard-mcp
voice-soundboard-mcp
```

### Configuración de Claude Desktop / Cliente MCP

Agrega lo siguiente a la configuración de tu cliente MCP (por ejemplo, `claude_desktop_config.json`):

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

Con opciones:

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

## Herramientas MCP

### `voice_speak`

Sintetiza voz a partir de texto.

```
text:         "Hello world!"
voice?:       "am_fenrir"          # Voice ID or preset name
speed?:       1.0                  # 0.5 - 2.0
format?:      "wav"                # wav | mp3 | ogg | raw
artifactMode?: "path"             # path | base64
sfx?:         true                # Enable [ding], [chime] etc.
```

### `voice_dialogue`

Síntesis de diálogo con múltiples voces.

```
script:       "Alice: Hello!\nBob: Hey there!"
cast?:        { "Alice": "af_sky", "Bob": "am_fenrir" }
speed?:       1.0
concat?:      true                 # Combine into single file
debug?:       true                 # Include cue_sheet
```

### `voice_status`

Devuelve información sobre el estado del motor, las voces disponibles, los presets y la información del backend. No requiere argumentos.

### `voice_interrupt`

Detiene o revierte la síntesis activa.

```
streamId?:    "stream-123"
reason?:      "user_spoke"         # user_spoke | context_change | timeout | manual
```

### `voice_inner_monologue`

Micro-expresiones efímeras para narración ambiental. Requiere la bandera `--ambient` o `VOICE_SOUNDBOARD_AMBIENT_ENABLED=1`.

```
text:         "Interesting..."     # Max 500 chars, auto-redacted
category?:    "thinking"           # general | thinking | observation | debug
```

## Voces

48 voces en 9 idiomas. El idioma se infiere automáticamente del prefijo del ID de la voz; no se requiere configuración.

| Prefijo | Idioma |
| -------- | ---------- |
| `af_` / `am_` | Inglés (americano) |
| `bf_` / `bm_` | Inglés (británico) |
| `jf_` / `jm_` | Japonés |
| `zf_` / `zm_` | Chino mandarín |
| `ef_` / `em_` | Español |
| `ff_` | Francés |
| `hf_` / `hm_` | Hindi |
| `if_` / `im_` | Italiano |
| `pf_` / `pm_` | Portugués brasileño |

### Inglés — Americano

| ID | Name | Género | Style |
|----| ------ | -------- | ------- |
| `af_aoede` | Aoede | Femenina | Musical |
| `af_bella` | Bella | Femenina | Warm |
| `af_heart` | Heart | Femenina | Cariñosa |
| `af_jessica` | Jessica | Femenina | Profesional |
| `af_kore` | Kore | Femenina | Juvenil |
| `af_nicole` | Nicole | Femenina | Soft |
| `af_sarah` | Sarah | Femenina | Clear |
| `af_sky` | Sky | Femenina | Airy |
| `am_eric` | Eric | Male | Confiada |
| `am_fenrir` | Fenrir | Male | Poderosa |
| `am_liam` | Liam | Male | Amigable |
| `am_michael` | Michael | Male | Deep |
| `am_onyx` | Onyx | Male | Suave |
| `am_puck` | Puck | Male | Juguetona |

### Inglés — Británico

| ID | Name | Género | Style |
|----| ------ | -------- | ------- |
| `bf_alice` | Alice | Femenina | Formal |
| `bf_emma` | Emma | Femenina | Refinada |
| `bf_isabella` | Isabella | Femenina | Warm |
| `bm_fable` | Fable | Male | Narrativa |
| `bm_george` | George | Male | Autoritaria |
| `bm_lewis` | Lewis | Male | Amigable |

### Japonés

| ID | Name | Género | Style |
|----| ------ | -------- | ------- |
| `jf_alpha` | Alpha | Femenino | Clear |
| `jf_gongitsune` | Gongitsune | Femenino | Narración de historias |
| `jf_nezuko` | Nezuko | Femenino | Gentil |
| `jf_tebukuro` | Tebukuro | Femenino | Warm |
| `jm_kumo` | Kumo | Male | Calm |

### Chino mandarín

| ID | Name | Género | Style |
|----| ------ | -------- | ------- |
| `zf_xiaobei` | Xiaobei | Femenino | Brillante |
| `zf_xiaoni` | Xiaoni | Femenino | Gentil |
| `zf_xiaoxiao` | Xiaoxiao | Femenino | Clear |
| `zf_xiaoyi` | Xiaoyi | Femenino | Warm |
| `zm_yunjian` | Yunjian | Male | Autoritario |
| `zm_yunxi` | Yunxi | Male | Amigable |
| `zm_yunxia` | Yunxia | Male | Calm |
| `zm_yunyang` | Yunyang | Male | Confiado |

### Español

| ID | Name | Género | Style |
|----| ------ | -------- | ------- |
| `ef_dora` | Dora | Femenino | Warm |
| `em_alex` | Alex | Male | Confiado |
| `em_santa` | Santa | Male | Jolly |

### Francés

| ID | Name | Género | Style |
|----| ------ | -------- | ------- |
| `ff_siwis` | Siwis | Femenino | Refinado |

### Hindi

| ID | Name | Género | Style |
|----| ------ | -------- | ------- |
| `hf_alpha` | Alpha | Femenino | Clear |
| `hf_beta` | Beta | Femenino | Warm |
| `hm_omega` | Omega | Male | Deep |
| `hm_psi` | Psi | Male | Calm |

### Italiano

| ID | Name | Género | Style |
|----| ------ | -------- | ------- |
| `if_sara` | Sara | Femenino | Warm |
| `im_nicola` | Nicola | Male | Confiado |

### Portugués brasileño

| ID | Name | Género | Style |
|----| ------ | -------- | ------- |
| `pf_dora` | Dora | Femenino | Warm |
| `pm_alex` | Alex | Male | Confiado |
| `pm_santa` | Santa | Male | Jolly |

### Preajustes

| Preajuste | Voice | Speed | Descripción |
| -------- | ------- | ------- | ------------- |
| `narrator` | `bm_george` | 0.95 | Estilo documental tranquilo |
| `announcer` | `am_onyx` | 1.05 | Energía de presentadora de noticias |
| `whisper` | `af_aoede` | 0.85 | Suave, íntimo |
| `storyteller` | `bf_emma` | 0.90 | Ambiente cálido de cuento para dormir |
| `assistant` | `af_jessica` | 1.0 | Neutral, útil |

## Rangos de emoción

Encierra el texto en etiquetas de emoción para controlar la entonación:

```
[happy]Great news![/happy] But [sad]I have to go.[/sad]
```

Soportado: `feliz`, `triste`, `enojado`, `asustado`, `sorprendido`, `disgustado`, `calmado`, `entusiasmado`

## Marcas de la línea de comandos

| Flag | Predeterminado | Descripción |
| ------ | --------- | ------------- |
| `--artifact=path\ | base64` | `path` | Modo de entrega de audio |
| `--output-dir=<path>` | `<tmpdir>/voice-soundboard/` | Directorio de salida |
| `--backend=mock\ |http` | `mock` | Selección de backend |
| `--backend-url=<url>` | &mdash; | URL de backend HTTP |
| `--ambient` | off | Habilitar el sistema de monólogo interno |
| `--max-concurrent=<n>` | `1` | Número máximo de solicitudes de síntesis concurrentes |
| `--timeout=<ms>` | `20000` | Tiempo de espera por solicitud |
| `--retention-minutes=<n>` | `240` | Edad de limpieza automática (0 para desactivar) |

## Paquetes

Este es un monorepo de pnpm con dos paquetes publicables:

| Paquete | Descripción | npm |
| --------- | ------------- |-----|
| [`@mcptoolshop/voice-soundboard-core`](packages/core) | Biblioteca central independiente del backend (validación, SSML, segmentación, esquemas) | [![npm](https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-core)](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-core) |
| [`@mcptoolshop/voice-soundboard-mcp`](packages/mcp-server) | Servidor MCP con CLI, protecciones y transporte | [![npm](https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-mcp)](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-mcp) |

## Desarrollo

```bash
# Install
pnpm install

# Build
pnpm build

# Test (342 tests)
pnpm test
```

> Parte de [MCP Tool Shop](https://mcp-tool-shop.github.io/)

### Estructura del proyecto

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

## Seguridad

Consulta [SECURITY.md](SECURITY.md) para informar sobre vulnerabilidades.

Consulta [THREAT_MODEL.md](THREAT_MODEL.md) para el análisis completo de la superficie de ataque.

## Relacionado

| Proyecto | Descripción |
| --------- | ------------- |
| [soundboard-plugin](https://github.com/mcp-tool-shop-org/soundboard-plugin) | Plugin de Claude para código &mdash; comandos con barra, narración con conciencia de la emoción. |

## Soporte

- **Preguntas / ayuda:** [Discusiones](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/discussions)
- **Informes de errores:** [Problemas](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/issues)
- **Seguridad:** [SECURITY.md](SECURITY.md)

## Licencia

[MIT](LICENSE)

---

<p align="center">
  Built by <a href="https://github.com/mcp-tool-shop-org">mcp-tool-shop</a>
</p>
