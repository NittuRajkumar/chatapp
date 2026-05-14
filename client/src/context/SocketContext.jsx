import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://chatapp-backend-q3xa.onrender.com'

const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
  const { token } = useAuth()
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!token) return

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })

    socketRef.current.on('connect', () => setConnected(true))
    socketRef.current.on('disconnect', () => setConnected(false))
    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message)
    })

    return () => {
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [token])

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)