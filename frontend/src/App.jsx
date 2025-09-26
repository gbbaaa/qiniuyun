import React, { useEffect, useMemo, useState } from 'react'
import CharacterList from './components/CharacterList.jsx'
import ChatWindow from './components/ChatWindow.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export default function App(){
  const [characters, setCharacters] = useState([])
  const [query, setQuery] = useState('')
  const [currentRole, setCurrentRole] = useState(null)

  useEffect(()=>{
    fetch(`${API_BASE}/api/characters`).then(r=>r.json()).then(d=>setCharacters(d.characters||[]))
  }, [])

  const filtered = useMemo(()=>{
    if(!query.trim()) return characters
    return characters.filter(c => (c.name+c.desc).toLowerCase().includes(query.toLowerCase()))
  }, [characters, query])

  return (
    <div className="max-w-6xl mx-auto p-4">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI 角色扮演 · 语音聊天</h1>
        <a className="text-sm underline" href="https://github.com/" target="_blank">GitHub</a>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <aside className="md:col-span-1 bg-white rounded-2xl shadow p-4">
          <input
            placeholder="搜索角色（如：哈利、苏格拉底、李时珍、诸葛亮）"
            className="w-full border rounded-lg px-3 py-2 mb-3"
            value={query} onChange={e=>setQuery(e.target.value)}
          />
          <CharacterList items={filtered} onPick={setCurrentRole} currentId={currentRole?.id} />
        </aside>
        <main className="md:col-span-2">
          <ChatWindow apiBase={API_BASE} role={currentRole} />
        </main>
      </div>
    </div>
  )
}
