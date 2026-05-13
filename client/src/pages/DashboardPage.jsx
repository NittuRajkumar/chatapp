import { useState } from 'react'
import { useSocket } from '../context/SocketContext'
import { useChat } from '../context/ChatContext'
import { useNotif } from '../context/NotifContext'
import Sidebar from '../components/Sidebar'
import ChatWindow from '../components/ChatWindow'
import UserList from '../components/UserList'

const DashboardPage = () => {
  const { socket } = useSocket()
  const { setActiveRoom, setActiveConv } = useChat()
  const { mentions, clearMentions } = useNotif()
  const [showMentions, setShowMentions] = useState(false)

  const handleSelectRoom = (room) => {
    setActiveRoom(room)
    setActiveConv(null)
  }

  const handleSelectConv = (conv) => {
    setActiveConv(conv)
    setActiveRoom(null)
  }

  const handleStartDM = (conv) => {
    setActiveConv(conv)
    setActiveRoom(null)
  }

  return (
    <div className="flex h-screen overflow-hidden relative">
      <Sidebar
        onSelectRoom={handleSelectRoom}
        onSelectConv={handleSelectConv}
        activeRoomId={null}
        activeConvId={null}
      />
      <ChatWindow socket={socket} />
      <UserList onStartDM={handleStartDM} />

      {/* Mention bell */}
      <div className="absolute top-4 right-52 z-40">
        <button
          onClick={() => setShowMentions(p => !p)}
          className="relative text-slate-400 hover:text-white transition"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {mentions.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-3.5 h-3.5 flex items-center justify-center">
              {mentions.length > 9 ? '9+' : mentions.length}
            </span>
          )}
        </button>

        {showMentions && (
          <div className="absolute right-0 top-8 w-72 bg-[#1a1d27] border border-slate-700 rounded-xl shadow-2xl z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
              <span className="text-white text-sm font-medium">Mentions</span>
              <button onClick={() => { clearMentions(); setShowMentions(false) }}
                className="text-slate-500 hover:text-white text-xs transition">Clear all</button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {mentions.length === 0 ? (
                <p className="text-slate-600 text-xs text-center py-6">No mentions</p>
              ) : mentions.map((m, i) => (
                <div key={i} className="px-4 py-3 border-b border-slate-800 hover:bg-slate-800 transition">
                  <p className="text-xs text-slate-400">
                    <span className="text-blue-400">@{m.mentionedBy}</span> mentioned you in
                    <span className="text-slate-300"> #{m.roomId}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1 truncate">{m.message?.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage