import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../api.js'
import { ICONS } from '../data.js'
import Icon from '../components/Icon.jsx'
import { Card, Chip, EmptyState, ErrorState, PageSkeleton, Sheet, availabilityTag, fmtTime, inputStyle, vibrate } from '../ui.jsx'

const DAY = 864e5
const dateStr = (d) => new Date(d).toISOString().slice(0, 10)

export default function Schedule() {
  const nav = useNavigate()
  const [dayOffset, setDayOffset] = useState(0)
  const [filters, setFilters] = useState({})
  const [showFilters, setShowFilters] = useState(false)
  const [q, setQ] = useState('')
  const date = dateStr(Date.now() + dayOffset * DAY)

  const query = useMemo(() => {
    const p = new URLSearchParams({ date })
    if (filters.instructor) p.set('instructor', filters.instructor)
    if (filters.level) p.set('level', filters.level)
    if (filters.category) p.set('category', filters.category)
    if (filters.availability) p.set('availability', 'available')
    if (q.trim()) p.set('q', q.trim())
    return p.toString()
  }, [date, filters, q])

  const { data, loading, error, refetch } = useApi(`/schedule?${query}`)
  const meta = useApi('/schedule/filters')

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() + i * DAY)
    return { offset: i, dow: d.toLocaleDateString('en-GB', { weekday: 'short' }), num: d.getDate() }
  })
  const activeFilterCount = ['instructor', 'level', 'category', 'availability'].filter((k) => filters[k]).length

  return (
    <div style={{ animation: 'plFade .3s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 24px 0' }}>
        <div style={{ fontFamily: 'Marcellus,serif', fontSize: 30 }}>Schedule</div>
        <div className="press" onClick={() => setShowFilters(true)} style={{ position: 'relative', width: 44, height: 44, borderRadius: '50%', background: 'var(--card)', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon d={ICONS.filter} size={19} />
          {activeFilterCount > 0 && <div style={{ position: 'absolute', top: 7, right: 7, width: 15, height: 15, borderRadius: 100, background: 'var(--rose)', color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{activeFilterCount}</div>}
        </div>
      </div>

      {/* search */}
      <div style={{ padding: '14px 24px 0', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 40, top: '50%', marginTop: -2, color: 'var(--sub)' }}><Icon d={ICONS.search} size={16} /></div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search classes or instructors" style={{ ...inputStyle, borderRadius: 100, paddingLeft: 44 }} />
      </div>

      {/* day strip */}
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', padding: '16px 20px 2px' }}>
        {days.map((d) => {
          const on = dayOffset === d.offset
          return (
            <div key={d.offset} onClick={() => { vibrate(4); setDayOffset(d.offset) }} style={{ flex: '0 0 52px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, cursor: 'pointer', padding: '2px 0' }}>
              <div style={{ fontSize: 11, color: on ? 'var(--rose)' : 'var(--sub)', fontWeight: on ? 700 : 400 }}>{d.dow}</div>
              <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, background: on ? 'var(--rose)' : 'transparent', color: on ? '#fff' : 'var(--ink)', boxShadow: on ? '0 8px 18px rgba(199,78,117,.35)' : 'none', transition: 'all .25s' }}>{d.num}</div>
            </div>
          )
        })}
      </div>

      <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--sub)', fontWeight: 600, padding: '18px 24px 12px' }}>
        {new Date(Date.now() + dayOffset * DAY).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
      </div>

      {loading ? <PageSkeleton /> : error ? <ErrorState error={error} retry={refetch} /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 24px 8px' }}>
          {data.sessions.length === 0 && (
            <EmptyState icon={ICONS.calendar} title="No classes found" text="Try another day or clear your filters." />
          )}
          {data.sessions.map((s) => (
            <Card key={s.id} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 13, opacity: s.started ? 0.55 : 1 }} onClick={() => nav(`/class/${s.id}`)}>
              <div style={{ width: 54, height: 54, borderRadius: 16, background: 'var(--pinksoft)', color: 'var(--rose)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1.15, flexShrink: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{fmtTime(s.startsAt).split(' ')[0]}</div>
                <div style={{ fontSize: 10, fontWeight: 600 }}>{fmtTime(s.startsAt).split(' ')[1]}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{s.className}</div>
                <div style={{ fontSize: 11.5, color: 'var(--sub)', marginTop: 2 }}>{s.durationMin} min · {s.level} · {s.studio.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                  <img src={s.instructor.photo} alt="" style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ fontSize: 12, color: 'var(--sub)' }}>{s.instructor.name}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 7 }}>
                {s.myBookingId ? <Tag_booked /> : availabilityTag(s)}
                {!s.started && !s.myBookingId && s.status === 'full' && <div style={{ fontSize: 10.5, color: 'var(--sub)' }}>{s.waitlistCount > 0 ? `${s.waitlistCount} waiting` : 'Waitlist open'}</div>}
                {!s.started && s.spaces > 0 && !s.myBookingId && <div style={{ fontSize: 10.5, color: 'var(--sub)' }}>{s.spaces} of {s.capacity} spaces</div>}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* filter sheet */}
      <Sheet open={showFilters} onClose={() => setShowFilters(false)}>
        <div style={{ fontFamily: 'Marcellus,serif', fontSize: 21, marginBottom: 14 }}>Filter classes</div>
        {meta.data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--sub)', marginBottom: 8 }}>Instructor</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {meta.data.instructors.map((i) => (
                  <Chip key={i.id} on={filters.instructor === i.id} onClick={() => setFilters((f) => ({ ...f, instructor: f.instructor === i.id ? null : i.id }))}>{i.name.split(' ')[0]}</Chip>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--sub)', marginBottom: 8 }}>Level</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {meta.data.levels.map((l) => (
                  <Chip key={l} on={filters.level === l} onClick={() => setFilters((f) => ({ ...f, level: f.level === l ? null : l }))}>{l}</Chip>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--sub)', marginBottom: 8 }}>Focus</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {meta.data.categories.map((c) => (
                  <Chip key={c} on={filters.category === c} onClick={() => setFilters((f) => ({ ...f, category: f.category === c ? null : c }))}>{c}</Chip>
                ))}
              </div>
            </div>
            <Chip on={!!filters.availability} onClick={() => setFilters((f) => ({ ...f, availability: !f.availability }))} style={{ alignSelf: 'flex-start' }}>Hide fully booked</Chip>
            <div style={{ display: 'flex', gap: 10 }}>
              <div className="press" onClick={() => { setFilters({}); setShowFilters(false) }} style={{ flex: 1, textAlign: 'center', padding: '14px 0', borderRadius: 100, background: 'var(--blush)', color: 'var(--sub)', fontWeight: 700, fontSize: 12, letterSpacing: '.08em', cursor: 'pointer' }}>CLEAR ALL</div>
              <div className="press" onClick={() => setShowFilters(false)} style={{ flex: 1, textAlign: 'center', padding: '14px 0', borderRadius: 100, background: 'var(--rose)', color: '#fff', fontWeight: 700, fontSize: 12, letterSpacing: '.08em', cursor: 'pointer' }}>APPLY</div>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  )
}

function Tag_booked() {
  return <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 100, background: 'var(--rose)', color: '#fff' }}>Booked</span>
}
