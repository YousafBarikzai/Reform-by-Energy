import { ICONS, PACKAGES } from '../data.js'
import Icon from '../components/Icon.jsx'
import { Monogram } from '../components/Logo.jsx'

function Tabs({ value, patch, vibrate }) {
  return (
    <div style={{ display: 'flex', gap: 26, padding: '16px 24px 0', borderBottom: '1px solid var(--line)', margin: '0 0 4px' }}>
      {['packages', 'membership'].map((t) => {
        const on = value === t
        return (
          <div key={t} onClick={() => { vibrate(5); patch({ pkgTab: t }) }} style={{ paddingBottom: 11, fontSize: 12, fontWeight: 700, letterSpacing: '.1em', color: on ? 'var(--rose)' : 'var(--sub)', borderBottom: on ? '2px solid var(--rose)' : '2px solid transparent', cursor: 'pointer', transition: 'color .2s' }}>
            {t.toUpperCase()}
          </div>
        )
      })}
    </div>
  )
}

function Check({ text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--sub)' }}>
      <Icon d={ICONS.check} size={13} color="var(--rose)" strokeWidth={2.2} /> {text}
    </div>
  )
}

export default function PackagesTab({ app }) {
  const { state, patch, vibrate } = app
  return (
    <div style={{ animation: 'plFade .3s' }}>
      <div style={{ fontFamily: 'Marcellus,serif', fontSize: 30, padding: '22px 24px 0' }}>Membership</div>
      <Tabs value={state.pkgTab} patch={patch} vibrate={vibrate} />

      {state.pkgTab === 'packages' ? (
        <>
          <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--sub)', fontWeight: 600, padding: '18px 24px 12px' }}>Choose a package</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '0 24px 8px' }}>
            {PACKAGES.map((p) => {
              const selected = state.selPkg === p.id
              if (p.compact) {
                return (
                  <div key={p.id} style={{ background: 'var(--card)', border: `1.5px solid ${selected ? 'var(--rose)' : 'var(--line)'}`, borderRadius: 20, padding: '14px 18px', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', gap: 12, transition: 'border-color .25s' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                        <div style={{ fontFamily: 'Marcellus,serif', fontSize: 19 }}>{p.name}</div>
                        <div style={{ fontFamily: 'Marcellus,serif', fontSize: 19, color: 'var(--rose)' }}>{p.price}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
                        {p.perks.map((perk) => <Check key={perk} text={perk} />)}
                      </div>
                    </div>
                    <div className="press" onClick={() => { vibrate(5); patch({ selPkg: p.id }) }} style={{ border: '1.5px solid var(--rose)', color: selected ? '#fff' : 'var(--rose)', background: selected ? 'var(--rose)' : 'transparent', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', padding: '8px 16px', borderRadius: 100, cursor: 'pointer', transition: 'all .25s' }}>SELECT</div>
                  </div>
                )
              }
              return (
                <div key={p.id} style={{ background: 'var(--card)', border: `1.5px solid ${selected ? 'var(--rose)' : 'var(--line)'}`, borderRadius: 22, boxShadow: 'var(--shadow)', overflow: 'hidden', transition: 'border-color .25s' }}>
                  {p.popular && (
                    <div style={{ background: 'var(--pinksoft)', color: 'var(--rose)', fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textAlign: 'center', padding: '7px 0' }}>MOST POPULAR</div>
                  )}
                  <div style={{ padding: '16px 20px 18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div style={{ fontFamily: 'Marcellus,serif', fontSize: 22 }}>{p.name}</div>
                      <div style={{ fontFamily: 'Marcellus,serif', fontSize: 22 }}>{p.price}</div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>{p.per}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 12 }}>
                      {p.perks.map((perk) => <Check key={perk} text={perk} />)}
                    </div>
                    <div
                      className="press"
                      onClick={() => { vibrate(5); patch({ selPkg: p.id }) }}
                      style={{ marginTop: 15, textAlign: 'center', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', padding: '13px 0', borderRadius: 100, cursor: 'pointer', background: selected ? 'var(--rose)' : 'var(--pinksoft)', color: selected ? '#fff' : 'var(--rose)', transition: 'all .25s' }}
                    >{selected ? 'SELECTED' : 'SELECT'}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <div style={{ margin: '24px 24px 0', background: 'var(--card)', borderRadius: 24, padding: '36px 24px', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6 }}>
          <Monogram size={54} color="var(--pink)" />
          <div style={{ fontFamily: 'Marcellus,serif', fontSize: 20, marginTop: 8 }}>No active membership</div>
          <div style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.6 }}>Choose a class pack to begin your<br />Reform journey.</div>
          <div className="press" onClick={() => patch({ pkgTab: 'packages' })} style={{ marginTop: 14, background: 'var(--rose)', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', padding: '12px 26px', borderRadius: 100, cursor: 'pointer' }}>VIEW PACKAGES</div>
        </div>
      )}
    </div>
  )
}
