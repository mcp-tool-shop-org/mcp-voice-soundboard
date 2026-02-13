"""Entry point: python -m soundboard_bridge

NDJSON protocol over stdin/stdout.

Requests (from Node server):
    {"id": "...", "op": "health"}
    {"id": "...", "op": "synthesize", "text": "...", "voice": "...", ...}
    {"id": "...", "op": "interrupt"}

Responses (to Node server):
    {"id": "...", "ok": true, ...}
    {"id": "...", "ok": false, "error": {"code": "...", "message": "..."}}

All logging goes to stderr; stdout is reserved for protocol messages.
"""

import json
import sys
import os
import traceback
from pathlib import Path


def _log(msg: str) -> None:
    """Log to stderr (never stdout — that's the protocol channel)."""
    print(f"[soundboard-bridge] {msg}", file=sys.stderr, flush=True)


def _respond(id: str, payload: dict) -> None:
    """Send a JSON response to stdout."""
    payload["id"] = id
    sys.stdout.write(json.dumps(payload) + "\n")
    sys.stdout.flush()


def _ok(id: str, **kwargs) -> None:
    _respond(id, {"ok": True, **kwargs})


def _err(id: str, code: str, message: str) -> None:
    _respond(id, {"ok": False, "error": {"code": code, "message": message}})


# ── Engine loading ──

_engine = None
_engine_error = None


def _load_engine():
    """Lazy-load the voice soundboard engine."""
    global _engine, _engine_error
    if _engine is not None or _engine_error is not None:
        return

    try:
        from voice_soundboard import VoiceEngine, Config
        _engine = VoiceEngine(Config())
        _log(f"Engine loaded: {type(_engine).__name__}")
    except Exception as e:
        _engine_error = str(e)
        _log(f"Engine load failed: {e}")


# ── Operation handlers ──


def handle_health(id: str, _msg: dict) -> None:
    _load_engine()
    if _engine_error:
        _err(id, "BACKEND_UNAVAILABLE", f"Engine failed to load: {_engine_error}")
    else:
        _ok(id, model="voice-soundboard-python", sample_rate=24000)


def handle_synthesize(id: str, msg: dict) -> None:
    _load_engine()
    if _engine is None:
        _err(id, "BACKEND_UNAVAILABLE", f"Engine not available: {_engine_error}")
        return

    text = msg.get("text", "")
    voice = msg.get("voice", "bm_george")
    speed = msg.get("speed", 1.0)
    fmt = msg.get("format", "wav")
    output_dir = msg.get("output_dir") or os.environ.get("TMPDIR", "/tmp")
    artifact_mode = msg.get("artifact_mode", "path")

    try:
        result = _engine.speak(text, voice=voice, speed=speed)

        if artifact_mode == "base64":
            import base64
            audio_bytes = result.audio_bytes if hasattr(result, "audio_bytes") else None
            if audio_bytes is None and hasattr(result, "audio_path"):
                audio_bytes = Path(result.audio_path).read_bytes()
            if audio_bytes is None:
                _err(id, "SYNTHESIS_FAILED", "No audio bytes available")
                return
            b64 = base64.b64encode(audio_bytes).decode("ascii")
            _ok(
                id,
                audio_bytes_base64=b64,
                duration_ms=getattr(result, "duration_ms", 0),
                sample_rate=getattr(result, "sample_rate", 24000),
                format=fmt,
            )
        else:
            # Path mode
            audio_path = str(getattr(result, "audio_path", ""))
            if not audio_path:
                _err(id, "SYNTHESIS_FAILED", "Engine did not produce an audio path")
                return
            _ok(
                id,
                audio_path=audio_path,
                duration_ms=getattr(result, "duration_ms", 0),
                sample_rate=getattr(result, "sample_rate", 24000),
                format=fmt,
            )
    except Exception as e:
        _log(f"Synthesis error: {traceback.format_exc()}")
        _err(id, "SYNTHESIS_FAILED", str(e))


def handle_interrupt(id: str, _msg: dict) -> None:
    _ok(id, interrupted=False)


# ── Main loop ──

HANDLERS = {
    "health": handle_health,
    "synthesize": handle_synthesize,
    "interrupt": handle_interrupt,
}


def main() -> None:
    _log("Bridge started, waiting for NDJSON on stdin...")
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            msg = json.loads(line)
        except json.JSONDecodeError as e:
            _log(f"Invalid JSON: {e}")
            continue

        id = msg.get("id", "unknown")
        op = msg.get("op", "")

        handler = HANDLERS.get(op)
        if handler:
            try:
                handler(id, msg)
            except Exception as e:
                _log(f"Handler error: {traceback.format_exc()}")
                _err(id, "INTERNAL_ERROR", str(e))
        else:
            _err(id, "UNKNOWN_OP", f"Unknown operation: {op}")


if __name__ == "__main__":
    main()
