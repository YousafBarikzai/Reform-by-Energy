import { DOWS, TIMES, dayNum } from '../data.js'

export default function Success({ app }) {
  const { state, sel, done } = app
  const confirmWhen = `${state.slot >= 0 ? TIMES[state.slot] : '6:30 PM'} · ${DOWS[state.day]} ${dayNum(state.day)} Jul`
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 40px', animation: 'plFade .3s' }}>
      <div style={{ width: 110, height: 110, borderRadius: '50%', background: 'var(--sagesoft)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'plPop .5s cubic-bezier(.2,.8,.2,1)' }}>
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <circle cx="30" cy="30" r="27" stroke="var(--sage)" strokeWidth="2.5" strokeDasharray="190" style={{ animation: 'plRing .8s ease-out forwards' }} />
          <path d="M19 31l7.5 7.5L41 23" stroke="var(--sage)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{ fontFamily: 'Marcellus,serif', fontSize: 28, marginTop: 26 }}>You’re booked</div>
      <div style={{ fontSize: 14, color: 'var(--sub)', marginTop: 8, lineHeight: 1.6 }}>{sel.name}<br />{confirmWhen} · Studio A</div>
      <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 16, background: 'var(--card)', borderRadius: 100, padding: '8px 16px', boxShadow: 'var(--shadow)' }}>Added to Apple Wallet · QR check-in ready</div>
      <div onClick={done} style={{ marginTop: 36, background: 'var(--ink)', color: 'var(--bg)', fontSize: 15, fontWeight: 600, padding: '15px 44px', borderRadius: 100, cursor: 'pointer' }}>Done</div>
    </div>
  )
}
