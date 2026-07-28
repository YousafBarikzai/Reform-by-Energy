import { useState } from 'react'
import { api, useApi } from '../api.js'
import { ICONS } from '../data.js'
import Icon from '../components/Icon.jsx'
import { Btn, Card, ErrorState, PageSkeleton, SectionLabel, Sheet, Tag, fmtDate, useToast } from '../ui.jsx'

const price = (cents) => `£${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`

export default function Packages() {
  const { data, loading, error, refetch } = useApi('/packages')
  const [tab, setTab] = useState('packages')
  const [buying, setBuying] = useState(null)
  const [busy, setBusy] = useState(false)
  const toast = useToast()

  if (loading) return <PageSkeleton />
  if (error) return <ErrorState error={error} retry={refetch} />
  const d = data
  const packs = d.packages.filter((p) => p.kind === 'pack')
  const memberships = d.packages.filter((p) => p.kind === 'membership')

  async function purchase() {
    setBusy(true)
    try {
      const r = await api.post(`/packages/${buying.id}/purchase`)
      toast(`Purchase confirmed · receipt ${r.receipt}`)
      setBuying(null)
      refetch()
    } catch (err) {
      toast(err.message, 'err')
    } finally {
      setBusy(false)
    }
  }

  const perClass = (p) => (p.classes ? p.price_cents / p.classes : null)

  return (
    <div style={{ animation: 'plFade .3s' }}>
      <div style={{ fontFamily: 'Marcellus,serif', fontSize: 30, padding: '22px 24px 0' }}>Membership</div>
      <div style={{ display: 'flex', gap: 26, padding: '16px 24px 0', borderBottom: '1px solid var(--line)' }}>
        {[['packages', 'PACKAGES'], ['membership', 'MEMBERSHIP']].map(([id, name]) => (
          <div key={id} onClick={() => setTab(id)} style={{ paddingBottom: 11, fontSize: 12, fontWeight: 700, letterSpacing: '.1em', color: tab === id ? 'var(--rose)' : 'var(--sub)', borderBottom: tab === id ? '2px solid var(--rose)' : '2px solid transparent', cursor: 'pointer', transition: 'color .2s' }}>{name}</div>
        ))}
      </div>

      {/* current pack summary */}
      {d.current && (
        <Card style={{ margin: '18px 24px 0', padding: '16px 20px', background: 'linear-gradient(120deg,var(--pinksoft),var(--card))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--rose)', fontWeight: 700 }}>Current package</div>
              <div style={{ fontFamily: 'Marcellus,serif', fontSize: 20, marginTop: 3 }}>{d.current.package_name}</div>
              <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 3 }}>Valid until {fmtDate(d.current.expires_at)}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Marcellus,serif', fontSize: 34, color: 'var(--rose)', lineHeight: 1 }}>{d.current.credits_left ?? '∞'}</div>
              <div style={{ fontSize: 10.5, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 2 }}>left</div>
            </div>
          </div>
          {d.current.credits_total && (
            <div style={{ height: 6, background: 'rgba(255,255,255,.7)', borderRadius: 100, marginTop: 12, overflow: 'hidden' }}>
              <div style={{ width: `${(d.current.credits_left / d.current.credits_total) * 100}%`, height: '100%', background: 'var(--rose)', borderRadius: 100, transition: 'width .5s' }} />
            </div>
          )}
        </Card>
      )}

      {tab === 'packages' ? (
        <>
          <SectionLabel>Choose a package</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '0 24px' }}>
            {packs.map((p) => (
              <Card key={p.id} style={{ overflow: 'hidden', border: `1.5px solid ${p.popular ? 'var(--rose)' : 'var(--line)'}` }}>
                {p.popular ? <div style={{ background: 'var(--pinksoft)', color: 'var(--rose)', fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textAlign: 'center', padding: '7px 0' }}>MOST POPULAR</div> : null}
                {p.intro ? <div style={{ background: 'var(--ink)', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textAlign: 'center', padding: '7px 0' }}>INTRO OFFER</div> : null}
                <div style={{ padding: '15px 20px 17px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontFamily: 'Marcellus,serif', fontSize: 21 }}>{p.name}</div>
                    <div style={{ fontFamily: 'Marcellus,serif', fontSize: 21 }}>{price(p.price_cents)}</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>
                    {perClass(p) ? `${price(Math.round(perClass(p)))} / class · ` : ''}valid {Math.round(p.validity_days / 30)} month{p.validity_days > 45 ? 's' : ''}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 11 }}>
                    <CheckRow text={p.classes ? `${p.classes} reformer class${p.classes > 1 ? 'es' : ''}` : 'Unlimited classes'} />
                    <CheckRow text={p.description} />
                  </div>
                  <Btn kind={p.popular ? 'primary' : 'soft'} style={{ marginTop: 14 }} onClick={() => setBuying(p)}>SELECT</Btn>
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <>
          <SectionLabel>Membership plans</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '0 24px' }}>
            {memberships.map((p) => (
              <Card key={p.id} style={{ padding: '17px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontFamily: 'Marcellus,serif', fontSize: 21 }}>{p.name}</div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Marcellus,serif', fontSize: 21 }}>{price(p.price_cents)}</div>
                    <div style={{ fontSize: 11, color: 'var(--sub)' }}>per month</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 11 }}>
                  <CheckRow text="Unlimited reformer classes" />
                  <CheckRow text="Priority booking · guest pass monthly" />
                  <CheckRow text={p.terms} />
                </div>
                <Btn style={{ marginTop: 14 }} onClick={() => setBuying(p)}>{d.current?.package_name === p.name ? 'RENEW' : 'SELECT'}</Btn>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* purchase history */}
      {d.receipts.length > 0 && (
        <>
          <SectionLabel>Purchase history</SectionLabel>
          <Card style={{ margin: '0 24px 8px', overflow: 'hidden' }}>
            {d.receipts.map((r, i) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: i === d.receipts.length - 1 ? 'none' : '1px solid var(--line)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--pinksoft)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon d={ICONS.card} size={15} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{r.package_name || 'Purchase'}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--sub)' }}>{fmtDate(r.created_at)} · receipt {r.receipt_no}</div>
                </div>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{price(r.amount_cents)}</div>
              </div>
            ))}
          </Card>
        </>
      )}

      {/* checkout sheet (simulated payment) */}
      <Sheet open={!!buying} onClose={() => setBuying(null)}>
        {buying && (
          <>
            <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--sub)', fontWeight: 700 }}>Checkout</div>
            <div style={{ fontFamily: 'Marcellus,serif', fontSize: 22, margin: '4px 0 12px' }}>{buying.name}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '4px 2px' }}>
              <span style={{ color: 'var(--sub)' }}>{buying.classes ? `${buying.classes} classes` : 'Unlimited'} · {Math.round(buying.validity_days / 30)}mo validity</span>
              <span style={{ fontWeight: 700 }}>{price(buying.price_cents)}</span>
            </div>
            <div style={{ background: 'var(--blush)', border: '1px dashed var(--pink)', borderRadius: 14, padding: '11px 15px', fontSize: 12.5, color: 'var(--sub)', lineHeight: 1.55, margin: '12px 0 4px' }}>
              Demo checkout — no payment is taken. A live payment provider (e.g. Stripe) will be connected before launch.
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--sub)', margin: '8px 2px 0' }}>{buying.terms}</div>
            <Btn disabled={busy} onClick={purchase} style={{ marginTop: 14 }}>{busy ? 'PROCESSING…' : `CONFIRM PURCHASE · ${price(buying.price_cents)}`}</Btn>
          </>
        )}
      </Sheet>
    </div>
  )
}

function CheckRow({ text }) {
  if (!text) return null
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: 'var(--sub)', lineHeight: 1.45 }}>
      <span style={{ color: 'var(--rose)', marginTop: 1 }}><Icon d={ICONS.check} size={13} strokeWidth={2.4} /></span> {text}
    </div>
  )
}
