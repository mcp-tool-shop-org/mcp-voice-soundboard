<p align="center">
  <a href="README.md">English</a> | <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <strong>Français</strong> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/mcp-voice-soundboard/main/assets/logo-dark.jpg" alt="MCP Voice Soundboard" width="420" />
</p>

<h3 align="center">Serveur MCP de synthèse vocale pour agents IA.</h3>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/mcp-tool-shop-org/mcp-voice-soundboard/ci.yml?branch=main&style=flat-square&label=CI" alt="CI"></a>
  <a href="https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-mcp"><img src="https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-mcp?style=flat-square&color=cb3837&logo=npm" alt="npm"></a>
  <img src="https://img.shields.io/badge/node-%E2%89%A520-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js 20+">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License: MIT"></a>
</p>

<p align="center">
  48 voix &bull; 9 langues &bull; 5 préréglages &bull; 8 émotions &bull; SSML-lite &bull; Balises SFX &bull; Dialogue multi-locuteurs<br>
  Backends TTS interchangeables. Garde-fous intégrés. Se lance avec une seule commande <code>npx</code>.
</p>

---

## Points forts

- **Natif MCP** &mdash; transport stdio, compatible avec Claude Desktop, Cursor et tout client MCP
- **5 outils** &mdash; `voice_speak`, `voice_dialogue`, `voice_status`, `voice_interrupt`, `voice_inner_monologue`
- **48 voix approuvées, 9 langues** &mdash; Anglais (américain + britannique), japonais, mandarin, espagnol, français, hindi, italien, portugais brésilien. Préréglages sélectionnés : `narrator`, `announcer`, `whisper`, `storyteller`, `assistant`
- **Balises d'émotion** &mdash; 8 émotions via le balisage en ligne `[happy]...[/happy]`
- **SSML-lite** &mdash; `<break>`, `<emphasis>`, `<prosody>` sans la complexité du SSML complet
- **Balises SFX** &mdash; `[ding]`, `[chime]`, `[whoosh]`, `[tada]`, `[error]`, `[click]` effets sonores en ligne
- **Dialogue multi-locuteurs** &mdash; format `Locuteur: réplique` avec attribution automatique et directives de pause
- **Garde-fous** &mdash; limitation de débit, sémaphore de concurrence, délais d'expiration des requêtes, protection contre le parcours de chemins, masquage de secrets
- **Backends interchangeables** &mdash; Mock (intégré), proxy HTTP, pont Python, ou apportez le vôtre

## Démarrage rapide

```bash
npx @mcptoolshop/voice-soundboard-mcp
```

Ou installer globalement :

```bash
npm install -g @mcptoolshop/voice-soundboard-mcp
voice-soundboard-mcp
```

### Configuration Claude Desktop / Client MCP

Ajoutez à la configuration de votre client MCP (par ex. `claude_desktop_config.json`) :

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

Avec des options :

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

Synthétiser la parole à partir de texte.

```
text:         "Bonjour le monde !"
voice?:       "am_fenrir"          # Identifiant de voix ou nom de préréglage
speed?:       1.0                  # 0.5 - 2.0
format?:      "wav"                # wav | mp3 | ogg | raw
artifactMode?: "path"             # path | base64
sfx?:         true                # Activer [ding], [chime] etc.
```

### `voice_dialogue`

Synthèse de dialogue multi-locuteurs.

```
script:       "Alice: Bonjour !\nBob: Salut !"
cast?:        { "Alice": "af_sky", "Bob": "am_fenrir" }
speed?:       1.0
concat?:      true                 # Combiner en un seul fichier
debug?:       true                 # Inclure le cue_sheet
```

### `voice_status`

Renvoie l'état du moteur, les voix disponibles, les préréglages et les informations du backend. Aucun argument.

### `voice_interrupt`

Arrêter ou annuler une synthèse en cours.

```
streamId?:    "stream-123"
reason?:      "user_spoke"         # user_spoke | context_change | timeout | manual
```

### `voice_inner_monologue`

Micro-énoncés éphémères pour la narration ambiante. Nécessite le drapeau `--ambient` ou `VOICE_SOUNDBOARD_AMBIENT_ENABLED=1`.

```
text:         "Intéressant..."     # 500 caractères max, masquage automatique
category?:    "thinking"           # general | thinking | observation | debug
```

## Voix

48 voix réparties sur 9 langues. La langue est déduite automatiquement du préfixe de l'identifiant de voix — aucune configuration requise.

| Préfixe | Langue |
|---------|--------|
| `af_` / `am_` | Anglais (américain) |
| `bf_` / `bm_` | Anglais (britannique) |
| `jf_` / `jm_` | Japonais |
| `zf_` / `zm_` | Chinois mandarin |
| `ef_` / `em_` | Espagnol |
| `ff_` | Français |
| `hf_` / `hm_` | Hindi |
| `if_` / `im_` | Italien |
| `pf_` / `pm_` | Portugais brésilien |

### Anglais — Américain

| ID | Nom | Genre | Style |
|----|-----|-------|-------|
| `af_aoede` | Aoede | Femme | Mélodieuse |
| `af_bella` | Bella | Femme | Chaleureuse |
| `af_heart` | Heart | Femme | Bienveillante |
| `af_jessica` | Jessica | Femme | Professionnelle |
| `af_kore` | Kore | Femme | Jeune |
| `af_nicole` | Nicole | Femme | Douce |
| `af_sarah` | Sarah | Femme | Claire |
| `af_sky` | Sky | Femme | Aérienne |
| `am_eric` | Eric | Homme | Assuré |
| `am_fenrir` | Fenrir | Homme | Puissant |
| `am_liam` | Liam | Homme | Amical |
| `am_michael` | Michael | Homme | Grave |
| `am_onyx` | Onyx | Homme | Velouté |
| `am_puck` | Puck | Homme | Espiègle |

### Anglais — Britannique

| ID | Nom | Genre | Style |
|----|-----|-------|-------|
| `bf_alice` | Alice | Femme | Distinguée |
| `bf_emma` | Emma | Femme | Raffinée |
| `bf_isabella` | Isabella | Femme | Chaleureuse |
| `bm_fable` | Fable | Homme | Conteur |
| `bm_george` | George | Homme | Autoritaire |
| `bm_lewis` | Lewis | Homme | Amical |

### Japonais

| ID | Nom | Genre | Style |
|----|-----|-------|-------|
| `jf_alpha` | Alpha | Femme | Claire |
| `jf_gongitsune` | Gongitsune | Femme | Conteuse |
| `jf_nezuko` | Nezuko | Femme | Douce |
| `jf_tebukuro` | Tebukuro | Femme | Chaleureuse |
| `jm_kumo` | Kumo | Homme | Calme |

### Chinois mandarin

| ID | Nom | Genre | Style |
|----|-----|-------|-------|
| `zf_xiaobei` | Xiaobei | Femme | Lumineuse |
| `zf_xiaoni` | Xiaoni | Femme | Douce |
| `zf_xiaoxiao` | Xiaoxiao | Femme | Claire |
| `zf_xiaoyi` | Xiaoyi | Femme | Chaleureuse |
| `zm_yunjian` | Yunjian | Homme | Autoritaire |
| `zm_yunxi` | Yunxi | Homme | Amical |
| `zm_yunxia` | Yunxia | Homme | Calme |
| `zm_yunyang` | Yunyang | Homme | Assuré |

### Espagnol

| ID | Nom | Genre | Style |
|----|-----|-------|-------|
| `ef_dora` | Dora | Femme | Chaleureuse |
| `em_alex` | Alex | Homme | Assuré |
| `em_santa` | Santa | Homme | Jovial |

### Français

| ID | Nom | Genre | Style |
|----|-----|-------|-------|
| `ff_siwis` | Siwis | Femme | Raffinée |

### Hindi

| ID | Nom | Genre | Style |
|----|-----|-------|-------|
| `hf_alpha` | Alpha | Femme | Claire |
| `hf_beta` | Beta | Femme | Chaleureuse |
| `hm_omega` | Omega | Homme | Grave |
| `hm_psi` | Psi | Homme | Calme |

### Italien

| ID | Nom | Genre | Style |
|----|-----|-------|-------|
| `if_sara` | Sara | Femme | Chaleureuse |
| `im_nicola` | Nicola | Homme | Assuré |

### Portugais brésilien

| ID | Nom | Genre | Style |
|----|-----|-------|-------|
| `pf_dora` | Dora | Femme | Chaleureuse |
| `pm_alex` | Alex | Homme | Assuré |
| `pm_santa` | Santa | Homme | Jovial |

### Préréglages

| Préréglage | Voix | Vitesse | Description |
|------------|------|---------|-------------|
| `narrator` | `bm_george` | 0.95 | Style documentaire calme |
| `announcer` | `am_onyx` | 1.05 | Énergie de présentateur |
| `whisper` | `af_aoede` | 0.85 | Doux, intime |
| `storyteller` | `bf_emma` | 0.90 | Ambiance chaleureuse d'histoire du soir |
| `assistant` | `af_jessica` | 1.0 | Neutre, serviable |

## Balises d'émotion

Entourez le texte de balises d'émotion pour contrôler la prosodie :

```
[happy]Bonne nouvelle ![/happy] Mais [sad]je dois partir.[/sad]
```

Émotions prises en charge : `happy`, `sad`, `angry`, `fearful`, `surprised`, `disgusted`, `calm`, `excited`

## Options en ligne de commande

| Option | Défaut | Description |
|--------|--------|-------------|
| `--artifact=path\|base64` | `path` | Mode de livraison audio |
| `--output-dir=<path>` | `<tmpdir>/voice-soundboard/` | Répertoire de sortie |
| `--backend=mock\|http` | `mock` | Sélection du backend |
| `--backend-url=<url>` | &mdash; | URL du backend HTTP |
| `--ambient` | désactivé | Activer le système de monologue intérieur |
| `--max-concurrent=<n>` | `1` | Nombre maximum de requêtes de synthèse simultanées |
| `--timeout=<ms>` | `20000` | Délai d'expiration par requête |
| `--retention-minutes=<n>` | `240` | Durée avant nettoyage automatique (0 pour désactiver) |

## Paquets

Ceci est un monorepo pnpm avec deux paquets publiables :

| Paquet | Description | npm |
|--------|-------------|-----|
| [`@mcptoolshop/voice-soundboard-core`](packages/core) | Bibliothèque principale indépendante du backend (validation, SSML, découpage, schémas) | [![npm](https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-core?style=flat-square)](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-core) |
| [`@mcptoolshop/voice-soundboard-mcp`](packages/mcp-server) | Serveur MCP avec CLI, garde-fous et transport | [![npm](https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-mcp?style=flat-square)](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-mcp) |

## Développement

```bash
# Installer
pnpm install

# Compiler
pnpm build

# Tester (342 tests)
pnpm test
```

> Fait partie de [MCP Tool Shop](https://mcp-tool-shop.github.io/)

### Structure du projet

```
mcp-voice-soundboard/
  packages/
    core/               @mcptoolshop/voice-soundboard-core
      src/
        limits.ts         SHIP_LIMITS, limites de texte/découpage
        schemas.ts        VoiceRequest, VoiceResponse, codes d'erreur
        artifact.ts       resolveOutputDir, bac à sable de chemins
        voices.ts         Registre de voix approuvées + préréglages
        emotion.ts        Analyseur de balises d'émotion
        ssml/             Analyseur SSML-lite + limites
        chunking/         Découpeur de texte
        sfx/              Analyseur de balises SFX + registre
        sandbox.ts        Noms de fichiers sûrs, vérification de liens symboliques
        ambient.ts        AmbientEmitter pour le monologue intérieur
        redact.ts         Masquage de données personnelles/secrets
    mcp-server/         @mcptoolshop/voice-soundboard-mcp
      src/
        server.ts         Enregistrement des outils MCP + câblage des garde-fous
        cli.ts            Point d'entrée CLI (transport stdio)
        backend.ts        Abstraction du backend + mock/HTTP
        concurrency.ts    SynthesisSemaphore
        rateLimit.ts      ToolRateLimiter (fenêtre glissante)
        timeout.ts        Utilitaire withTimeout
        retention.ts      Minuteur de nettoyage des fichiers de sortie
        redact.ts         Masquage au niveau serveur
        validation.ts     Validation des résultats de synthèse
        tools/            Gestionnaires d'outils individuels
  assets/               Logo, manifestes d'événements audio
  docs/                 Documentation d'architecture
```

## Sécurité

Voir [SECURITY.md](SECURITY.md) pour le signalement de vulnérabilités.

Voir [THREAT_MODEL.md](THREAT_MODEL.md) pour l'analyse complète de la surface d'attaque.

## Projets associés

| Projet | Description |
|--------|-------------|
| [soundboard-plugin](https://github.com/mcp-tool-shop-org/soundboard-plugin) | Plugin Claude Code &mdash; commandes slash, narration sensible aux émotions |

## Support

- **Questions / aide :** [Discussions](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/discussions)
- **Signalement de bugs :** [Issues](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/issues)
- **Sécurité :** [SECURITY.md](SECURITY.md)

## Licence

[MIT](LICENSE)

---

<p align="center">
  Conçu par <a href="https://github.com/mcp-tool-shop-org">mcp-tool-shop</a>
</p>
