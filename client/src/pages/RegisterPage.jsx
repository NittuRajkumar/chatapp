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

const RegisterPage = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [strength, setStrength] = useState(0)

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (e.target.name === 'password') {
      const p = e.target.value
      let s = 0
      if (p.length >= 6) s++
      if (/[A-Z]/.test(p)) s++
      if (/[0-9]/.test(p)) s++
      if (/[^A-Za-z0-9]/.test(p)) s++
      setStrength(s)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const strengthColors = ['#ef4444', '#f97316', '#eab308', '#22c55e']
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong']

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      fontFamily: "'Segoe UI', system-ui, sans-serif", padding: '1rem'
    }}>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
        {[
          { w: 350, h: 350, top: '10%', left: '60%', color: 'rgba(139,92,246,0.12)' },
          { w: 400, h: 400, top: '55%', left: '-8%', color: 'rgba(99,102,241,0.10)' },
          { w: 200, h: 200, top: '30%', left: '30%', color: 'rgba(139,92,246,0.06)' },
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
        @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(139,92,246,0.35); } 60% { box-shadow: 0 0 0 12px rgba(139,92,246,0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-input {
          width: 100%; background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 13px 16px; color: white; font-size: 15px; outline: none;
          transition: border-color 0.25s, background 0.25s, box-shadow 0.25s; box-sizing: border-box;
        }
        .auth-input:focus { border-color: #8b5cf6; background: rgba(139,92,246,0.08); box-shadow: 0 0 0 3px rgba(139,92,246,0.18); }
        .auth-input::placeholder { color: rgba(255,255,255,0.28); }
        .auth-btn {
          width: 100%; padding: 13px; border-radius: 12px; border: none; cursor: pointer;
          font-size: 15px; font-weight: 700; letter-spacing: 0.3px;
          background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white;
          transition: transform 0.2s, box-shadow 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .auth-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(139,92,246,0.45); }
        .auth-btn:active:not(:disabled) { transform: translateY(0); }
        .auth-btn:disabled { opacity: 0.65; cursor: not-allowed; }
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
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'pulse 2.5s infinite',
            boxShadow: '0 8px 24px rgba(139,92,246,0.4)'
          }}>
            <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
              <path d="M16 4C9.37 4 4 8.48 4 14c0 2.76 1.3 5.26 3.4 7.1L6 28l6.5-3.2A14.2 14.2 0 0 0 16 25c6.63 0 12-4.48 12-10S22.63 4 16 4z" stroke="white" strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
              <path d="M11 13h2M15 13h2M19 13h2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>Create Account</h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', marginTop: '5px', margin: '5px 0 0' }}>Join ChatApp — free forever</p>
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
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Username</label>
            <input className="auth-input" type="text" name="username" value={form.username}
              onChange={handleChange} placeholder="e.g. ayush_kumar" required autoComplete="username" />
          </div>
          <div>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Email</label>
            <input className="auth-input" type="email" name="email" value={form.email}
              onChange={handleChange} placeholder="you@example.com" required autoComplete="email" />
          </div>
          <div>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input className="auth-input" type={showPass ? 'text' : 'password'} name="password"
                value={form.password} onChange={handleChange} placeholder="Min. 6 characters"
                required minLength={6} style={{ paddingRight: '48px' }} autoComplete="new-password" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', padding: '4px'
                }}>
                <EyeIcon open={showPass} />
              </button>
            </div>
            {/* Password strength meter */}
            {form.password.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} style={{
                      flex: 1, height: '3px', borderRadius: '2px', transition: 'background 0.3s',
                      background: i < strength ? strengthColors[strength - 1] : 'rgba(255,255,255,0.1)'
                    }} />
                  ))}
                </div>
                {strength > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: strengthColors[strength - 1] }} />
                    <span style={{ fontSize: '12px', color: strengthColors[strength - 1], fontWeight: 500 }}>
                      {strengthLabels[strength - 1]} password
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="auth-btn" style={{ marginTop: '4px' }}>
            {loading ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite', transformOrigin: 'center' }}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                Creating account...
              </>
            ) : (
              <>
                Create Account
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '22px' }}>
          <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: '14px' }}>Already have an account? </span>
          <Link to="/login" style={{ color: '#a78bfa', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage