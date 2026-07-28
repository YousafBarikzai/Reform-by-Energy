export default function ClassDetail({ app }) {
  const { state, patch, vibrate, sel, back } = app
  const fav = !!state.fav[state.sel]
  const meta = [
    { k: 'Duration', v: `${sel.dur} min` },
    { k: 'Burn', v: `${sel.cal} kcal` },
    { k: 'Level', v: sel.level.split(' ')[0] },
  ]
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', animation: 'plUp .35s cubic-bezier(.2,.8,.2,1)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 110 }}>
        <div style={{ position: 'relative' }}>
          <img src={sel.img} alt={sel.name} style={{ width: '100%', height: 300, objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(20,18,14,.25),rgba(20,18,14,0) 40%)' }} />
          <div onClick={back} style={{ position: 'absolute', top: 14, left: 18, width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,.28)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.4)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer' }}>‹</div>
          <div onClick={() => { vibrate(10); patch({ fav: { ...state.fav, [state.sel]: !fav } }) }} style={{ position: 'absolute', top: 14, right: 18, width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,.28)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, cursor: 'pointer', color: fav ? 'var(--gold)' : '#fff' }}>♥</div>
        </div>
        <div style={{ padding: '22px 24px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontFamily: 'Marcellus,serif', fontSize: 28, lineHeight: 1.15 }}>{sel.name}</div>
            <div style={{ background: 'var(--goldsoft)', color: 'var(--gold)', fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 100, whiteSpace: 'nowrap', marginTop: 4 }}>{sel.level}</div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            {meta.map((m) => (
              <div key={m.k} style={{ flex: 1, background: 'var(--card)', borderRadius: 16, padding: '12px 0', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{m.v}</div>
                <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 2 }}>{m.k}</div>
              </div>
            ))}
          </div>
          <div onClick={() => patch({ view: 'instructor' })} style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18, background: 'var(--card)', borderRadius: 18, padding: '12px 14px', boxShadow: 'var(--shadow)', cursor: 'pointer' }}>
            <img src={sel.a} alt={sel.coach} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{sel.coach}</div>
              <div style={{ fontSize: 12, color: 'var(--sub)' }}>View profile</div>
            </div>
            <div style={{ color: 'var(--sub)' }}>›</div>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--sub)', marginTop: 18 }}>{sel.desc}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
            <div style={{ background: 'var(--sagesoft)', color: 'var(--sage)', fontSize: 12, fontWeight: 600, padding: '7px 13px', borderRadius: 100 }}>{sel.equip}</div>
            <div style={{ background: 'var(--sagesoft)', color: 'var(--sage)', fontSize: 12, fontWeight: 600, padding: '7px 13px', borderRadius: 100 }}>Grip socks</div>
            <div style={{ background: 'var(--sagesoft)', color: 'var(--sage)', fontSize: 12, fontWeight: 600, padding: '7px 13px', borderRadius: 100 }}>{sel.spots} spots left</div>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 24, right: 24, bottom: 24 }}>
        <div className="press" onClick={() => patch({ view: 'booking', sheet: false, slot: -1 })} style={{ background: 'var(--ink)', color: 'var(--bg)', textAlign: 'center', fontSize: 16, fontWeight: 600, padding: '17px 0', borderRadius: 100, cursor: 'pointer', boxShadow: '0 10px 30px rgba(42,39,33,.3)' }}>Book class</div>
      </div>
    </div>
  )
}
