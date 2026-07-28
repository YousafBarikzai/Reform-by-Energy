import { PLANS } from '../data.js'

export default function Membership({ app }) {
  const { state, back } = app
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', animation: 'plUp .35s cubic-bezier(.2,.8,.2,1)', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 24px 0' }}>
        <div onClick={back} style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--card)', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer' }}>‹</div>
        <div style={{ fontFamily: 'Marcellus,serif', fontSize: 24 }}>Membership</div>
      </div>
      <div style={{ margin: '20px 24px 0', background: 'var(--ink)', color: 'var(--bg)', borderRadius: 26, padding: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle,rgba(185,148,89,.35),transparent 70%)' }} />
        <div style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', opacity: 0.65 }}>Current pack</div>
        <div style={{ fontFamily: 'Marcellus,serif', fontSize: 26, marginTop: 6 }}>10-Class Pack</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 16 }}>
          <div style={{ fontFamily: 'Marcellus,serif', fontSize: 44, color: 'var(--gold)' }}>{state.credits}</div>
          <div style={{ fontSize: 13, opacity: 0.65 }}>credits left · renews 14 Aug</div>
        </div>
        <div style={{ height: 5, background: 'rgba(255,255,255,.15)', borderRadius: 100, marginTop: 14, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'var(--gold)', borderRadius: 100, width: `${state.credits * 10}%`, transition: 'width .5s' }} />
        </div>
      </div>
      <div style={{ fontFamily: 'Marcellus,serif', fontSize: 18, padding: '26px 24px 12px' }}>Upgrade</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 24px 8px' }}>
        {PLANS.map((p) => (
          <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--card)', border: `1.5px solid ${p.border}`, borderRadius: 20, padding: '16px 18px', boxShadow: 'var(--shadow)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</div>
                {p.tag && <div style={{ background: 'var(--goldsoft)', color: 'var(--gold)', fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 100 }}>{p.tag}</div>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 3 }}>{p.sub}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Marcellus,serif', fontSize: 19 }}>{p.price}</div>
              <div style={{ fontSize: 11, color: 'var(--sub)' }}>{p.per}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ margin: '14px 24px 40px', background: 'var(--sagesoft)', borderRadius: 20, padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Referral rewards</div>
          <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>Both of you earn a free class</div>
        </div>
        <div style={{ background: 'var(--sage)', color: '#fff', fontSize: 13, fontWeight: 600, padding: '9px 16px', borderRadius: 100 }}>Share</div>
      </div>
    </div>
  )
}
