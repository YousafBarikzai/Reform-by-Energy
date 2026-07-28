import { useRef, useState } from 'react'
import { api, useApi } from '../api.js'
import { ICONS } from '../data.js'
import Icon from '../components/Icon.jsx'
import { Btn, Card, ErrorState, Field, PageSkeleton, SectionLabel, Sheet, Tag, TopBar, fmtDate, inputStyle, useToast } from '../ui.jsx'

export default function Journey() {
  const { data, loading, error, refetch } = useApi('/journey')
  const toast = useToast()
  const fileRef = useRef(null)
  const [goalSheet, setGoalSheet] = useState(false)
  const [measureSheet, setMeasureSheet] = useState(false)
  const [compare, setCompare] = useState(null)
  const [form, setForm] = useState({})
  const [busy, setBusy] = useState(false)

  if (loading) return <PageSkeleton />
  if (error) return <ErrorState error={error} retry={refetch} />
  const d = data
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function run(fn, msg, close) {
    setBusy(true)
    try { await fn(); if (msg) toast(msg); close?.(); setForm({}); refetch() }
    catch (err) { toast(err.message, 'err') }
    finally { setBusy(false) }
  }

  function uploadPhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => run(() => api.post('/me/photo', { dataUrl: reader.result, kind: 'progress', caption: '' }), 'Photo added — visible only to you')
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const m0 = d.measurements[0]
  const mPrev = d.measurements[1]
  const diff = (k) => (m0 && mPrev && m0[k] != null && mPrev[k] != null) ? (m0[k] - mPrev[k]).toFixed(1) : null

  return (
    <div style={{ animation: 'plFade .3s' }}>
      <TopBar title="Transformation" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 24px 0', fontSize: 11.5, color: 'var(--sub)' }}>
        <Icon d={ICONS.shield} size={13} color="var(--rose)" /> Private — everything here is visible only to you.
      </div>

      {/* goals */}
      <SectionLabel right={<div className="press" onClick={() => setGoalSheet(true)} style={{ fontSize: 11, fontWeight: 700, color: 'var(--rose)', cursor: 'pointer' }}>+ ADD GOAL</div>}>Fitness goals</SectionLabel>
      <Card style={{ margin: '0 24px', overflow: 'hidden' }}>
        {d.goals.length === 0 && <div style={{ padding: '16px 18px', fontSize: 13, color: 'var(--sub)' }}>Add your first goal — small and specific works best.</div>}
        {d.goals.map((g, i) => (
          <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: i === d.goals.length - 1 ? 'none' : '1px solid var(--line)' }}>
            <div className="press" onClick={() => run(() => api.patch(`/journey/goals/${g.id}`, { done: !g.done }), g.done ? null : 'Milestone reached — points added ✦')}
              style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${g.done ? 'var(--rose)' : 'var(--line)'}`, background: g.done ? 'var(--rose)' : 'transparent', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              {g.done ? <Icon d={ICONS.check} size={12} strokeWidth={3} /> : null}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, textDecoration: g.done ? 'line-through' : 'none', color: g.done ? 'var(--sub)' : 'var(--ink)' }}>{g.title}</div>
              {g.target_date && <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 2 }}>Target {fmtDate(g.target_date)}</div>}
            </div>
            <div className="press" onClick={() => run(() => api.del(`/journey/goals/${g.id}`))} style={{ color: 'var(--line)', cursor: 'pointer', fontSize: 17, padding: 4 }}>×</div>
          </div>
        ))}
      </Card>

      {/* measurements */}
      <SectionLabel right={<div className="press" onClick={() => setMeasureSheet(true)} style={{ fontSize: 11, fontWeight: 700, color: 'var(--rose)', cursor: 'pointer' }}>+ NEW ENTRY</div>}>Measurements</SectionLabel>
      {m0 ? (
        <Card style={{ margin: '0 24px', padding: '15px 18px' }}>
          <div style={{ fontSize: 11.5, color: 'var(--sub)', marginBottom: 10 }}>Latest · {fmtDate(m0.date)}{mPrev ? ` · vs ${fmtDate(mPrev.date)}` : ''}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[['weight_kg', 'Weight', 'kg'], ['waist_cm', 'Waist', 'cm'], ['hips_cm', 'Hips', 'cm'], ['chest_cm', 'Chest', 'cm'], ['arm_cm', 'Arm', 'cm'], ['thigh_cm', 'Thigh', 'cm']].map(([k, name, unit]) => m0[k] != null && (
              <div key={k} style={{ background: 'var(--blush)', borderRadius: 14, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginTop: 3 }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{m0[k]}<span style={{ fontSize: 10.5, fontWeight: 400, color: 'var(--sub)' }}> {unit}</span></div>
                  {diff(k) != null && Number(diff(k)) !== 0 && (
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: Number(diff(k)) < 0 ? '#3E7A48' : 'var(--rose)' }}>{Number(diff(k)) > 0 ? '+' : ''}{diff(k)}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card style={{ margin: '0 24px', padding: '16px 18px', fontSize: 13, color: 'var(--sub)' }}>Record measurements to see change over time. Only add what feels right for you.</Card>
      )}

      {/* progress photos */}
      <SectionLabel right={<div className="press" onClick={() => fileRef.current?.click()} style={{ fontSize: 11, fontWeight: 700, color: 'var(--rose)', cursor: 'pointer' }}>+ ADD PHOTO</div>}>Progress photos</SectionLabel>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto} style={{ display: 'none' }} />
      {d.photos.length === 0 ? (
        <Card style={{ margin: '0 24px', padding: '20px 18px', display: 'flex', alignItems: 'center', gap: 13 }}>
          <div style={{ width: 42, height: 42, borderRadius: 13, background: 'var(--pinksoft)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon d={ICONS.camera} size={19} /></div>
          <div style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.55 }}>Private before-and-after photos. Encrypted in transit, never shared, deletable any time.</div>
        </Card>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 24px 4px' }}>
            {d.photos.map((p) => (
              <div key={p.id} style={{ flex: '0 0 118px', position: 'relative' }}>
                <img src={p.url} alt="" style={{ width: 118, height: 150, borderRadius: 16, objectFit: 'cover', display: 'block', boxShadow: 'var(--shadow)' }} />
                <div style={{ position: 'absolute', left: 7, bottom: 7 }}><Tag style={{ background: 'rgba(255,255,255,.9)' }}>{fmtDate(p.taken_at)}</Tag></div>
                <div className="press" onClick={() => run(() => api.del(`/journey/photos/${p.id}`), 'Photo deleted')}
                  style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%', background: 'rgba(56,38,46,.55)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, cursor: 'pointer' }}>×</div>
              </div>
            ))}
          </div>
          {d.photos.length >= 2 && (
            <div style={{ padding: '10px 24px 0' }}>
              <Btn kind="soft" onClick={() => setCompare([d.photos[d.photos.length - 1], d.photos[0]])}>COMPARE FIRST & LATEST</Btn>
            </div>
          )}
        </>
      )}

      {/* timeline */}
      <SectionLabel>Journey timeline</SectionLabel>
      <div style={{ margin: '0 24px 12px', paddingLeft: 10, borderLeft: '2px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          ...d.goals.filter((g) => g.done).map((g) => ({ date: g.target_date || g.created_at, text: `Goal reached — ${g.title}`, icon: '✓' })),
          ...d.measurements.map((mm) => ({ date: mm.date, text: `Measurements recorded${mm.note ? ` · ${mm.note}` : ''}`, icon: '△' })),
          ...d.photos.map((p) => ({ date: p.taken_at, text: 'Progress photo added', icon: '◉' })),
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 12).map((ev, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', position: 'relative' }}>
            <div style={{ position: 'absolute', left: -17, top: 3, width: 11, height: 11, borderRadius: '50%', background: 'var(--rose)', border: '2px solid var(--bg)' }} />
            <div style={{ marginLeft: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{ev.text}</div>
              <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 2 }}>{fmtDate(ev.date)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* goal sheet */}
      <Sheet open={goalSheet} onClose={() => setGoalSheet(false)}>
        <div style={{ fontFamily: 'Marcellus,serif', fontSize: 21, marginBottom: 14 }}>New goal</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="Goal"><input style={inputStyle} value={form.title || ''} onChange={set('title')} placeholder="e.g. Hold a 60-second teaser" /></Field>
          <Field label="Target date (optional)"><input style={inputStyle} type="date" value={form.targetDate || ''} onChange={set('targetDate')} /></Field>
          <Btn disabled={busy || !form.title} onClick={() => run(() => api.post('/journey/goals', form), 'Goal added', () => setGoalSheet(false))}>ADD GOAL</Btn>
        </div>
      </Sheet>

      {/* measurement sheet */}
      <Sheet open={measureSheet} onClose={() => setMeasureSheet(false)}>
        <div style={{ fontFamily: 'Marcellus,serif', fontSize: 21, marginBottom: 6 }}>New measurements</div>
        <div style={{ fontSize: 12, color: 'var(--sub)', marginBottom: 14 }}>Every field is optional — record what matters to you.</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[['weightKg', 'Weight (kg)'], ['chestCm', 'Chest (cm)'], ['waistCm', 'Waist (cm)'], ['hipsCm', 'Hips (cm)'], ['armCm', 'Arm (cm)'], ['thighCm', 'Thigh (cm)']].map(([k, name]) => (
            <Field key={k} label={name}><input style={inputStyle} type="number" step="0.1" value={form[k] || ''} onChange={set(k)} /></Field>
          ))}
        </div>
        <div style={{ marginTop: 10 }}>
          <Field label="Note (optional)"><input style={inputStyle} value={form.note || ''} onChange={set('note')} /></Field>
        </div>
        <Btn disabled={busy} onClick={() => run(() => api.post('/journey/measurements', form), 'Measurements saved', () => setMeasureSheet(false))} style={{ marginTop: 14 }}>SAVE ENTRY</Btn>
      </Sheet>

      {/* compare sheet */}
      <Sheet open={!!compare} onClose={() => setCompare(null)}>
        {compare && (
          <>
            <div style={{ fontFamily: 'Marcellus,serif', fontSize: 21, marginBottom: 14 }}>Before & after</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {compare.map((p, i) => (
                <div key={p.id} style={{ flex: 1 }}>
                  <img src={p.url} alt="" style={{ width: '100%', height: 240, borderRadius: 18, objectFit: 'cover', display: 'block' }} />
                  <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--sub)', marginTop: 7, fontWeight: 600 }}>{i === 0 ? 'First' : 'Latest'} · {fmtDate(p.taken_at)}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </Sheet>
    </div>
  )
}
