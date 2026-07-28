import { IMAGES } from '../data.js'

export default function ProfileTab({ app }) {
  const { state, patch, dark, toggleDark, memberName } = app
  const rows = [
    { icon: '☰', name: 'Personal details', hint: '', go: () => {} },
    { icon: '✦', name: 'Fitness goals', hint: '3 active', go: () => patch({ view: 'progress' }) },
    { icon: '♥', name: 'Favourites', hint: '2 saved', go: () => patch({ view: 'instructor' }) },
    { icon: '⬦', name: 'Payment · Apple Pay', hint: '', go: () => patch({ view: 'membership' }) },
    { icon: '◎', name: 'Notifications', hint: 'On', go: () => {} },
  ]
  return (
    <div style={{ animation: 'plFade .3s' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 24px 0', textAlign: 'center' }}>
        <img src={IMAGES.profile} alt="You" style={{ width: 86, height: 86, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--gold)' }} />
        <div style={{ fontFamily: 'Marcellus,serif', fontSize: 24, marginTop: 12 }}>{memberName}</div>
        <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 2 }}>Member since 2024 · Gold</div>
      </div>
      <div onClick={() => patch({ view: 'membership' })} style={{ margin: '20px 24px 0', background: 'var(--ink)', color: 'var(--bg)', borderRadius: 24, padding: '20px 22px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', opacity: 0.65 }}>Studio credits</div>
          <div style={{ fontFamily: 'Marcellus,serif', fontSize: 30, marginTop: 2 }}>{state.credits}</div>
          <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>10-class pack · renews 14 Aug</div>
        </div>
        <div style={{ background: 'var(--gold)', color: '#fff', fontSize: 13, fontWeight: 600, padding: '9px 16px', borderRadius: 100 }}>Top up</div>
      </div>
      <div style={{ display: 'flex', gap: 12, margin: '14px 24px 0' }}>
        <div onClick={() => patch({ view: 'progress' })} style={{ flex: 1, background: 'var(--card)', borderRadius: 20, padding: 16, boxShadow: 'var(--shadow)', cursor: 'pointer' }}>
          <div style={{ fontFamily: 'Marcellus,serif', fontSize: 22, color: 'var(--sage)' }}>42</div>
          <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>Classes · view progress</div>
        </div>
        <div onClick={() => patch({ view: 'wellness' })} style={{ flex: 1, background: 'var(--card)', borderRadius: 20, padding: 16, boxShadow: 'var(--shadow)', cursor: 'pointer' }}>
          <div style={{ fontFamily: 'Marcellus,serif', fontSize: 22, color: 'var(--gold)' }}>6</div>
          <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>Wellness · rituals</div>
        </div>
      </div>
      <div style={{ margin: '18px 24px 0', background: 'var(--card)', borderRadius: 22, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
        {rows.map((r) => (
          <div key={r.name} onClick={r.go} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '15px 18px', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--sagesoft)', color: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{r.icon}</div>
            <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{r.name}</div>
            <div style={{ fontSize: 12, color: 'var(--sub)' }}>{r.hint}</div>
            <div style={{ color: 'var(--sub)' }}>›</div>
          </div>
        ))}
        <div onClick={toggleDark} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '15px 18px', cursor: 'pointer' }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--goldsoft)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>◐</div>
          <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>Dark mode</div>
          <div style={{ width: 46, height: 28, borderRadius: 100, padding: 3, boxSizing: 'border-box', background: dark ? 'var(--sage)' : 'var(--line)', transition: 'background .3s' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.25)', transform: `translateX(${dark ? 18 : 0}px)`, transition: 'transform .3s' }} />
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--sub)', padding: '20px 0 4px' }}>Face ID · Apple Pay · Health connected</div>
    </div>
  )
}
