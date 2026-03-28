# Voice Etiquette

Controls how Claude uses voice narration during work sessions.
Read this file at session start when voice-soundboard MCP is available.

Copy this file to `~/.claude/voice-etiquette.md` and customize to your preferences.

## Verbosity

| Level | When to speak | Good for |
|-------|--------------|----------|
| `silent` | Never | Heads-down focus, noisy environment |
| `minimal` | Task summary only (end of request) | Light awareness without interruption |
| `normal` | Task start + milestones + summary | Default — balanced narration |
| `verbose` | Start + progress + milestones + blockers + summary | Pairing, demos, learning |

**Current level: `normal`**

## Speaking Cues

Which moments trigger voice. Toggle individually.

| Cue | Default | Description |
|-----|---------|-------------|
| `task_start` | on | Announce what you're about to do (1 sentence) |
| `milestone` | on | Tests passing, build succeeding, commit made |
| `blocker` | on | Errors, unexpected failures, needs user input |
| `task_summary` | on | Summary when finishing a request |
| `commit` | off | Read the commit message aloud |
| `file_created` | off | Announce new files |
| `test_results` | off | Speak test count and pass/fail |
| `thinking` | off | Narrate reasoning ("I'm going to try X because...") |

## Voice Preferences

| Setting | Value | Options |
|---------|-------|---------|
| `default_preset` | `narrator` | narrator, announcer, whisper, storyteller, assistant |
| `milestone_preset` | `announcer` | Any preset or voice ID |
| `blocker_preset` | `assistant` | Any preset or voice ID |
| `summary_preset` | `narrator` | Any preset or voice ID |
| `speed` | `1.0` | 0.5 - 2.0 |
| `max_sentence_length` | `2` | Max sentences per narration (keeps it tight) |

## Tone

| Setting | Value | Options |
|---------|-------|---------|
| `style` | `professional` | professional, casual, dramatic, deadpan, playful |
| `humor` | `off` | off, dry, roast, chaotic, cheeky |
| `emotion_spans` | `off` | off, subtle, expressive |

## Rules

- Never narrate file reads, grep searches, or routine tool calls
- Never repeat what's already visible in the text output
- Keep every narration to `max_sentence_length` or fewer
- If the user says "quiet" or "shh", switch to `silent` for the rest of the session
- If the user says "talk to me", switch to `verbose`
- Always call `voice_play` after `voice_speak` — don't just synthesize into the void
- When `humor` is set, use the matching `humor_*` preset for milestones
