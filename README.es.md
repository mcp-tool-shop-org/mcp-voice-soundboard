<p align="center">
  <a href="README.md">English</a> | <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <strong>Español</strong> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/mcp-voice-soundboard/main/assets/logo-dark.jpg" alt="MCP Voice Soundboard" width="420" />
</p>

<h3 align="center">Servidor MCP de texto a voz para agentes de IA.</h3>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/mcp-tool-shop-org/mcp-voice-soundboard/ci.yml?branch=main&style=flat-square&label=CI" alt="CI"></a>
  <a href="https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-mcp"><img src="https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-mcp?style=flat-square&color=cb3837&logo=npm" alt="npm"></a>
  <img src="https://img.shields.io/badge/node-%E2%89%A520-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js 20+">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License: MIT"></a>
</p>

<p align="center">
  48 voces &bull; 9 idiomas &bull; 5 preajustes &bull; 8 emociones &bull; SSML-lite &bull; Etiquetas SFX &bull; Diálogo multi-hablante<br>
  Backends de TTS intercambiables. Protecciones integradas. Se ejecuta con un solo comando <code>npx</code>.
</p>

---

## Aspectos Destacados

- **Nativo MCP** &mdash; transporte stdio, funciona con Claude Desktop, Cursor y cualquier cliente MCP
- **5 herramientas** &mdash; `voice_speak`, `voice_dialogue`, `voice_status`, `voice_interrupt`, `voice_inner_monologue`
- **48 voces aprobadas, 9 idiomas** &mdash; Inglés (americano + británico), japonés, mandarín, español, francés, hindi, italiano, portugués brasileño. Preajustes curados: `narrator`, `announcer`, `whisper`, `storyteller`, `assistant`
- **Intervalos de emoción** &mdash; 8 emociones mediante marcado en línea `[happy]...[/happy]`
- **SSML-lite** &mdash; `<break>`, `<emphasis>`, `<prosody>` sin la complejidad completa de SSML
- **Etiquetas SFX** &mdash; `[ding]`, `[chime]`, `[whoosh]`, `[tada]`, `[error]`, `[click]` efectos de sonido en línea
- **Diálogo multi-hablante** &mdash; formato `Hablante: línea` con asignación automática y directivas de pausa
- **Protecciones** &mdash; limitación de tasa, semáforo de concurrencia, tiempos de espera por solicitud, protección contra recorrido de rutas, redacción de secretos
- **Backends intercambiables** &mdash; Mock (integrado), proxy HTTP, puente Python, o trae el tuyo propio

## Inicio Rápido

```bash
npx @mcptoolshop/voice-soundboard-mcp
```

O instalar globalmente:

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
voice?:       "am_fenrir"          # ID de voz o nombre de preajuste
speed?:       1.0                  # 0.5 - 2.0
format?:      "wav"                # wav | mp3 | ogg | raw
artifactMode?: "path"             # path | base64
sfx?:         true                # Habilitar [ding], [chime] etc.
```

### `voice_dialogue`

Síntesis de diálogo multi-hablante.

```
script:       "Alice: Hello!\nBob: Hey there!"
cast?:        { "Alice": "af_sky", "Bob": "am_fenrir" }
speed?:       1.0
concat?:      true                 # Combinar en un solo archivo
debug?:       true                 # Incluir cue_sheet
```

### `voice_status`

Devuelve el estado del motor, voces disponibles, preajustes e información del backend. Sin argumentos.

### `voice_interrupt`

Detiene o revierte la síntesis activa.

```
streamId?:    "stream-123"
reason?:      "user_spoke"         # user_spoke | context_change | timeout | manual
```

### `voice_inner_monologue`

Micro-enunciados efímeros para narración ambiental. Requiere la bandera `--ambient` o `VOICE_SOUNDBOARD_AMBIENT_ENABLED=1`.

```
text:         "Interesting..."     # Máx 500 caracteres, redacción automática
category?:    "thinking"           # general | thinking | observation | debug
```

## Voces

48 voces en 9 idiomas. El idioma se infiere automáticamente del prefijo del ID de voz — no requiere configuración.

| Prefijo | Idioma |
|---------|--------|
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

| ID | Nombre | Género | Estilo |
|----|--------|--------|--------|
| `af_aoede` | Aoede | Femenino | Musical |
| `af_bella` | Bella | Femenino | Cálida |
| `af_heart` | Heart | Femenino | Afectuosa |
| `af_jessica` | Jessica | Femenino | Profesional |
| `af_kore` | Kore | Femenino | Juvenil |
| `af_nicole` | Nicole | Femenino | Suave |
| `af_sarah` | Sarah | Femenino | Clara |
| `af_sky` | Sky | Femenino | Etérea |
| `am_eric` | Eric | Masculino | Seguro |
| `am_fenrir` | Fenrir | Masculino | Potente |
| `am_liam` | Liam | Masculino | Amigable |
| `am_michael` | Michael | Masculino | Grave |
| `am_onyx` | Onyx | Masculino | Suave |
| `am_puck` | Puck | Masculino | Juguetón |

### Inglés — Británico

| ID | Nombre | Género | Estilo |
|----|--------|--------|--------|
| `bf_alice` | Alice | Femenino | Formal |
| `bf_emma` | Emma | Femenino | Refinada |
| `bf_isabella` | Isabella | Femenino | Cálida |
| `bm_fable` | Fable | Masculino | Narrativo |
| `bm_george` | George | Masculino | Autoritario |
| `bm_lewis` | Lewis | Masculino | Amigable |

### Japonés

| ID | Nombre | Género | Estilo |
|----|--------|--------|--------|
| `jf_alpha` | Alpha | Femenino | Clara |
| `jf_gongitsune` | Gongitsune | Femenino | Narrativa |
| `jf_nezuko` | Nezuko | Femenino | Gentil |
| `jf_tebukuro` | Tebukuro | Femenino | Cálida |
| `jm_kumo` | Kumo | Masculino | Tranquilo |

### Chino Mandarín

| ID | Nombre | Género | Estilo |
|----|--------|--------|--------|
| `zf_xiaobei` | Xiaobei | Femenino | Brillante |
| `zf_xiaoni` | Xiaoni | Femenino | Gentil |
| `zf_xiaoxiao` | Xiaoxiao | Femenino | Clara |
| `zf_xiaoyi` | Xiaoyi | Femenino | Cálida |
| `zm_yunjian` | Yunjian | Masculino | Autoritario |
| `zm_yunxi` | Yunxi | Masculino | Amigable |
| `zm_yunxia` | Yunxia | Masculino | Tranquilo |
| `zm_yunyang` | Yunyang | Masculino | Seguro |

### Español

| ID | Nombre | Género | Estilo |
|----|--------|--------|--------|
| `ef_dora` | Dora | Femenino | Cálida |
| `em_alex` | Alex | Masculino | Seguro |
| `em_santa` | Santa | Masculino | Jovial |

### Francés

| ID | Nombre | Género | Estilo |
|----|--------|--------|--------|
| `ff_siwis` | Siwis | Femenino | Refinada |

### Hindi

| ID | Nombre | Género | Estilo |
|----|--------|--------|--------|
| `hf_alpha` | Alpha | Femenino | Clara |
| `hf_beta` | Beta | Femenino | Cálida |
| `hm_omega` | Omega | Masculino | Grave |
| `hm_psi` | Psi | Masculino | Tranquilo |

### Italiano

| ID | Nombre | Género | Estilo |
|----|--------|--------|--------|
| `if_sara` | Sara | Femenino | Cálida |
| `im_nicola` | Nicola | Masculino | Seguro |

### Portugués Brasileño

| ID | Nombre | Género | Estilo |
|----|--------|--------|--------|
| `pf_dora` | Dora | Femenino | Cálida |
| `pm_alex` | Alex | Masculino | Seguro |
| `pm_santa` | Santa | Masculino | Jovial |

### Preajustes

| Preajuste | Voz | Velocidad | Descripción |
|-----------|-----|-----------|-------------|
| `narrator` | `bm_george` | 0.95 | Estilo documental tranquilo |
| `announcer` | `am_onyx` | 1.05 | Energía de presentador de noticias |
| `whisper` | `af_aoede` | 0.85 | Suave, íntimo |
| `storyteller` | `bf_emma` | 0.90 | Sensación de cuento para dormir |
| `assistant` | `af_jessica` | 1.0 | Neutral, servicial |

## Intervalos de Emoción

Envuelve el texto en etiquetas de emoción para controlar la prosodia:

```
[happy]Great news![/happy] But [sad]I have to go.[/sad]
```

Soportados: `happy`, `sad`, `angry`, `fearful`, `surprised`, `disgusted`, `calm`, `excited`

## Banderas de CLI

| Bandera | Predeterminado | Descripción |
|---------|----------------|-------------|
| `--artifact=path\|base64` | `path` | Modo de entrega de audio |
| `--output-dir=<path>` | `<tmpdir>/voice-soundboard/` | Directorio de salida |
| `--backend=mock\|http` | `mock` | Selección de backend |
| `--backend-url=<url>` | &mdash; | URL del backend HTTP |
| `--ambient` | desactivado | Habilitar sistema de monólogo interno |
| `--max-concurrent=<n>` | `1` | Máximo de solicitudes de síntesis concurrentes |
| `--timeout=<ms>` | `20000` | Tiempo de espera por solicitud |
| `--retention-minutes=<n>` | `240` | Antigüedad para limpieza automática (0 para desactivar) |

## Paquetes

Este es un monorepo pnpm con dos paquetes publicables:

| Paquete | Descripción | npm |
|---------|-------------|-----|
| [`@mcptoolshop/voice-soundboard-core`](packages/core) | Biblioteca central independiente del backend (validación, SSML, fragmentación, esquemas) | [![npm](https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-core?style=flat-square)](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-core) |
| [`@mcptoolshop/voice-soundboard-mcp`](packages/mcp-server) | Servidor MCP con CLI, protecciones y transporte | [![npm](https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-mcp?style=flat-square)](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-mcp) |

## Desarrollo

```bash
# Instalar
pnpm install

# Compilar
pnpm build

# Pruebas (342 tests)
pnpm test
```

> Parte de [MCP Tool Shop](https://mcp-tool-shop.github.io/)

### Estructura del Proyecto

```
mcp-voice-soundboard/
  packages/
    core/               @mcptoolshop/voice-soundboard-core
      src/
        limits.ts         SHIP_LIMITS, límites de texto/fragmento
        schemas.ts        VoiceRequest, VoiceResponse, códigos de error
        artifact.ts       resolveOutputDir, sandbox de rutas
        voices.ts         Registro de voces aprobadas + preajustes
        emotion.ts        Analizador de intervalos de emoción
        ssml/             Analizador SSML-lite + límites
        chunking/         Fragmentador de texto
        sfx/              Analizador de etiquetas SFX + registro
        sandbox.ts        Nombres de archivo seguros, verificación de symlinks
        ambient.ts        AmbientEmitter para monólogo interno
        redact.ts         Redacción de PII/secretos
    mcp-server/         @mcptoolshop/voice-soundboard-mcp
      src/
        server.ts         Registro de herramientas MCP + conexión de protecciones
        cli.ts            Punto de entrada CLI (transporte stdio)
        backend.ts        Abstracción de backend + mock/HTTP
        concurrency.ts    SynthesisSemaphore
        rateLimit.ts      ToolRateLimiter (ventana deslizante)
        timeout.ts        Utilidad withTimeout
        retention.ts      Temporizador de limpieza de archivos de salida
        redact.ts         Redacción a nivel de servidor
        validation.ts     Validación de resultados de síntesis
        tools/            Manejadores individuales de herramientas
  assets/               Logo, manifiestos de eventos de audio
  docs/                 Documentación de arquitectura
```

## Seguridad

Consulta [SECURITY.md](SECURITY.md) para reportar vulnerabilidades.

Consulta [THREAT_MODEL.md](THREAT_MODEL.md) para el análisis completo de la superficie de amenazas.

## Relacionados

| Proyecto | Descripción |
|----------|-------------|
| [soundboard-plugin](https://github.com/mcp-tool-shop-org/soundboard-plugin) | Plugin para Claude Code &mdash; comandos slash, narración con reconocimiento de emociones |

## Soporte

- **Preguntas / ayuda:** [Discusiones](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/discussions)
- **Reportes de errores:** [Issues](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/issues)
- **Seguridad:** [SECURITY.md](SECURITY.md)

## Licencia

[MIT](LICENSE)

---

<p align="center">
  Creado por <a href="https://github.com/mcp-tool-shop-org">mcp-tool-shop</a>
</p>
