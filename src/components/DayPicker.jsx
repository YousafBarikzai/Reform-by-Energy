import { DOWS, dayNum } from '../data.js'

// Shared 7-day strip used by Schedule and Booking. `letterSpacing` matches the
// slight style difference between the two screens in the design.
export default function DayPicker({ app, letterSpacing }) {
  const { state, patch } = app
  return (
    <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: letterSpacing ? '16px 24px 6px' : '12px 24px 6px' }}>
      {DOWS.map((d, i) => {
        const on = state.day === i
        return (
          <div
            key={d}
            onClick={() => patch({ day: i })}
            style={{ flex: '0 0 52px', textAlign: 'center', padding: '10px 0 12px', borderRadius: 18, cursor: 'pointer', background: on ? 'var(--ink)' : 'var(--card)', color: on ? 'var(--bg)' : 'var(--ink)', boxShadow: on ? '0 8px 20px rgba(42,39,33,.25)' : 'var(--shadow)', transition: 'all .25s' }}
          >
            <div style={{ fontSize: 11, letterSpacing: letterSpacing ? '.06em' : undefined, opacity: 0.75 }}>{d}</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>{dayNum(i)}</div>
          </div>
        )
      })}
    </div>
  )
}
