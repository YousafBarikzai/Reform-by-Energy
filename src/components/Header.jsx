import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ICONS } from '../data.js'
import Icon from './Icon.jsx'
import { Monogram, Wordmark } from './Logo.jsx'
import { Btn, Sheet, useIsPhone, vibrate } from '../ui.jsx'

const MENU = [
  ['/', 'Home', ICONS.home],
  ['/schedule', 'Schedule', ICONS.calendar],
  ['/packages', 'Packages', ICONS.tag],
  ['/instructors', 'Instructors', ICONS.user],
  ['/library', 'Library', ICONS.play],
  ['/about', 'About', ICONS.sparkle],
  ['/contact', 'Contact', ICONS.mail],
]

// Glass top bar for visitors: brand → home, menu + login on the right.
export default function Header() {
  const nav = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const isPhone = useIsPhone()
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, zIndex: 30, paddingTop: isPhone ? 'env(safe-area-inset-top)' : 46 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: 'var(--glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid var(--line)' }}>
          <div className="press" onClick={() => { vibrate(4); nav('/') }} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <Monogram size={30} />
            <div style={{ fontFamily: 'Marcellus,serif', fontSize: 14, letterSpacing: '.18em' }}>REFORM</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="press" role="button" aria-label="Log in" onClick={() => { vibrate(4); nav('/auth', { state: { from: pathname } }) }}
              style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', color: 'var(--rose)', border: '1.5px solid var(--rose)', borderRadius: 100, padding: '7px 14px', cursor: 'pointer' }}>
              LOG IN
            </div>
            <div className="press" role="button" aria-label="Menu" onClick={() => { vibrate(4); setOpen(true) }}
              style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--card)', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            </div>
          </div>
        </div>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 14px' }}>
          <Wordmark height={26} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {MENU.map(([to, label, icon]) => {
            const on = pathname === to
            return (
              <div key={to} className="press" onClick={() => { vibrate(4); setOpen(false); nav(to) }}
                style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 8px', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: on ? 'var(--rose)' : 'var(--pinksoft)', color: on ? '#fff' : 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon d={icon} size={15} />
                </div>
                <div style={{ fontSize: 15, fontWeight: on ? 700 : 500, color: on ? 'var(--rose)' : 'var(--ink)' }}>{label}</div>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <Btn kind="outline" style={{ flex: 1 }} onClick={() => { setOpen(false); nav('/auth', { state: { from: pathname } }) }}>LOG IN</Btn>
          <Btn style={{ flex: 1 }} onClick={() => { setOpen(false); nav('/auth', { state: { from: pathname, register: true } }) }}>JOIN REFORM</Btn>
        </div>
      </Sheet>
    </>
  )
}
