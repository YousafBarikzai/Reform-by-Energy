import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './components/Icon.jsx'
import { ICONS } from './data.js'

export const vibrate = (ms) => { try { navigator.vibrate && navigator.vibrate(ms) } catch { /* unsupported */ } }

// ── layout primitives ──
export const label = { fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--sub)', fontWeight: 600 }
export const roseLabel = { ...label, color: 'var(--rose)' }

export function SectionLabel({ children, right, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '22px 24px 10px', ...style }}>
      <div style={roseLabel}>{children}</div>
      {right}
    </div>
  )
}

export function Card({ children, style, onClick, className }) {
  return (
    <div className={className || (onClick ? 'press' : undefined)} onClick={onClick}
      style={{ background: 'var(--card)', borderRadius: 22, boxShadow: 'var(--shadow)', cursor: onClick ? 'pointer' : undefined, ...style }}>
      {children}
    </div>
  )
}

export function Btn({ children, onClick, kind = 'primary', style, disabled, small }) {
  const base = {
    primary: { background: 'var(--rose)', color: '#fff' },
    soft: { background: 'var(--pinksoft)', color: 'var(--rose)' },
    outline: { background: 'transparent', color: 'var(--rose)', border: '1.5px solid var(--rose)' },
    ghost: { background: 'transparent', color: 'var(--sub)' },
    dark: { background: 'var(--ink)', color: '#fff' },
  }[kind]
  return (
    <div className={disabled ? undefined : 'press'}
      onClick={disabled ? undefined : (e) => { vibrate(5); onClick?.(e) }}
      style={{
        textAlign: 'center', fontWeight: 700, letterSpacing: '.08em', cursor: disabled ? 'default' : 'pointer',
        fontSize: small ? 11 : 13, padding: small ? '8px 16px' : '15px 22px', borderRadius: 100,
        opacity: disabled ? 0.45 : 1, transition: 'all .25s', userSelect: 'none', ...base, ...style,
      }}>
      {children}
    </div>
  )
}

export function TopBar({ title, back = true, right }) {
  const nav = useNavigate()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '22px 24px 0' }}>
      {back && (
        <div className="press" onClick={() => (window.history.length > 1 ? nav(-1) : nav('/'))}
          style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--card)', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
        </div>
      )}
      <div style={{ fontFamily: 'Marcellus,serif', fontSize: 26, flex: 1 }}>{title}</div>
      {right}
    </div>
  )
}

export function Chip({ children, on, onClick, style }) {
  return (
    <div className="press" onClick={onClick && ((e) => { vibrate(4); onClick(e) })}
      style={{ flex: '0 0 auto', padding: '8px 15px', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: onClick ? 'pointer' : 'default', border: `1px solid ${on ? 'var(--rose)' : 'var(--line)'}`, background: on ? 'var(--rose)' : 'var(--card)', color: on ? '#fff' : 'var(--sub)', transition: 'all .25s', whiteSpace: 'nowrap', ...style }}>
      {children}
    </div>
  )
}

export function Tag({ children, tone = 'soft', style }) {
  const tones = {
    soft: { background: 'var(--pinksoft)', color: 'var(--rose)' },
    green: { background: '#E7F2E7', color: '#3E7A48' },
    amber: { background: '#FBEEDA', color: '#A2701F' },
    red: { background: '#FBE2E2', color: '#B03A3A' },
    grey: { background: 'var(--blush)', color: 'var(--sub)' },
  }[tone]
  return <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 100, whiteSpace: 'nowrap', ...tones, ...style }}>{children}</span>
}

// availability → visual state
export function availabilityTag(s) {
  if (s.started) return <Tag tone="grey">Finished</Tag>
  if (s.status === 'full') return <Tag tone="red">Fully booked</Tag>
  if (s.status === 'almost_full') return <Tag tone="amber">Almost full</Tag>
  if (s.status === 'limited') return <Tag tone="amber">{s.spaces} spaces</Tag>
  return <Tag tone="green">Available</Tag>
}

// ── charts (hand-rolled SVG) ──
export function Ring({ pct, size = 72, stroke = 7, color = 'var(--rose)', track = 'var(--pinksoft)', children }) {
  const r = (size - stroke) / 2 - 2
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, Math.max(0, pct / 100)))}
        transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.2,.8,.2,1)' }} />
      {children}
    </svg>
  )
}

export function Bars({ values, labels, height = 90, color = 'var(--rose)', dim = 'var(--pinksoft)', highlight = -1 }) {
  const max = Math.max(1, ...values)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height }}>
      {values.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
          <div style={{ fontSize: 10, color: 'var(--sub)', fontWeight: 600 }}>{v || ''}</div>
          <div style={{ width: '100%', maxWidth: 30, borderRadius: '8px 8px 4px 4px', height: `${Math.max(4, (v / max) * 72)}%`, background: i === highlight ? color : v ? color : dim, opacity: i === highlight ? 1 : 0.75, transition: 'height .5s' }} />
          {labels && <div style={{ fontSize: 10, color: 'var(--sub)' }}>{labels[i]}</div>}
        </div>
      ))}
    </div>
  )
}

export function Sparkline({ values, width = 280, height = 60, color = 'var(--rose)' }) {
  if (!values.length) return null
  const max = Math.max(...values), min = Math.min(...values)
  const span = max - min || 1
  const pts = values.map((v, i) => [
    (i / Math.max(1, values.length - 1)) * (width - 8) + 4,
    height - 6 - ((v - min) / span) * (height - 14),
  ])
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <path d={`${d} L${width - 4},${height} L4,${height} Z`} fill="var(--pinksoft)" opacity="0.6" />
      <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => i === pts.length - 1 && <circle key={i} cx={p[0]} cy={p[1]} r="4" fill={color} />)}
    </svg>
  )
}

export function Stars({ value = 0, onChange, size = 18 }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} onClick={onChange && ((e) => { e.stopPropagation(); vibrate(4); onChange(n) })}
          style={{ fontSize: size, cursor: onChange ? 'pointer' : 'default', color: n <= value ? 'var(--rose)' : 'var(--line)', lineHeight: 1 }}>★</span>
      ))}
    </div>
  )
}

// ── loading / empty / error states ──
export function Skeleton({ height = 90, style, radius = 22 }) {
  return <div style={{ height, borderRadius: radius, background: 'linear-gradient(100deg, var(--blush) 40%, #fff 50%, var(--blush) 60%)', backgroundSize: '200% 100%', animation: 'plShimmer 1.4s infinite linear', ...style }} />
}
export function PageSkeleton() {
  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Skeleton height={34} style={{ width: '55%' }} radius={10} />
      <Skeleton height={170} />
      <Skeleton height={90} />
      <Skeleton height={90} />
    </div>
  )
}
export function EmptyState({ icon = ICONS.heart, title, text, action }) {
  return (
    <Card style={{ margin: '20px 24px 0', padding: '38px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6 }}>
      <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'var(--pinksoft)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon d={icon} size={23} strokeWidth={1.6} />
      </div>
      <div style={{ fontFamily: 'Marcellus,serif', fontSize: 19, marginTop: 8 }}>{title}</div>
      {text && <div style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.6, maxWidth: 260 }}>{text}</div>}
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </Card>
  )
}
export function ErrorState({ error, retry }) {
  return (
    <EmptyState icon={ICONS.help} title="Something went wrong"
      text={error?.message || 'Please check your connection and try again.'}
      action={retry && <Btn small kind="soft" onClick={retry}>TRY AGAIN</Btn>} />
  )
}

// ── modal sheet ──
export function Sheet({ open, onClose, children }) {
  if (!open) return null
  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(56,38,46,.42)', animation: 'plFade .25s', zIndex: 40 }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '86%', overflowY: 'auto', background: 'var(--card)', borderRadius: '30px 30px 0 0', padding: '12px 24px 30px', animation: 'plSheet .35s cubic-bezier(.2,.8,.2,1)', boxShadow: '0 -10px 40px rgba(0,0,0,.16)', zIndex: 41 }}>
        <div style={{ width: 40, height: 4, borderRadius: 100, background: 'var(--line)', margin: '4px auto 16px' }} />
        {children}
      </div>
    </>
  )
}

// ── toasts ──
const ToastContext = createContext(() => {})
export const useToast = () => useContext(ToastContext)
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const push = useCallback((message, tone = 'ok') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', width: 'min(92vw, 360px)', top: 'max(58px, env(safe-area-inset-top))', zIndex: 90, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ background: t.tone === 'err' ? '#B03A3A' : 'var(--ink)', color: '#fff', borderRadius: 16, padding: '12px 18px', fontSize: 13, fontWeight: 500, boxShadow: '0 10px 30px rgba(0,0,0,.25)', animation: 'plUp .3s cubic-bezier(.2,.8,.2,1)' }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// form field
export function Field({ label: text, children }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--sub)', marginBottom: 6 }}>{text}</div>
      {children}
    </label>
  )
}
export const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '13px 16px', borderRadius: 14,
  border: '1.5px solid var(--line)', background: 'var(--card)', color: 'var(--ink)',
  fontSize: 15, fontFamily: "'Albert Sans',sans-serif", outline: 'none',
}

export function useIsPhone() {
  const [isPhone, setIsPhone] = useState(() => window.matchMedia('(max-width: 520px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 520px)')
    const onChange = (e) => setIsPhone(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return isPhone
}

// date/time formatting
export const fmtTime = (d) => new Date(d).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase().replace(' ', ' ')
export const fmtDay = (d) => new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
export const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
export function relDay(d) {
  const date = new Date(d)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const that = new Date(date); that.setHours(0, 0, 0, 0)
  const diff = Math.round((that - today) / 864e5)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })
}
