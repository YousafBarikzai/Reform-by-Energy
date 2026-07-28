import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, useApi } from '../api.js'
import { useAuth } from '../auth.jsx'
import { ICONS } from '../data.js'
import Icon from '../components/Icon.jsx'
import { Btn, Card, ErrorState, PageSkeleton, Sheet, Tag, availabilityTag, fmtTime, relDay, useToast, vibrate } from '../ui.jsx'

// Interactive studio map: instructor at top, entrance at bottom, tappable reformers.
function StudioMap({ layout, selected, onSelect, favourite }) {
  const cols = layout.cols || 4
  return (
    <div style={{ background: 'var(--blush)', border: '1px solid var(--line)', borderRadius: 20, padding: '16px 14px 12px' }}>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--card)', borderRadius: 100, padding: '6px 14px', fontSize: 11, fontWeight: 600, color: 'var(--sub)', boxShadow: 'var(--shadow)' }}>
          <Icon d={ICONS.user} size={13} color="var(--rose)" /> Instructor
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10 }}>
        {layout.reformers.map((r) => {
          const isSelected = selected === r.id
          const isMine = r.state === 'mine'
          const selectable = r.state === 'free' && onSelect
          const bg = r.state === 'maintenance' ? 'repeating-linear-gradient(45deg, var(--line), var(--line) 4px, var(--blush) 4px, var(--blush) 9px)'
            : isSelected || isMine ? 'var(--rose)' : r.state === 'taken' ? 'var(--line)' : 'var(--card)'
          const color = isSelected || isMine ? '#fff' : r.state === 'taken' ? 'var(--sub)' : 'var(--rose)'
          return (
            <div key={r.id}
              onClick={selectable ? () => { vibrate(6); onSelect(isSelected ? null : r.id) } : undefined}
              style={{ position: 'relative', aspectRatio: '1 / 1.35', borderRadius: 12, background: bg, border: `1.5px solid ${isSelected || isMine ? 'var(--rose)' : 'var(--line)'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, cursor: selectable ? 'pointer' : 'default', transition: 'all .2s', boxShadow: isSelected || isMine ? '0 6px 16px rgba(199,78,117,.35)' : 'none' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color }}>{r.number}</div>
              <div style={{ fontSize: 8.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', color }}>
                {r.state === 'maintenance' ? 'Maint.' : isMine ? 'Yours' : isSelected ? 'Picked' : r.state === 'taken' ? 'Taken' : 'Free'}
              </div>
              {favourite === r.number && r.state !== 'maintenance' && (
                <div style={{ position: 'absolute', top: 4, right: 5, fontSize: 10, color: isSelected || isMine ? '#fff' : 'var(--rose)' }}>♥</div>
              )}
            </div>
          )
        })}
      </div>
      <div style={{ textAlign: 'center', marginTop: 12, fontSize: 10.5, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--sub)' }}>— Entrance —</div>
    </div>
  )
}

export default function ClassDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { member, refresh } = useAuth()
  const goAuth = (register = false) => nav('/auth', { state: { from: `/class/${id}`, register } })
  const toast = useToast()
  const { data, loading, error, refetch } = useApi(`/sessions/${id}`)
  const [selectedReformer, setSelectedReformer] = useState(null)
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [showPolicy, setShowPolicy] = useState(false)

  if (loading) return <PageSkeleton />
  if (error) return <ErrorState error={error} retry={refetch} />
  const s = data.session
  const booked = !!s.myBookingId

  async function act(fn, okMsg) {
    setBusy(true)
    try {
      await fn()
      if (okMsg) toast(okMsg)
      await refetch()
      setConfirming(false)
      setSelectedReformer(null)
    } catch (err) {
      toast(err.message, 'err')
      if (err.data?.needsPackage) nav('/packages')
      await refetch()
    } finally {
      setBusy(false)
    }
  }

  const book = () => act(() => api.post(`/sessions/${id}/book`, { reformerId: selectedReformer }), 'Booked — see you in the studio 🤍')
  const cancel = () => act(() => api.post(`/sessions/${id}/cancel`), 'Booking cancelled')
  const joinWaitlist = () => act(() => api.post(`/sessions/${id}/waitlist`), 'Added to the waiting list')
  const leaveWaitlist = () => act(() => api.post(`/sessions/${id}/waitlist/leave`), 'Removed from the waiting list')
  const changeReformer = (rid) => act(() => api.post(`/sessions/${id}/reformer`, { reformerId: rid }), 'Reformer updated')
  const saveFavourite = (num) => act(async () => {
    await api.patch('/me', { prefs: { favouriteReformer: num } })
    await refresh()
  }, `Reformer ${num} saved as your favourite`)

  const favouriteFree = s.studioLayout.reformers.find((r) => r.number === s.favouriteReformer && r.state === 'free')

  return (
    <div style={{ animation: 'plFade .3s' }}>
      {/* hero */}
      <div style={{ position: 'relative', margin: '0 0 0' }}>
        <img src={s.image} alt="" style={{ width: '100%', height: 210, objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(56,38,46,.25), rgba(56,38,46,0) 45%)' }} />
        <div className="press" onClick={() => (window.history.length > 1 ? nav(-1) : nav('/schedule'))} style={{ position: 'absolute', top: 14, left: 18, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round"><path d="M15 5l-7 7 7 7" /></svg>
        </div>
        <div style={{ position: 'absolute', top: 16, right: 18 }}>{booked ? <Tag style={{ background: 'var(--rose)', color: '#fff' }}>Booked</Tag> : availabilityTag(s)}</div>
      </div>

      <div style={{ padding: '18px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
          <div>
            <div style={{ fontFamily: 'Marcellus,serif', fontSize: 27, lineHeight: 1.15 }}>{s.className}</div>
            <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 4 }}>{relDay(s.startsAt)} · {fmtTime(s.startsAt)} · {s.studio.name}</div>
          </div>
          <Tag>{s.level}</Tag>
        </div>

        {/* meta tiles */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          {[[`${s.durationMin} min`, 'Duration'], [s.category, 'Focus'], [`${s.spaces}/${s.capacity}`, 'Spaces'], [fmtTime(s.cutoffAt), 'Book by']].map(([v, k]) => (
            <Card key={k} style={{ flex: 1, padding: '11px 0', textAlign: 'center' }}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{v}</div>
              <div style={{ fontSize: 10, color: 'var(--sub)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '.06em' }}>{k}</div>
            </Card>
          ))}
        </div>

        {/* instructor */}
        <Card style={{ marginTop: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={s.instructor.photo} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{s.instructor.name}</div>
            <div style={{ fontSize: 12, color: 'var(--sub)' }}>Instructor</div>
          </div>
          {s.playlist && (
            <a href={s.playlist.url} target="_blank" rel="noreferrer" className="press" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--pinksoft)', color: 'var(--rose)', borderRadius: 100, padding: '8px 14px', fontSize: 11.5, fontWeight: 700 }}>
              <Icon d={ICONS.music} size={13} /> Playlist
            </a>
          )}
        </Card>

        <div style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--sub)', marginTop: 14 }}>{s.description}</div>

        {/* reformer selection */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '20px 0 10px' }}>
          <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--rose)', fontWeight: 600 }}>
            {booked ? 'Your reformer' : 'Choose your reformer'}
          </div>
          {s.favouriteReformer && !booked && (
            <div style={{ fontSize: 11, color: favouriteFree ? 'var(--rose)' : 'var(--sub)', fontWeight: 600 }}>
              ♥ No. {s.favouriteReformer} {favouriteFree ? 'is free' : 'taken'}
            </div>
          )}
        </div>
        <StudioMap
          layout={s.studioLayout}
          selected={selectedReformer}
          favourite={s.favouriteReformer}
          onSelect={booked
            ? (rid) => rid && !s.pastCutoff && changeReformer(rid)
            : (rid) => setSelectedReformer(rid)}
        />
        {booked && s.myReformer && !s.pastCutoff && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--sub)' }}>Tap a free reformer to move · changes close {fmtTime(s.cutoffAt)}</div>
            {member?.prefs?.favouriteReformer !== s.myReformer && (
              <div className="press" onClick={() => saveFavourite(s.myReformer)} style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--rose)', cursor: 'pointer' }}>♥ SAVE AS FAVOURITE</div>
            )}
          </div>
        )}

        {/* policies + calendar */}
        <div style={{ display: 'flex', gap: 14, margin: '16px 0 0', fontSize: 12, color: 'var(--sub)', fontWeight: 600 }}>
          <div className="press" onClick={() => setShowPolicy(true)} style={{ cursor: 'pointer' }}>Booking policy</div>
          {booked && <a href={`/api/sessions/${s.id}/calendar.ics`} style={{ color: 'var(--rose)' }}>Add to calendar</a>}
        </div>

        {/* CTA */}
        <div style={{ margin: '18px 0 26px' }}>
          {s.started ? (
            <Btn kind="soft" disabled>THIS CLASS HAS FINISHED</Btn>
          ) : !member ? (
            <>
              <Btn onClick={() => goAuth(false)}>{s.status === 'full' ? 'SIGN IN TO JOIN THE WAITING LIST' : 'SIGN IN TO BOOK'}</Btn>
              <div onClick={() => goAuth(true)} style={{ textAlign: 'center', fontSize: 12.5, fontWeight: 600, color: 'var(--rose)', marginTop: 12, cursor: 'pointer' }}>
                New to Reform? Create an account — you'll return right here
              </div>
            </>
          ) : booked ? (
            <Btn kind="outline" disabled={busy} onClick={cancel}>CANCEL BOOKING{!s.pastCutoff ? '' : ' · NO REFUND AFTER CUT-OFF'}</Btn>
          ) : s.pastCutoff ? (
            <Btn kind="soft" disabled>BOOKING CLOSED</Btn>
          ) : s.status === 'full' ? (
            s.onWaitlist ? (
              <Btn kind="outline" disabled={busy} onClick={leaveWaitlist}>LEAVE WAITING LIST</Btn>
            ) : (
              <Btn disabled={busy} onClick={joinWaitlist}>JOIN WAITING LIST{s.waitlistCount > 0 ? ` · ${s.waitlistCount} AHEAD` : ''}</Btn>
            )
          ) : (
            <Btn disabled={busy} onClick={() => setConfirming(true)}>
              {selectedReformer ? `BOOK · REFORMER ${s.studioLayout.reformers.find((r) => r.id === selectedReformer)?.number}` : 'BOOK CLASS'}
            </Btn>
          )}
        </div>
      </div>

      {/* confirm sheet */}
      <Sheet open={confirming} onClose={() => setConfirming(false)}>
        <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--sub)', fontWeight: 700 }}>Confirm booking</div>
        <div style={{ fontFamily: 'Marcellus,serif', fontSize: 22, margin: '4px 0 14px' }}>{s.className}</div>
        <Card style={{ background: 'var(--blush)', boxShadow: 'none', padding: 14, display: 'flex', gap: 13, alignItems: 'center' }}>
          <img src={s.image} alt="" style={{ width: 54, height: 54, borderRadius: 14, objectFit: 'cover' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{relDay(s.startsAt)}, {fmtTime(s.startsAt)}</div>
            <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>
              {s.instructor.name} · {s.studio.name}{selectedReformer ? ` · Reformer ${s.studioLayout.reformers.find((r) => r.id === selectedReformer)?.number}` : ' · Any reformer'}
            </div>
          </div>
        </Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '14px 4px 0', color: 'var(--sub)' }}>
          <span>1 class credit</span>
          <span style={{ color: 'var(--ink)', fontWeight: 600 }}>Refundable until {fmtTime(s.cutoffAt)}</span>
        </div>
        <Btn disabled={busy} onClick={book} style={{ marginTop: 16 }}>{busy ? 'BOOKING…' : 'CONFIRM BOOKING'}</Btn>
      </Sheet>

      {/* policy sheet */}
      <Sheet open={showPolicy} onClose={() => setShowPolicy(false)}>
        <div style={{ fontFamily: 'Marcellus,serif', fontSize: 21, marginBottom: 10 }}>Booking policy</div>
        <div style={{ fontSize: 13.5, color: 'var(--sub)', lineHeight: 1.7 }}>
          · One class credit is taken per booking.<br />
          · Cancel any time before the {s.cutoffMin}-minute cut-off for a full credit refund.<br />
          · Cancelling after the cut-off forfeits the credit.<br />
          · Waiting-list members are booked in automatically (oldest first) when a space opens, and notified immediately.<br />
          · Reformer changes are free until the cut-off.<br />
          · Please arrive 10 minutes early; unclaimed reformers may be released at start time.
        </div>
        <Btn kind="soft" onClick={() => setShowPolicy(false)} style={{ marginTop: 16 }}>GOT IT</Btn>
      </Sheet>
    </div>
  )
}
