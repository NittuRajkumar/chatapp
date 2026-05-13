import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { usePresence } from '../context/PresenceContext'
import { useNotif } from '../context/NotifContext'
import api from '../utils/axios'

const Sidebar = ({ onSelectRoom, onSelectConv, activeRoomId, activeConvId }) => {
  const { user, logout } = useAuth()
  const { rooms, conversations, fetchRooms, fetchConversations, setActiveRoom, setActiveConv } = useChat()
  const { onlineUsers } = usePresence()
  const { unreadRooms } = useNotif()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('rooms')
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [newRoom, setNewRoom] = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)

  const handleSearch = (e) => {
    setSearch(e.target.value)
    if (tab === 'rooms') fetchRooms(e.target.value)
  }

  const handleCreateRoom = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await api.post('/rooms', newRoom)
      setNewRoom({ name: '', description: '' })
      setShowCreateRoom(false)
      fetchRooms()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create room')
    } finally {
      setCreating(false)
    }
  }

  const selectRoom = (room) => {
    setActiveRoom(room)
    setActiveConv(null)
    onSelectRoom(room)
  }

  const selectConv = (conv) => {
    setActiveConv(conv)
    setActiveRoom(null)
    onSelectConv(conv)
  }

  const getOtherParticipant = (conv) => {
    return conv.participants?.find(p => p.id !== user.id)
  }

  return (
    <div className="w-64 bg-[#1a1d27] border-r border-slate-800 flex flex-col h-full relative">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-white text-lg">ChatApp</span>
          <button onClick={logout} className="text-slate-500 hover:text-red-400 text-xs transition">Logout</button>
        </div>
        <div className="flex items-center gap-2 bg-[#0f1117] rounded-lg px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"></div>
          <span className="text-slate-300 text-sm truncate">{user?.username}</span>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pt-3">
        <input
          value={search} onChange={handleSearch}
          placeholder="Search rooms or users..."
          className="w-full bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      {/* Tabs */}
      <div className="flex px-3 pt-3 gap-1">
        <button
          onClick={() => setTab('rooms')}
          className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition ${tab === 'rooms' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Rooms
        </button>
        <button
          onClick={() => { setTab('dms'); fetchConversations() }}
          className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition ${tab === 'dms' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          DMs
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {tab === 'rooms' && (
          <>
            <button
              onClick={() => setShowCreateRoom(true)}
              className="w-full text-left text-xs text-blue-400 hover:text-blue-300 py-2 px-2 transition flex items-center gap-1"
            >
              <span className="text-lg leading-none">+</span> New Room
            </button>
            {rooms.map(room => (
              <button
                key={room.id}
                onClick={() => selectRoom(room)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition ${activeRoomId === room.id ? 'bg-blue-600/20 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-slate-500">#</span>
                    <span className="text-sm truncate">{room.name}</span>
                  </div>
                  {unreadRooms[room.id] > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">
                      {unreadRooms[room.id] > 9 ? '9+' : unreadRooms[room.id]}
                    </span>
                  )}
                </div>
              </button>
            ))}
            {rooms.length === 0 && (
              <p className="text-slate-600 text-xs text-center py-4">No rooms found</p>
            )}
          </>
        )}

        {tab === 'dms' && (
          <>
            {conversations.map(conv => {
              const other = getOtherParticipant(conv)
              const isOnline = onlineUsers[other?.id] === 'online'
              return (
                <button
                  key={conv.id}
                  onClick={() => selectConv(conv)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition ${activeConvId === conv.id ? 'bg-blue-600/20 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="relative flex-shrink-0">
                      <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white">
                        {other?.username?.[0]?.toUpperCase()}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#1a1d27] ${isOnline ? 'bg-green-400' : 'bg-slate-600'}`}></div>
                    </div>
                    <span className="text-sm truncate">{other?.username}</span>
                  </div>
                </button>
              )
            })}
            {conversations.length === 0 && (
              <p className="text-slate-600 text-xs text-center py-4">No conversations yet</p>
            )}
          </>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#1a1d27] rounded-2xl p-6 w-80 border border-slate-700 shadow-2xl">
            <h3 className="text-white font-semibold mb-4">Create Room</h3>
            <form onSubmit={handleCreateRoom} className="space-y-3">
              <input
                value={newRoom.name} onChange={e => setNewRoom({ ...newRoom, name: e.target.value })}
                placeholder="Room name" required
                className="w-full bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
              <input
                value={newRoom.description} onChange={e => setNewRoom({ ...newRoom, description: e.target.value })}
                placeholder="Description (optional)"
                className="w-full bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowCreateRoom(false)}
                  className="flex-1 py-2 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-lg transition">
                  Cancel
                </button>
                <button type="submit" disabled={creating}
                  className="flex-1 py-2 text-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition">
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar