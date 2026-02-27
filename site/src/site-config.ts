import type { SiteConfig } from '@mcptoolshop/site-theme';

export const config: SiteConfig = {
  title: 'MCP Voice Soundboard',
  description: 'Text-to-speech MCP server — 48 voices, 9 languages, 5 presets, emotion spans, SSML-lite, multi-speaker dialogue, SFX tags, and built-in guardrails.',
  logoBadge: 'v1',
  brandName: 'MCP Voice Soundboard',
  repoUrl: 'https://github.com/mcp-tool-shop-org/mcp-voice-soundboard',
  footerText: 'MIT Licensed — built by <a href="https://mcp-tool-shop.github.io/" style="color:var(--color-muted);text-decoration:underline">MCP Tool Shop</a>',

  hero: {
    badge: 'TypeScript · Node.js · MCP',
    headline: 'Give your agent',
    headlineAccent: 'a voice.',
    description: '48 voices, 9 languages, 5 presets, emotion spans, SSML-lite, SFX tags, and multi-speaker dialogue. Ships as a single npx command.',
    primaryCta: { href: '#usage', label: 'Get started' },
    secondaryCta: { href: '#tools', label: 'See the tools' },
    previews: [
      {
        label: 'Quick start',
        code: '# one command — no install required\nnpx @mcptoolshop/voice-soundboard-mcp\n\n# Claude Desktop / MCP client config\n{\n  "mcpServers": {\n    "voice-soundboard": {\n      "command": "npx",\n      "args": ["-y", "@mcptoolshop/voice-soundboard-mcp"]\n    }\n  }\n}',
      },
      {
        label: 'Speak & emote',
        code: '// synthesize with emotion spans\nvoice_speak({\n  text: "[happy]Great news![/happy] But [sad]I have to go.[/sad]",\n  voice: "narrator",   // preset: calm documentary style\n  sfx: true\n})\n\n// multi-speaker dialogue\nvoice_dialogue({\n  script: "Alice: Hello!\\nBob: [excited]Hey there![/excited]",\n  cast: { Alice: "af_sky", Bob: "am_fenrir" }\n})',
      },
      {
        label: 'Status & control',
        code: '// check available voices and backend health\nvoice_status()\n\n// stop active synthesis\nvoice_interrupt({ reason: "user_spoke" })\n\n// ambient micro-utterance (requires --ambient flag)\nvoice_inner_monologue({\n  text: "Interesting...",\n  category: "thinking"\n})',
      },
    ],
  },

  sections: [
    {
      kind: 'features',
      id: 'features',
      title: 'Built for AI agents',
      subtitle: 'MCP native, expressive by default, and safe to ship — everything an AI agent needs to speak out loud.',
      features: [
        {
          title: 'MCP native',
          desc: 'stdio transport, works with Claude Desktop, Cursor, and any MCP client. Five tools: voice_speak, voice_dialogue, voice_status, voice_interrupt, voice_inner_monologue.',
        },
        {
          title: '48 voices, 9 languages',
          desc: 'English (American + British), Japanese, Mandarin, Spanish, French, Hindi, Italian, Brazilian Portuguese. Five curated presets: narrator, announcer, whisper, storyteller, assistant.',
        },
        {
          title: 'Guardrails built in',
          desc: 'Rate limiting, concurrency semaphore, request timeouts, path traversal protection, and secret redaction. Swappable backends: mock, HTTP proxy, or bring your own.',
        },
      ],
    },
    {
      kind: 'data-table',
      id: 'tools',
      title: 'Five MCP tools',
      subtitle: 'Every voice operation an AI agent needs.',
      columns: ['Tool', 'What it does'],
      rows: [
        ['voice_speak', 'Synthesize speech — text, voice/preset, speed, format, SFX, artifact mode'],
        ['voice_dialogue', 'Multi-speaker synthesis — Speaker: line format, auto-cast, concat, cue sheet'],
        ['voice_status', 'Engine health, available voices, presets, and backend info'],
        ['voice_interrupt', 'Stop or rollback active synthesis with optional reason code'],
        ['voice_inner_monologue', 'Ephemeral ambient micro-utterances — max 500 chars, auto-redacted'],
      ],
    },
    {
      kind: 'code-cards',
      id: 'usage',
      title: 'Get started',
      cards: [
        {
          title: 'Install & run',
          code: 'npx @mcptoolshop/voice-soundboard-mcp\n\n# or install globally\nnpm install -g @mcptoolshop/voice-soundboard-mcp\nvoice-soundboard-mcp',
        },
        {
          title: 'Emotion spans',
          code: '// 8 emotions: happy, sad, angry, fearful,\n// surprised, disgusted, calm, excited\nvoice_speak({\n  text: "[calm]Here is your summary.[/calm]"\n})',
        },
        {
          title: 'Multi-speaker dialogue',
          code: 'voice_dialogue({\n  script:\n    "Narrator: Once upon a time...\\n" +\n    "Hero: I\'ll take on the quest!",\n  cast: {\n    Narrator: "storyteller",\n    Hero: "am_fenrir"\n  }\n})',
        },
        {
          title: 'CLI options',
          code: 'npx @mcptoolshop/voice-soundboard-mcp \\\n  --artifact=base64 \\\n  --max-concurrent=2 \\\n  --timeout=30000 \\\n  --ambient',
        },
      ],
    },
    {
      kind: 'features',
      id: 'expression',
      title: 'Rich expression',
      subtitle: 'Inline markup for prosody, timing, and effects — no full SSML required.',
      features: [
        {
          title: 'Emotion spans',
          desc: 'Eight emotions via [happy]...[/happy] inline markup. Wrap any phrase to shift prosody — stack them across a sentence for nuanced delivery.',
        },
        {
          title: 'SSML-lite & SFX',
          desc: '<break>, <emphasis>, <prosody> for timing control. SFX tags [ding], [chime], [whoosh], [tada], [error], [click] for inline sound effects.',
        },
        {
          title: 'Swappable backends',
          desc: 'Mock backend ships built-in — zero setup. HTTP proxy and Python bridge for production. Plug in Kokoro, Coqui, ElevenLabs, or any TTS engine.',
        },
      ],
    },
    {
      kind: 'data-table',
      id: 'quality',
      title: 'Ship Gate scorecard',
      subtitle: 'v1.0.0 — audited against our product quality standard.',
      columns: ['Category', 'Score', 'Highlights'],
      rows: [
        ['Security', '10/10', 'SECURITY.md, threat model, redaction, no telemetry'],
        ['Error handling', '8/10', 'Structured errors (code/hint/retryable), toToolError pattern'],
        ['Operator docs', '9/10', 'README, CHANGELOG, HANDBOOK, Zod-documented tools'],
        ['Shipping hygiene', '9/10', 'CI, verify script, dependabot, lockfile, 344 tests'],
        ['Identity', '10/10', 'Logo, 8 translations, landing page, repo metadata'],
      ],
    },
  ],
};
