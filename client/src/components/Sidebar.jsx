import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { usePresence } from '../context/PresenceContext'

const Avatar = ({ name, size = 36, online }) => {
  const colors = [
    'linear-gradient(135deg,#6366f1,#8b5cf6)',
    'linear-gradient(135deg,#ec4899,#f43f5e)',
    'linear-gradient(135deg,#10b981,#06b6d4)',
    'linear-gradient(135deg,#f59e0b,#ef4444)',
    'linear-gradient(135deg,#3b82f6,#6366f1)',
    'linear-gradient(135deg,#8b5cf6,#ec4899)',
  ]
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length]
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%', background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 700, fontSize: size * 0.38,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
      }}>
        {name?.[0]?.toUpperCase() || '?'}
      </div>
      {online !== undefined && (
        <div style={{
          position: 'absolute', bottom: 1, right: 1,
          width: size * 0.28, height: size * 0.28, borderRadius: '50%',
          background: online ? '#22c55e' : '#6b7280',
          border: '2px solid #1e1b3a',
          boxShadow: online ? '0 0 6px rgba(34,197,94,0.6)' : 'none',
          transition: 'all 0.3s'
        }} />
      )}
    </div>
  )
}

const Sidebar = ({ onClose }) => {
  const { user, logout } = useAuth()
  const { rooms, activeChatId, setActiveChatId, conversations, unread } = useChat()
  const { onlineUsers } = usePresence()
  const [tab, setTab] = useState('rooms')
  const [search, setSearch] = useState('')

  const filteredRooms = (rooms || []).filter(r => r.name?.toLowerCase().includes(search.toLowerCase()))
  const filteredDMs = (conversations || []).filter(c => {
    const name = c.otherUser?.username || ''
    return name.toLowerCase().includes(search.toLowerCase())
  })

  const tabStyle = (active) => ({
    flex: 1, padding: '8px', border: 'none', borderRadius: '10px', cursor: 'pointer',
    fontWeight: 600, fontSize: '13px', transition: 'all 0.2s',
    background: active ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent',
    color: active ? 'white' : 'rgba(255,255,255,0.45)',
    boxShadow: active ? '0 4px 12px rgba(99,102,241,0.4)' : 'none',
  })

  return (
    <div style={{
      width: '280px', height: '100vh', display: 'flex', flexDirection: 'column',
      background: 'rgba(15,12,41,0.85)', backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255,255,255,0.07)',
    }}>

      {/* Header */}
      <div style={{
        padding: '16px', display: 'flex', alignItems: 'center', gap: '10px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.10))'
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(99,102,241,0.4)', flexShrink: 0
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: 'white', fontWeight: 800, fontSize: '15px', letterSpacing: '-0.2px' }}>ChatApp</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Real-time messaging</div>
        </div>
        {/* Mobile close button */}
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,0.6)', borderRadius: '8px', padding: '6px',
          display: 'none'
        }} className="mobile-close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            style={{
              width: '100%', background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.08)',
              borderRadius: '10px', padding: '9px 12px 9px 32px', color: 'white', fontSize: '13px',
              outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s'
            }}
            onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.background = 'rgba(99,102,241,0.1)' }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.07)' }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 16px 12px', display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', margin: '0 12px 8px' }}>
        <button onClick={() => setTab('rooms')} style={tabStyle(tab === 'rooms')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Rooms
        </button>
        <button onClick={() => setTab('dms')} style={tabStyle(tab === 'dms')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }}>
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          DMs
        </button>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
        {tab === 'rooms' ? (
          <>
            <div style={{ padding: '4px 8px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                Public Rooms
              </span>
              <button style={{
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none',
                borderRadius: '6px', padding: '3px 8px', cursor: 'pointer',
                color: 'white', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px'
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                New
              </button>
            </div>
            {filteredRooms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                No rooms yet
              </div>
            ) : filteredRooms.map(room => (
              <RoomItem key={room.id} room={room} active={activeChatId === room.id}
                unread={unread?.[room.id] || 0} onClick={() => setActiveChatId(room.id)} />
            ))}
          </>
        ) : (
          <>
            <div style={{ padding: '4px 8px 8px' }}>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                Direct Messages
              </span>
            </div>
            {filteredDMs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                No DMs yet
              </div>
            ) : filteredDMs.map(conv => (
              <DMItem key={conv.id} conv={conv} active={activeChatId === conv.id}
                online={onlineUsers?.has?.(conv.otherUser?.id)}
                unread={unread?.[conv.id] || 0} onClick={() => setActiveChatId(conv.id)} />
            ))}
          </>
        )}
      </div>

      {/* User profile footer */}
      <div style={{
        padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'rgba(99,102,241,0.05)'
      }}>
        <Avatar name={user?.username} size={34} online={true} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: 'white', fontWeight: 600, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.username}
          </div>
          <div style={{ color: '#22c55e', fontSize: '11px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.7)' }} />
            Online
          </div>
        </div>
        <button onClick={logout} title="Sign out" style={{
          background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '8px', padding: '7px', cursor: 'pointer', color: '#f87171',
          display: 'flex', alignItems: 'center', transition: 'all 0.2s'
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.25)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

const RoomItem = ({ room, active, unread, onClick }) => (
  <button onClick={onClick} style={{
    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 10px', borderRadius: '12px', border: 'none', cursor: 'pointer', textAlign: 'left',
    background: active ? 'linear-gradient(135deg,rgba(99,102,241,0.25),rgba(139,92,246,0.15))' : 'transparent',
    borderLeft: active ? '3px solid #6366f1' : '3px solid transparent',
    transition: 'all 0.2s', marginBottom: '2px'
  }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
  >
    <div style={{
      width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
      background: active ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: active ? '0 4px 12px rgba(99,102,241,0.35)' : 'none'
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? 'white' : 'rgba(255,255,255,0.45)'} strokeWidth="2" strokeLinecap="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ color: active ? 'white' : 'rgba(255,255,255,0.8)', fontWeight: active ? 700 : 500, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        # {room.name}
      </div>
      {room.description && (
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {room.description}
        </div>
      )}
    </div>
    {unread > 0 && (
      <div style={{
        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
        color: 'white', borderRadius: '10px', padding: '2px 7px',
        fontSize: '11px', fontWeight: 700, minWidth: '18px', textAlign: 'center',
        boxShadow: '0 2px 8px rgba(99,102,241,0.5)'
      }}>{unread > 99 ? '99+' : unread}</div>
    )}
  </button>
)

const DMItem = ({ conv, active, online, unread, onClick }) => (
  <button onClick={onClick} style={{
    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer', textAlign: 'left',
    background: active ? 'linear-gradient(135deg,rgba(99,102,241,0.25),rgba(139,92,246,0.15))' : 'transparent',
    borderLeft: active ? '3px solid #6366f1' : '3px solid transparent',
    transition: 'all 0.2s', marginBottom: '2px'
  }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
  >
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%',
        background: 'linear-gradient(135deg,#ec4899,#8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 700, fontSize: '14px',
        boxShadow: active ? '0 4px 12px rgba(236,72,153,0.4)' : 'none'
      }}>
        {conv.otherUser?.username?.[0]?.toUpperCase()}
      </div>
      <div style={{
        position: 'absolute', bottom: 1, right: 1, width: '10px', height: '10px',
        borderRadius: '50%', background: online ? '#22c55e' : '#6b7280',
        border: '2px solid #1e1b3a',
        boxShadow: online ? '0 0 6px rgba(34,197,94,0.6)' : 'none',
        transition: 'all 0.3s'
      }} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ color: active ? 'white' : 'rgba(255,255,255,0.8)', fontWeight: active ? 700 : 500, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {conv.otherUser?.username}
      </div>
      <div style={{ color: online ? '#4ade80' : 'rgba(255,255,255,0.3)', fontSize: '11px', fontWeight: 500 }}>
        {online ? 'Online' : 'Offline'}
      </div>
    </div>
    {unread > 0 && (
      <div style={{
        background: 'linear-gradient(135deg,#ec4899,#f43f5e)',
        color: 'white', borderRadius: '10px', padding: '2px 7px',
        fontSize: '11px', fontWeight: 700, minWidth: '18px', textAlign: 'center',
        boxShadow: '0 2px 8px rgba(236,72,153,0.5)'
      }}>{unread > 99 ? '99+' : unread}</div>
    )}
  </button>
)

export default Sidebar