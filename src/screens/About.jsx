import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../api.js'
import { ICONS, IMAGES } from '../data.js'
import Icon from '../components/Icon.jsx'
import { Btn, Card, ErrorState, PageSkeleton, SectionLabel, Tag, vibrate } from '../ui.jsx'
import classStretch from '../assets/images/class-stretch.jpg'
import instructorHero from '../assets/images/instructor-hero.jpg'

function Faq({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div onClick={() => { vibrate(3); setOpen(!open) }} style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{q}</div>
        <div style={{ color: 'var(--rose)', fontSize: 16, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .25s', flexShrink: 0 }}>+</div>
      </div>
      {open && <div style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.65, marginTop: 8, animation: 'plFade .25s' }}>{a}</div>}
    </div>
  )
}

export default function About() {
  const nav = useNavigate()
  const { data, loading, error, refetch } = useApi('/studio')
  if (loading) return <PageSkeleton />
  if (error) return <ErrorState error={error} retry={refetch} />
  return (
    <div style={{ animation: 'plFade .3s' }}>
      <div style={{ fontFamily: 'Marcellus,serif', fontSize: 30, padding: '22px 24px 0' }}>About Reform</div>

      <div style={{ margin: '16px 24px 0', borderRadius: 24, overflow: 'hidden' }}>
        <img src={IMAGES.heroReformer} alt="The Reform studio" style={{ width: '100%', height: 170, objectFit: 'cover', display: 'block' }} />
      </div>
      <div style={{ padding: '16px 24px 0', fontSize: 14, color: 'var(--sub)', lineHeight: 1.75 }}>
        Reform by Energym began with a simple frustration: reformer Pilates was either clinical and joyless, or crowded and careless.
        We built the studio we wanted to train in — <b style={{ color: 'var(--ink)' }}>intimate classes of eight</b>, instructors who coach form relentlessly,
        and a space designed to lower your shoulders the moment you walk in.
      </div>
      <div style={{ padding: '12px 24px 0', fontSize: 14, color: 'var(--sub)', lineHeight: 1.75 }}>
        The reformer's springs make it the most scalable strength tool there is: gentle enough for rehabilitation and pregnancy,
        demanding enough for athletes. Whatever brings you in — posture, strength, recovery, or calm — the machine meets you where you are.
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '14px 24px 0' }}>
        {['Precision over reps', 'Small by design', 'Every body welcome', 'Breath first'].map((t) => <Tag key={t}>{t}</Tag>)}
      </div>

      <SectionLabel>The space</SectionLabel>
      <div style={{ display: 'flex', gap: 8, padding: '0 24px' }}>
        <img src={instructorHero} alt="Studio One" style={{ flex: 1, height: 120, borderRadius: 18, objectFit: 'cover', minWidth: 0 }} />
        <img src={classStretch} alt="Stretch area" style={{ flex: 1, height: 120, borderRadius: 18, objectFit: 'cover', minWidth: 0 }} />
      </div>
      <Card style={{ margin: '12px 24px 0', padding: '15px 18px', fontSize: 13, color: 'var(--sub)', lineHeight: 1.8 }}>
        Two studios, fourteen reformers, showers and changing areas, filtered water, and lockers.
        Step-free access throughout. Free 2-hour parking on Energym Lane; the 41 and 87 buses stop outside.
      </Card>

      <SectionLabel>Frequently asked questions</SectionLabel>
      <Card style={{ margin: '0 24px', overflow: 'hidden' }}>
        {data.faqs.map((f) => <Faq key={f.id} q={f.question} a={f.answer} />)}
      </Card>

      <div style={{ padding: '20px 24px 12px', display: 'flex', gap: 10 }}>
        <Btn style={{ flex: 1 }} onClick={() => nav('/schedule')}>VIEW SCHEDULE</Btn>
        <Btn kind="soft" style={{ flex: 1 }} onClick={() => nav('/contact')}>CONTACT US</Btn>
      </div>
    </div>
  )
}
