import { FullLogo } from './Logo.jsx'

// Branded loading screen: shows the full logo, then fades away.
export default function Splash() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg,#FFF7F9 0%,#FBE4EC 100%)', animation: 'plSplashOut .6s ease 1.3s forwards', pointerEvents: 'none' }}>
      <div style={{ animation: 'plPop .7s cubic-bezier(.2,.8,.2,1)' }}>
        <FullLogo width={190} color="var(--ink)" />
      </div>
    </div>
  )
}
