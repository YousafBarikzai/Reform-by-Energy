import { useEffect, useState } from 'react'
import { IOSDevice } from './ios-frame.jsx'
import HomeTab from './screens/HomeTab.jsx'
import ScheduleTab from './screens/ScheduleTab.jsx'
import PackagesTab from './screens/PackagesTab.jsx'
import LibraryTab from './screens/LibraryTab.jsx'
import ProfileTab from './screens/ProfileTab.jsx'
import BottomNav from './components/BottomNav.jsx'
import Splash from './components/Splash.jsx'

const INITIAL_STATE = {
  tab: 'home', day: 2, booked: { 1: true },
  pkgTab: 'packages', selPkg: '10', libTab: 'library',
}

function vibrate(ms) {
  try { navigator.vibrate && navigator.vibrate(ms) } catch (e) { /* unsupported */ }
}

// Device frame on desktop only; at phone widths the app fills the viewport.
function useIsPhone() {
  const [isPhone, setIsPhone] = useState(() => window.matchMedia('(max-width: 520px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 520px)')
    const onChange = (e) => setIsPhone(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return isPhone
}

const TABS = {
  home: HomeTab,
  schedule: ScheduleTab,
  packages: PackagesTab,
  library: LibraryTab,
  profile: ProfileTab,
}

export default function App() {
  const [state, setState] = useState(INITIAL_STATE)
  const [splash, setSplash] = useState(true)
  const isPhone = useIsPhone()

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 2000)
    return () => clearTimeout(t)
  }, [])

  const patch = (p) => setState((s) => ({ ...s, ...p }))
  const app = { state, patch, vibrate }
  const Tab = TABS[state.tab]

  const screen = (
    <div className="pl" style={{ position: 'relative', width: '100%', height: '100%', background: 'var(--bg)', color: 'var(--ink)', fontFamily: "'Albert Sans',sans-serif", overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        {/* clear the device status bar when framed; honor the notch when installed on a phone */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 124, paddingTop: isPhone ? 'env(safe-area-inset-top)' : 46 }}>
          <Tab key={state.tab} app={app} />
        </div>
        <BottomNav app={app} />
      </div>
      {splash && <Splash />}
    </div>
  )

  if (isPhone) {
    return <div style={{ height: '100dvh' }}>{screen}</div>
  }
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'radial-gradient(120% 120% at 50% 0%, #FDF0F4 0%, #F6D7E0 100%)' }}>
      <IOSDevice>{screen}</IOSDevice>
    </div>
  )
}
