import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../utils/axios'

const ChatContext = createContext(null)

export const ChatProvider = ({ children }) => {
  const [rooms, setRooms] = useState([])
  const [conversations, setConversations] = useState([])
  const [activeRoom, setActiveRoom] = useState(null)
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(false)

  const fetchRooms = useCallback(async (search = '') => {
    const res = await api.get(`/rooms${search ? `?search=${search}` : ''}`)
    setRooms(res.data)
  }, [])

  const fetchConversations = useCallback(async () => {
    const res = await api.get('/conversations')
    setConversations(res.data)
  }, [])

  const loadRoomMessages = useCallback(async (roomId) => {
    setLoadingMessages(true)
    setMessages([])
    const res = await api.get(`/rooms/${roomId}/messages`)
    setMessages(res.data)
    setLoadingMessages(false)
  }, [])

  const loadConvMessages = useCallback(async (convId) => {
    setLoadingMessages(true)
    setMessages([])
    const res = await api.get(`/conversations/${convId}/messages`)
    setMessages(res.data)
    setLoadingMessages(false)
  }, [])

  const addMessage = useCallback((msg) => {
    setMessages(prev => {
      if (prev.find(m => m.id === msg.id)) return prev
      return [...prev, msg]
    })
  }, [])

  const updateMessage = useCallback((updated) => {
    setMessages(prev => prev.map(m => m.id === updated.id ? updated : m))
  }, [])

  const removeMessage = useCallback((id) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isDeleted: true, content: 'This message was deleted' } : m))
  }, [])

  useEffect(() => {
    fetchRooms()
    fetchConversations()
  }, [])

  return (
    <ChatContext.Provider value={{
      rooms, conversations, activeRoom, activeConv,
      messages, loadingMessages,
      setActiveRoom, setActiveConv,
      fetchRooms, fetchConversations,
      loadRoomMessages, loadConvMessages,
      addMessage, updateMessage, removeMessage,
      setRooms, setConversations
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => useContext(ChatContext)