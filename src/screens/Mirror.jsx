import { useNavigate } from 'react-router-dom'
import { useApi } from '../api.js'
import { ICONS } from '../data.js'
import Icon from '../components/Icon.jsx'
import { Monogram } from '../components/Logo.jsx'
import { Card, ErrorState, PageSkeleton, Ring, SectionLabel, Sparkline, TopBar, fmtDate } from '../ui.jsx'

export default function Mirror() {
  const nav = useNavigate()
  const { data, loading, error, refetch } = useApi('/mirror')
  if (loading) return <PageSkeleton />
  if (error) return <ErrorState error={error} retry={refetch} />
  const d = data

  return (
    <div style={{ animation: 'plFade .3s' }}>
      <TopBar title="Reform Mirror" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 24px 0', fontSize: 11.5, color: 'var(--sub)' }}>
        <Icon d={ICONS.shield} size={13} color="var(--rose)" /> Your private wellness journal — only you can see this.
      </div>

      {/* quote of the day (managed content library) */}
      {d.quote && (
        <Card style={{ margin: '16px 24px 0', padding: '22px 22px 18px', background: 'linear-gradient(135deg,var(--pinksoft),var(--card))', textAlign: 'center' }}>
          <Monogram size={30} color="var(--pink)" />
          <div style={{ fontFamily: 'Marcellus,serif', fontSize: 17.5, lineHeight: 1.55, marginTop: 8 }}>“{d.quote.text}”</div>
          <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 8, letterSpacing: '.08em', textTransform: 'uppercase' }}>{d.quote.author}</div>
        </Card>
      )}

      {/* week & month summary */}
      <div style={{ display: 'flex', gap: 12, margin: '14px 24px 0' }}>
        <Card style={{ flex: 1, padding: '15px 17px' }}>
          <div style={{ fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--sub)', fontWeight: 600 }}>This week</div>
          <div style={{ fontFamily: 'Marcellus,serif', fontSize: 26, color: 'var(--rose)', marginTop: 4 }}>{d.week.classes}</div>
          <div style={{ fontSize: 11.5, color: 'var(--sub)' }}>classes · {d.week.minutes} min</div>
        </Card>
        <Card style={{ flex: 1, padding: '15px 17px' }}>
          <div style={{ fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--sub)', fontWeight: 600 }}>This month</div>
          <div style={{ fontFamily: 'Marcellus,serif', fontSize: 26, color: 'var(--rose)', marginTop: 4 }}>{d.month.classes}</div>
          <div style={{ fontSize: 11.5, color: 'var(--sub)' }}>classes · {d.month.minutes} min</div>
        </Card>
        <Card style={{ flex: 1, padding: '15px 17px' }}>
          <div style={{ fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--sub)', fontWeight: 600 }}>Streak</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
            <Icon d={ICONS.flame} size={18} color="var(--rose)" />
            <div style={{ fontFamily: 'Marcellus,serif', fontSize: 26, color: 'var(--rose)' }}>{d.streak.current}</div>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--sub)' }}>weeks</div>
        </Card>
      </div>

      {/* milestone ring */}
      <Card style={{ margin: '12px 24px 0', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 18 }} onClick={() => nav('/profile/progress')}>
        <Ring pct={((d.nextMilestone.at - d.nextMilestone.toGo) / d.nextMilestone.at) * 100} size={70} stroke={7}>
          <text x="35" y="40" textAnchor="middle" fontSize="15" fontWeight="600" fill="var(--ink)" fontFamily="Marcellus,serif">{d.totalClasses}</text>
        </Ring>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14.5 }}>Next milestone · {d.nextMilestone.at} classes</div>
          <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 3 }}>{d.nextMilestone.toGo} to go. Every visit counts.</div>
        </div>
      </Card>

      {/* wellness trend */}
      {d.wellness.length > 1 && (
        <>
          <SectionLabel right={<div onClick={() => nav('/profile/wellness')} style={{ fontSize: 11, fontWeight: 600, color: 'var(--sub)', cursor: 'pointer' }}>CHECK IN</div>}>Wellness this week</SectionLabel>
          <Card style={{ margin: '0 24px', padding: '14px 16px 8px' }} onClick={() => nav('/profile/wellness')}>
            <Sparkline values={d.wellness.slice().reverse().map((w) => w.score)} height={52} />
          </Card>
        </>
      )}

      {/* goals */}
      {d.goals.length > 0 && (
        <>
          <SectionLabel right={<div onClick={() => nav('/profile/journey')} style={{ fontSize: 11, fontWeight: 600, color: 'var(--sub)', cursor: 'pointer' }}>MANAGE</div>}>Current goals</SectionLabel>
          <Card style={{ margin: '0 24px', overflow: 'hidden' }} onClick={() => nav('/profile/journey')}>
            {d.goals.map((g, i) => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 18px', borderBottom: i === d.goals.length - 1 ? 'none' : '1px solid var(--line)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--rose)', flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 13.5 }}>{g.title}</div>
                {g.target_date && <div style={{ fontSize: 11, color: 'var(--sub)' }}>{fmtDate(g.target_date)}</div>}
              </div>
            ))}
          </Card>
        </>
      )}

      {/* challenges snapshot */}
      {d.challenges.length > 0 && (
        <>
          <SectionLabel right={<div onClick={() => nav('/profile/challenges')} style={{ fontSize: 11, fontWeight: 600, color: 'var(--sub)', cursor: 'pointer' }}>VIEW ALL</div>}>Challenges</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 24px' }}>
            {d.challenges.map((c) => (
              <Card key={c.id} style={{ padding: '13px 17px' }} onClick={() => nav('/profile/challenges')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
                  <span>{c.title}</span><span style={{ color: 'var(--rose)' }}>{c.progress}/{c.goal}</span>
                </div>
                <div style={{ height: 6, background: 'var(--blush)', borderRadius: 100, marginTop: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (c.progress / c.goal) * 100)}%`, height: '100%', background: 'linear-gradient(90deg,var(--pink),var(--rose))', borderRadius: 100 }} />
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* badges + rewards + favourites */}
      <div style={{ display: 'flex', gap: 12, margin: '22px 24px 0' }}>
        <Card style={{ flex: 1, padding: '14px 16px' }} onClick={() => nav('/profile/rewards')}>
          <div style={{ fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--sub)', fontWeight: 600 }}>{d.tier} tier</div>
          <div style={{ fontFamily: 'Marcellus,serif', fontSize: 24, color: 'var(--rose)', marginTop: 4 }}>{d.points}</div>
          <div style={{ fontSize: 11.5, color: 'var(--sub)' }}>reward points</div>
        </Card>
        <Card style={{ flex: 1.4, padding: '14px 16px' }} onClick={() => nav('/profile/progress')}>
          <div style={{ fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--sub)', fontWeight: 600 }}>Latest badges</div>
          <div style={{ display: 'flex', gap: 7, marginTop: 8 }}>
            {d.badges.map((b) => (
              <div key={b.id} title={b.name} style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--pinksoft)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{b.icon}</div>
            ))}
          </div>
        </Card>
      </div>

      {/* favourite classes */}
      {d.favouriteClasses.length > 0 && (
        <>
          <SectionLabel>Your classes</SectionLabel>
          <Card style={{ margin: '0 24px', overflow: 'hidden' }}>
            {d.favouriteClasses.map((f, i) => (
              <div key={f.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 18px', borderBottom: i === d.favouriteClasses.length - 1 ? 'none' : '1px solid var(--line)', fontSize: 13 }}>
                <span style={{ fontWeight: 600 }}>{f.name}</span>
                <span style={{ color: 'var(--sub)' }}>{f.n} classes</span>
              </div>
            ))}
          </Card>
        </>
      )}

      {/* photos + measurements snapshot */}
      {(d.photos.length > 0 || d.measurements.length > 0) && (
        <>
          <SectionLabel right={<div onClick={() => nav('/profile/journey')} style={{ fontSize: 11, fontWeight: 600, color: 'var(--sub)', cursor: 'pointer' }}>JOURNEY</div>}>Transformation</SectionLabel>
          <div style={{ display: 'flex', gap: 10, padding: '0 24px' }}>
            {d.photos.map((p) => (
              <img key={p.id} src={p.url} alt="" style={{ width: 88, height: 110, borderRadius: 14, objectFit: 'cover', boxShadow: 'var(--shadow)' }} />
            ))}
            {d.measurements[0] && (
              <Card style={{ flex: 1, padding: '12px 15px' }} onClick={() => nav('/profile/journey')}>
                <div style={{ fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--sub)', fontWeight: 600 }}>Latest measurements</div>
                <div style={{ fontSize: 12.5, color: 'var(--sub)', marginTop: 6, lineHeight: 1.7 }}>
                  {d.measurements[0].weight_kg && <>Weight <b style={{ color: 'var(--ink)' }}>{d.measurements[0].weight_kg} kg</b><br /></>}
                  {d.measurements[0].waist_cm && <>Waist <b style={{ color: 'var(--ink)' }}>{d.measurements[0].waist_cm} cm</b><br /></>}
                  <span style={{ fontSize: 10.5 }}>{fmtDate(d.measurements[0].date)}</span>
                </div>
              </Card>
            )}
          </div>
        </>
      )}

      {/* recent class notes */}
      {d.recentNotes.length > 0 && (
        <>
          <SectionLabel>Recent notes</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 24px 12px' }}>
            {d.recentNotes.map((n, i) => (
              <Card key={i} style={{ padding: '13px 17px' }}>
                <div style={{ fontSize: 13, fontStyle: 'italic', lineHeight: 1.55 }}>“{n.notes}”</div>
                <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 6 }}>{n.name} · {fmtDate(n.starts_at)}{n.rating ? ` · ${'★'.repeat(n.rating)}` : ''}</div>
              </Card>
            ))}
          </div>
        </>
      )}
      <div style={{ height: 10 }} />
    </div>
  )
}
