import React, { useEffect, useRef, useState } from 'react'

function hasCJK(s=''){
  for (let i=0;i<s.length;i++){
    const code = s.charCodeAt(i)
    if(code>=0x4e00 && code<=0x9fff) return true
  }
  return false
}

export default function ChatWindow({ apiBase, role }){
  const [messages, setMessages] = useState([])
  const [recording, setRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const audioRef = useRef(null)
  const [inputText, setInputText] = useState('')

  useEffect(()=>{ setMessages([]) }, [role?.id])

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mr = new MediaRecorder(stream)
    chunksRef.current = []
    mr.ondataavailable = e => { if(e.data.size>0) chunksRef.current.push(e.data) }
    mr.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      const form = new FormData()
      form.append('file', blob, 'speech.webm')
      const asr = await fetch(`${apiBase}/api/speech-to-text`, { method:'POST', body: form }).then(r=>r.json())
      const text = asr.text || ''
      if(text.trim()){
        sendText(text)
      }
      setRecording(false)
    }
    mediaRecorderRef.current = mr
    mr.start()
    setRecording(true)
  }

  const stopRecording = () => { mediaRecorderRef.current && mediaRecorderRef.current.stop() }

  const sendText = async (text) => {
    if(!role) return alert('请先选择一个角色')
    const myMsg = { sender:'user', content: text }
    const history = [...messages, myMsg].slice(-8)
    setMessages(prev=>[...prev, myMsg])
    const payload = {
      roleId: role.id,
      user_message: text,
      history
    }
    const res = await fetch(`${apiBase}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r=>r.json())
    setMessages(prev=>[...prev, { sender:'assistant', content: res.text }])
    if(res.audio_b64){
      const audio = new Audio(`data:audio/mpeg;base64,${res.audio_b64}`)
      audioRef.current = audio
      await audio.play()
    }
  }

  const onSubmit = (e) => {
    e.preventDefault()
    if(inputText.trim()) sendText(inputText.trim())
    setInputText('')
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4 h-[70vh] flex flex-col">
      {!role && <div className="text-slate-500">← 从左侧选择一个角色开始对话。支持中文与英文语音/文本输入。</div>}
      {role && (
        <>
          <div className="pb-2 border-b mb-2">
            <div className="font-semibold">{role.name}</div>
            <div className="text-xs text-slate-500">与角色进行语音或文本聊天</div>
          </div>
          <div className="flex-1 overflow-auto space-y-3 pr-1">
            {messages.map((m, idx)=>(
              <div key={idx} className={`max-w-[80%] rounded-2xl px-3 py-2 ${m.sender==='user'?'bg-blue-100 ml-auto':'bg-slate-100'}`}>
                {m.content}
              </div>
            ))}
          </div>
          <div className="pt-3 flex items-center gap-2">
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`px-4 py-2 rounded-xl ${recording?'bg-red-500':'bg-blue-600'} text-white`}>
              {recording?'松开结束':'按住说话'}
            </button>
            <form onSubmit={onSubmit} className="flex-1 flex gap-2">
              <input value={inputText} onChange={e=>setInputText(e.target.value)}
                placeholder="或在此输入文字并回车发送…"
                className="flex-1 border rounded-xl px-3 py-2"/>
              <button className="px-4 py-2 rounded-xl bg-slate-800 text-white">发送</button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
