<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
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

- **Compatible avec MCP natif** : utilise le transport stdio, fonctionne avec Claude Desktop, Cursor et tout client MCP.
- **5 outils** : `voice_speak`, `voice_dialogue`, `voice_status`, `voice_interrupt`, `voice_inner_monologue`.
- **48 voix disponibles, 9 langues** : anglais (américain et britannique), japonais, mandarin, espagnol, français, hindi, italien, portugais brésilien. Présets prédéfinis : `narrateur`, `annonceur`, `chuchotement`, `conte`, `assistant`.
- **Indicateurs d'émotion** : 8 émotions via la balise inline `[happy]...[/happy]`.
- **SSML-lite** : balises `<break>`, `<emphasis>`, `<prosody>` sans la complexité complète de SSML.
- **Balises d'effets sonores (SFX)** : `[ding]`, `[chime]`, `[whoosh]`, `[tada]`, `[error]`, `[click]` pour des effets sonores inline.
- **Dialogue multi-locuteurs** : format `Locuteur : ligne` avec directives d'attribution automatique et de pause.
- **Mesures de sécurité** : limitation du débit, sémaphore de concurrence, délais d'attente des requêtes, protection contre les attaques par parcours de répertoire, suppression des informations sensibles.
- **Backends interchangeables** : Mock (intégré), proxy HTTP, pont Python, ou utilisez votre propre backend.

## Démarrage rapide

```bash
npx @mcptoolshop/voice-soundboard-mcp
```

Ou installez globalement :

```bash
npm install -g @mcptoolshop/voice-soundboard-mcp
voice-soundboard-mcp
```

### Configuration du client Claude Desktop / MCP

Ajoutez ceci à la configuration de votre client MCP (par exemple, `claude_desktop_config.json`) :

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

Avec les options suivantes :

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

## Outils MCP

### `voice_speak`

Synthétise la parole à partir d'un texte.

```
text:         "Hello world!"
voice?:       "am_fenrir"          # Voice ID or preset name
speed?:       1.0                  # 0.5 - 2.0
format?:      "wav"                # wav | mp3 | ogg | raw
artifactMode?: "path"             # path | base64
sfx?:         true                # Enable [ding], [chime] etc.
```

### `voice_dialogue`

Synthèse de dialogue multi-locuteurs.

```
script:       "Alice: Hello!\nBob: Hey there!"
cast?:        { "Alice": "af_sky", "Bob": "am_fenrir" }
speed?:       1.0
concat?:      true                 # Combine into single file
debug?:       true                 # Include cue_sheet
```

### `voice_status`

Retourne l'état du moteur, les voix disponibles, les présets et les informations sur le backend. Ne prend aucun argument.

### `voice_interrupt`

Arrête ou annule la synthèse en cours.

```
streamId?:    "stream-123"
reason?:      "user_spoke"         # user_spoke | context_change | timeout | manual
```

### `voice_inner_monologue`

Micro-énoncés éphémères pour une narration d'ambiance. Nécessite le flag `--ambient` ou `VOICE_SOUNDBOARD_AMBIENT_ENABLED=1`.

```
text:         "Interesting..."     # Max 500 chars, auto-redacted
category?:    "thinking"           # general | thinking | observation | debug
```

## Voix

48 voix dans 9 langues. La langue est automatiquement détectée à partir du préfixe de l'ID de la voix ; aucune configuration n'est requise.

| Préfixe | Langue |
| -------- | ---------- |
| `af_` / `am_` | Anglais (américain) |
| `bf_` / `bm_` | Anglais (britannique) |
| `jf_` / `jm_` | Japonais |
| `zf_` / `zm_` | Mandarin |
| `ef_` / `em_` | Espagnol |
| `ff_` | Français |
| `hf_` / `hm_` | Hindi |
| `if_` / `im_` | Italien |
| `pf_` / `pm_` | Portugais brésilien |

### Anglais — Américain

| ID | Name | Genre | Style |
|----| ------ | -------- | ------- |
| `af_aoede` | Aoede | Femme | Musical |
| `af_bella` | Bella | Femme | Warm |
| `af_heart` | Heart | Femme | Affectueuse |
| `af_jessica` | Jessica | Femme | Professionnelle |
| `af_kore` | Kore | Femme | Jeune |
| `af_nicole` | Nicole | Femme | Soft |
| `af_sarah` | Sarah | Femme | Clear |
| `af_sky` | Sky | Femme | Airy |
| `am_eric` | Eric | Male | Confiante |
| `am_fenrir` | Fenrir | Male | Puissante |
| `am_liam` | Liam | Male | Amicale |
| `am_michael` | Michael | Male | Deep |
| `am_onyx` | Onyx | Male | Douce |
| `am_puck` | Puck | Male | Ludique |

### Anglais — Britannique

| ID | Name | Genre | Style |
|----| ------ | -------- | ------- |
| `bf_alice` | Alice | Femme | Soignée |
| `bf_emma` | Emma | Femme | Raffinée |
| `bf_isabella` | Isabella | Femme | Warm |
| `bm_fable` | Fable | Male | Conte |
| `bm_george` | George | Male | Autoritaire |
| `bm_lewis` | Lewis | Male | Amicale |

### Japonais

| ID | Name | Genre | Style |
|----| ------ | -------- | ------- |
| `jf_alpha` | Alpha | Féminine | Clear |
| `jf_gongitsune` | Gongitsune | Féminine | Narration |
| `jf_nezuko` | Nezuko | Féminine | Douce |
| `jf_tebukuro` | Tebukuro | Féminine | Warm |
| `jm_kumo` | Kumo | Male | Calm |

### Chinois mandarin

| ID | Name | Genre | Style |
|----| ------ | -------- | ------- |
| `zf_xiaobei` | Xiaobei | Féminine | Lumineuse |
| `zf_xiaoni` | Xiaoni | Féminine | Douce |
| `zf_xiaoxiao` | Xiaoxiao | Féminine | Clear |
| `zf_xiaoyi` | Xiaoyi | Féminine | Warm |
| `zm_yunjian` | Yunjian | Male | Autoritaire |
| `zm_yunxi` | Yunxi | Male | Amical |
| `zm_yunxia` | Yunxia | Male | Calm |
| `zm_yunyang` | Yunyang | Male | Confiant |

### Espagnol

| ID | Name | Genre | Style |
|----| ------ | -------- | ------- |
| `ef_dora` | Dora | Féminine | Warm |
| `em_alex` | Alex | Male | Confiant |
| `em_santa` | Santa | Male | Jolly |

### Français

| ID | Name | Genre | Style |
|----| ------ | -------- | ------- |
| `ff_siwis` | Siwis | Féminine | Raffinée |

### Hindi

| ID | Name | Genre | Style |
|----| ------ | -------- | ------- |
| `hf_alpha` | Alpha | Féminine | Clear |
| `hf_beta` | Beta | Féminine | Warm |
| `hm_omega` | Omega | Male | Deep |
| `hm_psi` | Psi | Male | Calm |

### Italien

| ID | Name | Genre | Style |
|----| ------ | -------- | ------- |
| `if_sara` | Sara | Féminine | Warm |
| `im_nicola` | Nicola | Male | Confiant |

### Portugais brésilien

| ID | Name | Genre | Style |
|----| ------ | -------- | ------- |
| `pf_dora` | Dora | Féminine | Warm |
| `pm_alex` | Alex | Male | Confiant |
| `pm_santa` | Santa | Male | Jolly |

### Préréglages

| Préréglage | Voice | Speed | Description |
| -------- | ------- | ------- | ------------- |
| `narrator` | `bm_george` | 0.95 | Style documentaire calme |
| `announcer` | `am_onyx` | 1.05 | Énergie d'une présentatrice d'informations |
| `whisper` | `af_aoede` | 0.85 | Douce, intime |
| `storyteller` | `bf_emma` | 0.90 | Ambiance chaleureuse de conte pour enfants |
| `assistant` | `af_jessica` | 1.0 | Neutre, serviable |

## Étendues émotionnelles

Encadrez le texte avec des balises d'émotion pour contrôler la prosodie :

```
[happy]Great news![/happy] But [sad]I have to go.[/sad]
```

Pris en charge : `heureux`, `triste`, `en colère`, `effrayé`, `surpris`, `dégoûté`, `calme`, `excité`

## Paramètres de la ligne de commande

| Flag | Par défaut | Description |
| ------ | --------- | ------------- |
| `--artifact=path\ | base64` | `path` | Mode de diffusion audio |
| `--output-dir=<path>` | `<tmpdir>/voice-soundboard/` | Répertoire de sortie |
| `--backend=mock\ |http` | `mock` | Sélection du backend |
| `--backend-url=<url>` | &mdash; | URL du backend HTTP |
| `--ambient` | off | Activer le système de monologue intérieur |
| `--max-concurrent=<n>` | `1` | Nombre maximal de requêtes de synthèse simultanées |
| `--timeout=<ms>` | `20000` | Délai d'expiration par requête |
| `--retention-minutes=<n>` | `240` | Durée de conservation automatique (0 pour désactiver) |

## Paquets

Il s'agit d'un dépôt monorepo pnpm avec deux paquets publiables :

| Paquet | Description | npm |
| --------- | ------------- |-----|
| [`@mcptoolshop/voice-soundboard-core`](packages/core) | Bibliothèque centrale indépendante du backend (validation, SSML, découpage, schémas) | [![npm](https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-core)](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-core) |
| [`@mcptoolshop/voice-soundboard-mcp`](packages/mcp-server) | Serveur MCP avec CLI, garde-fous et transport | [![npm](https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-mcp)](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-mcp) |

## Développement

```bash
# Install
pnpm install

# Build
pnpm build

# Test (342 tests)
pnpm test
```

> Fait partie de [MCP Tool Shop](https://mcp-tool-shop.github.io/)

### Structure du projet

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

## Sécurité

Voir [SECURITY.md](SECURITY.md) pour signaler les vulnérabilités.

Voir [THREAT_MODEL.md](THREAT_MODEL.md) pour l'analyse complète de la surface d'attaque.

## Lié

| Projet | Description |
| --------- | ------------- |
| [soundboard-plugin](https://github.com/mcp-tool-shop-org/soundboard-plugin) | Plugin Claude Code &mdash; commandes slash, narration sensible aux émotions |

## Support

- **Questions / aide :** [Discussions](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/discussions)
- **Signalement de bugs :** [Issues](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/issues)
- **Sécurité :** [SECURITY.md](SECURITY.md)

## Licence

[MIT](LICENSE)

---

<p align="center">
  Built by <a href="https://github.com/mcp-tool-shop-org">mcp-tool-shop</a>
</p>
