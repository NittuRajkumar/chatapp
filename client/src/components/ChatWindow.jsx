import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { usePresence } from '../context/PresenceContext'

const Avatar = ({ name, size = 32 }) => {
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
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: 700, fontSize: size * 0.38,
      boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
    }}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  )
}

const ChatWindow = ({ onMenuClick }) => {
  const { user } = useAuth()
  const { activeChat, messages, sendMessage, typingUsers, isLoading } = useChat()
  const { onlineUsers } = usePresence()
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    try {
      await sendMessage(text.trim())
      setText('')
      inputRef.current?.focus()
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(e)
    }
  }

  // Empty / no chat selected state
  if (!activeChat) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(15,12,41,0.4)', backdropFilter: 'blur(10px)'
      }}>
        {/* Mobile menu button */}
        <button onClick={onMenuClick} style={{
          position: 'absolute', top: '16px', left: '16px',
          background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: '10px', padding: '8px', cursor: 'pointer', color: 'white',
          display: 'none'
        }} className="mobile-menu-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div style={{
          textAlign: 'center', padding: '32px',
          background: 'rgba(255,255,255,0.03)', borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '20px', margin: '0 auto 20px',
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 32px rgba(99,102,241,0.4)'
          }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h2 style={{ color: 'white', fontWeight: 800, fontSize: '22px', margin: '0 0 8px' }}>Select a conversation</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', maxWidth: '280px', lineHeight: 1.6, margin: '0 auto' }}>
            Pick a room or DM from the sidebar to start chatting
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
            {['Real-time', 'Private DMs', 'Online Status'].map(f => (
              <span key={f} style={{
                background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)',
                borderRadius: '20px', padding: '4px 12px', fontSize: '12px', color: 'rgba(255,255,255,0.5)'
              }}>{f}</span>
            ))}
          </div>
        </div>
        <style>{`@media(max-width:768px){.mobile-menu-btn{display:flex !important}}`}</style>
      </div>
    )
  }

  const isOnline = activeChat.otherUser ? onlineUsers?.has?.(activeChat.otherUser.id) : null
  const typingList = typingUsers ? [...typingUsers].filter(u => u !== user?.username) : []

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Chat header */}
      <div style={{
        padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px',
        background: 'rgba(15,12,41,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        <button onClick={onMenuClick} style={{
          background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: '10px', padding: '8px', cursor: 'pointer', color: 'white',
          display: 'none', alignItems: 'center'
        }} className="mobile-menu-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        {activeChat.type === 'dm' ? (
          <div style={{ position: 'relative' }}>
            <Avatar name={activeChat.otherUser?.username} size={38} />
            <div style={{
              position: 'absolute', bottom: 1, right: 1, width: '11px', height: '11px',
              borderRadius: '50%', background: isOnline ? '#22c55e' : '#6b7280',
              border: '2px solid #0f0c29',
              boxShadow: isOnline ? '0 0 8px rgba(34,197,94,0.6)' : 'none',
              transition: 'all 0.3s'
            }} />
          </div>
        ) : (
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99,102,241,0.4)'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
        )}

        <div style={{ flex: 1 }}>
          <div style={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>
            {activeChat.type === 'room' ? `# ${activeChat.name}` : activeChat.otherUser?.username}
          </div>
          <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            {isOnline !== null ? (
              <>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: isOnline ? '#22c55e' : '#6b7280', boxShadow: isOnline ? '0 0 6px rgba(34,197,94,0.6)' : 'none' }} />
                <span style={{ color: isOnline ? '#4ade80' : 'rgba(255,255,255,0.35)' }}>{isOnline ? 'Online' : 'Offline'}</span>
              </>
            ) : (
              <span style={{ color: 'rgba(255,255,255,0.35)' }}>{activeChat.description || 'Public room'}</span>
            )}
          </div>
        </div>

        {/* Header actions */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>, label: 'Search' },
            { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, label: 'Members' },
          ].map(btn => (
            <button key={btn.label} title={btn.label} style={{
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px', padding: '7px', cursor: 'pointer', color: 'rgba(255,255,255,0.55)',
              display: 'flex', alignItems: 'center', transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.2)'; e.currentTarget.style.color = 'white' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
            >{btn.icon}</button>
          ))}
        </div>

        <style>{`@media(max-width:768px){.mobile-menu-btn{display:flex !important}}`}</style>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px',
        background: 'rgba(10,8,30,0.5)'
      }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px 0' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', animation: 'shimmer 1.5s ease-in-out infinite', backgroundSize: '200% 100%' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ width: '100px', height: '12px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', marginBottom: '6px', animation: 'shimmer 1.5s ease-in-out infinite' }} />
                  <div style={{ width: `${140 + i * 30}px`, height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', animation: 'shimmer 1.5s ease-in-out infinite' }} />
                </div>
              </div>
            ))}
            <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
          </div>
        ) : messages?.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', opacity: 0.5 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', margin: 0 }}>No messages yet. Say hello!</p>
          </div>
        ) : (
          (messages || []).map((msg, i) => {
            const isMine = msg.userId === user?.id || msg.senderId === user?.id
            const showAvatar = !isMine && (i === 0 || messages[i - 1]?.userId !== msg.userId)
            const isDeleted = msg.isDeleted || msg.deleted
            return (
              <MessageBubble key={msg.id || i} msg={msg} isMine={isMine} showAvatar={showAvatar} isDeleted={isDeleted} />
            )
          })
        )}

        {/* Typing indicator */}
        {typingList.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', marginTop: '4px' }}>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', padding: '8px 14px' }}>
              {[0,1,2].map(d => (
                <div key={d} style={{
                  width: '7px', height: '7px', borderRadius: '50%', background: '#818cf8',
                  animation: `bounce 1.2s ease-in-out ${d * 0.2}s infinite`
                }} />
              ))}
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginLeft: '6px' }}>
                {typingList.join(', ')} {typingList.length === 1 ? 'is' : 'are'} typing
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
        <style>{`
          @keyframes bounce { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }
          @keyframes msgIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>

      {/* Input area */}
      <div style={{
        padding: '12px 20px 16px', background: 'rgba(15,12,41,0.9)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.07)'
      }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Enter to send)"
              rows={1}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.1)',
                borderRadius: '14px', padding: '12px 16px', color: 'white', fontSize: '14px',
                outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.5,
                transition: 'all 0.2s', maxHeight: '120px', overflowY: 'auto',
                fontFamily: "'Segoe UI', system-ui, sans-serif"
              }}
              onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.background = 'rgba(99,102,241,0.08)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = 'none' }}
            />
          </div>
          <button type="submit" disabled={!text.trim() || sending} style={{
            width: '46px', height: '46px', borderRadius: '14px', border: 'none', cursor: 'pointer',
            background: text.trim() ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.07)',
            color: text.trim() ? 'white' : 'rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            transition: 'all 0.2s',
            boxShadow: text.trim() ? '0 6px 18px rgba(99,102,241,0.45)' : 'none',
            transform: text.trim() ? 'scale(1)' : 'scale(0.95)'
          }}>
            {sending ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite', transformOrigin: 'center' }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )}
          </button>
        </form>
        <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', marginTop: '6px', paddingLeft: '4px' }}>
          Enter to send · Shift+Enter for new line
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )
}

const MessageBubble = ({ msg, isMine, showAvatar, isDeleted }) => {
  const time = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

  return (
    <div style={{
      display: 'flex', flexDirection: isMine ? 'row-reverse' : 'row',
      alignItems: 'flex-end', gap: '8px', marginBottom: '2px',
      animation: 'msgIn 0.25s ease-out'
    }}>
      {!isMine && (
        <div style={{ width: 32, visibility: showAvatar ? 'visible' : 'hidden' }}>
          <Avatar name={msg.username || msg.sender?.username} size={32} />
        </div>
      )}

      <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', gap: '3px', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
        {showAvatar && !isMine && (
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, paddingLeft: '2px' }}>
            {msg.username || msg.sender?.username}
          </span>
        )}
        <div style={{
          padding: isDeleted ? '8px 14px' : '10px 14px',
          borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          background: isDeleted
            ? 'rgba(255,255,255,0.04)'
            : isMine
              ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
              : 'rgba(255,255,255,0.09)',
          color: isDeleted ? 'rgba(255,255,255,0.25)' : 'white',
          fontSize: '14px', lineHeight: 1.5,
          boxShadow: isMine && !isDeleted ? '0 4px 16px rgba(99,102,241,0.35)' : '0 2px 8px rgba(0,0,0,0.2)',
          fontStyle: isDeleted ? 'italic' : 'normal',
          border: isDeleted ? '1px dashed rgba(255,255,255,0.12)' : 'none',
          backdropFilter: 'blur(8px)',
          wordBreak: 'break-word'
        }}>
          {isDeleted ? 'This message was deleted' : msg.content || msg.text}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', paddingRight: isMine ? '4px' : 0, paddingLeft: isMine ? 0 : '4px' }}>
          <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: '11px' }}>{time}</span>
          {isMine && msg.readAt && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="18 2 9 13 4 8"/><polyline points="22 6 13 17 11 15"/>
            </svg>
          )}
          {msg.isEdited && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>edited</span>}
        </div>
      </div>
    </div>
  )
}

export default ChatWindow