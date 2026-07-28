import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, useApi } from '../api.js'
import { useAuth } from '../auth.jsx'
import { ICONS, IMAGES } from '../data.js'
import Icon from '../components/Icon.jsx'
import { Monogram, Wordmark } from '../components/Logo.jsx'
import { Btn, Card, Field, SectionLabel, Skeleton, Tag, availabilityTag, fmtTime, inputStyle, relDay, useToast, vibrate } from '../ui.jsx'

import classReformer from '../assets/images/class-reformer.jpg'
import classCore from '../assets/images/class-core.jpg'
import classStretch from '../assets/images/class-stretch.jpg'
import instructorHero from '../assets/images/instructor-hero.jpg'
import challenge from '../assets/images/challenge.jpg'

const STEPS = [
  ['Explore the schedule', 'Browse live classes — no account needed.'],
  ['Choose a class or pack', 'Pick a session, or start with the Intro Offer.'],
  ['Create your account', 'Thirty seconds, right inside the booking.'],
  ['Confirm your booking', 'Choose your reformer and you’re in.'],
  ['Come move with us', 'Arrive 10 minutes early — we’ll take it from there.'],
]

const FACILITIES = [
  [ICONS.sparkle, '14 reformers', 'Two light-filled studios'],
  [ICONS.user, 'Max 8 per class', 'Every body gets watched'],
  [ICONS.drop, 'Showers & lockers', 'Changing areas + amenities'],
  [ICONS.heart, 'Step-free access', 'Fully accessible studio'],
  [ICONS.pin, 'Energym Lane', 'Free 2-hour parking nearby'],
  [ICONS.clock, 'Open 6am – 8pm', 'Seven days a week'],
]

function InlineLogin() {
  const nav = useNavigate()
  const { setMember } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({})
  const [busy, setBusy] = useState(false)
  async function login() {
    setBusy(true)
    try {
      const d = await api.post('/auth/login', { email: form.email, password: form.password, remember: true })
      setMember(d.member)
      toast(`Welcome back, ${d.member.firstName} 🤍`)
    } catch (err) {
      toast(err.message, 'err')
    } finally { setBusy(false) }
  }
  return (
    <Card style={{ margin: '0 24px', padding: '20px 20px 18px' }}>
      <div style={{ fontFamily: 'Marcellus,serif', fontSize: 19, textAlign: 'center' }}>Member sign in</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
        <input style={inputStyle} type="email" placeholder="Email" value={form.email || ''} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        <input style={inputStyle} type="password" placeholder="Password" value={form.password || ''} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && login()} />
        <Btn disabled={busy} onClick={login}>{busy ? 'SIGNING IN…' : 'LOG IN'}</Btn>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 12, fontSize: 12.5, fontWeight: 600 }}>
        <span style={{ color: 'var(--rose)', cursor: 'pointer' }} onClick={() => nav('/auth', { state: { register: true } })}>Create account</span>
        <span style={{ color: 'var(--sub)', cursor: 'pointer' }} onClick={() => nav('/auth', { state: { forgot: true } })}>Forgot password</span>
      </div>
    </Card>
  )
}

function Faq({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={open ? undefined : 'press'} onClick={() => { vibrate(3); setOpen(!open) }} style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{q}</div>
        <div style={{ color: 'var(--rose)', fontSize: 16, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .25s', flexShrink: 0 }}>+</div>
      </div>
      {open && <div style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.65, marginTop: 8, animation: 'plFade .25s' }}>{a}</div>}
    </div>
  )
}

export default function PublicHome() {
  const nav = useNavigate()
  const featured = useApi('/featured')
  const studio = useApi('/studio')
  const packages = useApi('/packages')
  const instructors = useApi('/instructors')

  return (
    <div style={{ animation: 'plFade .3s', marginTop: -12 }}>
      {/* ── hero ── */}
      <div style={{ position: 'relative', height: 440, overflow: 'hidden' }}>
        <img src={IMAGES.heroReformer} alt="Reformer Pilates at Reform by Energym" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,247,249,.25) 0%, rgba(56,38,46,.18) 40%, rgba(56,38,46,.72) 100%)' }} />
        <div style={{ position: 'absolute', left: 24, right: 24, bottom: 26, color: '#fff' }}>
          <Monogram size={44} color="#fff" />
          <div style={{ fontFamily: 'Marcellus,serif', fontSize: 33, lineHeight: 1.15, marginTop: 10 }}>Strength,<br />made graceful.</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.6, opacity: 0.92, marginTop: 8, maxWidth: 300 }}>
            Boutique reformer Pilates in an intimate, light-filled studio. Small classes, expert eyes, and movement that carries into everything you do.
          </div>
          <div style={{ display: 'flex', gap: 9, marginTop: 16, flexWrap: 'wrap' }}>
            <Btn small onClick={() => nav('/schedule')} style={{ padding: '11px 18px' }}>BOOK A CLASS</Btn>
            <Btn small kind="soft" onClick={() => nav('/schedule')} style={{ padding: '11px 18px', background: 'rgba(255,255,255,.92)' }}>VIEW SCHEDULE</Btn>
            <Btn small kind="soft" onClick={() => nav('/packages')} style={{ padding: '11px 18px', background: 'rgba(255,255,255,.92)' }}>PACKAGES</Btn>
          </div>
        </div>
      </div>

      {/* ── stats strip ── */}
      <div style={{ display: 'flex', gap: 10, padding: '16px 24px 0' }}>
        {[
          [studio.data?.stats.weeklyClasses ?? '—', 'classes a week'],
          ['8', 'max per class'],
          [studio.data?.stats.instructors ?? '—', 'expert instructors'],
        ].map(([v, k]) => (
          <Card key={k} style={{ flex: 1, padding: '13px 8px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Marcellus,serif', fontSize: 24, color: 'var(--rose)' }}>{v}</div>
            <div style={{ fontSize: 10.5, color: 'var(--sub)', marginTop: 2 }}>{k}</div>
          </Card>
        ))}
      </div>

      {/* ── featured classes ── */}
      <SectionLabel right={<div onClick={() => nav('/schedule')} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', color: 'var(--rose)', cursor: 'pointer' }}>FULL SCHEDULE</div>}>This week at Reform</SectionLabel>
      {featured.loading ? <div style={{ padding: '0 24px' }}><Skeleton height={200} /></div> : (
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 24px 6px' }}>
          {(featured.data?.featured || []).map((s) => (
            <Card key={s.id} style={{ flex: '0 0 224px', overflow: 'hidden' }} onClick={() => nav(`/class/${s.id}`)}>
              <div style={{ position: 'relative' }}>
                <img src={s.image} alt="" style={{ width: '100%', height: 104, objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', top: 8, left: 8 }}>{availabilityTag(s)}</div>
              </div>
              <div style={{ padding: '11px 14px 13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{s.className}</div>
                  <Tag tone="grey">{s.level.split(' ')[0]}</Tag>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--sub)', marginTop: 3 }}>
                  {relDay(s.startsAt)} · {fmtTime(s.startsAt)} · {s.durationMin} min
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 9 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <img src={s.instructor.photo} alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                    <span style={{ fontSize: 11.5, color: 'var(--sub)' }}>{s.instructor.name.split(' ')[0]}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', color: '#fff', background: 'var(--rose)', borderRadius: 100, padding: '6px 13px' }}>BOOK</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── about ── */}
      <div style={{ margin: '24px 24px 0', borderRadius: 26, overflow: 'hidden', boxShadow: 'var(--shadow)', background: 'var(--card)' }}>
        <img src={classStretch} alt="The Reform studio" style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }} />
        <div style={{ padding: '18px 20px 20px' }}>
          <div style={{ fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--rose)', fontWeight: 700 }}>About Reform</div>
          <div style={{ fontFamily: 'Marcellus,serif', fontSize: 21, lineHeight: 1.3, marginTop: 6 }}>Reformer Pilates, without the intimidation</div>
          <div style={{ fontSize: 13.5, color: 'var(--sub)', lineHeight: 1.7, marginTop: 8 }}>
            Reform by Energym is a boutique reformer studio built around one idea: precise, low-impact strength work should feel like a treat, not a test.
            Classes never exceed eight, every exercise scales from first-timer to athlete, and our instructors coach form obsessively — because that's where results live.
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
            {['Posture', 'Core strength', 'Flexibility', 'Low impact', 'Rehab-friendly', 'Pre/post-natal'].map((t) => <Tag key={t}>{t}</Tag>)}
          </div>
          <Btn small kind="soft" style={{ marginTop: 14, display: 'inline-block' }} onClick={() => nav('/about')}>MORE ABOUT US</Btn>
        </div>
      </div>

      {/* ── how it works ── */}
      <SectionLabel>How it works</SectionLabel>
      <div style={{ margin: '0 24px', paddingLeft: 10, borderLeft: '2px solid var(--pinksoft)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {STEPS.map(([title, text], i) => (
          <div key={title} style={{ position: 'relative', marginLeft: 10 }}>
            <div style={{ position: 'absolute', left: -27, top: 0, width: 22, height: 22, borderRadius: '50%', background: 'var(--rose)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
            <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>{text}</div>
          </div>
        ))}
      </div>

      {/* ── packages preview ── */}
      <SectionLabel right={<div onClick={() => nav('/packages')} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', color: 'var(--rose)', cursor: 'pointer' }}>COMPARE ALL</div>}>Packages & memberships</SectionLabel>
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 24px 6px' }}>
        {(packages.data?.packages || []).filter((p) => p.intro || p.popular || p.kind === 'membership').map((p) => (
          <Card key={p.id} style={{ flex: '0 0 200px', padding: '16px 18px', border: `1.5px solid ${p.popular ? 'var(--rose)' : 'var(--line)'}` }} onClick={() => nav('/packages')}>
            {p.intro ? <Tag style={{ background: 'var(--ink)', color: '#fff' }}>Intro offer</Tag> : p.popular ? <Tag>Most popular</Tag> : <Tag tone="grey">Membership</Tag>}
            <div style={{ fontFamily: 'Marcellus,serif', fontSize: 18, marginTop: 9 }}>{p.name.replace('Intro Offer · ', '')}</div>
            <div style={{ fontFamily: 'Marcellus,serif', fontSize: 24, color: 'var(--rose)', marginTop: 4 }}>£{(p.price_cents / 100).toFixed(0)}</div>
            <div style={{ fontSize: 11.5, color: 'var(--sub)', marginTop: 4, lineHeight: 1.5 }}>
              {p.classes ? `${p.classes} class${p.classes > 1 ? 'es' : ''}` : 'Unlimited classes'} · valid {Math.round(p.validity_days / 30)} month{p.validity_days > 45 ? 's' : ''}
            </div>
          </Card>
        ))}
      </div>

      {/* ── instructors ── */}
      <SectionLabel right={<div onClick={() => nav('/instructors')} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', color: 'var(--rose)', cursor: 'pointer' }}>MEET THE TEAM</div>}>Your instructors</SectionLabel>
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 24px 6px' }}>
        {(instructors.data?.instructors || []).map((i) => (
          <Card key={i.id} style={{ flex: '0 0 150px', padding: '16px 14px', textAlign: 'center' }} onClick={() => nav(`/instructors/${i.id}`)}>
            <img src={i.photo} alt={i.name} style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'cover', margin: '0 auto', border: '2.5px solid var(--pinksoft)' }} />
            <div style={{ fontWeight: 600, fontSize: 13.5, marginTop: 9 }}>{i.name}</div>
            <div style={{ fontSize: 10.5, color: 'var(--sub)', marginTop: 3 }}>{i.specialties}</div>
          </Card>
        ))}
      </div>

      {/* ── studio experience ── */}
      <SectionLabel>The studio</SectionLabel>
      <div style={{ display: 'flex', gap: 8, padding: '0 24px' }}>
        <img src={instructorHero} alt="Studio One" style={{ flex: 1.4, height: 150, borderRadius: 20, objectFit: 'cover', minWidth: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
          <img src={classCore} alt="Reformer detail" style={{ width: '100%', height: 71, borderRadius: 20, objectFit: 'cover' }} />
          <img src={challenge} alt="Members" style={{ width: '100%', height: 71, borderRadius: 20, objectFit: 'cover' }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '12px 24px 0' }}>
        {FACILITIES.map(([icon, title, text]) => (
          <Card key={title} style={{ padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: 11, background: 'var(--pinksoft)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon d={icon} size={15} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{title}</div>
              <div style={{ fontSize: 10.5, color: 'var(--sub)' }}>{text}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* ── testimonials ── */}
      <SectionLabel>Members on Reform</SectionLabel>
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 24px 6px' }}>
        {(studio.data?.testimonials || []).map((t) => (
          <Card key={t.id} style={{ flex: '0 0 240px', padding: '16px 18px', background: 'linear-gradient(135deg, var(--pinksoft), var(--card))' }}>
            <div style={{ color: 'var(--rose)', fontSize: 13, letterSpacing: 2 }}>{'★'.repeat(t.rating)}</div>
            <div style={{ fontSize: 13, lineHeight: 1.6, marginTop: 8, fontStyle: 'italic' }}>“{t.text}”</div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--sub)', marginTop: 10 }}>— {t.name}</div>
          </Card>
        ))}
      </div>

      {/* ── FAQs ── */}
      <SectionLabel>Common questions</SectionLabel>
      <Card style={{ margin: '0 24px', overflow: 'hidden' }}>
        {(studio.data?.faqs || []).slice(0, 6).map((f) => <Faq key={f.id} q={f.question} a={f.answer} />)}
        <div className="press" onClick={() => nav('/about')} style={{ padding: '13px 18px', fontSize: 12.5, fontWeight: 700, color: 'var(--rose)', cursor: 'pointer', textAlign: 'center' }}>ALL QUESTIONS & STUDIO INFO</div>
      </Card>

      {/* ── final CTA ── */}
      <div style={{ margin: '24px 24px 0', borderRadius: 26, overflow: 'hidden', position: 'relative' }}>
        <img src={classReformer} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(56,38,46,.55), rgba(56,38,46,.78))' }} />
        <div style={{ position: 'relative', padding: '30px 24px', textAlign: 'center', color: '#fff' }}>
          <div style={{ fontFamily: 'Marcellus,serif', fontSize: 23, lineHeight: 1.3 }}>Your first class is waiting</div>
          <div style={{ fontSize: 13, opacity: 0.9, marginTop: 6 }}>Three classes for £60 with the Intro Offer.</div>
          <div style={{ display: 'flex', gap: 9, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
            <Btn small onClick={() => nav('/schedule')} style={{ padding: '11px 18px' }}>BOOK YOUR FIRST CLASS</Btn>
            <Btn small kind="soft" onClick={() => nav('/auth', { state: { register: true } })} style={{ padding: '11px 18px', background: 'rgba(255,255,255,.92)' }}>CREATE ACCOUNT</Btn>
          </div>
        </div>
      </div>

      {/* ── inline login ── */}
      <SectionLabel>Already a member?</SectionLabel>
      <InlineLogin />

      {/* ── footer ── */}
      <div style={{ margin: '26px 0 0', padding: '26px 24px 14px', background: 'var(--blush)', borderTop: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><Wordmark height={24} color="var(--sub)" /></div>
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--sub)', lineHeight: 1.9, marginTop: 12 }}>
          12 Energym Lane · London · E2 8RE<br />
          hello@reformbyenergym.com · 020 7946 0512<br />
          Mon–Sat 6am–8pm · Sun 8am–2pm
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12, fontSize: 12, fontWeight: 600, color: 'var(--rose)', flexWrap: 'wrap' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => nav('/schedule')}>Schedule</span>
          <span style={{ cursor: 'pointer' }} onClick={() => nav('/packages')}>Packages</span>
          <span style={{ cursor: 'pointer' }} onClick={() => nav('/instructors')}>Instructors</span>
          <span style={{ cursor: 'pointer' }} onClick={() => nav('/contact')}>Contact</span>
          <span style={{ cursor: 'pointer' }} onClick={() => nav('/auth')}>Log in</span>
        </div>
      </div>
    </div>
  )
}
