import { useState, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'

const MessageInput = ({ socket }) => {
  const { user } = useAuth()
  const { activeRoom, activeConv } = useChat()
  const [content, setContent] = useState('')
  const typingRef = useRef(false)
  const typingTimer = useRef(null)

  const emitTypingStop = useCallback(() => {
    if (!typingRef.current) return
    typingRef.current = false
    if (activeRoom) socket?.emit('typing:stop', { roomId: activeRoom.id })
    if (activeConv) socket?.emit('dm:typing:stop', { conversationId: activeConv.id })
  }, [socket, activeRoom, activeConv])

  const handleChange = (e) => {
    setContent(e.target.value)
    if (!typingRef.current) {
      typingRef.current = true
      if (activeRoom) socket?.emit('typing:start', { roomId: activeRoom.id })
      if (activeConv) socket?.emit('dm:typing:start', { conversationId: activeConv.id })
    }
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(emitTypingStop, 2000)
  }

  const handleSend = () => {
    if (!content.trim()) return
    if (activeRoom) socket?.emit('message:send', { roomId: activeRoom.id, content })
    if (activeConv) socket?.emit('dm:send', { conversationId: activeConv.id, content })
    setContent('')
    emitTypingStop()
    clearTimeout(typingTimer.current)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const placeholder = activeRoom ? `Message #${activeRoom.name}` : 'Send a message...'

  return (
    <div className="px-6 py-4 border-t border-slate-800 flex-shrink-0">
      <div className="flex items-end gap-3 bg-[#1a1d27] border border-slate-700 rounded-xl px-4 py-3 focus-within:border-blue-500 transition">
        <textarea
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="flex-1 bg-transparent text-white text-sm placeholder-slate-600 resize-none focus:outline-none max-h-32 overflow-y-auto leading-relaxed"
          style={{ height: 'auto' }}
          onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px' }}
        />
        <button
          onClick={handleSend}
          disabled={!content.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg px-3 py-1.5 text-sm font-medium transition flex-shrink-0"
        >
          Send
        </button>
      </div>
      <p className="text-slate-700 text-xs mt-1.5 ml-1">Enter to send · Shift+Enter for new line · Markdown supported</p>
    </div>
  )
}

export default MessageInput