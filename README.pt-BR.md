<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
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
  46 voices &bull; 9 languages &bull; 5 presets &bull; 8 emotions &bull; SSML-lite &bull; SFX tags &bull; multi-speaker dialogue<br>
  Swappable TTS backends. Guardrails built in. Ships as a single <code>npx</code> command.
</p>

---

## Destaques

- **Compatível com MCP nativo** &mdash; utiliza o transporte stdio, funciona com Claude Desktop, Cursor e qualquer cliente MCP.
- **5 ferramentas** &mdash; `voice_speak`, `voice_dialogue`, `voice_status`, `voice_interrupt`, `voice_inner_monologue`
- **46 vozes, 9 idiomas** &mdash; Inglês (Americano + Britânico), Japonês, Mandarim, Espanhol, Francês, Hindi, Italiano, Português do Brasil. Presets pré-definidos: `narrador`, `anunciador`, `sussurro`, `contador de histórias`, `assistente`.
- **Intervalos de emoção** &mdash; 8 emoções através de marcação inline `[feliz]...[/feliz]`
- **SSML-lite** &mdash; `<break>`, `<emphasis>`, `<prosody>` sem a complexidade total do SSML.
- **Tags de efeitos sonoros (SFX)** &mdash; `[ding]`, `[chime]`, `[whoosh]`, `[tada]`, `[error]`, `[click]` para efeitos sonoros inline.
- **Diálogo com múltiplos locutores** &mdash; Formato `Locutor: linha` com diretivas de atribuição automática e pausa.
- **Mecanismos de proteção** &mdash; Limitação de taxa, semáforo de concorrência, tempos limite de requisição, proteção contra travessia de caminho, redação de informações confidenciais.
- **Backends intercambiáveis** &mdash; Mock (integrado), proxy HTTP, ponte Python ou utilize o seu próprio.

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

Adicione à configuração do seu cliente MCP (por exemplo, `claude_desktop_config.json`):

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

Sintetiza fala a partir de texto.

```
text:         "Hello world!"
voice?:       "am_fenrir"          # Voice ID or preset name
speed?:       1.0                  # 0.5 - 2.0
format?:      "wav"                # wav | mp3 | ogg | raw
artifactMode?: "path"             # path | base64
sfx?:         true                # Enable [ding], [chime] etc.
```

### `voice_dialogue`

Síntese de diálogo com múltiplos locutores.

```
script:       "Alice: Hello!\nBob: Hey there!"
cast?:        { "Alice": "af_sky", "Bob": "am_fenrir" }
speed?:       1.0
concat?:      true                 # Combine into single file
debug?:       true                 # Include cue_sheet
```

### `voice_status`

Retorna o estado do motor, vozes disponíveis, presets e informações do backend. Não requer argumentos.

### `voice_interrupt`

Interrompe ou reverte a síntese ativa.

```
streamId?:    "stream-123"
reason?:      "user_spoke"         # user_spoke | context_change | timeout | manual
```

### `voice_inner_monologue`

Micro-declarações efêmeras para narração ambiente. Requer a flag `--ambient` ou `VOICE_SOUNDBOARD_AMBIENT_ENABLED=1`.

```
text:         "Interesting..."     # Max 500 chars, auto-redacted
category?:    "thinking"           # general | thinking | observation | debug
```

## Vozes

46 vozes em 9 idiomas. O idioma é inferido automaticamente do prefixo do ID da voz — nenhuma configuração é necessária.

| Prefixo | Idioma |
|--------|----------|
| `af_` / `am_` | Inglês (Americano) |
| `bf_` / `bm_` | Inglês (Britânico) |
| `jf_` / `jm_` | Japonês |
| `zf_` / `zm_` | Chinês Mandarim |
| `ef_` / `em_` | Espanhol |
| `ff_` | Francês |
| `hf_` / `hm_` | Hindi |
| `if_` / `im_` | Italiano |
| `pf_` / `pm_` | Português Brasileiro |

### Inglês — Americano

| ID | Nome | Gênero | Estilo |
|----|------|--------|-------|
| `af_aoede` | Aoede | Feminino | Musical |
| `af_bella` | Bella | Feminino | Acolhedor |
| `af_heart` | Coração | Feminino | Atenciosa |
| `af_jessica` | Jessica | Feminino | Profissional |
| `af_kore` | Kore | Feminino | Jovem |
| `af_nicole` | Nicole | Feminino | Suave |
| `af_sarah` | Sarah | Feminino | Claro |
| `af_sky` | Céu | Feminino | Arejado |
| `am_eric` | Eric | Masculino | Confiante |
| `am_fenrir` | Fenrir | Masculino | Poderosa |
| `am_liam` | Liam | Masculino | Amigável |
| `am_michael` | Michael | Masculino | Profundo |
| `am_onyx` | Ônix | Masculino | Suave |
| `am_puck` | Puck | Masculino | Brincalhona |

### Inglês — Britânico

| ID | Nome | Gênero | Estilo |
|----|------|--------|-------|
| `bf_alice` | Alice | Feminino | Formal |
| `bf_emma` | Emma | Feminino | Refinado |
| `bf_isabella` | Isabella | Feminino | Acolhedor |
| `bm_fable` | Fábula | Masculino | Contação de histórias |
| `bm_george` | George | Masculino | Autoritário |
| `bm_lewis` | Lewis | Masculino | Amigável |

### Japonês

| ID | Nome | Gênero | Estilo |
|----|------|--------|-------|
| `jf_alpha` | Alfa | Feminino | Claro |
| `jf_gongitsune` | Gongitsune | Feminino | Contação de histórias |
| `jf_nezuko` | Nezuko | Feminino | Gentil |
| `jf_tebukuro` | Tebukuro | Feminino | Acolhedor |
| `jm_kumo` | Kumo | Masculino | Calmo |

### Chinês Mandarim

| ID | Nome | Gênero | Estilo |
|----|------|--------|-------|
| `zf_xiaobei` | Xiaobei | Feminino | Brilhante |
| `zf_xiaoni` | Xiaoni | Feminino | Gentil |
| `zf_xiaoxiao` | Xiaoxiao | Feminino | Claro |
| `zf_xiaoyi` | Xiaoyi | Feminino | Acolhedor |
| `zm_yunjian` | Yunjian | Masculino | Autoritário |
| `zm_yunxi` | Yunxi | Masculino | Amigável |
| `zm_yunxia` | Yunxia | Masculino | Calmo |
| `zm_yunyang` | Yunyang | Masculino | Confiante |

### Espanhol

| ID | Nome | Gênero | Estilo |
|----|------|--------|-------|
| `ef_dora` | Dora | Feminino | Acolhedor |
| `em_alex` | Alex | Masculino | Confiante |
| `em_santa` | Santa | Masculino | Alegre |

### Francês

| ID | Nome | Gênero | Estilo |
|----|------|--------|-------|
| `ff_siwis` | Siwis | Feminino | Refinado |

### Hindi

| ID | Nome | Gênero | Estilo |
|----|------|--------|-------|
| `hf_alpha` | Alfa | Feminino | Claro |
| `hf_beta` | Beta | Feminino | Acolhedor |
| `hm_omega` | Omega | Masculino | Profundo |
| `hm_psi` | Psi | Masculino | Calmo |

### Italiano

| ID | Nome | Gênero | Estilo |
|----|------|--------|-------|
| `if_sara` | Sara | Feminino | Acolhedor |
| `im_nicola` | Nicola | Masculino | Confiante |

### Português Brasileiro

| ID | Nome | Gênero | Estilo |
|----|------|--------|-------|
| `pf_dora` | Dora | Feminino | Acolhedor |
| `pm_alex` | Alex | Masculino | Confiante |
| `pm_santa` | Santa | Masculino | Alegre |

### Predefinições

| Predefinição | Voz | Velocidade | Descrição |
|--------|-------|-------|-------------|
| `narrator` | `bm_george` | 0.95 | Estilo documental calmo |
| `announcer` | `am_onyx` | 1.05 | Energia de apresentador de notícias |
| `whisper` | `af_aoede` | 0.85 | Suave, íntimo |
| `storyteller` | `bf_emma` | 0.90 | Sensação acolhedora de história para dormir |
| `assistant` | `af_jessica` | 1.0 | Neutro, útil |

## Intervalos de Emoção

Envolva o texto em tags de emoção para controlar a prosódia:

```
[happy]Great news![/happy] But [sad]I have to go.[/sad]
```

Suportado: `feliz`, `triste`, `irritado`, `medroso`, `surpreso`, `enojado`, `calmo`, `animado`

## Flags da Linha de Comando

| Bandeira | Padrão | Descrição |
|------|---------|-------------|
| `--artifact=path\ | base64` | `path` | Modo de entrega de áudio |
| `--output-dir=<path>` | `<tmpdir>/voice-soundboard/` | Diretório de saída |
| `--backend=mock\ | http | `mock` | Seleção de backend |
| `--backend-url=<url>` | &mdash; | URL do backend HTTP |
| `--ambient` | desligado | Habilitar o sistema de monólogo interno |
| `--max-concurrent=<n>` | `1` | Número máximo de solicitações de síntese simultâneas |
| `--timeout=<ms>` | `20000` | Tempo limite por solicitação |
| `--retention-minutes=<n>` | `240` | Idade de limpeza automática (0 para desativar) |

## Pacotes

Este é um monorepo pnpm com dois pacotes publicáveis:

| Pacote | Descrição | npm |
|---------|-------------|-----|
| [`@mcptoolshop/voice-soundboard-core`](packages/core) | Biblioteca central independente do backend (validação, SSML, divisão em partes, esquemas) | [![npm](https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-core)](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-core) |
| [`@mcptoolshop/voice-soundboard-mcp`](packages/mcp-server) | Servidor MCP com CLI, diretrizes e transporte | [![npm](https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-mcp)](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-mcp) |

## Desenvolvimento

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

> Parte de [MCP Tool Shop](https://mcp-tool-shop.github.io/)

### Estrutura do Projeto

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

## Privacidade

**Sem telemetria.** Esta ferramenta não coleta dados de uso, não envia análises e não faz solicitações de rede, exceto para o backend de TTS que você configura. Todo o processamento é local.

## Segurança

Consulte [SECURITY.md](SECURITY.md) para relatar vulnerabilidades.

Consulte [THREAT_MODEL.md](THREAT_MODEL.md) para a análise completa da superfície de ataque.

## Relacionado

| Projeto | Descrição |
|---------|-------------|
| [soundboard-plugin](https://github.com/mcp-tool-shop-org/soundboard-plugin) | Plugin Claude Code &mdash; comandos de barra, narração com consciência de emoção |

## Suporte

- **Dúvidas / Ajuda:** [Discussões](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/discussions)
- **Relatórios de erros:** [Problemas](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/issues)
- **Segurança:** [SECURITY.md](SECURITY.md)

## Painel de avaliação

| Categoria | Pontuação | Observações |
|----------|-------|-------|
| A. Segurança | 10/10 | SECURITY.md, THREAT_MODEL.md, redação, sem telemetria |
| B. Tratamento de erros | 8/10 | Contrato de erro estruturado (código/dica/tentável), padrão toToolError |
| C. Documentação para operadores | 9/10 | README, CHANGELOG, MANUAL, documentação da ferramenta |
| D. Higiene de lançamento | 9/10 | CI, script de verificação, dependabot, lockfile |
| E. Identidade | 10/10 | Logotipo, traduções, página de destino, metadados |
| **Total** | **46/50** | |

## Licença

[MIT](LICENSE)

---

<p align="center">
  Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
</p>
