---
name: speak
description: Speak text aloud with voice selection, emotion, and effects. Say anything naturally.
argument-hint: [text to speak]
---

# Speak

Speak the following aloud: **$ARGUMENTS**

## Instructions

1. Parse the user's request to determine:
   - **Text** to synthesize
   - **Voice or preset** (if mentioned — e.g. "in a whisper", "use the narrator")
   - **Speed** (if mentioned — e.g. "slowly", "fast")
   - **Emotion** (if the text has emotional content, wrap in emotion spans)

2. Choose the right preset or voice:
   - Casual/friendly → `assistant` preset
   - Documentary/calm → `narrator` preset
   - Energetic/bold → `announcer` preset
   - Story/expressive → `storyteller` preset
   - Soft/gentle → `whisper` preset
   - Specific voice → use voice ID directly (e.g. `am_fenrir`, `bf_alice`)

3. Add emotion spans if the text contains emotional content:
   - `[happy]...[/happy]` for joy, excitement
   - `[sad]...[/sad]` for sadness, disappointment
   - `[urgent]...[/urgent]` for warnings, deadlines
   - `[calm]...[/calm]` for reassurance

4. Call `voice_speak` with the prepared text and options

5. If SFX are appropriate (notifications, alerts), enable `sfx: true` and use tags like `[ding]`, `[chime]`

## Tips

- Default voice is `bm_george` (British male, authoritative) — good for general announcements
- For code walkthroughs, use `narrator` at speed 0.9 for clarity
- Emotion spans can be nested within dialogue for natural-sounding speech
- Use `voice_status` first if unsure what voices are available
