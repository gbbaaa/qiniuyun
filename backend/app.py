# backend/app.py
import os
import io
import base64
import uvicorn
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
import yaml

from services.asr import transcribe_audio
from services.llm import generate_reply
from services.tts import synthesize_speech, detect_lang

# ---------- FastAPI app ----------
app = FastAPI(title="AI Roleplay Voice Web API", version="1.0.0")

# CORS (allow all origins for demo/dev; tighten for prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load characters (YAML)
with open(os.path.join("data", "characters.yaml"), "r", encoding="utf-8") as f:
    CHARACTERS = {c["id"]: c for c in yaml.safe_load(f)["characters"]}

class HistoryItem(BaseModel):
    sender: str  # 'user' or 'assistant'
    content: str

class ChatPayload(BaseModel):
    roleId: str
    user_message: str
    history: list[HistoryItem] = []
    target_lang: str | None = None  # 'zh' or 'en'

@app.get("/api/characters")
async def list_characters():
    items = [{"id": c["id"], "name": c["name"], "desc": c.get("desc", "")} for c in CHARACTERS.values()]
    return {"characters": items}

@app.post("/api/speech-to-text")
async def speech_to_text(file: UploadFile = File(...)):
    # Save to temp and transcribe
    content = await file.read()
    tmp_path = f"/tmp/{file.filename}"
    with open(tmp_path, "wb") as f:
        f.write(content)
    try:
        text, lang = transcribe_audio(tmp_path)
        return {"text": text, "lang": lang}
    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass

@app.post("/api/text-to-speech")
async def text_to_speech(text: str = Form(...), lang: str = Form("auto")):
    if lang == "auto":
        lang = detect_lang(text)
    audio_fp = synthesize_speech(text, lang)
    # return base64 for easy front-end playback
    b64 = base64.b64encode(audio_fp.read()).decode("utf-8")
    return {"audio_b64": b64, "lang": lang}

@app.post("/api/chat")
async def chat(payload: ChatPayload):
    role_id = payload.roleId
    if role_id not in CHARACTERS:
        return JSONResponse(status_code=400, content={"error": "Unknown roleId"})
    role_prompt = CHARACTERS[role_id]["prompt"]
    # Prepare history in OpenAI message format
    history_msgs = []
    for h in payload.history[-8:]:  # keep last 8 exchanges to limit tokens
        role = "user" if h.sender == "user" else "assistant"
        history_msgs.append({"role": role, "content": h.content})
    reply_text = generate_reply(role_prompt, payload.user_message, history_msgs)
    lang = payload.target_lang or detect_lang(payload.user_message or reply_text)
    audio_fp = synthesize_speech(reply_text, lang)
    b64 = base64.b64encode(audio_fp.read()).decode("utf-8")
    return {"text": reply_text, "audio_b64": b64, "lang": lang}

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
