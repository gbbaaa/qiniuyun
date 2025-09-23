# AI 角色扮演 · 语音聊天网页

一个支持 **中文 / 英文** 语音聊天的 AI 角色扮演网页。用户可搜索并选择角色（哈利·波特、苏格拉底、李时珍、诸葛亮），与其进行 **语音 + 文本** 对话。后端基于 **FastAPI**，集成 **ASR(Whisper)**、**LLM(OpenAI Chat Completions)** 与 **TTS(gTTS)** 构建端到端闭环。

> ⚠️ 仅调用 LLM / ASR / TTS，不依赖第三方 Agent 框架。

## 功能清单
- 角色搜索与选择（哈利·波特 / 苏格拉底 / 李时珍 / 诸葛亮）
- 语音输入（浏览器录音 → Whisper 识别）
- 角色对话（GPT-4o mini 默认，可切换其他模型）
- 语音输出（gTTS 合成，自动中英切换）
- 多轮上下文（保留最近 8 条）
- 前端：React + Tailwind；后端：FastAPI

## 目录结构
```
ai-roleplay-voice-web/
├── backend/                 # FastAPI 后端
│   ├── app.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── data/
│   │   └── characters.yaml  # 角色设定与技能
│   └── services/
│       ├── asr.py           # Whisper ASR
│       ├── llm.py           # OpenAI Chat
│       └── tts.py           # gTTS 合成
├── frontend/                # React + Vite + Tailwind 前端
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── public/
│   └── src/
│       ├── main.jsx
│       ├── index.css
│       ├── App.jsx
│       └── components/
│           ├── CharacterList.jsx
│           └── ChatWindow.jsx
└── docs/
    ├── PRODUCT_SPEC.md      # 题目1-4的思考与说明
    ├── DEPLOYMENT.md        # 部署指南（含常见问题）
    ├── ROLE_DESIGN.md       # 角色与技能说明
    └── SUBMISSION_CHECKLIST.md # 提交检查清单
```

## 快速开始

### 1) 后端
```bash
cd backend
python -m venv .venv && source .venv/bin/activate    # Windows 用 .venv\Scripts\activate
pip install -r requirements.txt
# 配置环境变量
export OPENAI_API_KEY=你的OpenAI密钥
# 可选：模型名（默认 gpt-4o-mini）
export OPENAI_MODEL=gpt-4o-mini
# 启动
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### 2) 前端
```bash
cd frontend
npm install
# 开发模式
npm run dev
# 构建
npm run build && npm run preview
```
默认前端开发端口 `5173`，后端端口 `8000`。若跨域，已在后端放开 CORS。也可在前端设置环境变量 `VITE_API_BASE` 指向后端地址。

## 体验指引
1. 打开前端页面 → 左侧搜索并选择一个角色。
2. 右侧聊天区：按住“按住说话”录音并松开，或直接输入文字。
3. 稍候将听到角色语音回复；同时可见文本气泡。
4. 试试这些示例：
   - **哈利·波特**： “给我讲一个霍格沃茨的趣事”; “教我一个简单的咒语”
   - **苏格拉底**： “什么是正义？”; “请用提问引导我分析 ‘说谎是否错误’ ”
   - **李时珍**： “最近常失眠怎么办？”（不会给具体剂量，仅方向建议）
   - **诸葛亮**： “如何在有限资源下做项目排期？”; “请用三段式分析‘是否该跨专业读研’”

## 许可证
MIT License © 2025 AI Roleplay Team
