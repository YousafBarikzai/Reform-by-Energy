import { useEffect, useState } from 'react'
import { IOSDevice } from './ios-frame.jsx'
import { CLASSES } from './data.js'
import HomeTab from './screens/HomeTab.jsx'
import ClassesTab from './screens/ClassesTab.jsx'
import ScheduleTab from './screens/ScheduleTab.jsx'
import CommunityTab from './screens/CommunityTab.jsx'
import ProfileTab from './screens/ProfileTab.jsx'
import ClassDetail from './screens/ClassDetail.jsx'
import Booking from './screens/Booking.jsx'
import Success from './screens/Success.jsx'
import Instructor from './screens/Instructor.jsx'
import Progress from './screens/Progress.jsx'
import Membership from './screens/Membership.jsx'
import Wellness from './screens/Wellness.jsx'
import BottomNav from './components/BottomNav.jsx'

const MEMBER_NAME = 'Sofia'
const START_DARK = false
const SHOW_PROMO = true

const INITIAL_STATE = {
  tab: 'home', view: 'main', sel: 0, day: 2, slot: -1, sheet: false,
  dark: null, filter: 'All', fav: {}, favMara: true, booked: { 0: true },
  credits: 7, hydration: 5,
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

export default function App() {
  const [state, setState] = useState(INITIAL_STATE)
  const isPhone = useIsPhone()

  const patch = (p) => setState((s) => ({ ...s, ...p }))
  const dark = state.dark === null ? START_DARK : state.dark
  const sel = CLASSES[state.sel]

  const app = {
    state, patch, vibrate, dark, sel,
    memberName: MEMBER_NAME,
    showPromo: SHOW_PROMO,
    open: (i) => patch({ sel: i, view: 'class' }),
    back: () => patch({
      view: state.view === 'booking' ? 'class' : 'main',
      sheet: false,
      slot: state.view === 'booking' ? state.slot : -1,
    }),
    done: () => patch({ view: 'main', tab: 'schedule', sheet: false, slot: -1 }),
    toggleDark: () => { vibrate(10); patch({ dark: !dark }) },
  }

  const screen = (
    <div
      className="pl"
      data-theme={dark ? 'dark' : 'light'}
      style={{ position: 'relative', width: '100%', height: '100%', background: 'var(--bg)', color: 'var(--ink)', fontFamily: "'Albert Sans',sans-serif", overflow: 'hidden', transition: 'background .4s' }}
    >
      {state.view === 'main' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 130 }}>
            {state.tab === 'home' && <HomeTab app={app} />}
            {state.tab === 'classes' && <ClassesTab app={app} />}
            {state.tab === 'schedule' && <ScheduleTab app={app} />}
            {state.tab === 'community' && <CommunityTab app={app} />}
            {state.tab === 'profile' && <ProfileTab app={app} />}
          </div>
          <BottomNav app={app} />
        </div>
      )}
      {state.view === 'class' && <ClassDetail app={app} />}
      {state.view === 'booking' && <Booking app={app} />}
      {state.view === 'success' && <Success app={app} />}
      {state.view === 'instructor' && <Instructor app={app} />}
      {state.view === 'progress' && <Progress app={app} />}
      {state.view === 'membership' && <Membership app={app} />}
      {state.view === 'wellness' && <Wellness app={app} />}
    </div>
  )

  if (isPhone) {
    return <div style={{ height: '100dvh' }}>{screen}</div>
  }
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'radial-gradient(120% 120% at 50% 0%, #F2EDE3 0%, #E5DFD2 100%)' }}>
      <IOSDevice dark={dark}>{screen}</IOSDevice>
    </div>
  )
}
