import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'
import { Btn, Field, PageSkeleton, inputStyle, useToast } from '../ui.jsx'
import { FullLogo } from '../components/Logo.jsx'

export default function AuthScreen() {
  const { member, setMember, loading } = useAuth()
  const location0 = useLocation()
  const [mode, setMode] = useState(location0.state?.forgot ? 'forgot' : location0.state?.register ? 'register' : 'login') // login | register | forgot | reset
  const [form, setForm] = useState({ remember: true })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [resetCode, setResetCode] = useState(null)
  const toast = useToast()
  const nav = useNavigate()
  const location = useLocation()
  if (loading) return <PageSkeleton />
  if (member) return <Navigate to={location.state?.from || '/'} replace />

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e?.preventDefault()
    setBusy(true); setError(null)
    try {
      if (mode === 'login') {
        const d = await api.post('/auth/login', { email: form.email, password: form.password, remember: form.remember !== false })
        setMember(d.member)
      } else if (mode === 'register') {
        const d = await api.post('/auth/register', { email: form.email, password: form.password, firstName: form.firstName, lastName: form.lastName, referralCode: form.referralCode })
        setMember(d.member)
        toast('Welcome to Reform 🤍')
      } else if (mode === 'forgot') {
        const d = await api.post('/auth/forgot', { email: form.email })
        setResetCode(d.resetCode || null)
        setMode('reset')
      } else if (mode === 'reset') {
        await api.post('/auth/reset', { code: form.code, password: form.password })
        toast('Password updated — sign in')
        setMode('login')
      }
      if (mode === 'login' || mode === 'register') nav(location.state?.from || '/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const link = { fontSize: 13, fontWeight: 600, color: 'var(--rose)', cursor: 'pointer', textAlign: 'center' }

  return (
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: 'linear-gradient(180deg,#FFF7F9 0%,#FBE4EC 100%)' }}>
      <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '54px 28px 40px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 30 }}>
          <FullLogo width={150} />
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'plFade .3s' }}>
          {mode === 'register' && (
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}><Field label="First name"><input style={inputStyle} value={form.firstName || ''} onChange={set('firstName')} autoComplete="given-name" /></Field></div>
              <div style={{ flex: 1 }}><Field label="Last name"><input style={inputStyle} value={form.lastName || ''} onChange={set('lastName')} autoComplete="family-name" /></Field></div>
            </div>
          )}
          {mode !== 'reset' && (
            <Field label="Email"><input style={inputStyle} type="email" value={form.email || ''} onChange={set('email')} autoComplete="email" placeholder="you@email.com" /></Field>
          )}
          {mode === 'reset' && (
            <>
              {resetCode && (
                <div style={{ background: 'var(--card)', border: '1px dashed var(--pink)', borderRadius: 14, padding: '12px 16px', fontSize: 13, color: 'var(--sub)', lineHeight: 1.5 }}>
                  Demo environment: no email service is connected, so here is your reset code — <b style={{ color: 'var(--rose)' }}>{resetCode}</b>
                </div>
              )}
              <Field label="Reset code"><input style={inputStyle} value={form.code || ''} onChange={set('code')} placeholder="8-character code" /></Field>
            </>
          )}
          {mode !== 'forgot' && (
            <Field label={mode === 'reset' ? 'New password' : 'Password'}>
              <input style={inputStyle} type="password" value={form.password || ''} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="At least 8 characters" />
            </Field>
          )}
          {mode === 'register' && (
            <Field label="Referral code (optional)"><input style={inputStyle} value={form.referralCode || ''} onChange={set('referralCode')} placeholder="From a friend" /></Field>
          )}
          {mode === 'login' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: -2 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--sub)', cursor: 'pointer' }}>
                <span onClick={() => setForm((f) => ({ ...f, remember: f.remember === false }))}
                  style={{ width: 18, height: 18, borderRadius: 6, border: '1.5px solid var(--pink)', background: form.remember !== false ? 'var(--rose)' : 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 800, transition: 'all .2s' }}>
                  {form.remember !== false ? '✓' : ''}
                </span>
                Remember me
              </label>
              <span onClick={() => { setMode('forgot'); setError(null) }} style={{ fontSize: 13, fontWeight: 600, color: 'var(--sub)', cursor: 'pointer' }}>Forgotten password</span>
            </div>
          )}

          {error && <div style={{ background: '#FBE2E2', color: '#B03A3A', borderRadius: 12, padding: '11px 15px', fontSize: 13, fontWeight: 500 }}>{error}</div>}

          <Btn onClick={submit} disabled={busy} style={{ marginTop: 4 }}>
            {busy ? 'ONE MOMENT…' : { login: 'SIGN IN', register: 'CREATE ACCOUNT', forgot: 'SEND RESET CODE', reset: 'SET NEW PASSWORD' }[mode]}
          </Btn>
          <button type="submit" style={{ display: 'none' }} />
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
          {mode === 'login' && (
            <div style={link} onClick={() => { setMode('register'); setError(null) }}>New to Reform? Create an account</div>
          )}
          {mode !== 'login' && <div style={link} onClick={() => { setMode('login'); setError(null) }}>Back to sign in</div>}
          <div onClick={() => nav('/')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 6, padding: '13px 0', borderRadius: 100, background: 'var(--card)', boxShadow: 'var(--shadow)', fontSize: 13, fontWeight: 600, color: 'var(--ink)', cursor: 'pointer' }} className="press">
            Explore the website without an account →
          </div>
        </div>

        <div style={{ marginTop: 26, textAlign: 'center', fontSize: 11.5, color: 'var(--sub)', lineHeight: 1.7 }}>
          Demo accounts · member <b>sophie@email.com</b> / reform123<br />admin <b>admin@reformbyenergym.com</b> / admin123
        </div>
      </div>
    </div>
  )
}
