import { CLASSES, SESSION_ORDER, SESSION_ROOMS, TIMES } from '../data.js'
import DayPicker from '../components/DayPicker.jsx'

export default function ScheduleTab({ app }) {
  const { state, patch, open } = app
  return (
    <div style={{ animation: 'plFade .3s' }}>
      <div style={{ padding: '22px 24px 4px', fontFamily: 'Marcellus,serif', fontSize: 30 }}>Schedule</div>
      <DayPicker app={app} letterSpacing />
      <div style={{ display: 'flex', flexDirection: 'column', padding: '14px 24px 8px' }}>
        {SESSION_ORDER.map((ci, k) => {
          const c = CLASSES[ci]
          const booked = !!state.booked[ci]
          const waitlist = c.spots <= 2
          return (
            <div key={k} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
              <div style={{ width: 56, paddingTop: 2 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{TIMES[k] || '8:00 PM'}</div>
                <div style={{ fontSize: 11, color: 'var(--sub)' }}>{c.dur} min</div>
              </div>
              <div onClick={() => open(ci)} style={{ flex: 1, cursor: 'pointer' }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>{c.coach} · Studio {SESSION_ROOMS[k]}</div>
              </div>
              <div
                onClick={booked ? undefined : () => patch({ sel: ci, view: 'booking', slot: k })}
                style={{ alignSelf: 'center', fontSize: 12, fontWeight: 600, padding: '8px 15px', borderRadius: 100, cursor: 'pointer', background: booked ? 'var(--sagesoft)' : waitlist ? 'var(--goldsoft)' : 'var(--ink)', color: booked ? 'var(--sage)' : waitlist ? 'var(--gold)' : 'var(--bg)', border: `1px solid ${booked ? 'var(--sagesoft)' : waitlist ? 'var(--goldsoft)' : 'var(--ink)'}`, transition: 'all .25s' }}
              >{booked ? 'Booked' : waitlist ? 'Waitlist' : 'Book'}</div>
            </div>
          )
        })}
      </div>
      <div style={{ margin: '18px 24px 0', background: 'var(--sagesoft)', borderRadius: 20, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sage)' }} />
        <div style={{ fontSize: 13, color: 'var(--ink)' }}>Waitlists open 24h before class. We’ll notify you.</div>
      </div>
    </div>
  )
}
