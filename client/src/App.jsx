import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { ChatProvider } from './context/ChatContext'
import { PresenceProvider } from './context/PresenceContext'
import { NotifProvider } from './context/NotifContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'

const ProtectedApp = () => (
  <SocketProvider>
    <ChatProvider>
      <PresenceProvider>
        <NotifProvider>
          <DashboardPage />
        </NotifProvider>
      </PresenceProvider>
    </ChatProvider>
  </SocketProvider>
)

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard/*" element={<ProtectedRoute><ProtectedApp /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
)

export default App