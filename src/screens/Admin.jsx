import { useState } from 'react'
import { Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { api, useApi } from '../api.js'
import { useAuth } from '../auth.jsx'
import { ICONS } from '../data.js'
import Icon from '../components/Icon.jsx'
import { Btn, Card, ErrorState, Field, PageSkeleton, SectionLabel, Sheet, Tag, TopBar, fmtDate, fmtTime, inputStyle, useToast } from '../ui.jsx'

// The CMS uses the generic whitelisted-entity API. Field specs drive the forms.
const ENTITY_SPECS = {
  class_types: { title: 'Classes', fields: [['name', 'text'], ['description', 'textarea'], ['level', 'text'], ['category', 'text'], ['duration_min', 'number'], ['image', 'text'], ['active', 'toggle']] },
  class_sessions: { title: 'Sessions', fields: [['class_type_id', 'number'], ['instructor_id', 'number'], ['studio_id', 'number'], ['starts_at', 'text'], ['duration_min', 'number'], ['capacity', 'number'], ['cutoff_min', 'number'], ['playlist_id', 'number'], ['status', 'text']] },
  instructors: { title: 'Instructors', fields: [['name', 'text'], ['bio', 'textarea'], ['photo', 'text'], ['specialties', 'text'], ['active', 'toggle']] },
  studios: { title: 'Studios', fields: [['name', 'text'], ['cols', 'number'], ['entrance', 'text']] },
  reformers: { title: 'Reformers', fields: [['studio_id', 'number'], ['number', 'number'], ['status', 'text']] },
  packages: { title: 'Packages', fields: [['name', 'text'], ['kind', 'text'], ['price_cents', 'number'], ['classes', 'number'], ['validity_days', 'number'], ['description', 'textarea'], ['terms', 'textarea'], ['popular', 'toggle'], ['intro', 'toggle'], ['active', 'toggle'], ['sort', 'number']] },
  library_items: { title: 'Library', fields: [['title', 'text'], ['kind', 'text'], ['category', 'text'], ['level', 'text'], ['duration_min', 'number'], ['image', 'text'], ['video_url', 'text'], ['summary', 'textarea'], ['muscles', 'text'], ['instructor_id', 'number'], ['published', 'toggle']] },
  challenges: { title: 'Challenges', fields: [['title', 'text'], ['description', 'textarea'], ['rules', 'textarea'], ['starts_at', 'text'], ['ends_at', 'text'], ['goal_type', 'text'], ['goal_count', 'number'], ['reward_points', 'number'], ['badge_id', 'number'], ['leaderboard', 'toggle'], ['active', 'toggle']] },
  rewards: { title: 'Rewards', fields: [['name', 'text'], ['description', 'textarea'], ['cost_points', 'number'], ['kind', 'text'], ['expiry_days', 'number'], ['active', 'toggle']] },
  badges: { title: 'Badges', fields: [['name', 'text'], ['icon', 'text'], ['description', 'text']] },
  playlists: { title: 'Playlists', fields: [['title', 'text'], ['cover', 'text'], ['platform', 'text'], ['url', 'text'], ['instructor_id', 'number']] },
  announcements: { title: 'Announcements', fields: [['title', 'text'], ['body', 'textarea'], ['pinned', 'toggle'], ['active', 'toggle']] },
  motivations: { title: 'Quotes', fields: [['text', 'textarea'], ['author', 'text']] },
}

function Overview() {
  const { data, loading, error, refetch } = useApi('/admin/overview')
  if (loading) return <PageSkeleton />
  if (error) return <ErrorState error={error} retry={refetch} />
  const d = data
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '16px 24px 0' }}>
        {[[d.members, 'Members'], [d.sessionsToday, 'Classes today'], [d.bookingsToday, 'Bookings today'], [d.waitlisted, 'On waitlists'], [`£${(d.revenue30d / 100).toFixed(0)}`, '30-day revenue'], [d.activeChallenges, 'Challenges']].map(([v, k]) => (
          <Card key={k} style={{ padding: '13px 14px' }}>
            <div style={{ fontFamily: 'Marcellus,serif', fontSize: 22, color: 'var(--rose)' }}>{v}</div>
            <div style={{ fontSize: 10.5, color: 'var(--sub)', marginTop: 2 }}>{k}</div>
          </Card>
        ))}
      </div>
      <SectionLabel>Recent admin activity</SectionLabel>
      <Card style={{ margin: '0 24px 12px', overflow: 'hidden' }}>
        {d.recentAudit.length === 0 && <div style={{ padding: '14px 18px', fontSize: 12.5, color: 'var(--sub)' }}>Actions you take in the CMS are logged here.</div>}
        {d.recentAudit.map((a, i) => (
          <div key={a.id} style={{ padding: '11px 18px', borderBottom: i === d.recentAudit.length - 1 ? 'none' : '1px solid var(--line)', fontSize: 12.5 }}>
            <b>{a.first_name}</b> — {a.action} {a.entity} {a.entity_id} <span style={{ color: 'var(--sub)' }}>· {fmtDate(a.created_at)}</span>
          </div>
        ))}
      </Card>
    </div>
  )
}

function TodaySessions() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const { data, loading, error, refetch } = useApi(`/admin/sessions?date=${date}`, [date])
  const toast = useToast()
  return (
    <div>
      <div style={{ padding: '14px 24px 0' }}>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
      </div>
      {loading ? <PageSkeleton /> : error ? <ErrorState error={error} retry={refetch} /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 24px 12px' }}>
          {data.sessions.map((s) => (
            <Card key={s.id} style={{ padding: '13px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{fmtTime(s.starts_at)} · {s.class_name}</div>
                <Tag tone={s.spaces === 0 ? 'red' : 'green'}>{s.booked}/{s.capacity}</Tag>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--sub)', marginTop: 2 }}>{s.instructor_name} · {s.studio_name}</div>
              {s.attendees.length > 0 && (
                <div style={{ marginTop: 9, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {s.attendees.map((a) => (
                    <div key={a.booking_id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                      <div style={{ flex: 1 }}>{a.first_name} {a.last_name} <span style={{ color: 'var(--sub)' }}>· {a.membership_number}</span></div>
                      <div className="press" onClick={async () => { await api.post(`/admin/bookings/${a.booking_id}/attended`, { attended: !a.attended }); toast(a.attended ? 'Marked absent' : 'Marked attended'); refetch() }}
                        style={{ fontSize: 10.5, fontWeight: 700, padding: '5px 11px', borderRadius: 100, cursor: 'pointer', background: a.attended ? 'var(--rose)' : 'var(--blush)', color: a.attended ? '#fff' : 'var(--sub)' }}>
                        {a.attended ? 'ATTENDED ✓' : 'MARK ATTENDED'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {s.waitlist.length > 0 && <div style={{ fontSize: 11.5, color: 'var(--sub)', marginTop: 8 }}>Waiting: {s.waitlist.map((w) => w.first_name).join(', ')}</div>}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function Members() {
  const [q, setQ] = useState('')
  const { data, loading, error, refetch } = useApi(`/admin/members?q=${encodeURIComponent(q)}`, [q])
  const toast = useToast()
  return (
    <div>
      <div style={{ padding: '14px 24px 0' }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search members" style={{ ...inputStyle, borderRadius: 100 }} />
      </div>
      {loading ? <PageSkeleton /> : error ? <ErrorState error={error} retry={refetch} /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 24px 12px' }}>
          {data.members.map((m) => (
            <Card key={m.id} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{m.first_name} {m.last_name} {m.role === 'admin' && <Tag tone="grey">admin</Tag>}</div>
                <div style={{ fontSize: 11.5, color: 'var(--sub)', marginTop: 2 }}>{m.email} · {m.membership_number}</div>
              </div>
              <Btn small kind="soft" onClick={async () => {
                const delta = Number(prompt('Adjust credits by (e.g. 1 or -1):', '1'))
                if (!delta) return
                try { await api.post(`/admin/members/${m.id}/credits`, { delta }); toast('Credits adjusted') }
                catch (err) { toast(err.message, 'err') }
              }}>CREDITS</Btn>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function PointRules() {
  const { data, loading, error, refetch } = useApi('/admin/point-rules')
  const toast = useToast()
  if (loading) return <PageSkeleton />
  if (error) return <ErrorState error={error} retry={refetch} />
  return (
    <Card style={{ margin: '16px 24px 12px', overflow: 'hidden' }}>
      {data.rules.map((r, i) => (
        <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderBottom: i === data.rules.length - 1 ? 'none' : '1px solid var(--line)' }}>
          <div style={{ flex: 1, fontSize: 13 }}>{r.label}</div>
          <input type="number" defaultValue={r.points} onBlur={async (e) => {
            const points = Number(e.target.value)
            if (points === r.points) return
            try { await api.patch(`/admin/point-rules/${r.key}`, { points }); toast(`${r.label} → ${points} pts`) }
            catch (err) { toast(err.message, 'err') }
          }} style={{ ...inputStyle, width: 76, padding: '8px 10px', textAlign: 'center' }} />
        </div>
      ))}
    </Card>
  )
}

function EntityManager({ table }) {
  const spec = ENTITY_SPECS[table]
  const { data, loading, error, refetch } = useApi(`/admin/entities/${table}`, [table])
  const [editing, setEditing] = useState(null) // {} for new, row for edit
  const [form, setForm] = useState({})
  const toast = useToast()
  if (loading) return <PageSkeleton />
  if (error) return <ErrorState error={error} retry={refetch} />

  const open = (row) => { setEditing(row || {}); setForm(row || {}) }
  async function save() {
    const body = {}
    for (const [f] of spec.fields) if (form[f] !== undefined && form[f] !== '') body[f] = form[f]
    try {
      if (editing.id) await api.patch(`/admin/entities/${table}/${editing.id}`, body)
      else await api.post(`/admin/entities/${table}`, body)
      toast(editing.id ? 'Saved' : 'Created')
      setEditing(null); refetch()
    } catch (err) { toast(err.message, 'err') }
  }
  async function remove(row) {
    try { await api.del(`/admin/entities/${table}/${row.id}`); toast('Deleted / unpublished'); refetch() }
    catch (err) { toast(err.message, 'err') }
  }
  const labelFor = (row) => row.name || row.title || row.text?.slice(0, 40) || `${spec.title.slice(0, -1)} #${row.id}`

  return (
    <div>
      <div style={{ padding: '14px 24px 0' }}>
        <Btn small kind="soft" onClick={() => open(null)}>+ NEW {spec.title.slice(0, -1).toUpperCase()}</Btn>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 24px 12px' }}>
        {data.rows.map((row) => (
          <Card key={row.id} style={{ padding: '11px 15px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>#{row.id} · {labelFor(row)}</div>
              {(row.active === 0 || row.published === 0) ? <Tag tone="grey">Hidden</Tag> : null}
            </div>
            <div className="press" onClick={() => open(row)} style={{ fontSize: 11, fontWeight: 700, color: 'var(--rose)', cursor: 'pointer' }}>EDIT</div>
            <div className="press" onClick={() => remove(row)} style={{ fontSize: 11, fontWeight: 700, color: '#B03A3A', cursor: 'pointer' }}>DELETE</div>
          </Card>
        ))}
      </div>
      <Sheet open={!!editing} onClose={() => setEditing(null)}>
        {editing && (
          <>
            <div style={{ fontFamily: 'Marcellus,serif', fontSize: 20, marginBottom: 12 }}>{editing.id ? `Edit ${spec.title.slice(0, -1).toLowerCase()} #${editing.id}` : `New ${spec.title.slice(0, -1).toLowerCase()}`}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 380, overflowY: 'auto', paddingRight: 4 }}>
              {spec.fields.map(([f, kind]) => (
                <Field key={f} label={f.replaceAll('_', ' ')}>
                  {kind === 'textarea' ? (
                    <textarea rows={2} style={{ ...inputStyle, resize: 'none' }} value={form[f] ?? ''} onChange={(e) => setForm((x) => ({ ...x, [f]: e.target.value }))} />
                  ) : kind === 'toggle' ? (
                    <select style={inputStyle} value={String(form[f] ?? 1)} onChange={(e) => setForm((x) => ({ ...x, [f]: Number(e.target.value) }))}>
                      <option value="1">Yes</option><option value="0">No</option>
                    </select>
                  ) : (
                    <input type={kind} style={inputStyle} value={form[f] ?? ''} onChange={(e) => setForm((x) => ({ ...x, [f]: kind === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value }))} />
                  )}
                </Field>
              ))}
            </div>
            <Btn onClick={save} style={{ marginTop: 14 }}>{editing.id ? 'SAVE CHANGES' : 'CREATE'}</Btn>
          </>
        )}
      </Sheet>
    </div>
  )
}

const TABS = [
  ['', 'Overview'], ['today', 'Today'], ['members', 'Members'], ['points', 'Points'],
  ...Object.entries(ENTITY_SPECS).map(([table, spec]) => [table, spec.title]),
]

export default function Admin() {
  const { member } = useAuth()
  const nav = useNavigate()
  if (member.role !== 'admin') return <Navigate to="/" replace />
  return (
    <div style={{ animation: 'plFade .3s' }}>
      <TopBar title="Studio CMS" right={<Tag>Admin</Tag>} />
      <div style={{ display: 'flex', gap: 7, overflowX: 'auto', padding: '14px 24px 2px' }}>
        {TABS.map(([path, name]) => (
          <NavLink key={path} to={`/admin/${path}`} end={path === ''} style={({ isActive }) => ({
            flex: '0 0 auto', padding: '8px 15px', borderRadius: 100, fontSize: 12, fontWeight: 600, textDecoration: 'none',
            background: isActive ? 'var(--rose)' : 'var(--card)', color: isActive ? '#fff' : 'var(--sub)',
            border: '1px solid var(--line)', transition: 'all .2s',
          })}>{name}</NavLink>
        ))}
      </div>
      <Routes>
        <Route index element={<Overview />} />
        <Route path="today" element={<TodaySessions />} />
        <Route path="members" element={<Members />} />
        <Route path="points" element={<PointRules />} />
        {Object.keys(ENTITY_SPECS).map((table) => (
          <Route key={table} path={table} element={<EntityManager table={table} />} />
        ))}
      </Routes>
      <div style={{ padding: '8px 24px 16px' }}>
        <Btn kind="ghost" onClick={() => nav('/')}>← BACK TO THE APP</Btn>
      </div>
    </div>
  )
}
