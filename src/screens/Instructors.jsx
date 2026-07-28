import { useNavigate } from 'react-router-dom'
import { useApi } from '../api.js'
import { Card, ErrorState, PageSkeleton, Tag } from '../ui.jsx'

export default function Instructors() {
  const nav = useNavigate()
  const { data, loading, error, refetch } = useApi('/instructors')
  if (loading) return <PageSkeleton />
  if (error) return <ErrorState error={error} retry={refetch} />
  return (
    <div style={{ animation: 'plFade .3s' }}>
      <div style={{ fontFamily: 'Marcellus,serif', fontSize: 30, padding: '22px 24px 4px' }}>Instructors</div>
      <div style={{ fontSize: 13, color: 'var(--sub)', padding: '0 24px', lineHeight: 1.6 }}>
        Small classes mean every instructor knows your name, your goals, and your tight left hip.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '18px 24px 10px' }}>
        {data.instructors.map((i) => (
          <Card key={i.id} style={{ padding: 16, display: 'flex', gap: 15 }} onClick={() => nav(`/instructors/${i.id}`)}>
            <img src={i.photo} alt={i.name} style={{ width: 76, height: 76, borderRadius: 22, objectFit: 'cover', flexShrink: 0 }} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontFamily: 'Marcellus,serif', fontSize: 18 }}>{i.name}</div>
              <div style={{ fontSize: 11, color: 'var(--rose)', fontWeight: 700, letterSpacing: '.04em', marginTop: 2 }}>{i.quals}</div>
              <div style={{ fontSize: 12.5, color: 'var(--sub)', lineHeight: 1.55, marginTop: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{i.bio}</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 8 }}>
                {i.teaches.slice(0, 3).map((t) => <Tag key={t.id} tone="grey">{t.name}</Tag>)}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
