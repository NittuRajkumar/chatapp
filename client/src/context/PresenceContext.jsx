import { createContext, useContext, useState, useEffect } from 'react'
import { useSocket } from './SocketContext'

const PresenceContext = createContext(null)

export const PresenceProvider = ({ children }) => {
  const { socket } = useSocket()
  const [onlineUsers, setOnlineUsers] = useState({})
  const [typing, setTyping] = useState({})

  useEffect(() => {
    if (!socket) return

    socket.on('user:status', ({ userId, status }) => {
      setOnlineUsers(prev => ({ ...prev, [userId]: status }))
    })

    socket.on('typing:started', ({ roomId, conversationId, user }) => {
      const key = roomId || conversationId
      setTyping(prev => ({ ...prev, [key]: [...(prev[key] || []).filter(u => u.id !== user.id), user] }))
    })

    socket.on('typing:stopped', ({ roomId, conversationId, userId }) => {
      const key = roomId || conversationId
      setTyping(prev => ({ ...prev, [key]: (prev[key] || []).filter(u => u.id !== userId) }))
    })

    return () => {
      socket.off('user:status')
      socket.off('typing:started')
      socket.off('typing:stopped')
    }
  }, [socket])

  return (
    <PresenceContext.Provider value={{ onlineUsers, typing }}>
      {children}
    </PresenceContext.Provider>
  )
}

export const usePresence = () => useContext(PresenceContext)