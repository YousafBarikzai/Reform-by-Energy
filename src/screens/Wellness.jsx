import { useState } from 'react'
import { api, useApi } from '../api.js'
import { ICONS } from '../data.js'
import Icon from '../components/Icon.jsx'
import { Btn, Card, ErrorState, PageSkeleton, SectionLabel, Sparkline, TopBar, inputStyle, useToast, vibrate } from '../ui.jsx'

const METRICS = [
  ['mood', 'Mood', ICONS.sun],
  ['energy', 'Energy', ICONS.flame],
  ['sleep', 'Sleep quality', ICONS.moon],
  ['stress', 'Stress level', ICONS.core],
  ['soreness', 'Muscle soreness', ICONS.stretch],
  ['wellbeing', 'General wellbeing', ICONS.heart],
]

function Scale({ value, onChange, invert }) {
  return (
    <div style={{ display: 'flex', gap: 7 }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const on = value === n
        return (
          <div key={n} onClick={() => { vibrate(4); onChange(n) }}
            style={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, cursor: 'pointer', background: on ? (invert ? 'var(--ink)' : 'var(--rose)') : 'var(--blush)', color: on ? '#fff' : 'var(--sub)', transition: 'all .2s' }}>{n}</div>
        )
      })}
    </div>
  )
}

export default function Wellness() {
  const { data, loading, error, refetch } = useApi('/wellness')
  const [form, setForm] = useState(null)
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  if (loading) return <PageSkeleton />
  if (error) return <ErrorState error={error} retry={refetch} />
  const d = data
  const editing = form !== null
  const start = () => setForm(d.today ? { ...d.today } : { mood: 3, energy: 3, sleep: 3, stress: 3, soreness: 2, wellbeing: 3, water: 4, note: '' })

  async function save() {
    setBusy(true)
    try {
      const r = await api.post('/wellness', form)
      toast(`Check-in saved — today's score ${r.score}`)
      setForm(null)
      refetch()
    } catch (err) { toast(err.message, 'err') } finally { setBusy(false) }
  }

  const scores = d.entries.slice(0, 14).reverse().map((e) => e.score)
  const avg = (k) => d.entries.length ? (d.entries.slice(0, 7).reduce((s, e) => s + e[k], 0) / Math.min(7, d.entries.length)).toFixed(1) : '—'

  return (
    <div style={{ animation: 'plFade .3s' }}>
      <TopBar title="Wellness" />

      {/* today */}
      {!editing && (
        <Card style={{ margin: '18px 24px 0', padding: '18px 20px', background: 'linear-gradient(120deg,var(--pinksoft),var(--card))' }}>
          {d.today ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 66, height: 66, borderRadius: '50%', background: 'var(--card)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow)' }}>
                <div style={{ fontFamily: 'Marcellus,serif', fontSize: 23, color: 'var(--rose)', lineHeight: 1 }}>{d.today.score}</div>
                <div style={{ fontSize: 8.5, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.08em' }}>score</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>Today's check-in ✓</div>
                <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 3, lineHeight: 1.5 }}>
                  {d.today.score >= 75 ? 'A strong day — your inputs look beautifully balanced.' : d.today.score >= 55 ? 'A steady day. Gentle movement and water will lift it.' : 'A softer day — rest is part of the practice too.'}
                </div>
                <div className="press" onClick={start} style={{ marginTop: 8, fontSize: 11.5, fontWeight: 700, color: 'var(--rose)', cursor: 'pointer' }}>EDIT TODAY'S ENTRY</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--card)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow)' }}><Icon d={ICONS.sun} size={20} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>How are you today?</div>
                <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>60 seconds, six sliders, one honest answer.</div>
              </div>
              <Btn small onClick={start}>CHECK IN</Btn>
            </div>
          )}
        </Card>
      )}

      {/* check-in form */}
      {editing && (
        <Card style={{ margin: '18px 24px 0', padding: '18px 20px' }}>
          <div style={{ fontFamily: 'Marcellus,serif', fontSize: 20, marginBottom: 14 }}>Today's check-in</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            {METRICS.map(([key, name, icon]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, fontWeight: 600, flex: 1 }}>
                  <span style={{ color: 'var(--rose)' }}><Icon d={icon} size={15} /></span> {name}
                  {(key === 'stress' || key === 'soreness') && <span style={{ fontSize: 10, color: 'var(--sub)', fontWeight: 400 }}>(5 = high)</span>}
                </div>
                <Scale value={form[key]} onChange={(v) => setForm((f) => ({ ...f, [key]: v }))} invert={key === 'stress' || key === 'soreness'} />
              </div>
            ))}
            {/* water */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                <span style={{ color: 'var(--rose)' }}><Icon d={ICONS.drop} size={15} /></span> Water · {form.water} glasses
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} onClick={() => { vibrate(4); setForm((f) => ({ ...f, water: i + 1 })) }}
                    style={{ flex: 1, height: 30, borderRadius: 9, cursor: 'pointer', background: i < form.water ? 'var(--rose)' : 'var(--blush)', transition: 'all .2s' }} />
                ))}
              </div>
            </div>
            <textarea value={form.note || ''} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="A private note about today (optional)" rows={2} style={{ ...inputStyle, resize: 'none' }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn kind="soft" style={{ flex: 1 }} onClick={() => setForm(null)}>CANCEL</Btn>
              <Btn style={{ flex: 2 }} disabled={busy} onClick={save}>{busy ? 'SAVING…' : 'SAVE CHECK-IN'}</Btn>
            </div>
          </div>
        </Card>
      )}

      {/* trend */}
      {scores.length > 1 && (
        <>
          <SectionLabel>Wellness trend</SectionLabel>
          <Card style={{ margin: '0 24px', padding: '16px 18px 10px' }}>
            <Sparkline values={scores} />
            <div style={{ display: 'flex', gap: 14, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)', fontSize: 11.5, color: 'var(--sub)', flexWrap: 'wrap' }}>
              <div>7-day mood <b style={{ color: 'var(--ink)' }}>{avg('mood')}/5</b></div>
              <div>energy <b style={{ color: 'var(--ink)' }}>{avg('energy')}/5</b></div>
              <div>sleep <b style={{ color: 'var(--ink)' }}>{avg('sleep')}/5</b></div>
              <div>stress <b style={{ color: 'var(--ink)' }}>{avg('stress')}/5</b></div>
            </div>
          </Card>
        </>
      )}

      {/* history */}
      <SectionLabel>Previous check-ins</SectionLabel>
      <Card style={{ margin: '0 24px 10px', overflow: 'hidden' }}>
        {d.entries.length === 0 && <div style={{ padding: '16px 18px', fontSize: 13, color: 'var(--sub)' }}>Your first check-in will appear here.</div>}
        {d.entries.slice(0, 14).map((e, i, arr) => (
          <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 18px', borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--line)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 13, background: e.score >= 75 ? 'var(--pinksoft)' : 'var(--blush)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13.5 }}>{e.score}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{new Date(e.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}</div>
              <div style={{ fontSize: 11.5, color: 'var(--sub)', marginTop: 2 }}>
                mood {e.mood} · energy {e.energy} · sleep {e.sleep} · water {e.water}{e.note ? ` · “${e.note}”` : ''}
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}
