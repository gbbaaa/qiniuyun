# backend/services/tts.py
from gtts import gTTS
from io import BytesIO

def detect_lang(text: str) -> str:
    for ch in text:
        if "\u4e00" <= ch <= "\u9fff":
            return "zh"
    return "en"

def synthesize_speech(text: str, lang: str = "zh"):
    """
    TTS using gTTS. Returns BytesIO mp3 stream.
    If lang is 'zh', we use 'zh-CN'; for english 'en'.
    """
    lang_map = {"zh": "zh-CN", "en": "en"}
    tts = gTTS(text=text, lang=lang_map.get(lang, "en"))
    fp = BytesIO()
    tts.write_to_fp(fp)
    fp.seek(0)
    return fp
