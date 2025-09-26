# backend/services/asr.py
import os
import requests

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

def transcribe_audio(file_path: str):
    """
    Use OpenAI Whisper API to transcribe audio.
    Returns (text, lang) where lang is a best-effort language code.
    """
    if not OPENAI_API_KEY:
        # Fallback: pretend empty transcription
        return ("", "zh")
    url = "https://api.openai.com/v1/audio/transcriptions"
    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}"}
    files = {
        "file": (os.path.basename(file_path), open(file_path, "rb"), "application/octet-stream"),
        "model": (None, "whisper-1"),
        # optional: "language": (None, "auto"),
    }
    resp = requests.post(url, headers=headers, files=files, timeout=60)
    resp.raise_for_status()
    data = resp.json()
    text = data.get("text", "")
    # Best-effort language detection: simple heuristic
    lang = "zh" if any("\u4e00" <= ch <= "\u9fff" for ch in text) else "en"
    return (text, lang)
