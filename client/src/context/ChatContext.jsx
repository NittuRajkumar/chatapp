import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import api from '../utils/axios'
import { useAuth } from './AuthContext'
import { useSocket } from './SocketContext'

const ChatContext = createContext(null)

export const ChatProvider = ({ children }) => {
  const { token, user } = useAuth()
  const { socket } = useSocket()

  const [rooms, setRooms] = useState([])
  const [conversations, setConversations] = useState([])
  const [activeChatId, _setActiveChatId] = useState(null)
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [unread, setUnread] = useState({})
  const [typingUsers, setTypingUsers] = useState(new Set())
  const [isLoading, setIsLoading] = useState(false)

  const activeChatRef = useRef(null)
  const messagesRef = useRef([])

  // Keep messagesRef in sync
  useEffect(() => { messagesRef.current = messages }, [messages])

  // ── Fetch rooms + convs on mount ──────────────────────────────────────────
  useEffect(() => {
    if (!token) return
    api.get('/rooms').then(res => setRooms(res.data || [])).catch(console.error)
    api.get('/conversations').then(res => setConversations(res.data || [])).catch(console.error)
  }, [token])

  // ── Socket events ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (msg) => {
      const chatId = msg.roomId || msg.conversationId
      if (chatId === activeChatRef.current) {
        setMessages(prev => {
          // Avoid duplicate (optimistic already added)
          if (prev.find(m => m.id && m.id === msg.id)) return prev
          // Replace optimistic message (tempId match)
          if (msg.tempId && prev.find(m => m.tempId === msg.tempId)) {
            return prev.map(m => m.tempId === msg.tempId ? { ...msg } : m)
          }
          return [...prev, msg]
        })
      } else if (chatId) {
        setUnread(prev => ({ ...prev, [chatId]: (prev[chatId] || 0) + 1 }))
      }
    }

    const handleTyping = ({ username, chatId, isTyping }) => {
      if (chatId !== activeChatRef.current) return
      setTypingUsers(prev => {
        const next = new Set(prev)
        isTyping ? next.add(username) : next.delete(username)
        return next
      })
    }

    const handleMessageUpdated = (msg) => {
      const chatId = msg.roomId || msg.conversationId
      if (chatId === activeChatRef.current) {
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, ...msg } : m))
      }
    }

    const handleMessageDeleted = ({ id, roomId, conversationId }) => {
      const chatId = roomId || conversationId
      if (chatId === activeChatRef.current) {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, isDeleted: true, content: null } : m))
      }
    }

    socket.on('new_message', handleNewMessage)
    socket.on('message', handleNewMessage)          // some backends emit 'message'
    socket.on('chat_message', handleNewMessage)     // fallback event name
    socket.on('typing', handleTyping)
    socket.on('message_updated', handleMessageUpdated)
    socket.on('message_deleted', handleMessageDeleted)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('message', handleNewMessage)
      socket.off('chat_message', handleNewMessage)
      socket.off('typing', handleTyping)
      socket.off('message_updated', handleMessageUpdated)
      socket.off('message_deleted', handleMessageDeleted)
    }
  }, [socket])

  // ── Set active chat + load messages ──────────────────────────────────────
  const setActiveChatId = useCallback(async (id) => {
    if (!id) return
    activeChatRef.current = id
    _setActiveChatId(id)
    setIsLoading(true)
    setMessages([])
    setTypingUsers(new Set())
    setUnread(prev => ({ ...prev, [id]: 0 }))

    // Join socket room
    if (socket) socket.emit('join_room', { roomId: id })

    try {
      const room = rooms.find(r => r.id === id)
      const conv = conversations.find(c => c.id === id)

      if (room) {
        setActiveChat({ ...room, type: 'room' })
        const res = await api.get(`/rooms/${id}/messages`)
        if (activeChatRef.current === id) {
          const data = res.data
          setMessages(Array.isArray(data) ? data : (data?.messages || []))
        }
      } else if (conv) {
        setActiveChat({ ...conv, type: 'dm' })
        const res = await api.get(`/conversations/${id}/messages`)
        if (activeChatRef.current === id) {
          const data = res.data
          setMessages(Array.isArray(data) ? data : (data?.messages || []))
        }
      }
    } catch (err) {
      console.error('Failed to load messages:', err)
      if (activeChatRef.current === id) setMessages([])
    } finally {
      if (activeChatRef.current === id) setIsLoading(false)
    }
  }, [rooms, conversations, socket])

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (content) => {
    if (!activeChatId || !content?.trim()) return

    const tempId = `temp_${Date.now()}`
    const optimistic = {
      tempId,
      content: content.trim(),
      userId: user?.id,
      senderId: user?.id,
      username: user?.username,
      sender: { username: user?.username, id: user?.id },
      createdAt: new Date().toISOString(),
      roomId: activeChat?.type === 'room' ? activeChatId : undefined,
      conversationId: activeChat?.type === 'dm' ? activeChatId : undefined,
      pending: true,
    }

    // Optimistically add to UI immediately
    setMessages(prev => [...prev, optimistic])

    try {
      let res
      if (activeChat?.type === 'room') {
        res = await api.post(`/rooms/${activeChatId}/messages`, { content: content.trim() })
      } else {
        res = await api.post(`/conversations/${activeChatId}/messages`, { content: content.trim() })
      }

      // Replace optimistic with real message
      setMessages(prev =>
        prev.map(m => m.tempId === tempId ? { ...res.data, tempId } : m)
      )
    } catch (err) {
      console.error('Failed to send:', err)
      // Mark as failed
      setMessages(prev =>
        prev.map(m => m.tempId === tempId ? { ...m, failed: true, pending: false } : m)
      )
    }
  }, [activeChatId, activeChat, user])

  // ── Create room ───────────────────────────────────────────────────────────
  const createRoom = useCallback(async (name, description = '') => {
    const res = await api.post('/rooms', { name, description })
    setRooms(prev => [...prev, res.data])
    return res.data
  }, [])

  // ── Emit typing ───────────────────────────────────────────────────────────
  const emitTyping = useCallback((isTyping) => {
    if (socket && activeChatId) {
      socket.emit('typing', { chatId: activeChatId, username: user?.username, isTyping })
    }
  }, [socket, activeChatId, user])

  return (
    <ChatContext.Provider value={{
      rooms, conversations, activeChatId, activeChat,
      messages, unread, typingUsers, isLoading,
      setActiveChatId, sendMessage, createRoom, emitTyping,
      setRooms, setConversations
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => useContext(ChatContext)