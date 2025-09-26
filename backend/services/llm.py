# backend/services/llm.py
import os
import requests

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

def generate_reply(role_prompt: str, user_message: str, history_messages: list[dict]):
    """
    Call OpenAI chat completion. History_messages is a list of dicts:
    {"role": "user"/"assistant", "content": "..."}
    """
    if not OPENAI_API_KEY:
        # Dev fallback without API: echo
        return f"(Demo) {user_message}"
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    messages = [{"role": "system", "content": role_prompt}] + history_messages + [
        {"role": "user", "content": user_message}
    ]
    payload = {
        "model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        "messages": messages,
        "temperature": 0.9,
    }
    resp = requests.post(url, headers=headers, json=payload, timeout=90)
    resp.raise_for_status()
    data = resp.json()
    return data["choices"][0]["message"]["content"]
