import { DAY_NAMES, DOWS, ICONS, INSTRUCTORS, SESSIONS, STUDIO, dayNum } from '../data.js'
import Icon from '../components/Icon.jsx'

export default function ScheduleTab({ app }) {
  const { state, patch, vibrate } = app
  return (
    <div style={{ animation: 'plFade .3s', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 24px 0' }}>
        <div style={{ fontFamily: 'Marcellus,serif', fontSize: 30 }}>Schedule</div>
        <div className="press" style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--card)', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon d={ICONS.calendar} size={19} />
        </div>
      </div>

      {/* day strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 24px 0' }}>
        {DOWS.map((d, i) => {
          const on = state.day === i
          return (
            <div key={d} onClick={() => { vibrate(5); patch({ day: i }) }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
              <div style={{ fontSize: 11, color: on ? 'var(--rose)' : 'var(--sub)', fontWeight: on ? 600 : 400 }}>{d}</div>
              <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, background: on ? 'var(--rose)' : 'transparent', color: on ? '#fff' : 'var(--ink)', boxShadow: on ? '0 8px 18px rgba(199,78,117,.35)' : 'none', transition: 'all .25s' }}>{dayNum(i)}</div>
            </div>
          )
        })}
      </div>

      {/* selected day label */}
      <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--sub)', fontWeight: 600, padding: '22px 24px 12px' }}>
        {DAY_NAMES[state.day]}, May {dayNum(state.day)}
      </div>

      {/* sessions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 24px' }}>
        {SESSIONS.map((s) => {
          const booked = !!state.booked[s.id]
          return (
            <div key={s.id} style={{ background: 'var(--card)', borderRadius: 20, padding: '12px 14px', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', gap: 13 }}>
              <div style={{ width: 54, height: 54, borderRadius: 16, background: 'var(--pinksoft)', color: 'var(--rose)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1.15 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{s.time}</div>
                <div style={{ fontSize: 10, fontWeight: 600 }}>{s.ampm}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>{STUDIO}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                  <img src={INSTRUCTORS[s.coach]} alt={s.coach} style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ fontSize: 12, color: 'var(--sub)' }}>{s.coach}</div>
                </div>
              </div>
              <div
                className={booked ? undefined : 'press'}
                onClick={booked ? undefined : () => { vibrate(10); patch({ booked: { ...state.booked, [s.id]: true } }) }}
                style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', padding: '9px 16px', borderRadius: 100, cursor: booked ? 'default' : 'pointer', background: booked ? 'var(--pinksoft)' : 'var(--rose)', color: booked ? 'var(--rose)' : '#fff', transition: 'all .25s' }}
              >{booked ? 'BOOKED' : 'BOOK'}</div>
            </div>
          )
        })}
      </div>

      {/* full schedule CTA */}
      <div style={{ padding: '20px 24px 8px', marginTop: 'auto' }}>
        <div className="press" style={{ background: 'var(--rose)', color: '#fff', textAlign: 'center', fontSize: 13, fontWeight: 700, letterSpacing: '.1em', padding: '16px 0', borderRadius: 100, cursor: 'pointer', boxShadow: '0 10px 24px rgba(199,78,117,.35)' }}>VIEW FULL SCHEDULE</div>
      </div>
    </div>
  )
}
