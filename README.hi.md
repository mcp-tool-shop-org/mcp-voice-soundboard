<p align="center">
  <a href="README.md">English</a> | <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <strong>हिन्दी</strong> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/mcp-voice-soundboard/main/assets/logo-dark.jpg" alt="MCP Voice Soundboard" width="420" />
</p>

<h3 align="center">AI एजेंटों के लिए टेक्स्ट-टू-स्पीच MCP सर्वर।</h3>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/mcp-tool-shop-org/mcp-voice-soundboard/ci.yml?branch=main&style=flat-square&label=CI" alt="CI"></a>
  <a href="https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-mcp"><img src="https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-mcp?style=flat-square&color=cb3837&logo=npm" alt="npm"></a>
  <img src="https://img.shields.io/badge/node-%E2%89%A520-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js 20+">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License: MIT"></a>
</p>

<p align="center">
  48 आवाज़ें &bull; 9 भाषाएँ &bull; 5 प्रीसेट &bull; 8 भावनाएँ &bull; SSML-lite &bull; SFX टैग &bull; बहु-वक्ता संवाद<br>
  बदलने योग्य TTS बैकेंड। अंतर्निहित सुरक्षा। एक <code>npx</code> कमांड में चालू।
</p>

---

## मुख्य विशेषताएँ

- **MCP नेटिव** &mdash; stdio ट्रांसपोर्ट, Claude Desktop, Cursor, और किसी भी MCP क्लाइंट के साथ काम करता है
- **5 टूल** &mdash; `voice_speak`, `voice_dialogue`, `voice_status`, `voice_interrupt`, `voice_inner_monologue`
- **48 स्वीकृत आवाज़ें, 9 भाषाएँ** &mdash; अंग्रेज़ी (अमेरिकी + ब्रिटिश), जापानी, मैंडरिन, स्पैनिश, फ्रेंच, हिन्दी, इतालवी, ब्राज़ीलियन पुर्तगाली। क्यूरेटेड प्रीसेट: `narrator`, `announcer`, `whisper`, `storyteller`, `assistant`
- **भावना स्पैन** &mdash; `[happy]...[/happy]` इनलाइन मार्कअप द्वारा 8 भावनाएँ
- **SSML-lite** &mdash; पूर्ण SSML की जटिलता के बिना `<break>`, `<emphasis>`, `<prosody>`
- **SFX टैग** &mdash; `[ding]`, `[chime]`, `[whoosh]`, `[tada]`, `[error]`, `[click]` इनलाइन ध्वनि प्रभाव
- **बहु-वक्ता संवाद** &mdash; ऑटो-कास्ट और पॉज़ निर्देशों के साथ `Speaker: line` प्रारूप
- **सुरक्षा गार्डरेल** &mdash; दर सीमितकरण, कंकरेंसी सेमाफोर, अनुरोध टाइमआउट, पथ ट्रैवर्सल सुरक्षा, सीक्रेट रिडैक्शन
- **बदलने योग्य बैकेंड** &mdash; Mock (अंतर्निहित), HTTP प्रॉक्सी, Python ब्रिज, या अपना खुद का लाएँ

## त्वरित शुरुआत

```bash
npx @mcptoolshop/voice-soundboard-mcp
```

या ग्लोबली इंस्टॉल करें:

```bash
npm install -g @mcptoolshop/voice-soundboard-mcp
voice-soundboard-mcp
```

### Claude Desktop / MCP क्लाइंट कॉन्फ़िगरेशन

अपने MCP क्लाइंट कॉन्फ़िगरेशन में जोड़ें (जैसे `claude_desktop_config.json`):

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

विकल्पों के साथ:

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

## MCP टूल

### `voice_speak`

टेक्स्ट से स्पीच सिंथेसाइज़ करें।

```
text:         "Hello world!"
voice?:       "am_fenrir"          # वॉइस ID या प्रीसेट नाम
speed?:       1.0                  # 0.5 - 2.0
format?:      "wav"                # wav | mp3 | ogg | raw
artifactMode?: "path"             # path | base64
sfx?:         true                # [ding], [chime] आदि सक्रिय करें
```

### `voice_dialogue`

बहु-वक्ता संवाद सिंथेसिस।

```
script:       "Alice: Hello!\nBob: Hey there!"
cast?:        { "Alice": "af_sky", "Bob": "am_fenrir" }
speed?:       1.0
concat?:      true                 # एक फ़ाइल में संयोजित करें
debug?:       true                 # cue_sheet शामिल करें
```

### `voice_status`

इंजन स्वास्थ्य, उपलब्ध आवाज़ें, प्रीसेट, और बैकेंड जानकारी लौटाता है। कोई आर्गुमेंट नहीं।

### `voice_interrupt`

सक्रिय सिंथेसिस को रोकें या रोलबैक करें।

```
streamId?:    "stream-123"
reason?:      "user_spoke"         # user_spoke | context_change | timeout | manual
```

### `voice_inner_monologue`

एम्बिएंट नैरेशन के लिए क्षणिक सूक्ष्म-उक्तियाँ। `--ambient` फ्लैग या `VOICE_SOUNDBOARD_AMBIENT_ENABLED=1` आवश्यक है।

```
text:         "Interesting..."     # अधिकतम 500 अक्षर, स्वतः रिडैक्टेड
category?:    "thinking"           # general | thinking | observation | debug
```

## आवाज़ें

9 भाषाओं में 48 आवाज़ें। भाषा वॉइस ID प्रीफ़िक्स से स्वतः पहचानी जाती है — कोई कॉन्फ़िगरेशन आवश्यक नहीं।

| प्रीफ़िक्स | भाषा |
|--------|----------|
| `af_` / `am_` | अंग्रेज़ी (अमेरिकी) |
| `bf_` / `bm_` | अंग्रेज़ी (ब्रिटिश) |
| `jf_` / `jm_` | जापानी |
| `zf_` / `zm_` | मैंडरिन चीनी |
| `ef_` / `em_` | स्पैनिश |
| `ff_` | फ्रेंच |
| `hf_` / `hm_` | हिन्दी |
| `if_` / `im_` | इतालवी |
| `pf_` / `pm_` | ब्राज़ीलियन पुर्तगाली |

### अंग्रेज़ी — अमेरिकी

| ID | नाम | लिंग | शैली |
|----|------|--------|-------|
| `af_aoede` | Aoede | महिला | संगीतमय |
| `af_bella` | Bella | महिला | उष्ण |
| `af_heart` | Heart | महिला | स्नेही |
| `af_jessica` | Jessica | महिला | पेशेवर |
| `af_kore` | Kore | महिला | युवा |
| `af_nicole` | Nicole | महिला | कोमल |
| `af_sarah` | Sarah | महिला | स्पष्ट |
| `af_sky` | Sky | महिला | हवाई |
| `am_eric` | Eric | पुरुष | आत्मविश्वासी |
| `am_fenrir` | Fenrir | पुरुष | शक्तिशाली |
| `am_liam` | Liam | पुरुष | मित्रवत |
| `am_michael` | Michael | पुरुष | गहरा |
| `am_onyx` | Onyx | पुरुष | सहज |
| `am_puck` | Puck | पुरुष | चंचल |

### अंग्रेज़ी — ब्रिटिश

| ID | नाम | लिंग | शैली |
|----|------|--------|-------|
| `bf_alice` | Alice | महिला | परिष्कृत |
| `bf_emma` | Emma | महिला | सुसंस्कृत |
| `bf_isabella` | Isabella | महिला | उष्ण |
| `bm_fable` | Fable | पुरुष | कथावाचक |
| `bm_george` | George | पुरुष | प्रामाणिक |
| `bm_lewis` | Lewis | पुरुष | मित्रवत |

### जापानी

| ID | नाम | लिंग | शैली |
|----|------|--------|-------|
| `jf_alpha` | Alpha | महिला | स्पष्ट |
| `jf_gongitsune` | Gongitsune | महिला | कथावाचक |
| `jf_nezuko` | Nezuko | महिला | सौम्य |
| `jf_tebukuro` | Tebukuro | महिला | उष्ण |
| `jm_kumo` | Kumo | पुरुष | शांत |

### मैंडरिन चीनी

| ID | नाम | लिंग | शैली |
|----|------|--------|-------|
| `zf_xiaobei` | Xiaobei | महिला | उज्ज्वल |
| `zf_xiaoni` | Xiaoni | महिला | सौम्य |
| `zf_xiaoxiao` | Xiaoxiao | महिला | स्पष्ट |
| `zf_xiaoyi` | Xiaoyi | महिला | उष्ण |
| `zm_yunjian` | Yunjian | पुरुष | प्रामाणिक |
| `zm_yunxi` | Yunxi | पुरुष | मित्रवत |
| `zm_yunxia` | Yunxia | पुरुष | शांत |
| `zm_yunyang` | Yunyang | पुरुष | आत्मविश्वासी |

### स्पैनिश

| ID | नाम | लिंग | शैली |
|----|------|--------|-------|
| `ef_dora` | Dora | महिला | उष्ण |
| `em_alex` | Alex | पुरुष | आत्मविश्वासी |
| `em_santa` | Santa | पुरुष | प्रसन्न |

### फ्रेंच

| ID | नाम | लिंग | शैली |
|----|------|--------|-------|
| `ff_siwis` | Siwis | महिला | सुसंस्कृत |

### हिन्दी

| ID | नाम | लिंग | शैली |
|----|------|--------|-------|
| `hf_alpha` | Alpha | महिला | स्पष्ट |
| `hf_beta` | Beta | महिला | उष्ण |
| `hm_omega` | Omega | पुरुष | गहरा |
| `hm_psi` | Psi | पुरुष | शांत |

### इतालवी

| ID | नाम | लिंग | शैली |
|----|------|--------|-------|
| `if_sara` | Sara | महिला | उष्ण |
| `im_nicola` | Nicola | पुरुष | आत्मविश्वासी |

### ब्राज़ीलियन पुर्तगाली

| ID | नाम | लिंग | शैली |
|----|------|--------|-------|
| `pf_dora` | Dora | महिला | उष्ण |
| `pm_alex` | Alex | पुरुष | आत्मविश्वासी |
| `pm_santa` | Santa | पुरुष | प्रसन्न |

### प्रीसेट

| प्रीसेट | आवाज़ | गति | विवरण |
|--------|-------|-------|-------------|
| `narrator` | `bm_george` | 0.95 | शांत डॉक्यूमेंट्री शैली |
| `announcer` | `am_onyx` | 1.05 | समाचार एंकर ऊर्जा |
| `whisper` | `af_aoede` | 0.85 | मृदु, अंतरंग |
| `storyteller` | `bf_emma` | 0.90 | गर्म सोने-की-कहानी अनुभव |
| `assistant` | `af_jessica` | 1.0 | तटस्थ, सहायक |

## भावना स्पैन

उच्चारण नियंत्रित करने के लिए टेक्स्ट को भावना टैग में रखें:

```
[happy]Great news![/happy] But [sad]I have to go.[/sad]
```

समर्थित: `happy`, `sad`, `angry`, `fearful`, `surprised`, `disgusted`, `calm`, `excited`

## CLI फ्लैग

| फ्लैग | डिफ़ॉल्ट | विवरण |
|------|---------|-------------|
| `--artifact=path\|base64` | `path` | ऑडियो डिलीवरी मोड |
| `--output-dir=<path>` | `<tmpdir>/voice-soundboard/` | आउटपुट डायरेक्टरी |
| `--backend=mock\|http` | `mock` | बैकेंड चयन |
| `--backend-url=<url>` | &mdash; | HTTP बैकेंड URL |
| `--ambient` | बंद | इनर-मोनोलॉग सिस्टम सक्रिय करें |
| `--max-concurrent=<n>` | `1` | अधिकतम समवर्ती सिंथेसिस अनुरोध |
| `--timeout=<ms>` | `20000` | प्रति-अनुरोध टाइमआउट |
| `--retention-minutes=<n>` | `240` | स्वतः-सफ़ाई अवधि (अक्षम करने के लिए 0) |

## पैकेज

यह दो प्रकाशनीय पैकेज वाला pnpm मोनोरेपो है:

| पैकेज | विवरण | npm |
|---------|-------------|-----|
| [`@mcptoolshop/voice-soundboard-core`](packages/core) | बैकेंड-अज्ञेयवादी कोर लाइब्रेरी (वैलिडेशन, SSML, चंकिंग, स्कीमा) | [![npm](https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-core?style=flat-square)](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-core) |
| [`@mcptoolshop/voice-soundboard-mcp`](packages/mcp-server) | CLI, गार्डरेल, और ट्रांसपोर्ट के साथ MCP सर्वर | [![npm](https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-mcp?style=flat-square)](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-mcp) |

## विकास

```bash
# इंस्टॉल करें
pnpm install

# बिल्ड करें
pnpm build

# टेस्ट करें (342 टेस्ट)
pnpm test
```

> [MCP Tool Shop](https://mcp-tool-shop.github.io/) का हिस्सा

### प्रोजेक्ट संरचना

```
mcp-voice-soundboard/
  packages/
    core/               @mcptoolshop/voice-soundboard-core
      src/
        limits.ts         SHIP_LIMITS, टेक्स्ट/चंक सीमाएँ
        schemas.ts        VoiceRequest, VoiceResponse, त्रुटि कोड
        artifact.ts       resolveOutputDir, पथ सैंडबॉक्स
        voices.ts         स्वीकृत वॉइस रजिस्ट्री + प्रीसेट
        emotion.ts        भावना स्पैन पार्सर
        ssml/             SSML-lite पार्सर + सीमाएँ
        chunking/         टेक्स्ट चंकर
        sfx/              SFX टैग पार्सर + रजिस्ट्री
        sandbox.ts        सुरक्षित फ़ाइलनाम, सिमलिंक जाँच
        ambient.ts        इनर मोनोलॉग के लिए AmbientEmitter
        redact.ts         PII/सीक्रेट रिडैक्शन
    mcp-server/         @mcptoolshop/voice-soundboard-mcp
      src/
        server.ts         MCP टूल पंजीकरण + गार्डरेल वायरिंग
        cli.ts            CLI एंट्रीपॉइंट (stdio ट्रांसपोर्ट)
        backend.ts        बैकेंड ऐब्सट्रैक्शन + mock/HTTP
        concurrency.ts    SynthesisSemaphore
        rateLimit.ts      ToolRateLimiter (स्लाइडिंग विंडो)
        timeout.ts        withTimeout उपयोगिता
        retention.ts      आउटपुट फ़ाइल सफ़ाई टाइमर
        redact.ts         सर्वर-स्तरीय रिडैक्शन
        validation.ts     सिंथेसिस परिणाम वैलिडेशन
        tools/            व्यक्तिगत टूल हैंडलर
  assets/               लोगो, ऑडियो इवेंट मैनिफेस्ट
  docs/                 आर्किटेक्चर डॉक्स
```

## सुरक्षा

भेद्यता रिपोर्टिंग के लिए [SECURITY.md](SECURITY.md) देखें।

पूर्ण खतरा सतह विश्लेषण के लिए [THREAT_MODEL.md](THREAT_MODEL.md) देखें।

## संबंधित

| प्रोजेक्ट | विवरण |
|---------|-------------|
| [soundboard-plugin](https://github.com/mcp-tool-shop-org/soundboard-plugin) | Claude Code प्लगइन &mdash; स्लैश कमांड, भावना-जागरूक नैरेशन |

## सहायता

- **प्रश्न / मदद:** [चर्चाएँ](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/discussions)
- **बग रिपोर्ट:** [इश्यूज़](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/issues)
- **सुरक्षा:** [SECURITY.md](SECURITY.md)

## लाइसेंस

[MIT](LICENSE)

---

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org">mcp-tool-shop</a> द्वारा निर्मित
</p>
