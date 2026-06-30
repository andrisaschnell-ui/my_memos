"""
Uses local Faster-Whisper to transcribe and translate audio into English text.
Supports spoken Afrikaans and English, translating everything into clean English.
"""
import asyncio
from faster_whisper import WhisperModel

# Lazy loading or singleton for WhisperModel
_model = None

def get_whisper_model():
    global _model
    if _model is None:
        # Using "tiny" model for fast CPU execution and very low RAM footprint on Railway.
        _model = WhisperModel("tiny", device="cpu", compute_type="int8")
    return _model

def _transcribe_sync(audio_path: str) -> str:
    model = get_whisper_model()
    # task="translate" translates Afrikaans/other languages directly into English text
    segments, info = model.transcribe(audio_path, task="translate", beam_size=5)
    text = " ".join([segment.text for segment in segments]).strip()
    return text

async def transcribe_audio(audio_path: str) -> str:
    """Run CPU-intensive transcription in a background thread."""
    return await asyncio.to_thread(_transcribe_sync, audio_path)
