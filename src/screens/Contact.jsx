import { useNavigate } from 'react-router-dom'
import { ICONS } from '../data.js'
import Icon from '../components/Icon.jsx'
import { Btn, Card, SectionLabel } from '../ui.jsx'
import challenge from '../assets/images/challenge.jpg'

const ROWS = [
  [ICONS.pin, 'Visit us', '12 Energym Lane, London E2 8RE'],
  [ICONS.mail, 'Email', 'hello@reformbyenergym.com'],
  [ICONS.bell, 'Call', '020 7946 0512'],
  [ICONS.clock, 'Hours', 'Mon–Sat 6am–8pm · Sun 8am–2pm'],
]

export default function Contact() {
  const nav = useNavigate()
  return (
    <div style={{ animation: 'plFade .3s' }}>
      <div style={{ fontFamily: 'Marcellus,serif', fontSize: 30, padding: '22px 24px 0' }}>Contact</div>
      <div style={{ margin: '16px 24px 0', borderRadius: 24, overflow: 'hidden', position: 'relative' }}>
        <img src={challenge} alt="Reform by Energym studio" style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(56,38,46,0) 40%, rgba(56,38,46,.6))' }} />
        <div style={{ position: 'absolute', left: 18, bottom: 14, color: '#fff', fontFamily: 'Marcellus,serif', fontSize: 19 }}>We'd love to meet you</div>
      </div>

      <SectionLabel>Find us</SectionLabel>
      <Card style={{ margin: '0 24px', overflow: 'hidden' }}>
        {ROWS.map(([icon, title, text], i) => (
          <div key={title} style={{ display: 'flex', gap: 13, alignItems: 'center', padding: '14px 18px', borderBottom: i === ROWS.length - 1 ? 'none' : '1px solid var(--line)' }}>
            <div style={{ width: 34, height: 34, borderRadius: 11, background: 'var(--pinksoft)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon d={icon} size={15} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--sub)' }}>{title}</div>
              <div style={{ fontSize: 13.5, fontWeight: 500, marginTop: 2 }}>{text}</div>
            </div>
          </div>
        ))}
      </Card>

      <SectionLabel>Getting here</SectionLabel>
      <Card style={{ margin: '0 24px', padding: '15px 18px', fontSize: 13, color: 'var(--sub)', lineHeight: 1.8 }}>
        Free 2-hour street parking on Energym Lane, with a pay-and-display car park two minutes' walk away.
        The 41 and 87 buses stop directly outside, and Hoxton Overground is an eight-minute walk.
        The studio is step-free throughout.
      </Card>

      <div style={{ padding: '20px 24px 0' }}>
        <a href="mailto:hello@reformbyenergym.com" style={{ textDecoration: 'none' }}>
          <Btn>EMAIL THE STUDIO</Btn>
        </a>
      </div>
      <div style={{ padding: '10px 24px 12px' }}>
        <Btn kind="soft" onClick={() => nav('/about')}>STUDIO INFO & FAQS</Btn>
      </div>
    </div>
  )
}
