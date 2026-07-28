import { api, useApi } from '../api.js'
import { Monogram, Wordmark } from '../components/Logo.jsx'
import { Btn, Card, ErrorState, PageSkeleton, Tag, TopBar, fmtDate, useToast } from '../ui.jsx'

export default function MemberCard() {
  const { data, loading, error, refetch } = useApi('/card')
  const toast = useToast()
  if (loading) return <PageSkeleton />
  if (error) return <ErrorState error={error} retry={refetch} />
  const d = data

  async function checkin() {
    try {
      await api.post('/checkin')
      toast('Checked in — enjoy class! +25 points')
      refetch()
    } catch (err) { toast(err.message, 'err') }
  }

  return (
    <div style={{ animation: 'plFade .3s' }}>
      <TopBar title="Membership card" />

      {/* wallet-style card */}
      <div style={{ margin: '18px 24px 0', borderRadius: 26, overflow: 'hidden', boxShadow: '0 18px 44px rgba(56,38,46,.28)', background: 'linear-gradient(135deg, #46303A 0%, var(--ink) 55%, #5A3D4A 100%)', color: '#fff', position: 'relative' }}>
        <div style={{ position: 'absolute', top: -60, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(242,169,192,.3), transparent 70%)' }} />
        <div style={{ padding: '20px 22px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Monogram size={38} color="#F2A9C0" />
            <Tag style={{ background: 'rgba(255,255,255,.16)', color: '#fff' }}>{d.status}</Tag>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginTop: 16 }}>
            {d.photo && <img src={d.photo} alt="" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(242,169,192,.6)' }} />}
            <div>
              <div style={{ fontFamily: 'Marcellus,serif', fontSize: 21 }}>{d.name}</div>
              <div style={{ fontSize: 11.5, opacity: 0.7, marginTop: 2 }}>{d.membershipNumber} · {d.tier} tier</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 18, marginTop: 16, fontSize: 11.5 }}>
            <div><div style={{ opacity: 0.6 }}>Package</div><b>{d.type}</b></div>
            <div><div style={{ opacity: 0.6 }}>Credits</div><b>{d.creditsLeft}</b></div>
            {d.expiresAt && <div><div style={{ opacity: 0.6 }}>Expires</div><b>{fmtDate(d.expiresAt)}</b></div>}
            <div><div style={{ opacity: 0.6 }}>Points</div><b>{d.points}</b></div>
          </div>
        </div>
        {/* QR panel */}
        <div style={{ background: '#fff', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 18 }}>
          <img src={d.qrDataUrl} alt="Check-in QR code" style={{ width: 108, height: 108, borderRadius: 10 }} />
          <div style={{ color: 'var(--ink)' }}>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>Studio check-in</div>
            <div style={{ fontSize: 11.5, color: 'var(--sub)', lineHeight: 1.55, marginTop: 4 }}>
              Scan at the front desk to check in to your booked class.
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--sub)', marginTop: 6 }}>
              Guest passes <b style={{ color: 'var(--rose)' }}>{d.guestPasses}</b> · Referral code <b style={{ color: 'var(--rose)' }}>{d.referralCode}</b>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 24px 10px' }}>
        <Btn onClick={checkin}>SELF CHECK-IN (SCANNER DEMO)</Btn>
        <div style={{ fontSize: 11.5, color: 'var(--sub)', textAlign: 'center', marginTop: 10, lineHeight: 1.6 }}>
          Checks you into your next booked class within the arrival window
          (30 min before → 2 h after start) — the same action the front-desk scanner performs.
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 6px', opacity: 0.4 }}>
        <Wordmark height={20} color="var(--sub)" />
      </div>
    </div>
  )
}
