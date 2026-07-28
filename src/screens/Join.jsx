import { useNavigate } from 'react-router-dom'
import { ICONS } from '../data.js'
import Icon from '../components/Icon.jsx'
import { Monogram, Wordmark } from '../components/Logo.jsx'
import { Btn, Card, SectionLabel } from '../ui.jsx'

const BENEFITS = [
  [ICONS.calendar, 'Book in seconds', 'Live availability, favourite reformer saved, automatic waiting lists.'],
  [ICONS.trophy, 'Track your progress', 'Streaks, badges, attendance analytics, and a private wellness journal.'],
  [ICONS.sparkle, 'Earn rewards', 'Points for every class, redeemable for free sessions, guest passes, and merch.'],
  [ICONS.play, 'Full technique library', 'Step-by-step reformer guidance from our instructors, on demand.'],
  [ICONS.qr, 'Digital membership card', 'QR check-in, credits, and referral code — always in your pocket.'],
]

// Shown behind the Profile tab for visitors who are not signed in.
export default function Join() {
  const nav = useNavigate()
  return (
    <div style={{ animation: 'plFade .3s' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '26px 24px 0', textAlign: 'center' }}>
        <Monogram size={52} />
        <div style={{ fontFamily: 'Marcellus,serif', fontSize: 26, marginTop: 12 }}>Your Reform account</div>
        <div style={{ fontSize: 13.5, color: 'var(--sub)', lineHeight: 1.6, marginTop: 6, maxWidth: 280 }}>
          One account for bookings, progress, rewards, and your private member area.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, padding: '20px 24px 0' }}>
        <Btn style={{ flex: 1 }} onClick={() => nav('/auth', { state: { from: '/profile', register: true } })}>CREATE ACCOUNT</Btn>
        <Btn kind="outline" style={{ flex: 1 }} onClick={() => nav('/auth', { state: { from: '/profile' } })}>LOG IN</Btn>
      </div>

      <SectionLabel>Membership benefits</SectionLabel>
      <Card style={{ margin: '0 24px', overflow: 'hidden' }}>
        {BENEFITS.map(([icon, title, text], i) => (
          <div key={title} style={{ display: 'flex', gap: 13, padding: '14px 18px', borderBottom: i === BENEFITS.length - 1 ? 'none' : '1px solid var(--line)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--pinksoft)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon d={icon} size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
              <div style={{ fontSize: 12, color: 'var(--sub)', lineHeight: 1.5, marginTop: 2 }}>{text}</div>
            </div>
          </div>
        ))}
      </Card>

      <SectionLabel>New here?</SectionLabel>
      <Card style={{ margin: '0 24px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 13 }} onClick={() => nav('/packages')}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--pinksoft)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon d={ICONS.tag} size={16} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Intro Offer · 3 classes for £60</div>
          <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>The easiest way to try the reformer.</div>
        </div>
        <Icon d={ICONS.chevron} size={13} color="var(--line)" strokeWidth={2.4} />
      </Card>

      <SectionLabel>Help & support</SectionLabel>
      <Card style={{ margin: '0 24px 10px', overflow: 'hidden' }}>
        <div className="press" onClick={() => nav('/contact')} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 18px', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}>
          <Icon d={ICONS.mail} size={16} color="var(--rose)" />
          <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>Contact the studio</div>
          <Icon d={ICONS.chevron} size={13} color="var(--line)" strokeWidth={2.4} />
        </div>
        <div className="press" onClick={() => nav('/about')} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 18px', cursor: 'pointer' }}>
          <Icon d={ICONS.help} size={16} color="var(--rose)" />
          <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>About Reform & FAQs</div>
          <Icon d={ICONS.chevron} size={13} color="var(--line)" strokeWidth={2.4} />
        </div>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '18px 0 6px', opacity: 0.45 }}>
        <Wordmark height={20} color="var(--sub)" />
      </div>
    </div>
  )
}
