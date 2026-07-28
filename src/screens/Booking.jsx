import { DOWS, SLOT_NOTES, TIMES, dayNum } from '../data.js'
import DayPicker from '../components/DayPicker.jsx'

export default function Booking({ app }) {
  const { state, patch, vibrate, sel, back } = app
  const hasSlot = state.slot >= 0
  const confirmWhen = `${hasSlot ? TIMES[state.slot] : '6:30 PM'} · ${DOWS[state.day]} ${dayNum(state.day)} Jul`
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', animation: 'plUp .35s cubic-bezier(.2,.8,.2,1)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 24px 0' }}>
        <div onClick={back} style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--card)', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer' }}>‹</div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--sub)' }}>Step 2 of 3</div>
          <div style={{ fontFamily: 'Marcellus,serif', fontSize: 20 }}>Choose a time</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 120 }}>
        <div style={{ padding: '20px 24px 4px', fontWeight: 600, fontSize: 14 }}>{sel.name}</div>
        <DayPicker app={app} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '16px 24px' }}>
          {TIMES.map((t, i) => {
            const on = state.slot === i
            return (
              <div
                key={t}
                onClick={() => { vibrate(5); patch({ slot: i }) }}
                style={{ textAlign: 'center', padding: '15px 0', borderRadius: 18, cursor: 'pointer', background: on ? 'var(--ink)' : 'var(--card)', color: on ? 'var(--bg)' : 'var(--ink)', border: `1px solid ${on ? 'var(--ink)' : 'var(--line)'}`, boxShadow: on ? '0 8px 20px rgba(42,39,33,.25)' : 'none', transition: 'all .25s' }}
              >
                <div style={{ fontWeight: 600, fontSize: 15 }}>{t}</div>
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{SLOT_NOTES[i]}</div>
              </div>
            )
          })}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 24, right: 24, bottom: 24 }}>
        <div
          onClick={() => { if (hasSlot) { vibrate(5); patch({ sheet: true }) } }}
          style={{ textAlign: 'center', fontSize: 16, fontWeight: 600, padding: '17px 0', borderRadius: 100, transition: 'all .3s', cursor: 'pointer', background: hasSlot ? 'var(--ink)' : 'var(--stone)', color: hasSlot ? 'var(--bg)' : 'var(--sub)', boxShadow: hasSlot ? '0 10px 30px rgba(42,39,33,.3)' : 'none' }}
        >Continue</div>
      </div>
      {state.sheet && (
        <>
          <div onClick={() => patch({ sheet: false })} style={{ position: 'absolute', inset: 0, background: 'rgba(20,18,14,.45)', animation: 'plFade .25s' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: 'var(--card)', borderRadius: '32px 32px 0 0', padding: '14px 24px 30px', animation: 'plSheet .35s cubic-bezier(.2,.8,.2,1)', boxShadow: '0 -10px 40px rgba(0,0,0,.15)' }}>
            <div style={{ width: 40, height: 4, borderRadius: 100, background: 'var(--line)', margin: '0 auto 18px' }} />
            <div style={{ fontSize: 12, color: 'var(--sub)' }}>Step 3 of 3</div>
            <div style={{ fontFamily: 'Marcellus,serif', fontSize: 22, marginTop: 2 }}>Confirm booking</div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 18, background: 'var(--bg)', borderRadius: 18, padding: 14 }}>
              <img src={sel.img} alt="" style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{sel.name}</div>
                <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>{confirmWhen} · {sel.coach}</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '16px 4px 0', color: 'var(--sub)' }}>
              <span>1 studio credit</span><span style={{ color: 'var(--ink)', fontWeight: 600 }}>{state.credits} → {state.credits - 1}</span>
            </div>
            <div
              className="press"
              onClick={() => { vibrate([15, 30, 15]); patch({ view: 'success', sheet: false, credits: state.credits - 1, booked: { ...state.booked, [state.sel]: true } }) }}
              style={{ marginTop: 18, background: 'var(--sage)', color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: 600, padding: '17px 0', borderRadius: 100, cursor: 'pointer' }}
            >Confirm · Apple Pay ready</div>
          </div>
        </>
      )}
    </div>
  )
}
