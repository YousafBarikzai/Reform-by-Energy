import { api, useApi } from '../api.js'
import { useAuth } from '../auth.jsx'
import { ICONS } from '../data.js'
import Icon from '../components/Icon.jsx'
import { Btn, Card, ErrorState, PageSkeleton, Tag, TopBar, fmtDate, useToast } from '../ui.jsx'

export default function Challenges() {
  const { data, loading, error, refetch } = useApi('/challenges')
  const { member, refresh } = useAuth()
  const toast = useToast()
  if (loading) return <PageSkeleton />
  if (error) return <ErrorState error={error} retry={refetch} />
  const visible = member?.prefs?.leaderboardVisible !== false

  async function join(c) {
    try { await api.post(`/challenges/${c.id}/join`); toast(`Joined ${c.title} — good luck!`); refetch() }
    catch (err) { toast(err.message, 'err') }
  }
  async function toggleVisibility() {
    try {
      await api.patch('/me', { prefs: { leaderboardVisible: !visible } })
      await refresh(); refetch()
      toast(visible ? 'You are now private on leaderboards' : 'Your name now shows on leaderboards')
    } catch (err) { toast(err.message, 'err') }
  }

  return (
    <div style={{ animation: 'plFade .3s' }}>
      <TopBar title="Challenges" />
      <div className="press" onClick={toggleVisibility} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 24px 0', cursor: 'pointer', fontSize: 12, color: 'var(--sub)' }}>
        <div style={{ width: 38, height: 22, borderRadius: 100, padding: 3, boxSizing: 'border-box', background: visible ? 'var(--rose)' : 'var(--line)', transition: 'background .25s', flexShrink: 0 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', transform: `translateX(${visible ? 16 : 0}px)`, transition: 'transform .25s' }} />
        </div>
        Show my name on leaderboards
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '16px 24px 10px' }}>
        {data.challenges.map((c) => {
          const pct = Math.min(100, (c.progress / c.goal_count) * 100)
          const done = !!c.completedAt
          const daysLeft = Math.max(0, Math.ceil((new Date(c.ends_at) - Date.now()) / 864e5))
          return (
            <Card key={c.id} style={{ overflow: 'hidden' }}>
              <div style={{ padding: '15px 18px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div>
                    <div style={{ fontFamily: 'Marcellus,serif', fontSize: 18 }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 3, lineHeight: 1.5 }}>{c.description}</div>
                  </div>
                  {done ? <Tag tone="green">Complete</Tag> : c.joined ? <Tag>Joined</Tag> : <Tag tone="grey">{daysLeft}d left</Tag>}
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: 11, color: 'var(--sub)' }}>
                  <span>{fmtDate(c.starts_at)} – {fmtDate(c.ends_at)}</span>
                  <span>· {c.participants} joined</span>
                  <span>· +{c.reward_points} pts{c.badge_name ? ` · ${c.badge_icon} badge` : ''}</span>
                </div>

                {c.joined && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 12, fontWeight: 700 }}>
                      <span style={{ color: 'var(--sub)' }}>Progress</span>
                      <span style={{ color: 'var(--rose)' }}>{c.progress} / {c.goal_count}</span>
                    </div>
                    <div style={{ height: 7, background: 'var(--blush)', borderRadius: 100, marginTop: 7, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: done ? '#3E7A48' : 'linear-gradient(90deg,var(--pink),var(--rose))', borderRadius: 100, transition: 'width .6s' }} />
                    </div>
                  </>
                )}
                {!c.joined && !done && <Btn small kind="soft" style={{ marginTop: 12, alignSelf: 'flex-start', display: 'inline-block' }} onClick={() => join(c)}>JOIN CHALLENGE</Btn>}
                {c.rules && <div style={{ fontSize: 10.5, color: 'var(--sub)', marginTop: 10, opacity: 0.85 }}>Rules: {c.rules}</div>}
              </div>

              {/* leaderboard */}
              {c.joined && c.leaderboard && c.leaderboard.length > 1 && (
                <div style={{ borderTop: '1px solid var(--line)', padding: '10px 18px 13px' }}>
                  <div style={{ fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--sub)', fontWeight: 700, marginBottom: 7 }}>Leaderboard</div>
                  {c.leaderboard.map((l, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', fontSize: 12.5 }}>
                      <div style={{ width: 18, fontFamily: 'Marcellus,serif', color: i === 0 ? 'var(--rose)' : 'var(--sub)' }}>{i + 1}</div>
                      <div style={{ flex: 1, fontWeight: l.you ? 700 : 500, color: l.you ? 'var(--rose)' : 'var(--ink)' }}>{l.name}</div>
                      <div style={{ color: 'var(--sub)' }}>{l.progress}/{c.goal_count}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
