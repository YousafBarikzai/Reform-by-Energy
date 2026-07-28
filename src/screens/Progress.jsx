import { BADGES, BAR_HEIGHTS, BAR_LABELS, STATS } from '../data.js'

export default function Progress({ app }) {
  const { back } = app
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', animation: 'plUp .35s cubic-bezier(.2,.8,.2,1)', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 24px 0' }}>
        <div onClick={back} style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--card)', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer' }}>‹</div>
        <div style={{ fontFamily: 'Marcellus,serif', fontSize: 24 }}>Progress</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '20px 24px 0' }}>
        {STATS.map((st) => (
          <div key={st.k} style={{ background: 'var(--card)', borderRadius: 20, padding: '16px 18px', boxShadow: 'var(--shadow)' }}>
            <div style={{ fontFamily: 'Marcellus,serif', fontSize: 26, color: st.color }}>{st.v}</div>
            <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 3 }}>{st.k}</div>
          </div>
        ))}
      </div>
      <div style={{ margin: '16px 24px 0', background: 'var(--card)', borderRadius: 22, padding: '18px 20px', boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Weekly activity</div>
          <div style={{ fontSize: 12, color: 'var(--sub)' }}>4 of 5 goal</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 90, marginTop: 16 }}>
          {BAR_LABELS.map((l, i) => {
            const h = BAR_HEIGHTS[i]
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '100%', borderRadius: '8px 8px 4px 4px', height: `${Math.max(h, 6)}%`, background: h ? 'var(--sage)' : 'var(--stone)', transition: 'height .5s' }} />
                <div style={{ fontSize: 10, color: 'var(--sub)' }}>{l}</div>
              </div>
            )
          })}
        </div>
      </div>
      <div style={{ margin: '16px 24px 0', background: 'linear-gradient(135deg,var(--sagesoft),var(--card))', border: '1px solid var(--line)', borderRadius: 22, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontFamily: 'Marcellus,serif', fontSize: 34, color: 'var(--sage)' }}>9</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Week streak</div>
          <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>Your longest yet. Keep it gentle, keep it going.</div>
        </div>
      </div>
      <div style={{ fontFamily: 'Marcellus,serif', fontSize: 18, padding: '24px 24px 12px' }}>Milestones</div>
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 24px 40px' }}>
        {BADGES.map((bd) => (
          <div key={bd.name} style={{ flex: '0 0 120px', background: 'var(--card)', borderRadius: 20, padding: '16px 12px', textAlign: 'center', boxShadow: 'var(--shadow)', opacity: bd.op }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', margin: '0 auto', background: bd.bg, color: bd.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{bd.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 600, marginTop: 10 }}>{bd.name}</div>
            <div style={{ fontSize: 10, color: 'var(--sub)', marginTop: 2 }}>{bd.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
