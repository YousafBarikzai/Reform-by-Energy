import { useEffect, useRef, useState } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { IOSDevice } from './ios-frame.jsx'
import { useAuth } from './auth.jsx'
import { useIsPhone, PageSkeleton } from './ui.jsx'
import BottomNav from './components/BottomNav.jsx'
import Header from './components/Header.jsx'
import Splash from './components/Splash.jsx'

import AuthScreen from './screens/Auth.jsx'
import PublicHome from './screens/PublicHome.jsx'
import Home from './screens/Home.jsx'
import Schedule from './screens/Schedule.jsx'
import ClassDetail from './screens/ClassDetail.jsx'
import Packages from './screens/Packages.jsx'
import Library from './screens/Library.jsx'
import LibraryItem from './screens/LibraryItem.jsx'
import Instructors from './screens/Instructors.jsx'
import InstructorProfile from './screens/InstructorProfile.jsx'
import About from './screens/About.jsx'
import Contact from './screens/Contact.jsx'
import Join from './screens/Join.jsx'
import Profile from './screens/Profile.jsx'
import Progress from './screens/Progress.jsx'
import Mirror from './screens/Mirror.jsx'
import Journey from './screens/Journey.jsx'
import History from './screens/History.jsx'
import Rewards from './screens/Rewards.jsx'
import Challenges from './screens/Challenges.jsx'
import Wellness from './screens/Wellness.jsx'
import MemberCard from './screens/MemberCard.jsx'
import Settings from './screens/Settings.jsx'
import Notifications from './screens/Notifications.jsx'
import Admin from './screens/Admin.jsx'

// Shell for every page: guests get the glass header + public menu, everyone
// gets the bottom navigation. Scroll resets on route change.
function Shell() {
  const { member, loading } = useAuth()
  const location = useLocation()
  const scroller = useRef(null)
  const isPhone = useIsPhone()
  useEffect(() => { scroller.current?.scrollTo({ top: 0 }) }, [location.pathname])
  if (loading) return <PageSkeleton />
  const isAdminArea = location.pathname.startsWith('/admin')
  const guest = !member
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      {guest && <Header />}
      <div ref={scroller} style={{ flex: 1, overflowY: 'auto', paddingBottom: isAdminArea ? 24 : 124, paddingTop: guest ? (isPhone ? 'calc(env(safe-area-inset-top) + 52px)' : 94) : (isPhone ? 'env(safe-area-inset-top)' : 46) }}>
        <Outlet />
      </div>
      {!isAdminArea && <BottomNav />}
    </div>
  )
}

// Guard for member-only areas: bounce to /auth remembering where they were.
function Protected() {
  const { member, loading } = useAuth()
  const location = useLocation()
  if (loading) return <PageSkeleton />
  if (!member) return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  return <Outlet />
}

function HomeSwitch() {
  const { member } = useAuth()
  return member ? <Home /> : <PublicHome />
}
function ProfileSwitch() {
  const { member } = useAuth()
  return member ? <Profile /> : <Join />
}

export default function App() {
  // branded splash plays once per session, not on every deep-link load
  const [splash, setSplash] = useState(() => !sessionStorage.getItem('reform-splashed'))
  const isPhone = useIsPhone()

  useEffect(() => {
    if (!splash) return
    const t = setTimeout(() => { setSplash(false); sessionStorage.setItem('reform-splashed', '1') }, 2000)
    return () => clearTimeout(t)
  }, [splash])

  const screen = (
    <div className="pl" style={{ position: 'relative', width: '100%', height: '100%', background: 'var(--bg)', color: 'var(--ink)', fontFamily: "'Albert Sans',sans-serif", overflow: 'hidden' }}>
      <Routes>
        <Route path="/auth" element={<AuthScreen />} />
        <Route element={<Shell />}>
          {/* public website — no login required */}
          <Route path="/" element={<HomeSwitch />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/class/:id" element={<ClassDetail />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/library" element={<Library />} />
          <Route path="/library/:id" element={<LibraryItem />} />
          <Route path="/instructors" element={<Instructors />} />
          <Route path="/instructors/:id" element={<InstructorProfile />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<ProfileSwitch />} />
          {/* member-only */}
          <Route element={<Protected />}>
            <Route path="/profile/progress" element={<Progress />} />
            <Route path="/profile/mirror" element={<Mirror />} />
            <Route path="/profile/journey" element={<Journey />} />
            <Route path="/profile/history" element={<History />} />
            <Route path="/profile/rewards" element={<Rewards />} />
            <Route path="/profile/challenges" element={<Challenges />} />
            <Route path="/profile/wellness" element={<Wellness />} />
            <Route path="/profile/card" element={<MemberCard />} />
            <Route path="/profile/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/admin/*" element={<Admin />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
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
