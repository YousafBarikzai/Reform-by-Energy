import { CLASSES, IMAGES } from '../data.js'

export default function HomeTab({ app }) {
  const { state, patch, open, memberName, showPromo } = app
  return (
    <div style={{ animation: 'plFade .3s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px 6px' }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--sub)', letterSpacing: '.08em', textTransform: 'uppercase' }}>Good morning</div>
          <div style={{ fontFamily: 'Marcellus,serif', fontSize: 30, lineHeight: 1.1, marginTop: 2 }}>{memberName}</div>
        </div>
        <img src={IMAGES.avatarAva} alt="You" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold)' }} />
      </div>

      <div onClick={() => open(0)} style={{ margin: '16px 24px 0', position: 'relative', borderRadius: 26, overflow: 'hidden', boxShadow: 'var(--shadow)', cursor: 'pointer' }}>
        <img src={IMAGES.heroReformer} alt="Reformer Pilates" style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(20,18,14,0) 30%,rgba(20,18,14,.72) 100%)' }} />
        <div style={{ position: 'absolute', left: 20, right: 20, bottom: 18, color: '#fff' }}>
          <div style={{ fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', color: '#E8DCC3' }}>Today · 6:30 PM</div>
          <div style={{ fontFamily: 'Marcellus,serif', fontSize: 26, marginTop: 4 }}>Reformer Pilates</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 13, color: 'rgba(255,255,255,.85)' }}>
            <span>Mara Ellison</span><span style={{ opacity: 0.5 }}>·</span><span>50 min</span><span style={{ opacity: 0.5 }}>·</span><span>Studio A</span>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 16, left: 20, background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.35)', color: '#fff', fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 100 }}>Booked</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '28px 24px 12px' }}>
        <div style={{ fontFamily: 'Marcellus,serif', fontSize: 20 }}>Popular this week</div>
        <div onClick={() => patch({ tab: 'classes' })} style={{ fontSize: 13, fontWeight: 600, color: 'var(--sage)', cursor: 'pointer' }}>See all</div>
      </div>
      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', padding: '2px 24px 8px' }}>
        {CLASSES.slice(0, 5).map((c, i) => (
          <div key={c.name} onClick={() => open(i)} style={{ flex: '0 0 168px', background: 'var(--card)', borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--shadow)', cursor: 'pointer' }}>
            <img src={c.img} alt={c.name} style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }} />
            <div style={{ padding: '12px 14px 14px' }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 3 }}>{c.dur} min · {c.level}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ margin: '24px 24px 0', background: 'var(--card)', borderRadius: 22, padding: '18px 20px', boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--sub)' }}>Continue programme</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold)' }}>Week 3 of 6</div>
        </div>
        <div style={{ fontFamily: 'Marcellus,serif', fontSize: 19, marginTop: 8 }}>Foundations of Reformer</div>
        <div style={{ height: 6, background: 'var(--stone)', borderRadius: 100, marginTop: 14, overflow: 'hidden' }}>
          <div style={{ width: '46%', height: '100%', background: 'linear-gradient(90deg,var(--sage),var(--gold))', borderRadius: 100 }} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 8 }}>7 of 15 sessions complete</div>
      </div>

      <div onClick={() => patch({ view: 'instructor' })} style={{ margin: '16px 24px 0', display: 'flex', gap: 14, alignItems: 'center', background: 'var(--sagesoft)', borderRadius: 22, padding: 16, cursor: 'pointer' }}>
        <img src={IMAGES.maraFeatured} alt="Mara Ellison" style={{ width: 58, height: 58, borderRadius: '50%', objectFit: 'cover' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--sage)', fontWeight: 600 }}>Featured instructor</div>
          <div style={{ fontWeight: 600, fontSize: 16, marginTop: 2 }}>Mara Ellison</div>
          <div style={{ fontSize: 12, color: 'var(--sub)' }}>Reformer · 12 yrs experience</div>
        </div>
        <div style={{ color: 'var(--sage)', fontSize: 20 }}>›</div>
      </div>

      <div style={{ margin: '16px 24px 0', background: 'linear-gradient(135deg,var(--goldsoft),var(--card))', border: '1px solid var(--line)', borderRadius: 22, padding: '22px 22px 20px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Marcellus,serif', fontSize: 18, lineHeight: 1.5, color: 'var(--ink)' }}>“Movement is a conversation between body and breath.”</div>
        <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 8, letterSpacing: '.08em', textTransform: 'uppercase' }}>Daily intention</div>
      </div>

      {showPromo && (
        <div style={{ margin: '16px 24px 0', background: 'var(--ink)', color: 'var(--bg)', borderRadius: 22, padding: '20px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'Marcellus,serif', fontSize: 18 }}>Bring a friend</div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 3 }}>Gift a class · earn 1 credit</div>
          </div>
          <div style={{ background: 'var(--gold)', color: '#fff', fontSize: 13, fontWeight: 600, padding: '9px 16px', borderRadius: 100 }}>Invite</div>
        </div>
      )}
    </div>
  )
}
