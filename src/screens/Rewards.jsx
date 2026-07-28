import { useState } from 'react'
import { api, useApi } from '../api.js'
import { ICONS } from '../data.js'
import Icon from '../components/Icon.jsx'
import { Btn, Card, ErrorState, PageSkeleton, SectionLabel, Sheet, Tag, TopBar, fmtDate, useToast } from '../ui.jsx'

const REASON_LABEL = {
  book_class: 'Class booked', attend_class: 'Class attended', complete_challenge: 'Challenge completed',
  streak_week: 'Weekly streak', referral: 'Referral', purchase: 'Package purchase', renewal: 'Renewal',
  complete_profile: 'Profile completed', milestone: 'Milestone', special_event: 'Special event', redeem: 'Reward redeemed',
}

export default function Rewards() {
  const { data, loading, error, refetch } = useApi('/rewards')
  const [confirming, setConfirming] = useState(null)
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  if (loading) return <PageSkeleton />
  if (error) return <ErrorState error={error} retry={refetch} />
  const d = data

  async function redeem() {
    setBusy(true)
    try {
      const r = await api.post(`/rewards/${confirming.id}/redeem`)
      toast(`Redeemed — show code ${r.code} at the studio`)
      setConfirming(null)
      refetch()
    } catch (err) { toast(err.message, 'err') } finally { setBusy(false) }
  }

  return (
    <div style={{ animation: 'plFade .3s' }}>
      <TopBar title="Rewards" />

      {/* wallet */}
      <Card style={{ margin: '18px 24px 0', padding: '20px 22px', background: 'linear-gradient(120deg, var(--ink), #5A3D4A)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 170, height: 170, borderRadius: '50%', background: 'radial-gradient(circle, rgba(242,169,192,.35), transparent 70%)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', opacity: 0.65 }}>Rewards balance</div>
            <div style={{ fontFamily: 'Marcellus,serif', fontSize: 42, marginTop: 4, color: 'var(--pink)' }}>{d.balance}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>points</div>
          </div>
          <Tag style={{ background: 'rgba(255,255,255,.15)', color: '#fff' }}>{d.tier} tier</Tag>
        </div>
        <div style={{ display: 'flex', gap: 18, marginTop: 14, fontSize: 11.5, opacity: 0.75 }}>
          <div>Earned <b>{d.earned}</b></div>
          <div>Redeemed <b>{d.redeemed}</b></div>
          {d.nextTier && <div>{d.nextTier.at - d.lifetime} pts to <b>{d.nextTier.name}</b></div>}
        </div>
        {d.nextTier && (
          <div style={{ height: 5, background: 'rgba(255,255,255,.15)', borderRadius: 100, marginTop: 10, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, (d.lifetime / d.nextTier.at) * 100)}%`, height: '100%', background: 'var(--pink)', borderRadius: 100 }} />
          </div>
        )}
      </Card>

      {/* available rewards */}
      <SectionLabel>Redeem</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 24px' }}>
        {d.rewards.map((r) => {
          const affordable = d.balance >= r.cost_points
          return (
            <Card key={r.id} style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 13 }}>
              <div style={{ width: 40, height: 40, borderRadius: 13, background: 'var(--pinksoft)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon d={{ class: ICONS.booking, discount: ICONS.tag, guest: ICONS.user, merch: ICONS.sparkle, perk: ICONS.flame }[r.kind] || ICONS.sparkle} size={17} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--sub)', marginTop: 2 }}>{r.description}{r.expiry_days ? ` · valid ${r.expiry_days} days` : ''}</div>
              </div>
              <div className={affordable ? 'press' : undefined} onClick={affordable ? () => setConfirming(r) : undefined}
                style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', padding: '8px 14px', borderRadius: 100, background: affordable ? 'var(--rose)' : 'var(--blush)', color: affordable ? '#fff' : 'var(--sub)', cursor: affordable ? 'pointer' : 'default', whiteSpace: 'nowrap' }}>
                {r.cost_points} PTS
              </div>
            </Card>
          )
        })}
      </div>

      {/* my redemptions */}
      {d.redemptions.length > 0 && (
        <>
          <SectionLabel>My rewards</SectionLabel>
          <Card style={{ margin: '0 24px', overflow: 'hidden' }}>
            {d.redemptions.map((r, i) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: i === d.redemptions.length - 1 ? 'none' : '1px solid var(--line)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{r.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--sub)', marginTop: 2 }}>Code <b style={{ color: 'var(--rose)' }}>{r.code}</b>{r.expires_at ? ` · expires ${fmtDate(r.expires_at)}` : ''}</div>
                </div>
                <Tag tone={r.status === 'used' ? 'grey' : 'green'}>{r.status === 'used' ? 'Used' : 'Active'}</Tag>
              </div>
            ))}
          </Card>
        </>
      )}

      {/* how to earn */}
      <SectionLabel>How to earn</SectionLabel>
      <Card style={{ margin: '0 24px', overflow: 'hidden' }}>
        {d.rules.map((r, i) => (
          <div key={r.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 18px', borderBottom: i === d.rules.length - 1 ? 'none' : '1px solid var(--line)', fontSize: 13 }}>
            <span style={{ color: 'var(--sub)' }}>{r.label}</span>
            <span style={{ fontWeight: 700, color: 'var(--rose)' }}>+{r.points}</span>
          </div>
        ))}
      </Card>

      {/* history */}
      <SectionLabel>Points history</SectionLabel>
      <Card style={{ margin: '0 24px 10px', overflow: 'hidden' }}>
        {d.ledger.slice(0, 20).map((l, i, arr) => (
          <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 18px', borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--line)' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{REASON_LABEL[l.reason] || l.reason}</div>
              <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 1 }}>{fmtDate(l.created_at)}</div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: l.delta > 0 ? '#3E7A48' : 'var(--rose)' }}>{l.delta > 0 ? '+' : ''}{l.delta}</div>
          </div>
        ))}
      </Card>

      <Sheet open={!!confirming} onClose={() => setConfirming(null)}>
        {confirming && (
          <>
            <div style={{ fontFamily: 'Marcellus,serif', fontSize: 21, marginBottom: 6 }}>Redeem {confirming.name}?</div>
            <div style={{ fontSize: 13.5, color: 'var(--sub)', lineHeight: 1.6 }}>{confirming.description} This uses <b style={{ color: 'var(--rose)' }}>{confirming.cost_points} points</b>, leaving you {d.balance - confirming.cost_points}.</div>
            <Btn disabled={busy} onClick={redeem} style={{ marginTop: 16 }}>{busy ? 'REDEEMING…' : 'CONFIRM'}</Btn>
          </>
        )}
      </Sheet>
    </div>
  )
}
