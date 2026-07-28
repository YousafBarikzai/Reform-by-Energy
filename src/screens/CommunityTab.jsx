import { IMAGES, LEADERS, STORIES } from '../data.js'

export default function CommunityTab() {
  return (
    <div style={{ animation: 'plFade .3s' }}>
      <div style={{ padding: '22px 24px 4px', fontFamily: 'Marcellus,serif', fontSize: 30 }}>Community</div>
      <div style={{ margin: '16px 24px 0', position: 'relative', borderRadius: 24, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
        <img src={IMAGES.challenge} alt="May challenge" style={{ width: '100%', height: 170, objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(20,18,14,.05) 20%,rgba(20,18,14,.7))' }} />
        <div style={{ position: 'absolute', left: 20, bottom: 16, color: '#fff' }}>
          <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: '#E8DCC3' }}>July challenge</div>
          <div style={{ fontFamily: 'Marcellus,serif', fontSize: 22, marginTop: 2 }}>12 classes in 30 days</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 3 }}>184 members joined · you’re at 7</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '26px 24px 12px' }}>
        <div style={{ fontFamily: 'Marcellus,serif', fontSize: 20 }}>Leaderboard</div>
        <div style={{ fontSize: 13, color: 'var(--sub)' }}>This month</div>
      </div>
      <div style={{ margin: '0 24px', background: 'var(--card)', borderRadius: 22, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
        {LEADERS.map((l) => (
          <div key={l.rank} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px', borderBottom: '1px solid var(--line)' }}>
            <div style={{ width: 22, fontFamily: 'Marcellus,serif', fontSize: 16, color: l.rankColor }}>{l.rank}</div>
            <img src={l.avatar} alt={l.name} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} />
            <div style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{l.name}</div>
            <div style={{ fontSize: 13, color: 'var(--sub)' }}>{l.n} classes</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '26px 24px 12px' }}>
        <div style={{ fontFamily: 'Marcellus,serif', fontSize: 20 }}>Stories</div>
      </div>
      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', padding: '0 24px 8px' }}>
        {STORIES.map((st) => (
          <div key={st.title} style={{ flex: '0 0 240px', background: 'var(--card)', borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
            <img src={st.img} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
            <div style={{ padding: '14px 16px 16px' }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{st.title}</div>
              <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 4, lineHeight: 1.5 }}>{st.text}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ margin: '22px 24px 0', background: 'var(--card)', borderRadius: 22, padding: '18px 20px', boxShadow: 'var(--shadow)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--sub)' }}>Upcoming event</div>
          <div style={{ fontWeight: 600, fontSize: 15, marginTop: 4 }}>Sunrise rooftop session</div>
          <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>Sat 2 Aug · 7:00 AM</div>
        </div>
        <div style={{ background: 'var(--sagesoft)', color: 'var(--sage)', fontSize: 13, fontWeight: 600, padding: '9px 16px', borderRadius: 100 }}>RSVP</div>
      </div>
    </div>
  )
}
