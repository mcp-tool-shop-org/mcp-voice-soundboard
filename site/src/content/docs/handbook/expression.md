---
title: Expression
description: Emotion spans, SSML-lite, and SFX tags.
sidebar:
  order: 4
---

## Emotion spans

Wrap text in curly-brace emotion tags to control prosody and voice routing. Each emotion maps to a specific voice and speed:

```
{joy}Great news!{/joy} But {calm}let me explain.{/calm}
```

Eight emotions available: `neutral`, `serious`, `friendly`, `professional`, `calm`, `joy`, `urgent`, `whisper`.

Emotions can be mixed across a sentence for nuanced delivery. Untagged text defaults to `neutral`. Unknown emotion names fall back to `neutral` with a warning.

## SSML-lite

A simplified subset of SSML for timing and emphasis control — without the full complexity of the SSML spec:

- `<break time="500ms"/>` — Pause for a duration
- `<emphasis level="strong">word</emphasis>` — Emphasize a word or phrase
- `<prosody rate="slow">text</prosody>` — Control speaking rate

## SFX tags

Inline sound effects that play alongside speech:

| Tag | Sound |
|-----|-------|
| `[ding]` | Notification chime |
| `[chime]` | Gentle bell |
| `[whoosh]` | Swoosh transition |
| `[tada]` | Celebration fanfare |
| `[pop]` | Short pop sound |
| `[click]` | Button click |

Enable SFX with `sfx: true` in `voice_speak` (on by default).

## Combining expression features

All expression features can be combined in a single synthesis request:

```
{joy}Welcome to the show!{/joy} <break time="300ms"/>
{calm}Today we'll be discussing...{/calm} [ding]
```
