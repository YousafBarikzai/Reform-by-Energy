import { CATEGORIES, ICONS, IMAGES, WORKOUTS } from '../data.js'
import Icon from '../components/Icon.jsx'

const CATEGORY_ICONS = {
  'Full Body': ICONS.fullBody,
  'Lower Body': ICONS.lowerBody,
  'Core': ICONS.core,
  'Arms': ICONS.arms,
  'Stretch': ICONS.stretch,
}

function Tabs({ value, patch, vibrate }) {
  return (
    <div style={{ display: 'flex', gap: 26, padding: '16px 24px 0', borderBottom: '1px solid var(--line)', margin: '0 0 4px' }}>
      {[['library', 'LIBRARY'], ['mylist', 'MY LIST']].map(([id, name]) => {
        const on = value === id
        return (
          <div key={id} onClick={() => { vibrate(5); patch({ libTab: id }) }} style={{ paddingBottom: 11, fontSize: 12, fontWeight: 700, letterSpacing: '.1em', color: on ? 'var(--rose)' : 'var(--sub)', borderBottom: on ? '2px solid var(--rose)' : '2px solid transparent', cursor: 'pointer', transition: 'color .2s' }}>
            {name}
          </div>
        )
      })}
    </div>
  )
}

export default function LibraryTab({ app }) {
  const { state, patch, vibrate } = app
  return (
    <div style={{ animation: 'plFade .3s' }}>
      <div style={{ fontFamily: 'Marcellus,serif', fontSize: 30, padding: '22px 24px 0' }}>Exercise Library</div>
      <Tabs value={state.libTab} patch={patch} vibrate={vibrate} />

      {state.libTab === 'library' ? (
        <>
          {/* subscription hero */}
          <div style={{ margin: '18px 24px 0', background: 'linear-gradient(120deg,var(--pinksoft),var(--blush))', border: '1px solid var(--line)', borderRadius: 24, overflow: 'hidden', display: 'flex' }}>
            <div style={{ flex: 1.2, padding: '20px 4px 20px 20px' }}>
              <div style={{ fontFamily: 'Marcellus,serif', fontSize: 20, lineHeight: 1.25 }}>Unlock our full<br />Exercise Library</div>
              <div style={{ fontSize: 12, color: 'var(--sub)', lineHeight: 1.55, marginTop: 7 }}>Access 300+ on-demand reformer workouts anytime, anywhere.</div>
              <div className="press" style={{ marginTop: 13, display: 'inline-block', background: 'var(--rose)', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', padding: '10px 18px', borderRadius: 100, cursor: 'pointer' }}>START FREE TRIAL</div>
              <div style={{ fontSize: 10.5, color: 'var(--sub)', marginTop: 9 }}>7 days free, then $12.99/month</div>
            </div>
            <img src={IMAGES.heroReformer} alt="Reformer workouts" style={{ flex: 1, width: '40%', objectFit: 'cover' }} />
          </div>

          {/* categories */}
          <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--sub)', fontWeight: 600, padding: '24px 24px 12px' }}>Categories</div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 24px 4px' }}>
            {CATEGORIES.map((c) => (
              <div key={c} className="press" style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, cursor: 'pointer', width: 66 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--card)', boxShadow: 'var(--shadow)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon d={CATEGORY_ICONS[c]} size={22} strokeWidth={1.5} />
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--sub)', textAlign: 'center' }}>{c}</div>
              </div>
            ))}
          </div>

          {/* popular workouts */}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '24px 24px 10px' }}>
            <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--sub)', fontWeight: 600 }}>Popular workouts</div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.08em', color: 'var(--rose)', cursor: 'pointer' }}>VIEW ALL</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 24px 8px' }}>
            {WORKOUTS.map((w) => (
              <div key={w.name} className="press" style={{ background: 'var(--card)', borderRadius: 20, padding: 10, boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', gap: 13, cursor: 'pointer' }}>
                <img src={w.img} alt={w.name} style={{ width: 64, height: 64, borderRadius: 14, objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{w.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 3 }}>{w.dur}</div>
                </div>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--pinksoft)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14"><path d="M4 2.5l8 4.5-8 4.5z" fill="currentColor" /></svg>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ margin: '24px 24px 0', background: 'var(--card)', borderRadius: 24, padding: '40px 24px', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--pinksoft)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon d={ICONS.heart} size={24} strokeWidth={1.6} />
          </div>
          <div style={{ fontFamily: 'Marcellus,serif', fontSize: 20, marginTop: 8 }}>Nothing saved yet</div>
          <div style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.6 }}>Tap the heart on any workout to<br />build your personal list.</div>
        </div>
      )}
    </div>
  )
}
