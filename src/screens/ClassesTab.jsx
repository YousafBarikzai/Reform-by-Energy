import { CLASSES, FILTERS } from '../data.js'

export default function ClassesTab({ app }) {
  const { state, patch, open } = app
  const classList = CLASSES
    .map((c, i) => ({ ...c, i }))
    .filter((c) => state.filter === 'All' || c.cat === state.filter)
  return (
    <div style={{ animation: 'plFade .3s' }}>
      <div style={{ padding: '22px 24px 4px', fontFamily: 'Marcellus,serif', fontSize: 30 }}>Classes</div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '14px 24px 4px' }}>
        {FILTERS.map((f) => {
          const on = state.filter === f
          return (
            <div
              key={f}
              onClick={() => patch({ filter: f })}
              style={{ flex: '0 0 auto', padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `1px solid ${on ? 'var(--ink)' : 'var(--line)'}`, background: on ? 'var(--ink)' : 'var(--card)', color: on ? 'var(--bg)' : 'var(--sub)', transition: 'all .25s' }}
            >{f}</div>
          )
        })}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 24px 8px' }}>
        {classList.map((c) => (
          <div key={c.name} onClick={() => open(c.i)} style={{ background: 'var(--card)', borderRadius: 24, overflow: 'hidden', boxShadow: 'var(--shadow)', cursor: 'pointer' }}>
            <div style={{ position: 'relative' }}>
              <img src={c.img} alt={c.name} style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,.85)', backdropFilter: 'blur(8px)', color: '#2A2721', fontSize: 12, fontWeight: 600, padding: '5px 11px', borderRadius: 100 }}>{c.spots} spots</div>
            </div>
            <div style={{ padding: '14px 18px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600 }}>{c.level}</div>
              </div>
              <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--sub)', marginTop: 6 }}>
                <span>{c.dur} min</span><span>{c.cal} kcal</span><span>{c.equip}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
                <img src={c.a} alt={c.coach} style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />
                <div style={{ fontSize: 13, color: 'var(--sub)' }}>{c.coach}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
