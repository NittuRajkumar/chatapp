import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import api from '../utils/axios'
import { useAuth } from './AuthContext'

const ChatContext = createContext(null)

export const ChatProvider = ({ children }) => {
  const { token } = useAuth()
  const [rooms, setRooms] = useState([])
  const [conversations, setConversations] = useState([])
  const [activeChatId, _setActiveChatId] = useState(null)
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [unread, setUnread] = useState({})
  const [typingUsers, setTypingUsers] = useState(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const activeChatRef = useRef(null)

  // Fetch rooms on mount
  useEffect(() => {
    if (!token) return
    api.get('/rooms').then(res => setRooms(res.data)).catch(console.error)
    api.get('/conversations').then(res => setConversations(res.data)).catch(console.error)
  }, [token])

  const setActiveChatId = useCallback(async (id) => {
    if (!id) return
    activeChatRef.current = id
    _setActiveChatId(id)
    setIsLoading(true)
    setMessages([])
    setTypingUsers(new Set())

    // Clear unread for this chat
    setUnread(prev => ({ ...prev, [id]: 0 }))

    try {
      // Check if it's a room or DM
      const room = rooms.find(r => r.id === id)
      const conv = conversations.find(c => c.id === id)

      if (room) {
        setActiveChat({ ...room, type: 'room' })
        const res = await api.get(`/rooms/${id}/messages`)
        if (activeChatRef.current === id) {
          setMessages(Array.isArray(res.data) ? res.data : (res.data?.messages || []))
        }
      } else if (conv) {
        setActiveChat({ ...conv, type: 'dm' })
        const res = await api.get(`/conversations/${id}/messages`)
        if (activeChatRef.current === id) {
          setMessages(Array.isArray(res.data) ? res.data : (res.data?.messages || []))
        }
      }
    } catch (err) {
      console.error('Failed to load messages:', err)
      setMessages([])
    } finally {
      if (activeChatRef.current === id) setIsLoading(false)
    }
  }, [rooms, conversations])

  const sendMessage = useCallback(async (content) => {
    if (!activeChatId || !content.trim()) return
    const room = rooms.find(r => r.id === activeChatId)
    try {
      if (room) {
        const res = await api.post(`/rooms/${activeChatId}/messages`, { content })
        setMessages(prev => [...prev, res.data])
      } else {
        const res = await api.post(`/conversations/${activeChatId}/messages`, { content })
        setMessages(prev => [...prev, res.data])
      }
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }, [activeChatId, rooms])

  const createRoom = useCallback(async (name, description = '') => {
    try {
      const res = await api.post('/rooms', { name, description })
      setRooms(prev => [...prev, res.data])
      return res.data
    } catch (err) {
      console.error('Failed to create room:', err)
      throw err
    }
  }, [])

  const addIncomingMessage = useCallback((msg) => {
    const chatId = msg.roomId || msg.conversationId
    if (chatId === activeChatRef.current) {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.find(m => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    } else {
      setUnread(prev => ({ ...prev, [chatId]: (prev[chatId] || 0) + 1 }))
    }
  }, [])

  return (
    <ChatContext.Provider value={{
      rooms, conversations, activeChatId, activeChat,
      messages, unread, typingUsers, isLoading,
      setActiveChatId, sendMessage, createRoom,
      addIncomingMessage, setTypingUsers, setRooms, setConversations
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => useContext(ChatContext)