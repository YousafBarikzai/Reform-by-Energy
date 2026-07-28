import { NAV_ITEMS } from '../data.js'

export default function BottomNav({ app }) {
  const { state, patch, vibrate } = app
  return (
    <div style={{ position: 'absolute', left: 20, right: 20, bottom: 22, background: 'var(--glass)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid var(--line)', borderRadius: 32, boxShadow: '0 12px 40px rgba(42,39,33,.16)', display: 'flex', padding: 8 }}>
      {NAV_ITEMS.map((t) => {
        const on = state.tab === t.id
        const color = on ? 'var(--sage)' : 'var(--sub)'
        return (
          <div
            key={t.id}
            onClick={() => { vibrate(5); patch({ tab: t.id, view: 'main' }) }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 0 6px', cursor: 'pointer', borderRadius: 24, background: on ? 'var(--sagesoft)' : 'transparent', transition: 'all .25s' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={t.d} /></svg>
            <div style={{ fontSize: 10, fontWeight: 600, color }}>{t.label}</div>
          </div>
        )
      })}
    </div>
  )
}
