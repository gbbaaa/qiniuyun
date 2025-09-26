import React from 'react'

export default function CharacterList({ items, onPick, currentId }){
  return (
    <div className="space-y-2">
      {items.map(it => (
        <button key={it.id}
          onClick={()=>onPick(it)}
          className={`w-full text-left border rounded-xl p-3 hover:bg-slate-50 ${currentId===it.id?'ring-2 ring-blue-500':''}`}>
          <div className="font-semibold">{it.name}</div>
          <div className="text-xs text-slate-500 line-clamp-2">{it.desc}</div>
        </button>
      ))}
      {items.length===0 && <div className="text-sm text-slate-500">没有匹配的角色</div>}
    </div>
  )
}
