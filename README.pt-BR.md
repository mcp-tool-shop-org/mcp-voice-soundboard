<p align="center">
  <a href="README.md">English</a> | <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <strong>Português</strong>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/mcp-voice-soundboard/main/assets/logo-dark.jpg" alt="MCP Voice Soundboard" width="420" />
</p>

<h3 align="center">Servidor MCP de texto-para-fala para agentes de IA.</h3>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/mcp-tool-shop-org/mcp-voice-soundboard/ci.yml?branch=main&style=flat-square&label=CI" alt="CI"></a>
  <a href="https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-mcp"><img src="https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-mcp?style=flat-square&color=cb3837&logo=npm" alt="npm"></a>
  <img src="https://img.shields.io/badge/node-%E2%89%A520-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js 20+">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License: MIT"></a>
</p>

<p align="center">
  48 vozes &bull; 9 idiomas &bull; 5 presets &bull; 8 emoções &bull; SSML-lite &bull; Tags SFX &bull; diálogo multi-falante<br>
  Backends de TTS intercambiáveis. Proteções integradas. Funciona com um único comando <code>npx</code>.
</p>

---

## Destaques

- **MCP nativo** &mdash; transporte stdio, funciona com Claude Desktop, Cursor e qualquer cliente MCP
- **5 ferramentas** &mdash; `voice_speak`, `voice_dialogue`, `voice_status`, `voice_interrupt`, `voice_inner_monologue`
- **48 vozes aprovadas, 9 idiomas** &mdash; Inglês (Americano + Britânico), Japonês, Mandarim, Espanhol, Francês, Hindi, Italiano, Português Brasileiro. Presets curados: `narrator`, `announcer`, `whisper`, `storyteller`, `assistant`
- **Intervalos de emoção** &mdash; 8 emoções via marcação inline `[happy]...[/happy]`
- **SSML-lite** &mdash; `<break>`, `<emphasis>`, `<prosody>` sem a complexidade total do SSML
- **Tags SFX** &mdash; efeitos sonoros inline `[ding]`, `[chime]`, `[whoosh]`, `[tada]`, `[error]`, `[click]`
- **Diálogo multi-falante** &mdash; formato `Falante: fala` com casting automático e diretivas de pausa
- **Proteções** &mdash; limitação de taxa, semáforo de concorrência, timeouts por requisição, proteção contra travessia de caminho, redação de segredos
- **Backends intercambiáveis** &mdash; Mock (integrado), proxy HTTP, ponte Python ou traga o seu próprio

## Início Rápido

```bash
npx @mcptoolshop/voice-soundboard-mcp
```

Ou instale globalmente:

```bash
npm install -g @mcptoolshop/voice-soundboard-mcp
voice-soundboard-mcp
```

### Configuração do Claude Desktop / Cliente MCP

Adicione à configuração do seu cliente MCP (ex.: `claude_desktop_config.json`):

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

Com opções:

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

## Ferramentas MCP

### `voice_speak`

Sintetizar fala a partir de texto.

```
text:         "Hello world!"
voice?:       "am_fenrir"          # ID da voz ou nome do preset
speed?:       1.0                  # 0.5 - 2.0
format?:      "wav"                # wav | mp3 | ogg | raw
artifactMode?: "path"             # path | base64
sfx?:         true                # Habilitar [ding], [chime] etc.
```

### `voice_dialogue`

Síntese de diálogo com múltiplos falantes.

```
script:       "Alice: Hello!\nBob: Hey there!"
cast?:        { "Alice": "af_sky", "Bob": "am_fenrir" }
speed?:       1.0
concat?:      true                 # Combinar em um único arquivo
debug?:       true                 # Incluir cue_sheet
```

### `voice_status`

Retorna a saúde do engine, vozes disponíveis, presets e informações do backend. Sem argumentos.

### `voice_interrupt`

Parar ou reverter síntese ativa.

```
streamId?:    "stream-123"
reason?:      "user_spoke"         # user_spoke | context_change | timeout | manual
```

### `voice_inner_monologue`

Micro-falas efêmeras para narração ambiente. Requer a flag `--ambient` ou `VOICE_SOUNDBOARD_AMBIENT_ENABLED=1`.

```
text:         "Interesting..."     # Máx. 500 caracteres, redação automática
category?:    "thinking"           # general | thinking | observation | debug
```

## Vozes

48 vozes em 9 idiomas. O idioma é inferido automaticamente pelo prefixo do ID da voz — nenhuma configuração necessária.

| Prefixo | Idioma |
|---------|--------|
| `af_` / `am_` | Inglês (Americano) |
| `bf_` / `bm_` | Inglês (Britânico) |
| `jf_` / `jm_` | Japonês |
| `zf_` / `zm_` | Mandarim Chinês |
| `ef_` / `em_` | Espanhol |
| `ff_` | Francês |
| `hf_` / `hm_` | Hindi |
| `if_` / `im_` | Italiano |
| `pf_` / `pm_` | Português Brasileiro |

### Inglês — Americano

| ID | Nome | Gênero | Estilo |
|----|------|--------|--------|
| `af_aoede` | Aoede | Feminino | Musical |
| `af_bella` | Bella | Feminino | Acolhedor |
| `af_heart` | Heart | Feminino | Carinhoso |
| `af_jessica` | Jessica | Feminino | Profissional |
| `af_kore` | Kore | Feminino | Jovial |
| `af_nicole` | Nicole | Feminino | Suave |
| `af_sarah` | Sarah | Feminino | Claro |
| `af_sky` | Sky | Feminino | Arejado |
| `am_eric` | Eric | Masculino | Confiante |
| `am_fenrir` | Fenrir | Masculino | Poderoso |
| `am_liam` | Liam | Masculino | Amigável |
| `am_michael` | Michael | Masculino | Grave |
| `am_onyx` | Onyx | Masculino | Suave |
| `am_puck` | Puck | Masculino | Brincalhão |

### Inglês — Britânico

| ID | Nome | Gênero | Estilo |
|----|------|--------|--------|
| `bf_alice` | Alice | Feminino | Formal |
| `bf_emma` | Emma | Feminino | Refinado |
| `bf_isabella` | Isabella | Feminino | Acolhedor |
| `bm_fable` | Fable | Masculino | Narrativo |
| `bm_george` | George | Masculino | Autoritário |
| `bm_lewis` | Lewis | Masculino | Amigável |

### Japonês

| ID | Nome | Gênero | Estilo |
|----|------|--------|--------|
| `jf_alpha` | Alpha | Feminino | Claro |
| `jf_gongitsune` | Gongitsune | Feminino | Narrativo |
| `jf_nezuko` | Nezuko | Feminino | Delicado |
| `jf_tebukuro` | Tebukuro | Feminino | Acolhedor |
| `jm_kumo` | Kumo | Masculino | Calmo |

### Mandarim Chinês

| ID | Nome | Gênero | Estilo |
|----|------|--------|--------|
| `zf_xiaobei` | Xiaobei | Feminino | Vibrante |
| `zf_xiaoni` | Xiaoni | Feminino | Delicado |
| `zf_xiaoxiao` | Xiaoxiao | Feminino | Claro |
| `zf_xiaoyi` | Xiaoyi | Feminino | Acolhedor |
| `zm_yunjian` | Yunjian | Masculino | Autoritário |
| `zm_yunxi` | Yunxi | Masculino | Amigável |
| `zm_yunxia` | Yunxia | Masculino | Calmo |
| `zm_yunyang` | Yunyang | Masculino | Confiante |

### Espanhol

| ID | Nome | Gênero | Estilo |
|----|------|--------|--------|
| `ef_dora` | Dora | Feminino | Acolhedor |
| `em_alex` | Alex | Masculino | Confiante |
| `em_santa` | Santa | Masculino | Alegre |

### Francês

| ID | Nome | Gênero | Estilo |
|----|------|--------|--------|
| `ff_siwis` | Siwis | Feminino | Refinado |

### Hindi

| ID | Nome | Gênero | Estilo |
|----|------|--------|--------|
| `hf_alpha` | Alpha | Feminino | Claro |
| `hf_beta` | Beta | Feminino | Acolhedor |
| `hm_omega` | Omega | Masculino | Grave |
| `hm_psi` | Psi | Masculino | Calmo |

### Italiano

| ID | Nome | Gênero | Estilo |
|----|------|--------|--------|
| `if_sara` | Sara | Feminino | Acolhedor |
| `im_nicola` | Nicola | Masculino | Confiante |

### Português Brasileiro

| ID | Nome | Gênero | Estilo |
|----|------|--------|--------|
| `pf_dora` | Dora | Feminino | Acolhedor |
| `pm_alex` | Alex | Masculino | Confiante |
| `pm_santa` | Santa | Masculino | Alegre |

### Presets

| Preset | Voz | Velocidade | Descrição |
|--------|-----|------------|-----------|
| `narrator` | `bm_george` | 0.95 | Estilo documentário calmo |
| `announcer` | `am_onyx` | 1.05 | Energia de âncora de notícias |
| `whisper` | `af_aoede` | 0.85 | Suave, íntimo |
| `storyteller` | `bf_emma` | 0.90 | Sensação acolhedora de história de ninar |
| `assistant` | `af_jessica` | 1.0 | Neutro, prestativo |

## Intervalos de Emoção

Envolva o texto em tags de emoção para controlar a prosódia:

```
[happy]Ótima notícia![/happy] Mas [sad]eu tenho que ir.[/sad]
```

Suportados: `happy`, `sad`, `angry`, `fearful`, `surprised`, `disgusted`, `calm`, `excited`

## Flags da CLI

| Flag | Padrão | Descrição |
|------|--------|-----------|
| `--artifact=path\|base64` | `path` | Modo de entrega do áudio |
| `--output-dir=<path>` | `<tmpdir>/voice-soundboard/` | Diretório de saída |
| `--backend=mock\|http` | `mock` | Seleção de backend |
| `--backend-url=<url>` | &mdash; | URL do backend HTTP |
| `--ambient` | desligado | Habilitar sistema de monólogo interno |
| `--max-concurrent=<n>` | `1` | Máx. de requisições de síntese concorrentes |
| `--timeout=<ms>` | `20000` | Timeout por requisição |
| `--retention-minutes=<n>` | `240` | Idade para limpeza automática (0 para desabilitar) |

## Pacotes

Este é um monorepo pnpm com dois pacotes publicáveis:

| Pacote | Descrição | npm |
|--------|-----------|-----|
| [`@mcptoolshop/voice-soundboard-core`](packages/core) | Biblioteca core agnóstica de backend (validação, SSML, chunking, schemas) | [![npm](https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-core?style=flat-square)](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-core) |
| [`@mcptoolshop/voice-soundboard-mcp`](packages/mcp-server) | Servidor MCP com CLI, proteções e transporte | [![npm](https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-mcp?style=flat-square)](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-mcp) |

## Desenvolvimento

```bash
# Instalar
pnpm install

# Compilar
pnpm build

# Testar (342 testes)
pnpm test
```

> Parte do [MCP Tool Shop](https://mcp-tool-shop.github.io/)

### Estrutura do Projeto

```
mcp-voice-soundboard/
  packages/
    core/               @mcptoolshop/voice-soundboard-core
      src/
        limits.ts         SHIP_LIMITS, limites de texto/chunk
        schemas.ts        VoiceRequest, VoiceResponse, códigos de erro
        artifact.ts       resolveOutputDir, sandbox de caminho
        voices.ts         Registro de vozes aprovadas + presets
        emotion.ts        Parser de intervalos de emoção
        ssml/             Parser SSML-lite + limites
        chunking/         Divisor de texto
        sfx/              Parser de tags SFX + registro
        sandbox.ts        Nomes de arquivo seguros, verificações de symlink
        ambient.ts        AmbientEmitter para monólogo interno
        redact.ts         Redação de PII/segredos
    mcp-server/         @mcptoolshop/voice-soundboard-mcp
      src/
        server.ts         Registro de ferramentas MCP + ligação de proteções
        cli.ts            Ponto de entrada CLI (transporte stdio)
        backend.ts        Abstração de backend + mock/HTTP
        concurrency.ts    SynthesisSemaphore
        rateLimit.ts      ToolRateLimiter (janela deslizante)
        timeout.ts        Utilitário withTimeout
        retention.ts      Timer de limpeza de arquivos de saída
        redact.ts         Redação em nível de servidor
        validation.ts     Validação de resultado de síntese
        tools/            Handlers individuais de ferramentas
  assets/               Logo, manifestos de eventos de áudio
  docs/                 Documentação de arquitetura
```

## Segurança

Consulte [SECURITY.md](SECURITY.md) para reportar vulnerabilidades.

Consulte [THREAT_MODEL.md](THREAT_MODEL.md) para a análise completa da superfície de ameaças.

## Relacionados

| Projeto | Descrição |
|---------|-----------|
| [soundboard-plugin](https://github.com/mcp-tool-shop-org/soundboard-plugin) | Plugin para Claude Code &mdash; comandos slash, narração com consciência emocional |

## Suporte

- **Perguntas / ajuda:** [Discussions](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/discussions)
- **Relatórios de bugs:** [Issues](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/issues)
- **Segurança:** [SECURITY.md](SECURITY.md)

## Licença

[MIT](LICENSE)

---

<p align="center">
  Feito por <a href="https://github.com/mcp-tool-shop-org">mcp-tool-shop</a>
</p>
