---
title: Expression
description: Emotion spans, SSML-lite, and SFX tags.
sidebar:
  order: 4
---

## Emotion spans

Wrap text in emotion tags to control prosody:

```
[happy]Great news![/happy] But [sad]I have to go.[/sad]
```

Eight emotions available: `happy`, `sad`, `angry`, `fearful`, `surprised`, `disgusted`, `calm`, `excited`.

Emotions can be mixed across a sentence for nuanced delivery.

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
| `[error]` | Error alert |
| `[click]` | Button click |

Enable SFX with `sfx: true` in `voice_speak` (on by default).

## Combining expression features

All expression features can be combined in a single synthesis request:

```
[excited]Welcome to the show![/excited] <break time="300ms"/>
[calm]Today we'll be discussing...[/calm] [ding]
```
