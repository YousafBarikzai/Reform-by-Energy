import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, useApi } from '../api.js'
import { ICONS } from '../data.js'
import Icon from '../components/Icon.jsx'
import { Card, EmptyState, ErrorState, PageSkeleton, TopBar } from '../ui.jsx'

const KIND_ICON = {
  reminder: ICONS.clock, booking: ICONS.calendar, waitlist: ICONS.user, rewards: ICONS.sparkle,
  challenge: ICONS.flame, announcement: ICONS.bell, library: ICONS.play, payment: ICONS.card,
  membership: ICONS.tag, favourite: ICONS.heart,
}

function ago(d) {
  const mins = Math.round((Date.now() - new Date(d)) / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  if (mins < 24 * 60) return `${Math.round(mins / 60)}h`
  return `${Math.round(mins / (24 * 60))}d`
}

export default function Notifications() {
  const nav = useNavigate()
  const { data, loading, error, refetch } = useApi('/notifications')

  useEffect(() => { api.post('/notifications/read').catch(() => {}) }, [])

  if (loading) return <PageSkeleton />
  if (error) return <ErrorState error={error} retry={refetch} />
  const items = data.notifications

  return (
    <div style={{ animation: 'plFade .3s' }}>
      <TopBar title="Notifications" />
      {items.length === 0 && <EmptyState icon={ICONS.bell} title="All quiet" text="Booking confirmations, reminders, and rewards will land here." />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '18px 24px 10px' }}>
        {items.map((n) => (
          <Card key={n.id} style={{ padding: '13px 16px', display: 'flex', gap: 13, alignItems: 'flex-start', opacity: n.read_at ? 0.75 : 1 }}
            onClick={n.link && !n.link.startsWith('/reminder') ? () => nav(n.link) : undefined}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: n.read_at ? 'var(--blush)' : 'var(--pinksoft)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon d={KIND_ICON[n.kind] || ICONS.bell} size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{n.title}</div>
                <div style={{ fontSize: 10.5, color: 'var(--sub)', flexShrink: 0 }}>{ago(n.created_at)}</div>
              </div>
              {n.body && <div style={{ fontSize: 12, color: 'var(--sub)', lineHeight: 1.5, marginTop: 3 }}>{n.body}</div>}
            </div>
            {!n.read_at && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--rose)', marginTop: 5, flexShrink: 0 }} />}
          </Card>
        ))}
      </div>
    </div>
  )
}
