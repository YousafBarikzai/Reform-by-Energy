// Reform by Energym brand marks, recreated as SVG from the logo artwork:
// a serif "R" whose leg sweeps into the three bars of an "E".

export function Monogram({ size = 44, color = 'var(--ink)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-label="Reform monogram">
      <text x="8" y="96" fontFamily="Marcellus, serif" fontSize="104" fill={color}>R</text>
      <rect x="62" y="34" width="52" height="7" fill={color} />
      <rect x="80" y="58" width="34" height="7" fill={color} />
      <rect x="58" y="86" width="56" height="7" fill={color} />
    </svg>
  )
}

export function Wordmark({ height = 30, color = 'var(--ink)' }) {
  return (
    <svg height={height} viewBox="0 0 300 44" fill="none" aria-label="Reform by Energym">
      <text x="150" y="22" textAnchor="middle" fontFamily="Marcellus, serif" fontSize="26" letterSpacing="10" fill={color}>REFORM</text>
      <line x1="42" y1="36" x2="82" y2="36" stroke={color} strokeWidth="1.4" />
      <text x="150" y="40" textAnchor="middle" fontFamily="'Albert Sans', sans-serif" fontSize="11" fontWeight="600" letterSpacing="5" fill={color}>BY ENERGYM</text>
      <line x1="218" y1="36" x2="258" y2="36" stroke={color} strokeWidth="1.4" />
    </svg>
  )
}

export function FullLogo({ width = 200, color = 'var(--ink)' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: Math.round(width * 0.06), width }}>
      <Monogram size={Math.round(width * 0.52)} color={color} />
      <Wordmark height={Math.round(width * 0.16)} color={color} />
    </div>
  )
}
