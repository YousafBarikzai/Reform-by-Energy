import { ICONS } from '../data.js'
import Icon from './Icon.jsx'

const ITEMS = [
  { id: 'home', label: 'Home', d: ICONS.home },
  { id: 'schedule', label: 'Schedule', d: ICONS.calendar },
  { id: 'packages', label: 'Packages', d: ICONS.tag },
  { id: 'library', label: 'Library', d: ICONS.play },
  { id: 'profile', label: 'Profile', d: ICONS.user },
]

export default function BottomNav({ app }) {
  const { state, patch, vibrate } = app
  return (
    <div style={{ position: 'absolute', left: 18, right: 18, bottom: 20, background: 'var(--glass)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid var(--line)', borderRadius: 30, boxShadow: '0 12px 40px rgba(199,78,117,.18)', display: 'flex', padding: 7 }}>
      {ITEMS.map((t) => {
        const on = state.tab === t.id
        const color = on ? 'var(--rose)' : 'var(--sub)'
        return (
          <div
            key={t.id}
            className="press"
            onClick={() => { vibrate(5); patch({ tab: t.id }) }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '9px 0 7px', cursor: 'pointer', borderRadius: 23, background: on ? 'var(--pinksoft)' : 'transparent', transition: 'background .25s' }}
          >
            <Icon d={t.d} color={color} />
            <div style={{ fontSize: 10, fontWeight: 600, color, letterSpacing: '.02em' }}>{t.label}</div>
          </div>
        )
      })}
    </div>
  )
}
