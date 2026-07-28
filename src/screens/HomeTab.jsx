import { ICONS, INSTRUCTORS, MEMBER, NEXT_CLASS, UPCOMING } from '../data.js'
import Icon from '../components/Icon.jsx'
import { Monogram } from '../components/Logo.jsx'

function Ring({ pct }) {
  const r = 26
  const c = 2 * Math.PI * r
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke="var(--pinksoft)" strokeWidth="7" />
      <circle cx="36" cy="36" r={r} fill="none" stroke="var(--rose)" strokeWidth="7" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform="rotate(-90 36 36)"
        style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.2,.8,.2,1)' }} />
      <text x="36" y="41" textAnchor="middle" fontSize="15" fontWeight="600" fill="var(--ink)" fontFamily="'Albert Sans',sans-serif">{pct}%</text>
    </svg>
  )
}

const label = { fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--rose)', fontWeight: 600 }

export default function HomeTab({ app }) {
  const { patch, vibrate } = app
  const actions = [
    { icon: ICONS.booking, name: 'Book Class', go: () => patch({ tab: 'schedule' }) },
    { icon: ICONS.calendar, name: 'Schedule', go: () => patch({ tab: 'schedule' }) },
    { icon: ICONS.tag, name: 'Packages', go: () => patch({ tab: 'packages' }) },
    { icon: ICONS.play, name: 'Library', go: () => patch({ tab: 'library' }) },
  ]
  return (
    <div style={{ animation: 'plFade .3s' }}>
      {/* brand strip */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
        <Monogram size={34} />
      </div>

      {/* greeting */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 24px 0' }}>
        <div>
          <div style={{ fontSize: 15, color: 'var(--sub)' }}>Good morning,</div>
          <div style={{ fontFamily: 'Marcellus,serif', fontSize: 32, lineHeight: 1.1, color: 'var(--rose)', marginTop: 2 }}>{MEMBER.first} <span style={{ fontSize: 22 }}>♡</span></div>
        </div>
        <div className="press" style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--card)', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--ink)' }}>
          <Icon d={ICONS.bell} size={20} />
        </div>
      </div>

      {/* next class */}
      <div style={{ ...label, padding: '22px 24px 10px' }}>Your next class</div>
      <div style={{ margin: '0 24px', background: 'var(--card)', borderRadius: 24, padding: 14, boxShadow: 'var(--shadow)', display: 'flex', gap: 14 }}>
        <img src={NEXT_CLASS.img} alt={NEXT_CLASS.name} style={{ width: 108, borderRadius: 18, objectFit: 'cover' }} />
        <div style={{ flex: 1, padding: '4px 0' }}>
          <div style={{ fontWeight: 600, fontSize: 17 }}>{NEXT_CLASS.name}</div>
          <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 1 }}>{NEXT_CLASS.focus}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 9, fontSize: 12, color: 'var(--sub)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Icon d={ICONS.clock} size={13} color="var(--rose)" /> {NEXT_CLASS.when}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Icon d={ICONS.pin} size={13} color="var(--rose)" /> {NEXT_CLASS.studio}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Icon d={ICONS.user} size={13} color="var(--rose)" /> {NEXT_CLASS.coach}</div>
          </div>
          <div className="press" style={{ marginTop: 11, display: 'inline-block', background: 'var(--rose)', color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '.08em', padding: '8px 16px', borderRadius: 100, cursor: 'pointer' }}>VIEW DETAILS</div>
        </div>
      </div>

      {/* weekly progress */}
      <div style={{ margin: '14px 24px 0', background: 'var(--card)', borderRadius: 24, padding: '18px 20px', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ ...label, color: 'var(--sub)' }}>Weekly progress</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <div style={{ fontFamily: 'Marcellus,serif', fontSize: 36, lineHeight: 1 }}>3</div>
            <div style={{ fontSize: 12, color: 'var(--sub)' }}>of 4 classes<br />completed</div>
          </div>
        </div>
        <Ring pct={75} />
      </div>

      {/* quick actions */}
      <div style={{ ...label, padding: '22px 24px 10px' }}>Quick actions</div>
      <div style={{ display: 'flex', gap: 10, padding: '0 24px' }}>
        {actions.map((a) => (
          <div key={a.name} className="press" onClick={() => { vibrate(5); a.go() }} style={{ flex: 1, background: 'var(--card)', borderRadius: 18, padding: '14px 4px 12px', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--pinksoft)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon d={a.icon} size={17} />
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink)', textAlign: 'center' }}>{a.name}</div>
          </div>
        ))}
      </div>

      {/* upcoming classes */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '24px 24px 10px' }}>
        <div style={label}>Upcoming classes</div>
        <div onClick={() => patch({ tab: 'schedule' })} style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.08em', color: 'var(--sub)', cursor: 'pointer' }}>VIEW ALL</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 24px 8px' }}>
        {UPCOMING.map((u) => (
          <div key={u.name} style={{ background: 'var(--card)', borderRadius: 20, padding: '12px 14px', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={INSTRUCTORS[u.coach]} alt={u.coach} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
              <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>{u.when} · {u.coach}</div>
            </div>
            <div className="press" onClick={() => { vibrate(5); patch({ tab: 'schedule' }) }} style={{ border: '1.5px solid var(--rose)', color: 'var(--rose)', fontSize: 11, fontWeight: 600, letterSpacing: '.06em', padding: '7px 16px', borderRadius: 100, cursor: 'pointer' }}>BOOK</div>
          </div>
        ))}
      </div>
    </div>
  )
}
