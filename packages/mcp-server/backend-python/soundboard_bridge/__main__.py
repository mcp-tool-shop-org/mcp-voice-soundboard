"""
Voice Soundboard Python Bridge — NDJSON stdio protocol.

Auto-downloads Kokoro ONNX model + voices on first run.
Communicates with the Node.js MCP server via newline-delimited JSON on stdin/stdout.

Protocol:
  IN:  {"id": "...", "op": "health"}
  OUT: {"id": "...", "ok": true, "model": "kokoro-v0.19"}

  IN:  {"id": "...", "op": "synthesize", "text": "Hello", "voice": "af_bella", "speed": 1.0,
        "format": "wav", "artifact_mode": "base64"}
  OUT: {"id": "...", "ok": true, "audio_bytes_base64": "...", "duration_ms": 1234,
        "sample_rate": 24000, "format": "wav"}

  IN:  {"id": "...", "op": "interrupt"}
  OUT: {"id": "...", "ok": true}
"""

import json
import sys
import io
import base64
import struct
import os


GITHUB_RELEASE = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0"
MODEL_FILE = "kokoro-v1.0.onnx"
VOICES_FILE = "voices-v1.0.bin"


def ensure_deps():
    """Install kokoro-onnx if missing."""
    try:
        import kokoro_onnx  # noqa: F401
    except ImportError:
        import subprocess
        print("[bridge] Installing kokoro-onnx...", file=sys.stderr)
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "--user", "-q", "kokoro-onnx"],
            stdout=sys.stderr,
            stderr=sys.stderr,
        )


def download_file(url: str, dest: str):
    """Download a file with progress."""
    import urllib.request
    filename = os.path.basename(dest)
    print(f"[bridge] Downloading {filename}...", file=sys.stderr)
    urllib.request.urlretrieve(url, dest)
    size_mb = os.path.getsize(dest) / (1024 * 1024)
    print(f"[bridge] Downloaded {filename} ({size_mb:.0f} MB)", file=sys.stderr)


def download_model():
    """Download Kokoro ONNX model + voices from GitHub releases. Returns (model_path, voices_path)."""
    cache_dir = os.path.join(os.path.expanduser("~"), ".cache", "voice-soundboard")
    os.makedirs(cache_dir, exist_ok=True)

    model_path = os.path.join(cache_dir, MODEL_FILE)
    voices_path = os.path.join(cache_dir, VOICES_FILE)

    if not os.path.exists(model_path):
        download_file(f"{GITHUB_RELEASE}/{MODEL_FILE}", model_path)

    if not os.path.exists(voices_path):
        download_file(f"{GITHUB_RELEASE}/{VOICES_FILE}", voices_path)

    print(f"[bridge] Model ready: {model_path}", file=sys.stderr)
    return model_path, voices_path


def pcm_to_wav(samples, sample_rate: int) -> bytes:
    """Convert float32 numpy array to WAV bytes."""
    import numpy as np

    # Clamp and convert to 16-bit PCM
    pcm = np.clip(samples, -1.0, 1.0)
    pcm = (pcm * 32767).astype(np.int16)
    raw = pcm.tobytes()

    # Build WAV header
    buf = io.BytesIO()
    num_channels = 1
    bits_per_sample = 16
    byte_rate = sample_rate * num_channels * bits_per_sample // 8
    block_align = num_channels * bits_per_sample // 8
    data_size = len(raw)

    buf.write(b"RIFF")
    buf.write(struct.pack("<I", 36 + data_size))
    buf.write(b"WAVE")
    buf.write(b"fmt ")
    buf.write(struct.pack("<I", 16))
    buf.write(struct.pack("<H", 1))  # PCM
    buf.write(struct.pack("<H", num_channels))
    buf.write(struct.pack("<I", sample_rate))
    buf.write(struct.pack("<I", byte_rate))
    buf.write(struct.pack("<H", block_align))
    buf.write(struct.pack("<H", bits_per_sample))
    buf.write(b"data")
    buf.write(struct.pack("<I", data_size))
    buf.write(raw)

    return buf.getvalue()


def main():
    ensure_deps()

    from kokoro_onnx import Kokoro

    model_path, voices_path = download_model()
    kokoro = Kokoro(model_path, voices_path)
    available_voices = kokoro.get_voices()

    print(f"[bridge] Ready — {len(available_voices)} voices available", file=sys.stderr)

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        try:
            msg = json.loads(line)
        except json.JSONDecodeError:
            continue

        req_id = msg.get("id")
        op = msg.get("op")

        if op == "health":
            resp = {"id": req_id, "ok": True, "model": "kokoro-v1.1-onnx", "voices": len(available_voices)}
            sys.stdout.write(json.dumps(resp) + "\n")
            sys.stdout.flush()

        elif op == "synthesize":
            try:
                text = msg.get("text", "")
                voice = msg.get("voice", "af_bella")
                speed = float(msg.get("speed", 1.0))
                artifact_mode = msg.get("artifact_mode", "base64")

                # Validate voice
                if voice not in available_voices:
                    # Try partial match
                    matches = [v for v in available_voices if v.startswith(voice)]
                    voice = matches[0] if matches else available_voices[0]

                samples, sample_rate = kokoro.create(text, voice=voice, speed=speed)
                wav_bytes = pcm_to_wav(samples, sample_rate)
                duration_ms = int(len(samples) / sample_rate * 1000)

                if artifact_mode == "base64":
                    resp = {
                        "id": req_id,
                        "ok": True,
                        "audio_bytes_base64": base64.b64encode(wav_bytes).decode(),
                        "duration_ms": duration_ms,
                        "sample_rate": sample_rate,
                        "format": "wav",
                    }
                else:
                    output_dir = msg.get("output_dir", os.path.join(os.path.expanduser("~"), ".voice-soundboard"))
                    os.makedirs(output_dir, exist_ok=True)
                    import uuid
                    audio_path = os.path.join(output_dir, f"vsmcp_{uuid.uuid4().hex[:8]}.wav")
                    with open(audio_path, "wb") as f:
                        f.write(wav_bytes)
                    resp = {
                        "id": req_id,
                        "ok": True,
                        "audio_path": audio_path,
                        "duration_ms": duration_ms,
                        "sample_rate": sample_rate,
                        "format": "wav",
                    }

                sys.stdout.write(json.dumps(resp) + "\n")
                sys.stdout.flush()

            except Exception as e:
                resp = {
                    "id": req_id,
                    "ok": False,
                    "error": {"code": "SYNTHESIS_FAILED", "message": str(e)},
                }
                sys.stdout.write(json.dumps(resp) + "\n")
                sys.stdout.flush()

        elif op == "interrupt":
            resp = {"id": req_id, "ok": True}
            sys.stdout.write(json.dumps(resp) + "\n")
            sys.stdout.flush()


if __name__ == "__main__":
    main()
