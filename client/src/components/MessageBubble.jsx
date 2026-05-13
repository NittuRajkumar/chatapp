import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import { useAuth } from '../context/AuthContext'

const MessageBubble = ({ message, socket }) => {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const isOwn = message.senderId === user.id
  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const handleEdit = () => {
    if (!editContent.trim()) return
    socket?.emit('message:edit', { messageId: message.id, content: editContent })
    setEditing(false)
  }

  const handleDelete = () => {
    if (window.confirm('Delete this message?')) {
      socket?.emit('message:delete', { messageId: message.id })
    }
  }

  return (
    <div className={`group flex items-start gap-3 py-1 px-2 rounded-lg hover:bg-slate-800/40 transition ${isOwn ? 'flex-row-reverse' : ''}`}>
      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white flex-shrink-0 mt-0.5">
        {message.sender?.username?.[0]?.toUpperCase()}
      </div>
      <div className={`flex-1 min-w-0 ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`flex items-baseline gap-2 mb-0.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs font-medium text-slate-300">{message.sender?.username}</span>
          <span className="text-xs text-slate-600">{time}</span>
          {message.isEdited && <span className="text-xs text-slate-600">(edited)</span>}
          {message.readAt && isOwn && <span className="text-xs text-blue-400">✓✓</span>}
        </div>

        {editing ? (
          <div className="w-full">
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              className="w-full bg-[#1a1d27] border border-blue-500 rounded-lg px-3 py-2 text-sm text-white resize-none focus:outline-none"
              rows={2}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEdit() } if (e.key === 'Escape') setEditing(false) }}
              autoFocus
            />
            <div className="flex gap-2 mt-1">
              <button onClick={handleEdit} className="text-xs text-blue-400 hover:text-blue-300">Save</button>
              <button onClick={() => setEditing(false)} className="text-xs text-slate-500 hover:text-slate-300">Cancel</button>
            </div>
          </div>
        ) : (
          <div className={`max-w-lg px-3 py-2 rounded-2xl text-sm ${message.isDeleted ? 'text-slate-600 italic' : isOwn ? 'bg-blue-600 text-white' : 'bg-[#1a1d27] text-slate-200'}`}>
            {message.isDeleted ? (
              <span>This message was deleted</span>
            ) : (
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action buttons — own messages only */}
      {isOwn && !message.isDeleted && !editing && (
        <div className={`flex gap-1 opacity-0 group-hover:opacity-100 transition mt-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <button onClick={() => { setEditing(true); setEditContent(message.content) }}
            className="text-xs text-slate-500 hover:text-blue-400 px-1.5 py-0.5 rounded transition">
            Edit
          </button>
          <button onClick={handleDelete}
            className="text-xs text-slate-500 hover:text-red-400 px-1.5 py-0.5 rounded transition">
            Del
          </button>
        </div>
      )}
    </div>
  )
}

export default MessageBubble