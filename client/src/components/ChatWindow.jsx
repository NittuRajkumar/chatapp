import { useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { usePresence } from '../context/PresenceContext'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'

const ChatWindow = ({ socket }) => {
  const { user } = useAuth()
  const { activeRoom, activeConv, messages, loadingMessages, addMessage, updateMessage, removeMessage, loadRoomMessages, loadConvMessages } = useChat()
  const { typing } = usePresence()
  const bottomRef = useRef(null)

  const activeId = activeRoom?.id || activeConv?.id
  const typingUsers = (typing[activeId] || []).filter(u => u.id !== user.id)

  useEffect(() => {
    if (!socket) return
    socket.on('message:new', (msg) => {
      const isRelevant = msg.roomId === activeRoom?.id || msg.conversationId === activeConv?.id
      if (isRelevant) addMessage(msg)
    })
    socket.on('message:edited', updateMessage)
    socket.on('message:deleted', ({ id }) => removeMessage(id))
    return () => {
      socket.off('message:new')
      socket.off('message:edited')
      socket.off('message:deleted')
    }
  }, [socket, activeRoom, activeConv])

  useEffect(() => {
    if (activeRoom) { socket?.emit('room:join', activeRoom.id); loadRoomMessages(activeRoom.id) }
    if (activeConv) { socket?.emit('conv:join', activeConv.id); loadConvMessages(activeConv.id) }
  }, [activeRoom?.id, activeConv?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getTitle = () => {
    if (activeRoom) return `# ${activeRoom.name}`
    if (activeConv) {
      const other = activeConv.participants?.find(p => p.id !== user.id)
      return other?.username || 'DM'
    }
    return null
  }

  if (!activeRoom && !activeConv) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0f1117]">
        <div className="text-center">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-slate-400 font-medium">Select a room or start a DM</p>
          <p className="text-slate-600 text-sm mt-1">Pick from the sidebar to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0f1117] min-w-0">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex-shrink-0">
        <h2 className="text-white font-semibold">{getTitle()}</h2>
        {activeRoom?.description && (
          <p className="text-slate-500 text-xs mt-0.5">{activeRoom.description}</p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
        {loadingMessages && (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} socket={socket} />
        ))}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 py-1">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span className="text-slate-500 text-xs">
              {typingUsers.map(u => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput socket={socket} />
    </div>
  )
}

export default ChatWindow