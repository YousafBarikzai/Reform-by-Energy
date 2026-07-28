import { useNavigate } from 'react-router-dom'
import { useApi } from '../api.js'
import { useAuth } from '../auth.jsx'
import { ICONS } from '../data.js'
import Icon from '../components/Icon.jsx'
import { Wordmark } from '../components/Logo.jsx'
import { Card, ErrorState, PageSkeleton, SectionLabel, useToast, vibrate } from '../ui.jsx'

function Row({ icon, name, hint, onClick, danger, isLast }) {
  return (
    <div className="press" onClick={() => { vibrate(4); onClick?.() }} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 18px', borderBottom: isLast ? 'none' : '1px solid var(--line)', cursor: 'pointer' }}>
      <div style={{ width: 34, height: 34, borderRadius: 11, background: danger ? '#FBE2E2' : 'var(--pinksoft)', color: danger ? '#B03A3A' : 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon d={icon} size={16} />
      </div>
      <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: danger ? '#B03A3A' : 'var(--ink)' }}>{name}</div>
      {hint && <div style={{ fontSize: 11.5, color: 'var(--sub)' }}>{hint}</div>}
      <Icon d={ICONS.chevron} size={13} color="var(--line)" strokeWidth={2.4} />
    </div>
  )
}

export default function Profile() {
  const nav = useNavigate()
  const { member, logout } = useAuth()
  const { data } = useApi('/dashboard')
  const toast = useToast()
  if (!member) return <PageSkeleton />
  const d = data

  return (
    <div style={{ animation: 'plFade .3s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 24px 0' }}>
        <div style={{ fontFamily: 'Marcellus,serif', fontSize: 30 }}>Profile</div>
        <div className="press" onClick={() => nav('/profile/settings')} style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--card)', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon d={ICONS.gear} size={19} strokeWidth={1.4} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 24px 0', textAlign: 'center' }}>
        <div style={{ padding: 4, borderRadius: '50%', background: 'linear-gradient(135deg,var(--pink),var(--pinksoft))' }}>
          {member.photo
            ? <img src={member.photo} alt="" style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', display: 'block', border: '3px solid var(--card)' }} />
            : <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Marcellus,serif', fontSize: 34, color: 'var(--rose)', border: '3px solid var(--card)' }}>{member.firstName[0]}</div>}
        </div>
        <div style={{ fontFamily: 'Marcellus,serif', fontSize: 24, marginTop: 12 }}>{member.firstName} {member.lastName}</div>
        <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 3 }}>{member.email}</div>
        {d && <div style={{ fontSize: 11.5, color: 'var(--rose)', fontWeight: 700, marginTop: 5, letterSpacing: '.08em', textTransform: 'uppercase' }}>{d.tier} tier · {d.points} points</div>}
      </div>

      {/* membership card CTA */}
      <Card onClick={() => nav('/profile/card')} style={{ margin: '18px 24px 0', padding: '16px 20px', background: 'linear-gradient(120deg, var(--ink), #5A3D4A)', color: '#fff', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon d={ICONS.qr} size={19} color="#fff" /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Digital membership card</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>QR check-in · {member.membershipNumber}</div>
        </div>
        <Icon d={ICONS.chevron} size={14} color="rgba(255,255,255,.5)" strokeWidth={2.4} />
      </Card>

      <SectionLabel>My journey</SectionLabel>
      <Card style={{ margin: '0 24px', overflow: 'hidden' }}>
        <Row icon={ICONS.mirror} name="Reform Mirror" hint="Your private journal" onClick={() => nav('/profile/mirror')} />
        <Row icon={ICONS.trophy} name="Progress dashboard" onClick={() => nav('/profile/progress')} />
        <Row icon={ICONS.camera} name="Transformation journey" hint="Private" onClick={() => nav('/profile/journey')} />
        <Row icon={ICONS.sun} name="Wellness check-in" onClick={() => nav('/profile/wellness')} />
        <Row icon={ICONS.booking} name="Class history" onClick={() => nav('/profile/history')} isLast />
      </Card>

      <SectionLabel>Rewards & community</SectionLabel>
      <Card style={{ margin: '0 24px', overflow: 'hidden' }}>
        <Row icon={ICONS.sparkle} name="Rewards wallet" hint={d ? `${d.points} pts` : ''} onClick={() => nav('/profile/rewards')} />
        <Row icon={ICONS.flame} name="Challenges" onClick={() => nav('/profile/challenges')} />
        <Row icon={ICONS.heart} name="Saved favourites" onClick={() => nav('/library')} isLast />
      </Card>

      <SectionLabel>Account</SectionLabel>
      <Card style={{ margin: '0 24px', overflow: 'hidden' }}>
        <Row icon={ICONS.user} name="Personal details & preferences" onClick={() => nav('/profile/settings')} />
        <Row icon={ICONS.tag} name="My membership" onClick={() => nav('/packages')} />
        <Row icon={ICONS.card} name="Payment methods" hint="Demo mode" onClick={() => toast('Payments run in demo mode — a provider is connected before launch')} />
        <Row icon={ICONS.bell} name="Notification settings" onClick={() => nav('/profile/settings')} />
        <Row icon={ICONS.watch} name="Connected services" onClick={() => nav('/profile/settings')} isLast />
      </Card>

      <SectionLabel>Support</SectionLabel>
      <Card style={{ margin: '0 24px', overflow: 'hidden' }}>
        <Row icon={ICONS.help} name="Help centre" onClick={() => toast('Ask at the front desk or email hello@reformbyenergym.com')} />
        <Row icon={ICONS.mail} name="Contact us" onClick={() => { window.location.href = 'mailto:hello@reformbyenergym.com' }} />
        {member.role === 'admin' && <Row icon={ICONS.shield} name="Studio admin (CMS)" onClick={() => nav('/admin')} />}
        <Row icon={ICONS.logout} name="Sign out" danger onClick={async () => { await logout(); nav('/') }} isLast />
      </Card>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '26px 0 6px', opacity: 0.45 }}>
        <Wordmark height={22} color="var(--sub)" />
      </div>
    </div>
  )
}
