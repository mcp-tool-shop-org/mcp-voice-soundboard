---
name: status
description: Check voice engine health and configuration.
argument-hint:
---

# Voice Status

Check the voice engine health and report status.

## Instructions

1. Call `voice_status` to get engine health information

2. Report:
   - **Engine status** — healthy / degraded / unhealthy
   - **Backend** — which TTS backend is active (mock, http, python)
   - **Voice count** — how many voices are available
   - **Preset count** — how many presets are configured
   - **Ambient system** — enabled or disabled
   - **Guardrails** — rate limits, concurrency, timeout settings
   - Any errors or warnings

3. If the engine is unhealthy, suggest:
   - Check that the TTS backend is running
   - Verify environment variables are set correctly
   - Check `VOICE_SOUNDBOARD_BACKEND` setting
   - For HTTP backend: verify `VOICE_SOUNDBOARD_HTTP_URL` is reachable

## Tips

- The mock backend always works — it returns silence but validates the full pipeline
- For real audio, configure the HTTP or Python backend
- `voice_status` is lightweight and not rate-limited — safe to call frequently
