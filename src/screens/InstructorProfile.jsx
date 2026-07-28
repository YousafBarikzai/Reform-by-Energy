import { useNavigate, useParams } from 'react-router-dom'
import { useApi } from '../api.js'
import { Card, ErrorState, PageSkeleton, SectionLabel, Tag, TopBar, availabilityTag, fmtTime, relDay } from '../ui.jsx'

export default function InstructorProfile() {
  const { id } = useParams()
  const nav = useNavigate()
  const { data, loading, error, refetch } = useApi(`/instructors/${id}`)
  if (loading) return <PageSkeleton />
  if (error) return <ErrorState error={error} retry={refetch} />
  const { instructor: i, upcoming, teaches } = data
  return (
    <div style={{ animation: 'plFade .3s' }}>
      <TopBar title="" />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 24px 0', textAlign: 'center' }}>
        <div style={{ padding: 4, borderRadius: '50%', background: 'linear-gradient(135deg,var(--pink),var(--pinksoft))' }}>
          <img src={i.photo} alt={i.name} style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', display: 'block', border: '3px solid var(--card)' }} />
        </div>
        <div style={{ fontFamily: 'Marcellus,serif', fontSize: 25, marginTop: 12 }}>{i.name}</div>
        <div style={{ fontSize: 11.5, color: 'var(--rose)', fontWeight: 700, marginTop: 4 }}>{i.quals}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 10 }}>
          {i.specialties.split('·').map((s) => <Tag key={s}>{s.trim()}</Tag>)}
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--sub)', lineHeight: 1.7, marginTop: 12 }}>{i.bio}</div>
      </div>

      {teaches.length > 0 && (
        <>
          <SectionLabel>Teaches</SectionLabel>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 24px 2px' }}>
            {teaches.map((t) => (
              <Card key={t.id} style={{ flex: '0 0 150px', overflow: 'hidden' }} onClick={() => nav('/schedule')}>
                <img src={t.image} alt="" style={{ width: '100%', height: 70, objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: '9px 12px 11px' }}>
                  <div style={{ fontWeight: 600, fontSize: 12.5 }}>{t.name}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--sub)', marginTop: 2 }}>{t.duration_min} min · {t.level}</div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {upcoming.length > 0 && (
        <>
          <SectionLabel>Upcoming classes</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 24px 10px' }}>
            {upcoming.map((s) => (
              <Card key={s.id} style={{ padding: '12px 15px', display: 'flex', alignItems: 'center', gap: 12 }} onClick={() => nav(`/class/${s.id}`)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{s.className}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--sub)', marginTop: 2 }}>{relDay(s.startsAt)} · {fmtTime(s.startsAt)} · {s.durationMin} min · {s.studio.name}</div>
                </div>
                {availabilityTag(s)}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
