import { createContext, useContext, useState, useEffect } from 'react'
import { useSocket } from './SocketContext'

const NotifContext = createContext(null)

export const NotifProvider = ({ children }) => {
  const { socket } = useSocket()
  const [mentions, setMentions] = useState([])
  const [unreadRooms, setUnreadRooms] = useState({})

  useEffect(() => {
    if (!socket) return

    socket.on('notification:mention', (data) => {
      setMentions(prev => [data, ...prev])
    })

    return () => {
      socket.off('notification:mention')
    }
  }, [socket])

  const markRoomRead = (roomId) => {
    setUnreadRooms(prev => ({ ...prev, [roomId]: 0 }))
  }

  const incrementUnread = (roomId) => {
    setUnreadRooms(prev => ({ ...prev, [roomId]: (prev[roomId] || 0) + 1 }))
  }

  const clearMentions = () => setMentions([])

  return (
    <NotifContext.Provider value={{ mentions, unreadRooms, markRoomRead, incrementUnread, clearMentions }}>
      {children}
    </NotifContext.Provider>
  )
}

export const useNotif = () => useContext(NotifContext)