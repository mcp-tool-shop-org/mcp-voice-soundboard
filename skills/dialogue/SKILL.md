---
name: dialogue
description: Create multi-speaker dialogue. Write conversations between characters with different voices.
argument-hint: [dialogue description or script]
---

# Dialogue

Create a multi-speaker dialogue: **$ARGUMENTS**

## Instructions

1. Parse the user's request to determine:
   - **Speakers** — who is talking?
   - **Content** — what are they saying?
   - **Tone** — formal, casual, dramatic, educational?

2. Write the script in `Speaker: line` format:
   ```
   Alice: Welcome everyone!
   [pause 500ms]
   Bob: Thanks for the introduction.
   Alice: [happy]Let's dive in![/happy]
   ```

3. Choose voice casting based on the speakers:
   - Male speakers → `am_*` (American) or `bm_*` (British)
   - Female speakers → `af_*` (American) or `bf_*` (British)
   - Match accent to character (e.g. British character → `bf_alice`)
   - Use different voice styles for contrast between speakers

4. Call `voice_dialogue` with:
   - `script` — the formatted dialogue
   - `cast` — speaker-to-voice mapping
   - `concat: true` if the user wants a single audio file

5. Report what was created: speakers, line count, voices used

## Recommended Cast Pairings

| Pairing | Voices | Good For |
|---------|--------|----------|
| Professional duo | `af_jessica` + `bm_george` | Interviews, tutorials |
| Casual friends | `am_liam` + `af_sky` | Conversations, demos |
| Storytelling | `bf_emma` + `bm_fable` | Narratives, audiobooks |
| Debate | `am_eric` + `am_fenrir` | Contrasting viewpoints |

## Tips

- Add `[pause 300ms]` between speakers for natural pacing
- Emotion spans work inside dialogue: `Alice: [surprised]Really?![/surprised]`
- Use `debug: true` to see the cue sheet and catch parse warnings
- Uncast speakers are auto-assigned — but explicit casting sounds better
