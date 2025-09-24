# 部署指南（DEPLOYMENT）

## 环境要求
- Python 3.9+（推荐 3.10）
- Node.js 18+ / npm 9+
- 有效的 OpenAI API Key（用于 Whisper 与 Chat Completions）
- 服务器可访问互联网（gTTS 需要联网）

## 后端部署
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 环境变量（Linux/Mac）
export OPENAI_API_KEY=你的OpenAI密钥
export OPENAI_MODEL=gpt-4o-mini

# 启动
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```
- Windows 设置环境变量：`set OPENAI_API_KEY=...`
- 生产环境可使用 `nohup` 或 `systemd` 守护运行，并配置 Nginx 反向代理。

## 前端部署
```bash
cd frontend
npm install
npm run build
npm run preview  # 或将 dist/ 托管到任意静态服务器
```
开发模式：`npm run dev`（端口默认 5173）。如需指向线上后端，在 `.env` 或启动时注入：
```
VITE_API_BASE=https://your-api.example.com
```

## 验证
1. 打开前端页面 → 允许浏览器麦克风权限。
2. 选择角色 → 按住“按住说话”录音 → 松开自动识别 → 等待语音回复。
3. 若无声音：检查浏览器是否拦截自动播放；或查看开发者工具 Network 是否有 `/api/chat` 请求。

## 常见问题
- **ASR失败/超时**：检查 OpenAI Key 是否有效，网络是否可访问 `api.openai.com`。
- **TTS无声音**：gTTS 需要联网；若内网环境受限，建议接入本地 TTS 或厂商 TTS（可在 `services/tts.py` 自行适配）。
- **中文或英文选择不对**：当前根据用户消息/回复文本**简单检测**中文字符来决定 `zh / en`，可改进为带语言码的识别/检测。
- **跨域**：后端已放开 CORS，生产请按需收紧域名白名单。

## 安全与成本
- 控制上下文长度（本项目仅保留最近8条），降低调用成本。
- 在 `services/llm.py` 中可调 `temperature` 和模型名称。
- 不回传任何敏感用户数据，日志谨慎记录。

