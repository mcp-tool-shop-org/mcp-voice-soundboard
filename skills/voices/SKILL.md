---
name: voices
description: List available voices and presets. Browse the full voice roster.
argument-hint:
---

# Voices

Show all available voices and presets.

## Instructions

1. Call `voice_status` to get the current engine state and voice roster

2. Present the results organized by:
   - **Presets** (5) — named configurations with voice + speed + style
   - **Voices by language** — grouped by accent/language
   - **Backend status** — which TTS backend is active

3. Format the output as a clear reference table showing:
   - Voice ID, name, gender, accent, style
   - Preset name, mapped voice, speed, description

4. If the user asked about a specific voice or language, highlight those results

## Voice ID Format

Voice IDs follow the pattern `{accent}{gender}_{name}`:
- First letter(s) = accent: `a` American, `b` British, `j` Japanese, `z` Chinese, `e` Spanish, `f` French, `h` Hindi, `i` Italian, `p` Portuguese
- Second letter = gender: `f` female, `m` male
- After underscore = name

## Tips

- Use `voice_speak` with a sample phrase to preview a voice
- Presets are shortcuts — `narrator` maps to `bm_george` at 0.95x speed
- The default voice is `bm_george` if no voice is specified
