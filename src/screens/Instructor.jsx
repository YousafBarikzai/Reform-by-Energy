import { CLASSES, IMAGES } from '../data.js'

export default function Instructor({ app }) {
  const { state, patch, vibrate, open, back } = app
  const maraClasses = CLASSES.map((c, i) => ({ ...c, i })).filter((c) => c.coach === 'Mara Ellison')
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', animation: 'plUp .35s cubic-bezier(.2,.8,.2,1)', overflowY: 'auto' }}>
      <div style={{ position: 'relative' }}>
        <img src={IMAGES.instructorHero} alt="Mara Ellison" style={{ width: '100%', height: 320, objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(20,18,14,.2),rgba(20,18,14,0) 35%)' }} />
        <div onClick={back} style={{ position: 'absolute', top: 14, left: 18, width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,.28)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.4)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer' }}>‹</div>
      </div>
      <div style={{ padding: '22px 24px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'Marcellus,serif', fontSize: 28 }}>Mara Ellison</div>
            <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 2 }}>Lead Reformer Instructor · 12 years</div>
          </div>
          <div onClick={() => { vibrate(10); patch({ favMara: !state.favMara }) }} style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--card)', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, cursor: 'pointer', color: state.favMara ? 'var(--gold)' : 'var(--sub)' }}>♥</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
          <div style={{ background: 'var(--sagesoft)', color: 'var(--sage)', fontSize: 12, fontWeight: 600, padding: '7px 13px', borderRadius: 100 }}>Reformer</div>
          <div style={{ background: 'var(--sagesoft)', color: 'var(--sage)', fontSize: 12, fontWeight: 600, padding: '7px 13px', borderRadius: 100 }}>Prenatal</div>
          <div style={{ background: 'var(--sagesoft)', color: 'var(--sage)', fontSize: 12, fontWeight: 600, padding: '7px 13px', borderRadius: 100 }}>Rehabilitation</div>
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--sub)', marginTop: 16 }}>Trained at Polestar London, Mara blends classical technique with breath-led sequencing. Her sessions are precise, calm, and quietly demanding.</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <div style={{ flex: 1, background: 'var(--card)', borderRadius: 16, padding: '14px 0', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
            <div style={{ fontFamily: 'Marcellus,serif', fontSize: 20, color: 'var(--sage)' }}>4.9</div>
            <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 2 }}>318 reviews</div>
          </div>
          <div style={{ flex: 1, background: 'var(--card)', borderRadius: 16, padding: '14px 0', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
            <div style={{ fontFamily: 'Marcellus,serif', fontSize: 20, color: 'var(--sage)' }}>NCPT</div>
            <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 2 }}>Certified</div>
          </div>
          <div style={{ flex: 1, background: 'var(--card)', borderRadius: 16, padding: '14px 0', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
            <div style={{ fontFamily: 'Marcellus,serif', fontSize: 20, color: 'var(--sage)' }}>12</div>
            <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 2 }}>Classes / wk</div>
          </div>
        </div>
        <div style={{ fontFamily: 'Marcellus,serif', fontSize: 18, marginTop: 26 }}>Teaches</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
          {maraClasses.map((mc) => (
            <div key={mc.name} onClick={() => open(mc.i)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--card)', borderRadius: 18, padding: '12px 14px', boxShadow: 'var(--shadow)', cursor: 'pointer' }}>
              <img src={mc.img} alt="" style={{ width: 46, height: 46, borderRadius: 12, objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{mc.name}</div>
                <div style={{ fontSize: 12, color: 'var(--sub)' }}>{mc.dur} min · {mc.level}</div>
              </div>
              <div style={{ color: 'var(--sub)' }}>›</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
