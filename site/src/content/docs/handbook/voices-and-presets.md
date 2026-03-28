---
title: Voices & Presets
description: 46 voices across 9 languages, plus 5 curated presets.
sidebar:
  order: 3
---

## Language prefixes

Language is auto-inferred from the voice ID prefix — no configuration required.

| Prefix | Language |
|--------|----------|
| `af_` / `am_` | English (American) |
| `bf_` / `bm_` | English (British) |
| `jf_` / `jm_` | Japanese |
| `zf_` / `zm_` | Mandarin Chinese |
| `ef_` / `em_` | Spanish |
| `ff_` | French |
| `hf_` / `hm_` | Hindi |
| `if_` / `im_` | Italian |
| `pf_` / `pm_` | Brazilian Portuguese |

## Presets

Five curated presets for common use cases:

| Preset | Voice | Speed | Description |
|--------|-------|-------|-------------|
| `narrator` | `bm_george` | 0.95 | Calm, clear, documentary style |
| `announcer` | `am_eric` | 1.1 | Bold, energetic, broadcast style |
| `whisper` | `af_sky` | 0.85 | Soft, intimate, gentle |
| `storyteller` | `bf_emma` | 0.90 | Expressive, varied pacing |
| `assistant` | `af_jessica` | 1.0 | Friendly, helpful, conversational |

Six humor presets are also available for sensor-humor integration. Use the `mood` parameter on `voice_speak` with one of: `dry`, `roast`, `chaotic`, `cheeky`, `cynic`, `zoomer`.

## Voice catalog highlights

**English (American)** — 14 voices including Aoede (musical), Bella (warm), Heart (caring), Jessica (professional), Eric (confident), Fenrir (powerful), Puck (playful).

**English (British)** — 6 voices including Alice (proper), Emma (refined), Fable (storytelling), George (authoritative).

**Japanese** — 5 voices including Alpha (clear), Gongitsune (storytelling), Nezuko (gentle).

**Mandarin Chinese** — 8 voices including Xiaobei (bright), Yunjian (authoritative), Yunxi (friendly).

**Spanish** — 3 voices. **French** — 1 voice. **Hindi** — 4 voices. **Italian** — 2 voices. **Brazilian Portuguese** — 3 voices.

Use `voice_status` to get the full list of available voices at runtime.
