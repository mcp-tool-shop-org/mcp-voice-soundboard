<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.md">English</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
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

## मुख्य विशेषताएं

- **MCP सपोर्ट:** stdio ट्रांसपोर्ट, क्लाउड डेस्कटॉप, कर्सर और किसी भी MCP क्लाइंट के साथ काम करता है।
- **5 उपकरण:** `voice_speak`, `voice_dialogue`, `voice_status`, `voice_interrupt`, `voice_inner_monologue`
- **48 स्वीकृत आवाजें, 9 भाषाएँ:** अंग्रेजी (अमेरिकी + ब्रिटिश), जापानी, मंदारिन, स्पेनिश, फ्रेंच, हिंदी, इतालवी, ब्राजीलियाई पुर्तगाली। तैयार किए गए विकल्प: `narrator` (कथावाचक), `announcer` (घोषक), `whisper` (फुसफुसाहट), `storyteller` (कहानीकार), `assistant` (सहायक)।
- **भावनाएं:** `[खुश]...[/खुश]` जैसे इनलाइन मार्कअप का उपयोग करके भावनाओं को दर्शाया जा सकता है।
- **SSML-lite:** `<break>`, `<emphasis>`, `<prosody>` जैसे SSML के कुछ ही तत्वों का उपयोग।
- **SFX टैग:** `[ding]`, `[chime]`, `[whoosh]`, `[tada]`, `[error]`, `[click]` जैसे इनलाइन ध्वनि प्रभाव।
- **बहु-वक्ता संवाद:** `वक्ता: पंक्ति` प्रारूप, जिसमें स्वचालित रूप से वक्ता का चयन और विराम शामिल है।
- **सुरक्षा उपाय:** दर सीमा, समवर्ती नियंत्रण, अनुरोध समय सीमा, पथ ट्रैवर्सल सुरक्षा, गुप्त जानकारी का छिपाव।
- **बदली जा सकने वाले बैकएंड:** मॉक (अंतर्निहित), HTTP प्रॉक्सी, पायथन ब्रिज, या अपना बैकएंड उपयोग करें।

## शुरुआत

```bash
npx @mcptoolshop/voice-soundboard-mcp
```

या इसे वैश्विक रूप से स्थापित करें:

```bash
npm install -g @mcptoolshop/voice-soundboard-mcp
voice-soundboard-mcp
```

### क्लाउड डेस्कटॉप / MCP क्लाइंट कॉन्फ़िगरेशन

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

## MCP उपकरण

### `voice_speak`

टेक्स्ट से भाषण उत्पन्न करें।

```
text:         "Hello world!"
voice?:       "am_fenrir"          # Voice ID or preset name
speed?:       1.0                  # 0.5 - 2.0
format?:      "wav"                # wav | mp3 | ogg | raw
artifactMode?: "path"             # path | base64
sfx?:         true                # Enable [ding], [chime] etc.
```

### `voice_dialogue`

बहु-वक्ता संवाद उत्पन्न करें।

```
script:       "Alice: Hello!\nBob: Hey there!"
cast?:        { "Alice": "af_sky", "Bob": "am_fenrir" }
speed?:       1.0
concat?:      true                 # Combine into single file
debug?:       true                 # Include cue_sheet
```

### `voice_status`

इंजन की स्थिति, उपलब्ध आवाजें, विकल्प और बैकएंड जानकारी प्रदर्शित करता है। कोई तर्क आवश्यक नहीं है।

### `voice_interrupt`

सक्रिय संश्लेषण को रोकें या वापस लें।

```
streamId?:    "stream-123"
reason?:      "user_spoke"         # user_spoke | context_change | timeout | manual
```

### `voice_inner_monologue`

वातावरण में वर्णन के लिए संक्षिप्त कथन। `--ambient` ध्वज या `VOICE_SOUNDBOARD_AMBIENT_ENABLED=1` की आवश्यकता है।

```
text:         "Interesting..."     # Max 500 chars, auto-redacted
category?:    "thinking"           # general | thinking | observation | debug
```

## आवाजें

9 भाषाओं में 48 आवाजें उपलब्ध हैं। भाषा का पता स्वचालित रूप से आवाज आईडी के उपसर्ग से लगाया जाता है - किसी कॉन्फ़िगरेशन की आवश्यकता नहीं है।

| उपसर्ग | भाषा |
|--------|----------|
| `af_` / `am_` | अंग्रेजी (अमेरिकी) |
| `bf_` / `bm_` | अंग्रेजी (ब्रिटिश) |
| `jf_` / `jm_` | जापानी |
| `zf_` / `zm_` | मंदारिन चीनी |
| `ef_` / `em_` | स्पेनिश |
| `ff_` | फ्रेंच |
| `hf_` / `hm_` | हिंदी |
| `if_` / `im_` | इतालवी |
| `pf_` / `pm_` | ब्राजीलियाई पुर्तगाली |

### अंग्रेजी — अमेरिकी

| ID | नाम | लिंग | शैली |
|----|------|--------|-------|
| `af_aoede` | एओडे | महिला | संगीत |
| `af_bella` | बेला | महिला | गर्म |
| `af_heart` | दिल | महिला | संवेदनशील |
| `af_jessica` | जेसिका | महिला | पेशेवर |
| `af_kore` | कोरे | महिला | युवा |
| `af_nicole` | निकोल | महिला | नरम |
| `af_sarah` | सारा | महिला | स्पष्ट |
| `af_sky` | आकाश | महिला | हवादार |
| `am_eric` | एरिक | पुरुष | आत्मविश्वासी |
| `am_fenrir` | फेनफ़िर | पुरुष | शक्तिशाली |
| `am_liam` | लियाम | पुरुष | दोस्ताना |
| `am_michael` | माइकल | पुरुष | गहरा |
| `am_onyx` | ओनिक्स | पुरुष | सुगम |
| `am_puck` | पॉक | पुरुष | चंचल |

### अंग्रेजी — ब्रिटिश

| ID | नाम | लिंग | शैली |
|----|------|--------|-------|
| `bf_alice` | ऐलिस | महिला | शिष्ट |
| `bf_emma` | एम्मा | महिला | परिष्कृत |
| `bf_isabella` | इसabella | महिला | गर्म |
| `bm_fable` | कहानी | पुरुष | कहानी सुनाना |
| `bm_george` | जॉर्ज | पुरुष | अधिकारपूर्ण |
| `bm_lewis` | लुईस | पुरुष | दोस्ताना |

### जापानी

| ID | नाम | लिंग | शैली |
|----|------|--------|-------|
| `jf_alpha` | अल्फा | महिला | स्पष्ट |
| `jf_gongitsune` | गोंगित्सुने | महिला | कहानी सुनाना |
| `jf_nezuko` | नेज़ुको | महिला | शांत |
| `jf_tebukuro` | तेबुकुरो | महिला | गर्म |
| `jm_kumo` | कुमो | पुरुष | शांत |

### मंदारिन चीनी

| ID | नाम | लिंग | शैली |
|----|------|--------|-------|
| `zf_xiaobei` | शियाओबेई | महिला | चमकदार |
| `zf_xiaoni` | शियाओनी | महिला | शांत |
| `zf_xiaoxiao` | शियाओक्सियाओ | महिला | स्पष्ट |
| `zf_xiaoyi` | शियाओयी | महिला | गर्म |
| `zm_yunjian` | युनजियान | पुरुष | अधिकारपूर्ण |
| `zm_yunxi` | युनक्सी | पुरुष | दोस्ताना |
| `zm_yunxia` | युनशिया | पुरुष | शांत |
| `zm_yunyang` | युनयांग | पुरुष | आत्मविश्वासी |

### स्पेनिश

| ID | नाम | लिंग | शैली |
|----|------|--------|-------|
| `ef_dora` | डोरा | महिला | गर्म |
| `em_alex` | एलेक्स | पुरुष | आत्मविश्वासी |
| `em_santa` | सांता | पुरुष | खुश |

### फ्रेंच

| ID | नाम | लिंग | शैली |
|----|------|--------|-------|
| `ff_siwis` | सिस | महिला | परिष्कृत |

### हिंदी

| ID | नाम | लिंग | शैली |
|----|------|--------|-------|
| `hf_alpha` | अल्फा | महिला | स्पष्ट |
| `hf_beta` | बीटा | महिला | गर्म |
| `hm_omega` | ओमेगा | पुरुष | गहरा |
| `hm_psi` | साई | पुरुष | शांत |

### इतालवी

| ID | नाम | लिंग | शैली |
|----|------|--------|-------|
| `if_sara` | सारा | महिला | गर्म |
| `im_nicola` | निकोला | पुरुष | आत्मविश्वासी |

### ब्राजीलियाई पुर्तगाली

| ID | नाम | लिंग | शैली |
|----|------|--------|-------|
| `pf_dora` | डोरा | महिला | गर्म |
| `pm_alex` | एलेक्स | पुरुष | आत्मविश्वासी |
| `pm_santa` | सांता | पुरुष | खुश |

### पूर्व-निर्धारित सेटिंग्स

| पूर्व-निर्धारित सेटिंग | आवाज | गति | विवरण |
|--------|-------|-------|-------------|
| `narrator` | `bm_george` | 0.95 | शांत, वृत्तचित्र शैली |
| `announcer` | `am_onyx` | 1.05 | समाचार प्रस्तुतकर्ता की शैली |
| `whisper` | `af_aoede` | 0.85 | नरम, अंतरंग |
| `storyteller` | `bf_emma` | 0.90 | गर्म, लोरी जैसी अनुभूति |
| `assistant` | `af_jessica` | 1.0 | तटस्थ, मददगार |

## भावनाएं

उच्चारण को नियंत्रित करने के लिए भावनाओं के टैग में टेक्स्ट लिखें:

```
[happy]Great news![/happy] But [sad]I have to go.[/sad]
```

समर्थित: `खुश`, `दुखी`, `गुस्सा`, `डर`, `आश्चर्य`, `घृणा`, `शांत`, `उत्साहित`

## कमांड लाइन विकल्प

| झंडा | डिफ़ॉल्ट | विवरण |
|------|---------|-------------|
| `--artifact=path\ | base64` | `path` | ऑडियो डिलीवरी मोड |
| `--output-dir=<path>` | `<tmpdir>/voice-soundboard/` | आउटपुट निर्देशिका |
| `--backend=mock\ | http | `mock` | बैकएंड चयन |
| `--backend-url=<url>` | &mdash; | HTTP बैकएंड यूआरएल |
| `--ambient` | बंद | आंतरिक-संवाद प्रणाली सक्षम करें |
| `--max-concurrent=<n>` | `1` | अधिकतम समवर्ती संश्लेषण अनुरोध |
| `--timeout=<ms>` | `20000` | प्रति-अनुरोध समय सीमा |
| `--retention-minutes=<n>` | `240` | स्वचालित सफाई अवधि (0 से अक्षम करें) |

## पैकेज

यह एक pnpm मोनोरेपो है जिसमें दो प्रकाशित करने योग्य पैकेज हैं:

| पैकेज | विवरण | npm |
|---------|-------------|-----|
| [`@mcptoolshop/voice-soundboard-core`](packages/core) | बैकएंड-अज्ञेय मुख्य लाइब्रेरी (सत्यापन, SSML, टुकड़ा करना, स्कीमा) | [![npm](https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-core)](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-core) |
| [`@mcptoolshop/voice-soundboard-mcp`](packages/mcp-server) | CLI, गार्डरेल और परिवहन के साथ MCP सर्वर | [![npm](https://img.shields.io/npm/v/@mcptoolshop/voice-soundboard-mcp)](https://www.npmjs.com/package/@mcptoolshop/voice-soundboard-mcp) |

## विकास

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

> [MCP टूल शॉप](https://mcp-tool-shop.github.io/) का हिस्सा

### परियोजना संरचना

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

## गोपनीयता

**कोई भी डेटा संग्रह नहीं।** यह उपकरण किसी भी उपयोग डेटा को एकत्र नहीं करता है, कोई भी विश्लेषण नहीं भेजता है, और किसी भी नेटवर्क अनुरोध को नहीं करता है, सिवाय आपके द्वारा कॉन्फ़िगर किए गए टीटीएस बैकएंड के। सभी प्रक्रियाएं स्थानीय हैं।

## सुरक्षा

भेद्यता रिपोर्टिंग के लिए [SECURITY.md](SECURITY.md) देखें।

पूर्ण खतरे विश्लेषण के लिए [THREAT_MODEL.md](THREAT_MODEL.md) देखें।

## संबंधित

| परियोजना | विवरण |
|---------|-------------|
| [soundboard-plugin](https://github.com/mcp-tool-shop-org/soundboard-plugin) | क्लाउड कोड प्लगइन &mdash; स्लैश कमांड, भावना-जागरूक कथन |

## सहायता

- **प्रश्न / सहायता:** [चर्चाएँ](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/discussions)
- **त्रुटि रिपोर्ट:** [समस्याएँ](https://github.com/mcp-tool-shop-org/mcp-voice-soundboard/issues)
- **सुरक्षा:** [SECURITY.md](SECURITY.md)

## मूल्यांकन

| श्रेणी | अंक | टिप्पणियाँ |
|----------|-------|-------|
| ए. सुरक्षा | 10/10 | SECURITY.md, THREAT_MODEL.md, रेडैक्शन, कोई डेटा संग्रह नहीं |
| बी. त्रुटि प्रबंधन | 8/10 | संरचित त्रुटि अनुबंध (कोड/संकेत/पुनः प्रयास योग्य), toToolError पैटर्न |
| सी. ऑपरेटर दस्तावेज़ | 9/10 | README, CHANGELOG, HANDBOOK, उपकरण दस्तावेज़ |
| डी. शिपिंग स्वच्छता | 9/10 | CI, सत्यापन स्क्रिप्ट, डिपेंडabot, लॉकफ़ाइल |
| ई. पहचान | 10/10 | लोगो, अनुवाद, लैंडिंग पृष्ठ, मेटाडेटा |
| **Total** | **46/50** | |

## लाइसेंस

[MIT](LICENSE)

---

<p align="center">
  Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
</p>
