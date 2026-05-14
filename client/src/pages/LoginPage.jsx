import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const EyeIcon = ({ open }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

const ChatLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="10" fill="white" fillOpacity="0.15"/>
    <path d="M6 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H18l-4 4v-4H8a2 2 0 0 1-2-2V8z" stroke="white" strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
    <circle cx="11" cy="13.5" r="1.2" fill="white"/>
    <circle cx="16" cy="13.5" r="1.2" fill="white"/>
    <circle cx="21" cy="13.5" r="1.2" fill="white"/>
  </svg>
)

const Spinner = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
      style={{ animation: 'spin 0.8s linear infinite', transformOrigin: 'center' }}/>
  </svg>
)

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      fontFamily: "'Segoe UI', system-ui, sans-serif", padding: '1rem'
    }}>
      {/* Ambient background blobs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
        {[
          { w: 400, h: 400, top: '5%', left: '-5%', color: 'rgba(99,102,241,0.12)' },
          { w: 300, h: 300, top: '60%', left: '70%', color: 'rgba(139,92,246,0.10)' },
          { w: 200, h: 200, top: '40%', left: '40%', color: 'rgba(99,102,241,0.06)' },
        ].map((b, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%',
            width: b.w, height: b.h, top: b.top, left: b.left,
            background: `radial-gradient(circle, ${b.color}, transparent 70%)`,
            animation: `floatBlob ${5 + i * 2}s ease-in-out infinite alternate`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes floatBlob { from { transform: translateY(0) scale(1); } to { transform: translateY(-24px) scale(1.04); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.35); } 60% { box-shadow: 0 0 0 12px rgba(99,102,241,0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-input {
          width: 100%; background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 13px 16px; color: white; font-size: 15px; outline: none;
          transition: border-color 0.25s, background 0.25s, box-shadow 0.25s; box-sizing: border-box;
        }
        .auth-input:focus { border-color: #6366f1; background: rgba(99,102,241,0.08); box-shadow: 0 0 0 3px rgba(99,102,241,0.18); }
        .auth-input::placeholder { color: rgba(255,255,255,0.28); }
        .auth-btn {
          width: 100%; padding: 13px; border-radius: 12px; border: none; cursor: pointer;
          font-size: 15px; font-weight: 700; letter-spacing: 0.3px;
          background: linear-gradient(135deg, #6366f1, #7c3aed); color: white;
          transition: transform 0.2s, box-shadow 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .auth-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(99,102,241,0.45); }
        .auth-btn:active:not(:disabled) { transform: translateY(0); }
        .auth-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .pill {
          background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.28);
          border-radius: 20px; padding: 4px 12px; font-size: 12px; color: rgba(255,255,255,0.55);
          display: flex; align-items: center; gap: 5px;
        }
      `}</style>

      <div style={{
        position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px',
        background: 'rgba(255,255,255,0.045)', backdropFilter: 'blur(24px)',
        borderRadius: '24px', padding: '40px 36px',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '0 32px 64px rgba(0,0,0,0.55)',
        animation: 'fadeUp 0.55s cubic-bezier(0.16,1,0.3,1)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px', gap: '12px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'pulse 2.5s infinite',
            boxShadow: '0 8px 24px rgba(99,102,241,0.4)'
          }}>
            <ChatLogo />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>Welcome back</h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', marginTop: '5px', margin: '5px 0 0' }}>Sign in to your ChatApp account</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)',
            borderRadius: '10px', padding: '12px 14px', marginBottom: '20px',
            color: '#fca5a5', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Email</label>
            <input className="auth-input" type="email" name="email" value={form.email}
              onChange={handleChange} placeholder="you@example.com" required autoComplete="email" />
          </div>
          <div>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input className="auth-input" type={showPass ? 'text' : 'password'} name="password"
                value={form.password} onChange={handleChange} placeholder="••••••••" required
                style={{ paddingRight: '48px' }} autoComplete="current-password" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center',
                  padding: '4px', transition: 'color 0.2s'
                }}>
                <EyeIcon open={showPass} />
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-btn" style={{ marginTop: '4px' }}>
            {loading ? (
              <><Spinner /> Signing in...</>
            ) : (
              <>
                Sign In
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </>
            )}
          </button>
        </form>

        {/* Footer link */}
        <div style={{ textAlign: 'center', marginTop: '22px' }}>
          <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: '14px' }}>Don't have an account? </span>
          <Link to="/register" style={{ color: '#818cf8', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
            Create one
          </Link>
        </div>

        {/* Feature pills — SVG icons only, no emojis */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '22px', flexWrap: 'wrap' }}>
          {[
            { label: 'Secure', icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
            { label: 'Real-time', icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="13 2 13 9 20 9"/><path d="M11 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/></svg> },
            { label: 'Chat Rooms', icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
            { label: 'Private DMs', icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
          ].map(f => (
            <span key={f.label} className="pill">{f.icon}{f.label}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LoginPage