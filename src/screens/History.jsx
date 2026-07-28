import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, useApi } from '../api.js'
import { ICONS } from '../data.js'
import Icon from '../components/Icon.jsx'
import { Card, Chip, EmptyState, ErrorState, PageSkeleton, Sheet, Stars, TopBar, fmtTime, inputStyle, useToast } from '../ui.jsx'

export default function History() {
  const nav = useNavigate()
  const { data, loading, error, refetch } = useApi('/history')
  const meta = useApi('/schedule/filters')
  const [instructor, setInstructor] = useState(null)
  const [type, setType] = useState(null)
  const [month, setMonth] = useState(null)
  const [editing, setEditing] = useState(null)
  const [note, setNote] = useState('')
  const toast = useToast()

  const filtered = useMemo(() => {
    if (!data) return []
    return data.history.filter((h) =>
      (!instructor || h.instructor === instructor) &&
      (!type || h.className === type) &&
      (!month || h.startsAt.slice(0, 7) === month))
  }, [data, instructor, type, month])

  if (loading) return <PageSkeleton />
  if (error) return <ErrorState error={error} retry={refetch} />
  const d = data
  const types = [...new Set(d.history.map((h) => h.className))]
  const instructors = [...new Set(d.history.map((h) => h.instructor))]
  const months = Object.entries(d.monthly).sort((a, b) => b[0].localeCompare(a[0]))
  const yearTotal = d.history.filter((h) => h.startsAt.startsWith(String(new Date().getFullYear()))).length

  async function saveFeedback(rating) {
    try {
      await api.post(`/bookings/${editing.bookingId}/feedback`, { rating: rating ?? editing.rating, notes: note })
      toast('Saved to your journal')
      setEditing(null)
      refetch()
    } catch (err) { toast(err.message, 'err') }
  }

  // group by month for the timeline
  const groups = []
  for (const h of filtered) {
    const key = new Date(h.startsAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    if (!groups.length || groups[groups.length - 1].key !== key) groups.push({ key, items: [] })
    groups[groups.length - 1].items.push(h)
  }

  return (
    <div style={{ animation: 'plFade .3s' }}>
      <TopBar title="Class history" />

      {/* summary */}
      <div style={{ display: 'flex', gap: 12, padding: '18px 24px 0' }}>
        <Card style={{ flex: 1, padding: '13px 16px' }}>
          <div style={{ fontFamily: 'Marcellus,serif', fontSize: 24, color: 'var(--rose)' }}>{d.history.length}</div>
          <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 2 }}>All time</div>
        </Card>
        <Card style={{ flex: 1, padding: '13px 16px' }}>
          <div style={{ fontFamily: 'Marcellus,serif', fontSize: 24, color: 'var(--rose)' }}>{yearTotal}</div>
          <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 2 }}>This year</div>
        </Card>
        <Card style={{ flex: 1, padding: '13px 16px' }}>
          <div style={{ fontFamily: 'Marcellus,serif', fontSize: 24, color: 'var(--rose)' }}>{months[0]?.[1] || 0}</div>
          <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 2 }}>This month</div>
        </Card>
      </div>

      {/* filters */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '14px 24px 4px' }}>
        {months.slice(0, 6).map(([m, n]) => (
          <Chip key={m} on={month === m} onClick={() => setMonth(month === m ? null : m)}>
            {new Date(m + '-15').toLocaleDateString('en-GB', { month: 'short' })} · {n}
          </Chip>
        ))}
        {instructors.map((i) => <Chip key={i} on={instructor === i} onClick={() => setInstructor(instructor === i ? null : i)}>{i.split(' ')[0]}</Chip>)}
        {types.map((t) => <Chip key={t} on={type === t} onClick={() => setType(type === t ? null : t)}>{t}</Chip>)}
      </div>

      {filtered.length === 0 && <EmptyState icon={ICONS.calendar} title="No classes here yet" text="Adjust the filters, or book your next class." />}

      {/* timeline */}
      {groups.map((g) => (
        <div key={g.key}>
          <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--sub)', fontWeight: 600, padding: '18px 24px 10px' }}>{g.key}</div>
          <div style={{ margin: '0 24px', paddingLeft: 12, borderLeft: '2px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {g.items.map((h) => (
              <div key={h.bookingId} style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: -19, top: 20, width: 11, height: 11, borderRadius: '50%', background: 'var(--rose)', border: '2px solid var(--bg)' }} />
                <Card style={{ marginLeft: 6, padding: '12px 14px' }} onClick={() => { setEditing(h); setNote(h.notes || '') }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src={h.image} alt="" style={{ width: 46, height: 46, borderRadius: 13, objectFit: 'cover' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{h.className}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--sub)', marginTop: 2 }}>
                        {new Date(h.startsAt).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })} · {fmtTime(h.startsAt)} · {h.instructor.split(' ')[0]} · {h.durationMin} min{h.reformer ? ` · Ref ${h.reformer}` : ''}
                      </div>
                      <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Stars value={h.rating || 0} size={13} />
                        {h.notes && <span style={{ fontSize: 11, color: 'var(--sub)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>“{h.notes}”</span>}
                      </div>
                    </div>
                    <Icon d={ICONS.chevron} size={13} color="var(--line)" strokeWidth={2.4} />
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div style={{ height: 12 }} />

      {/* rate & note sheet */}
      <Sheet open={!!editing} onClose={() => setEditing(null)}>
        {editing && (
          <>
            <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--sub)', fontWeight: 700 }}>{new Date(editing.startsAt).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
            <div style={{ fontFamily: 'Marcellus,serif', fontSize: 22, margin: '4px 0 14px' }}>{editing.className}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: 'var(--sub)', fontWeight: 600 }}>Your rating</div>
              <Stars value={editing.rating || 0} size={26} onChange={(n) => { setEditing((e) => ({ ...e, rating: n })); saveFeedback(n) }} />
            </div>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Private class note — how did it feel?" style={{ ...inputStyle, resize: 'none' }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <div className="press" onClick={() => { nav('/schedule') }} style={{ flex: 1, textAlign: 'center', padding: '13px 0', borderRadius: 100, background: 'var(--pinksoft)', color: 'var(--rose)', fontWeight: 700, fontSize: 12, letterSpacing: '.08em', cursor: 'pointer' }}>REBOOK SIMILAR</div>
              <div className="press" onClick={() => saveFeedback()} style={{ flex: 1, textAlign: 'center', padding: '13px 0', borderRadius: 100, background: 'var(--rose)', color: '#fff', fontWeight: 700, fontSize: 12, letterSpacing: '.08em', cursor: 'pointer' }}>SAVE NOTE</div>
            </div>
          </>
        )}
      </Sheet>
    </div>
  )
}
