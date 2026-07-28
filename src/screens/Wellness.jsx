import { IMAGES, RITUALS } from '../data.js'

export default function Wellness({ app }) {
  const { state, patch, vibrate, back } = app
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', animation: 'plUp .35s cubic-bezier(.2,.8,.2,1)', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 24px 0' }}>
        <div onClick={back} style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--card)', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer' }}>‹</div>
        <div style={{ fontFamily: 'Marcellus,serif', fontSize: 24 }}>Wellness</div>
      </div>
      <div style={{ margin: '20px 24px 0', position: 'relative', borderRadius: 24, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
        <img src={IMAGES.wellnessHero} alt="Evening meditation" style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(20,18,14,.05) 20%,rgba(20,18,14,.7))' }} />
        <div style={{ position: 'absolute', left: 20, bottom: 16, color: '#fff' }}>
          <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: '#E8DCC3' }}>Tonight</div>
          <div style={{ fontFamily: 'Marcellus,serif', fontSize: 22, marginTop: 2 }}>Evening unwind · 10 min</div>
        </div>
        <div style={{ position: 'absolute', right: 16, bottom: 16, width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,.25)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.4)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>▶</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '18px 24px 0' }}>
        {RITUALS.map((rt) => (
          <div key={rt.name} style={{ background: 'var(--card)', borderRadius: 20, padding: 16, boxShadow: 'var(--shadow)' }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: rt.bg, color: rt.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{rt.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 14, marginTop: 12 }}>{rt.name}</div>
            <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>{rt.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ margin: '16px 24px 40px', background: 'var(--card)', borderRadius: 22, padding: '18px 20px', boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Hydration</div>
          <div style={{ fontSize: 12, color: 'var(--sub)' }}>{state.hydration} of 8 glasses</div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              onClick={() => { vibrate(5); patch({ hydration: i + 1 }) }}
              style={{ flex: 1, height: 34, borderRadius: 10, cursor: 'pointer', background: i < state.hydration ? 'var(--sage)' : 'var(--stone)', border: `1px solid ${i < state.hydration ? 'var(--sage)' : 'var(--line)'}`, transition: 'all .25s' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
