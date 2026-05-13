import { useState, useEffect } from 'react'
import { usePresence } from '../context/PresenceContext'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import api from '../utils/axios'

const UserList = ({ onStartDM }) => {
  const { user } = useAuth()
  const { onlineUsers } = usePresence()
  const { fetchConversations } = useChat()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      const res = await api.get(`/users${search ? `?search=${search}` : ''}`)
      setUsers(res.data)
    }
    load()
  }, [search])

  const startDM = async (targetUserId) => {
    const res = await api.post('/conversations', { targetUserId })
    await fetchConversations()
    onStartDM(res.data)
  }

  return (
    <div className="w-48 bg-[#1a1d27] border-l border-slate-800 flex flex-col h-full">
      <div className="p-3 border-b border-slate-800">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Users</p>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full bg-[#0f1117] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {users.map(u => {
          const isOnline = onlineUsers[u.id] === 'online'
          return (
            <button
              key={u.id}
              onClick={() => startDM(u.id)}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-800 transition group"
            >
              <div className="relative flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white">
                  {u.username[0].toUpperCase()}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#1a1d27] ${isOnline ? 'bg-green-400' : 'bg-slate-600'}`}></div>
              </div>
              <span className="text-xs text-slate-400 group-hover:text-white truncate transition">{u.username}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default UserList