import { useNavigate } from 'react-router-dom'
import { useApi } from '../api.js'
import { useAuth } from '../auth.jsx'
import { ICONS } from '../data.js'
import Icon from '../components/Icon.jsx'
import { Monogram } from '../components/Logo.jsx'
import { Btn, Card, ErrorState, PageSkeleton, Ring, SectionLabel, Tag, availabilityTag, fmtTime, relDay, vibrate } from '../ui.jsx'

export default function Home() {
  const nav = useNavigate()
  const { member } = useAuth()
  const { data, loading, error, refetch } = useApi('/dashboard')
  if (loading) return <PageSkeleton />
  if (error) return <ErrorState error={error} retry={refetch} />
  const d = data

  const actions = [
    { icon: ICONS.booking, name: 'Book Class', go: () => nav('/schedule') },
    { icon: ICONS.calendar, name: 'Schedule', go: () => nav('/schedule') },
    { icon: ICONS.tag, name: 'Packages', go: () => nav('/packages') },
    { icon: ICONS.play, name: 'Library', go: () => nav('/library') },
  ]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning,' : hour < 18 ? 'Good afternoon,' : 'Good evening,'

  return (
    <div style={{ animation: 'plFade .3s' }}>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 0' }}>
        <Monogram size={34} />
      </div>

      {/* greeting + notifications */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 24px 0' }}>
        <div>
          <div style={{ fontSize: 15, color: 'var(--sub)' }}>{greeting}</div>
          <div style={{ fontFamily: 'Marcellus,serif', fontSize: 32, lineHeight: 1.1, color: 'var(--rose)', marginTop: 2 }}>{d.member.firstName} <span style={{ fontSize: 22 }}>♡</span></div>
        </div>
        <div className="press" onClick={() => nav('/notifications')} style={{ position: 'relative', width: 44, height: 44, borderRadius: '50%', background: 'var(--card)', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon d={ICONS.bell} size={20} />
          {d.unreadNotifications > 0 && (
            <div style={{ position: 'absolute', top: 8, right: 9, minWidth: 16, height: 16, borderRadius: 100, background: 'var(--rose)', color: '#fff', fontSize: 9.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{d.unreadNotifications}</div>
          )}
        </div>
      </div>

      {/* next class */}
      <SectionLabel>Your next class</SectionLabel>
      {d.nextClass ? (
        <Card style={{ margin: '0 24px', padding: 14, display: 'flex', gap: 14 }} onClick={() => nav(`/class/${d.nextClass.id}`)}>
          <img src={d.nextClass.image} alt="" style={{ width: 106, borderRadius: 18, objectFit: 'cover' }} />
          <div style={{ flex: 1, padding: '2px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 17 }}>{d.nextClass.className}</div>
              <Tag>Booked</Tag>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8, fontSize: 12, color: 'var(--sub)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Icon d={ICONS.clock} size={13} color="var(--rose)" /> {relDay(d.nextClass.startsAt)}, {fmtTime(d.nextClass.startsAt)}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Icon d={ICONS.pin} size={13} color="var(--rose)" /> {d.nextClass.studio.name}{d.nextClass.myReformer ? ` · Reformer ${d.nextClass.myReformer}` : ''}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Icon d={ICONS.user} size={13} color="var(--rose)" /> {d.nextClass.instructor.name}</div>
            </div>
            <div style={{ marginTop: 10, display: 'inline-block', background: 'var(--rose)', color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '.08em', padding: '8px 16px', borderRadius: 100 }}>VIEW DETAILS</div>
          </div>
        </Card>
      ) : (
        <Card style={{ margin: '0 24px', padding: '22px 20px', display: 'flex', alignItems: 'center', gap: 14 }} onClick={() => nav('/schedule')}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--pinksoft)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon d={ICONS.calendar} size={19} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Nothing booked yet</div>
            <div style={{ fontSize: 12.5, color: 'var(--sub)', marginTop: 2 }}>Browse this week's classes and reserve your reformer.</div>
          </div>
          <Btn small>BOOK</Btn>
        </Card>
      )}

      {/* weekly progress + streak */}
      <div style={{ display: 'flex', gap: 12, margin: '14px 24px 0' }}>
        <Card style={{ flex: 1.4, padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => nav('/profile/progress')}>
          <div>
            <div style={{ fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--sub)', fontWeight: 600 }}>Weekly progress</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginTop: 6 }}>
              <div style={{ fontFamily: 'Marcellus,serif', fontSize: 32, lineHeight: 1 }}>{d.weekly.attended}</div>
              <div style={{ fontSize: 11.5, color: 'var(--sub)' }}>of {d.weekly.goal} classes</div>
            </div>
          </div>
          <Ring pct={(d.weekly.attended / d.weekly.goal) * 100} size={62} stroke={6}>
            <text x="31" y="35.5" textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--ink)" fontFamily="'Albert Sans',sans-serif">{Math.round((d.weekly.attended / d.weekly.goal) * 100)}%</text>
          </Ring>
        </Card>
        <Card style={{ flex: 1, padding: '16px 18px' }} onClick={() => nav('/profile/progress')}>
          <div style={{ fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--sub)', fontWeight: 600 }}>Streak</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 6 }}>
            <Icon d={ICONS.flame} size={22} color="var(--rose)" />
            <div style={{ fontFamily: 'Marcellus,serif', fontSize: 32, lineHeight: 1 }}>{d.streak.current}</div>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--sub)', marginTop: 3 }}>week{d.streak.current === 1 ? '' : 's'} in a row</div>
        </Card>
      </div>

      {/* package + rewards strip */}
      <div style={{ display: 'flex', gap: 12, margin: '12px 24px 0' }}>
        <Card style={{ flex: 1, padding: '14px 16px' }} onClick={() => nav('/packages')}>
          <div style={{ fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--sub)', fontWeight: 600 }}>{d.package ? d.package.name : 'No package'}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 5 }}>
            <div style={{ fontFamily: 'Marcellus,serif', fontSize: 24, color: 'var(--rose)' }}>{d.package ? (d.package.unlimited ? '∞' : d.package.creditsLeft) : '—'}</div>
            <div style={{ fontSize: 11.5, color: 'var(--sub)' }}>{d.package ? 'classes left' : 'buy a pack'}</div>
          </div>
        </Card>
        <Card style={{ flex: 1, padding: '14px 16px' }} onClick={() => nav('/profile/rewards')}>
          <div style={{ fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--sub)', fontWeight: 600 }}>{d.tier} tier</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 5 }}>
            <div style={{ fontFamily: 'Marcellus,serif', fontSize: 24, color: 'var(--rose)' }}>{d.points}</div>
            <div style={{ fontSize: 11.5, color: 'var(--sub)' }}>points</div>
          </div>
        </Card>
      </div>

      {/* quick actions */}
      <SectionLabel>Quick actions</SectionLabel>
      <div style={{ display: 'flex', gap: 10, padding: '0 24px' }}>
        {actions.map((a) => (
          <div key={a.name} className="press" onClick={() => { vibrate(5); a.go() }} style={{ flex: 1, background: 'var(--card)', borderRadius: 18, padding: '14px 4px 12px', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--pinksoft)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon d={a.icon} size={17} />
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, textAlign: 'center' }}>{a.name}</div>
          </div>
        ))}
      </div>

      {/* recommended (rule-based) */}
      {d.recommended.length > 0 && (
        <>
          <SectionLabel right={<div onClick={() => nav('/schedule')} style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.08em', color: 'var(--sub)', cursor: 'pointer' }}>VIEW ALL</div>}>Recommended for you</SectionLabel>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 24px 6px' }}>
            {d.recommended.map((s) => (
              <Card key={s.id} style={{ flex: '0 0 210px', overflow: 'hidden' }} onClick={() => nav(`/class/${s.id}`)}>
                <div style={{ position: 'relative' }}>
                  <img src={s.image} alt="" style={{ width: '100%', height: 96, objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', top: 8, left: 8 }}>{availabilityTag(s)}</div>
                </div>
                <div style={{ padding: '10px 14px 13px' }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{s.className}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--sub)', marginTop: 2 }}>{relDay(s.startsAt)} · {fmtTime(s.startsAt)} · {s.instructor.name.split(' ')[0]}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--rose)', fontWeight: 600, marginTop: 6 }}>✦ {s.reason}</div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* upcoming bookings */}
      {d.upcoming.length > 0 && (
        <>
          <SectionLabel>Also booked</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 24px' }}>
            {d.upcoming.map((s) => (
              <Card key={s.id} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }} onClick={() => nav(`/class/${s.id}`)}>
                <img src={s.instructor.photo} alt="" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{s.className}</div>
                  <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>{relDay(s.startsAt)}, {fmtTime(s.startsAt)} · {s.instructor.name.split(' ')[0]}</div>
                </div>
                <Tag>Booked</Tag>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* active challenges */}
      {d.challenges.length > 0 && (
        <>
          <SectionLabel right={<div onClick={() => nav('/profile/challenges')} style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.08em', color: 'var(--sub)', cursor: 'pointer' }}>VIEW ALL</div>}>Active challenges</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 24px' }}>
            {d.challenges.map((c) => (
              <Card key={c.id} style={{ padding: '14px 18px' }} onClick={() => nav('/profile/challenges')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{c.title}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--rose)' }}>{c.completedAt ? 'Complete ✓' : `${c.progress}/${c.goal}`}</div>
                </div>
                <div style={{ height: 6, background: 'var(--blush)', borderRadius: 100, marginTop: 10, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (c.progress / c.goal) * 100)}%`, height: '100%', background: 'linear-gradient(90deg,var(--pink),var(--rose))', borderRadius: 100, transition: 'width .6s' }} />
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* favourite instructor + achievements */}
      {d.favourite.instructor && (
        <Card style={{ margin: '22px 24px 0', padding: 14, display: 'flex', gap: 13, alignItems: 'center', background: 'var(--pinksoft)', boxShadow: 'none' }}>
          <img src={d.favourite.instructor.photo} alt="" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--rose)', fontWeight: 700 }}>Favourite instructor</div>
            <div style={{ fontWeight: 600, fontSize: 15, marginTop: 2 }}>{d.favourite.instructor.name}</div>
            <div style={{ fontSize: 11.5, color: 'var(--sub)' }}>{d.favourite.instructor.n} classes together</div>
          </div>
          {d.badges[0] && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--card)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, margin: '0 auto' }}>{d.badges[0].icon}</div>
              <div style={{ fontSize: 9.5, fontWeight: 600, color: 'var(--sub)', marginTop: 4, maxWidth: 64 }}>{d.badges[0].name}</div>
            </div>
          )}
        </Card>
      )}

      {/* announcements */}
      {d.announcements.length > 0 && (
        <>
          <SectionLabel>Studio news</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 24px 8px' }}>
            {d.announcements.map((a) => (
              <Card key={a.id} style={{ padding: '15px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {a.pinned ? <Tag>Pinned</Tag> : null}
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{a.title}</div>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--sub)', lineHeight: 1.55, marginTop: 5 }}>{a.body}</div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
