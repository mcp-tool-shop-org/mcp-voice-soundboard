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
_engine_type = None  # "kokoro" or "piper"

# Piper voice cache: model_name → loaded PiperVoice
_piper_voices: dict = {}
_piper_model_dir: str | None = None


def _load_engine(output_dir: str | None = None):
    """Lazy-load the voice engine (Kokoro or Piper based on env)."""
    global _engine, _engine_error, _engine_type, _piper_model_dir

    if _engine is not None or _engine_error is not None:
        return

    engine_choice = os.environ.get("VOICE_SOUNDBOARD_ENGINE", "kokoro").lower()
    out = output_dir or os.environ.get("VOICE_SOUNDBOARD_OUTPUT_DIR")

    if engine_choice == "piper":
        try:
            from piper import PiperVoice  # noqa: F401
            _engine_type = "piper"
            _piper_model_dir = os.environ.get("VOICE_SOUNDBOARD_PIPER_MODEL_DIR", "F:/AI/models/piper")
            # Piper doesn't need a persistent engine — voices are loaded on demand
            _engine = "piper"  # sentinel
            _log(f"Piper engine ready (model dir: {_piper_model_dir})")
        except Exception as e:
            _engine_error = str(e)
            _log(f"Piper engine load failed: {e}")
    else:
        try:
            from voice_soundboard import VoiceEngine, Config

            kwargs = {}
            if out:
                out_path = Path(out)
                out_path.mkdir(parents=True, exist_ok=True)
                kwargs["output_dir"] = out_path
                _log(f"Output dir: {out_path}")

            _engine = VoiceEngine(Config(**kwargs))
            _engine_type = "kokoro"
            _log(f"Kokoro engine loaded: {type(_engine).__name__}")
        except Exception as e:
            _engine_error = str(e)
            _log(f"Kokoro engine load failed: {e}")


def _get_piper_voice(model_name: str):
    """Load and cache a Piper voice model."""
    if model_name not in _piper_voices:
        from piper import PiperVoice
        model_path = os.path.join(_piper_model_dir, f"{model_name}.onnx")
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Piper model not found: {model_path}")
        _piper_voices[model_name] = PiperVoice.load(model_path)
        _log(f"Piper voice loaded: {model_name}")
    return _piper_voices[model_name]


# ── Operation handlers ──


def handle_health(id: str, _msg: dict) -> None:
    _load_engine()
    if _engine_error:
        _err(id, "BACKEND_UNAVAILABLE", f"Engine failed to load: {_engine_error}")
    else:
        model_name = f"voice-soundboard-{_engine_type}"
        _ok(id, model=model_name, engine=_engine_type, sample_rate=24000)


def handle_synthesize(id: str, msg: dict) -> None:
    text = msg.get("text", "")
    voice = msg.get("voice", "bm_george")
    speed = msg.get("speed", 1.0)
    fmt = msg.get("format", "wav")
    output_dir = msg.get("output_dir")
    artifact_mode = msg.get("artifact_mode", "path")

    # Piper-native prosody params (passed when mood is set with Piper engine)
    piper_prosody = msg.get("piper_prosody")

    # Pass output_dir to engine init (only effective on first load)
    _load_engine(output_dir)
    if _engine is None:
        _err(id, "BACKEND_UNAVAILABLE", f"Engine not available: {_engine_error}")
        return

    try:
        if _engine_type == "piper" and piper_prosody:
            audio_path, sample_rate = _synthesize_piper(text, piper_prosody, output_dir)
        elif _engine_type == "piper":
            # Piper without mood — use default voice + neutral params
            audio_path, sample_rate = _synthesize_piper(text, {
                "piper_voice": "en_GB-alan-medium",
                "length_scale": 1.0,
                "noise_scale": 0.667,
                "noise_w_scale": 0.8,
                "volume": 1.0,
            }, output_dir)
        else:
            # Kokoro path (existing behavior)
            result = _engine.speak(text, voice=voice, speed=speed)
            audio_path = Path(str(getattr(result, "audio_path", "")))
            sample_rate = getattr(result, "sample_rate", 24000)

            if artifact_mode == "base64":
                import base64
                audio_bytes = result.audio_bytes if hasattr(result, "audio_bytes") else None
                if audio_bytes is None and hasattr(result, "audio_path"):
                    audio_bytes = Path(result.audio_path).read_bytes()
                if audio_bytes is None:
                    _err(id, "SYNTHESIS_FAILED", "No audio bytes available")
                    return
                b64 = base64.b64encode(audio_bytes).decode("ascii")
                _ok(id, audio_bytes_base64=b64, duration_ms=getattr(result, "duration_ms", 0),
                    sample_rate=sample_rate, format=fmt)
                return

            if output_dir:
                import shutil
                dest_dir = Path(output_dir)
                dest_dir.mkdir(parents=True, exist_ok=True)
                dest = dest_dir / audio_path.name
                if audio_path.parent.resolve() != dest_dir.resolve():
                    shutil.move(str(audio_path), str(dest))
                    audio_path = dest

            _ok(id, audio_path=str(audio_path), duration_ms=getattr(result, "duration_ms", 0),
                sample_rate=sample_rate, format=fmt)
            return

        # Piper path — handle artifact mode
        if not audio_path.exists():
            _err(id, "SYNTHESIS_FAILED", "Piper did not produce audio")
            return

        if artifact_mode == "base64":
            import base64
            b64 = base64.b64encode(audio_path.read_bytes()).decode("ascii")
            _ok(id, audio_bytes_base64=b64, duration_ms=0, sample_rate=sample_rate, format=fmt)
        else:
            if output_dir:
                import shutil
                dest_dir = Path(output_dir)
                dest_dir.mkdir(parents=True, exist_ok=True)
                dest = dest_dir / audio_path.name
                if audio_path.parent.resolve() != dest_dir.resolve():
                    shutil.move(str(audio_path), str(dest))
                    audio_path = dest

            _ok(id, audio_path=str(audio_path), duration_ms=0, sample_rate=sample_rate, format=fmt)

    except Exception as e:
        _log(f"Synthesis error: {traceback.format_exc()}")
        _err(id, "SYNTHESIS_FAILED", str(e))


def _synthesize_piper(text: str, prosody: dict, output_dir: str | None = None) -> tuple:
    """Synthesize with Piper using native prosody params. Returns (audio_path, sample_rate)."""
    import wave
    import hashlib
    from piper.config import SynthesisConfig

    piper_voice_name = prosody.get("piper_voice", "en_GB-alan-medium")
    voice = _get_piper_voice(piper_voice_name)

    config = SynthesisConfig(
        length_scale=prosody.get("length_scale", 1.0),
        noise_scale=prosody.get("noise_scale", 0.667),
        noise_w_scale=prosody.get("noise_w_scale", 0.8),
        volume=prosody.get("volume", 1.0),
    )

    # Generate output path
    out_dir = Path(output_dir or os.environ.get("VOICE_SOUNDBOARD_OUTPUT_DIR", "F:/AI/output"))
    out_dir.mkdir(parents=True, exist_ok=True)
    text_hash = hashlib.md5(text.encode()).hexdigest()[:8]
    out_path = out_dir / f"piper_{piper_voice_name}_{text_hash}.wav"

    with wave.open(str(out_path), "wb") as wav:
        voice.synthesize_wav(text, wav, syn_config=config)

    _log(f"Piper synth: voice={piper_voice_name} length={config.length_scale} "
         f"noise={config.noise_scale} noise_w={config.noise_w_scale} vol={config.volume}")

    # Get sample rate from the voice config
    sample_rate = voice.config.sample_rate if hasattr(voice, "config") and hasattr(voice.config, "sample_rate") else 22050

    return out_path, sample_rate


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
