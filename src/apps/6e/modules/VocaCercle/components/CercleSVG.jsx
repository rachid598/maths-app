/**
 * Cercle SVG avec un élément mis en évidence selon `kind` :
 * centre, rayon, diametre, corde, arc, disque
 */
export default function CercleSVG({ kind }) {
  const size = 200
  const cx = 100
  const cy = 105
  const r = 70
  const blue = '#3b82f6'
  const highlight = '#ef4444'

  // Points sur le cercle
  const ptA = { x: cx + r, y: cy, label: 'A' }       // 0°
  const ptB = { x: cx - r, y: cy, label: 'B' }       // 180°
  const ptC = { x: cx + r * Math.cos(Math.PI / 4), y: cy - r * Math.sin(Math.PI / 4), label: 'C' }  // 45°
  const ptD = { x: cx - r * Math.cos(Math.PI / 3), y: cy + r * Math.sin(Math.PI / 3), label: 'D' }  // 240°

  const dot = (pt, color = blue) => (
    <g key={pt.label}>
      <circle cx={pt.x} cy={pt.y} r="4" fill={color} />
      <text x={pt.x} y={pt.y - 10} textAnchor="middle" fontSize="13" fontWeight="bold" className="fill-gray-700 dark:fill-gray-200">{pt.label}</text>
    </g>
  )

  const centerDot = (color = blue) => (
    <g>
      <circle cx={cx} cy={cy} r="4" fill={color} />
      <text x={cx} y={cy - 10} textAnchor="middle" fontSize="13" fontWeight="bold" className="fill-gray-700 dark:fill-gray-200">O</text>
    </g>
  )

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {/* Cercle de base */}
      {kind === 'disque' ? (
        <circle cx={cx} cy={cy} r={r} fill={highlight} fillOpacity="0.2" stroke={blue} strokeWidth="2" />
      ) : (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={blue} strokeWidth="2" />
      )}

      {kind === 'centre' && (
        <>
          <circle cx={cx} cy={cy} r="12" fill={highlight} fillOpacity="0.2" stroke={highlight} strokeWidth="1.5" />
          {centerDot(highlight)}
          {dot(ptA)}
        </>
      )}

      {kind === 'rayon' && (
        <>
          <line x1={cx} y1={cy} x2={ptA.x} y2={ptA.y} stroke={highlight} strokeWidth="3" />
          {centerDot(highlight)}
          {dot(ptA, highlight)}
        </>
      )}

      {kind === 'diametre' && (
        <>
          <line x1={ptA.x} y1={ptA.y} x2={ptB.x} y2={ptB.y} stroke={highlight} strokeWidth="3" />
          {centerDot()}
          {dot(ptA, highlight)}
          {dot(ptB, highlight)}
        </>
      )}

      {kind === 'corde' && (
        <>
          <line x1={ptC.x} y1={ptC.y} x2={ptD.x} y2={ptD.y} stroke={highlight} strokeWidth="3" />
          {centerDot()}
          {dot(ptC, highlight)}
          {dot(ptD, highlight)}
        </>
      )}

      {kind === 'arc' && (
        <>
          {/* Arc entre A (0°) et C (45°) — grand arc via le bas */}
          <path
            d={`M ${ptA.x} ${ptA.y} A ${r} ${r} 0 1 1 ${ptC.x} ${ptC.y}`}
            fill="none" stroke={highlight} strokeWidth="4" strokeLinecap="round"
          />
          {centerDot()}
          {dot(ptA, highlight)}
          {dot(ptC, highlight)}
        </>
      )}

      {kind === 'disque' && (
        <>
          {centerDot()}
          {dot(ptA)}
        </>
      )}
    </svg>
  )
}
