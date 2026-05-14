import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import ChatWindow from '../components/ChatWindow'

const DashboardPage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      position: 'relative'
    }}>
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div onClick={() => setMobileSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 40, backdropFilter: 'blur(4px)'
        }} />
      )}

      {/* Sidebar */}
      <div style={{
        position: 'relative', zIndex: 50,
        transform: mobileSidebarOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)'
      }}>
        <Sidebar onClose={() => setMobileSidebarOpen(false)} />
      </div>

      {/* Main chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <ChatWindow onMenuClick={() => setMobileSidebarOpen(true)} />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-panel {
            position: fixed !important; left: 0; top: 0; bottom: 0;
            transform: translateX(-100%); z-index: 50;
          }
          .sidebar-panel.open { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

export default DashboardPage