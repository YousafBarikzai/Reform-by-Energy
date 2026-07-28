import { ICONS, MEMBER } from '../data.js'
import Icon from '../components/Icon.jsx'
import { Wordmark } from '../components/Logo.jsx'

function Row({ icon, name, danger, isLast }) {
  return (
    <div className="press" style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '15px 18px', borderBottom: isLast ? 'none' : '1px solid var(--line)', cursor: 'pointer' }}>
      <div style={{ width: 34, height: 34, borderRadius: 11, background: 'var(--pinksoft)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon d={icon} size={16} />
      </div>
      <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: danger ? 'var(--rose)' : 'var(--ink)' }}>{name}</div>
      <Icon d={ICONS.chevron} size={14} color="var(--line)" strokeWidth={2.2} />
    </div>
  )
}

const label = { fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--sub)', fontWeight: 600, padding: '22px 24px 10px' }

export default function ProfileTab() {
  return (
    <div style={{ animation: 'plFade .3s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 24px 0' }}>
        <div style={{ fontFamily: 'Marcellus,serif', fontSize: 30 }}>Profile</div>
        <div className="press" style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--card)', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon d={ICONS.gear} size={19} strokeWidth={1.4} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '22px 24px 0', textAlign: 'center' }}>
        <div style={{ padding: 4, borderRadius: '50%', background: 'linear-gradient(135deg,var(--pink),var(--pinksoft))' }}>
          <img src={MEMBER.avatar} alt={MEMBER.name} style={{ width: 92, height: 92, borderRadius: '50%', objectFit: 'cover', display: 'block', border: '3px solid var(--card)' }} />
        </div>
        <div style={{ fontFamily: 'Marcellus,serif', fontSize: 24, marginTop: 12 }}>{MEMBER.name}</div>
        <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 3 }}>{MEMBER.email}</div>
      </div>

      <div style={label}>Account</div>
      <div style={{ margin: '0 24px', background: 'var(--card)', borderRadius: 22, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
        <Row icon={ICONS.booking} name="My Bookings" />
        <Row icon={ICONS.tag} name="My Membership" />
        <Row icon={ICONS.card} name="Payment Methods" />
        <Row icon={ICONS.bell} name="Notifications" />
        <Row icon={ICONS.gear} name="Settings" isLast />
      </div>

      <div style={label}>Support</div>
      <div style={{ margin: '0 24px', background: 'var(--card)', borderRadius: 22, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
        <Row icon={ICONS.help} name="Help Center" />
        <Row icon={ICONS.mail} name="Contact Us" />
        <Row icon={ICONS.logout} name="Log Out" danger isLast />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '26px 0 6px', opacity: 0.45 }}>
        <Wordmark height={22} color="var(--sub)" />
      </div>
    </div>
  )
}
