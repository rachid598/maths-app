/**
 * Dessine un objet géométrique en SVG compact :
 * droite (trait qui dépasse des deux côtés), segment (points aux extrémités),
 * demi-droite (point à l'origine, trait qui dépasse d'un côté),
 * longueur (segment avec barres de cotation).
 */
export default function FigureSVG({ kind, points }) {
  const [a, b] = points
  const w = 260
  const h = 80
  const y = 48
  const x1 = 60
  const x2 = 200
  const color = '#3b82f6'

  const xLeft = 16
  const xRight = 244

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="mx-auto">
      {/* Labels */}
      <text x={x1} y={20} textAnchor="middle" className="fill-gray-700 dark:fill-gray-200" fontSize="15" fontWeight="bold">{a}</text>
      <text x={x2} y={20} textAnchor="middle" className="fill-gray-700 dark:fill-gray-200" fontSize="15" fontWeight="bold">{b}</text>

      {kind === 'droite' && (
        <>
          {/* Trait qui dépasse des deux côtés */}
          <line x1={xLeft} y1={y} x2={xRight} y2={y} stroke={color} strokeWidth="2.5" />
          <circle cx={x1} cy={y} r="4.5" fill={color} />
          <circle cx={x2} cy={y} r="4.5" fill={color} />
        </>
      )}

      {kind === 'segment' && (
        <>
          <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth="2.5" />
          <circle cx={x1} cy={y} r="5" fill={color} />
          <circle cx={x2} cy={y} r="5" fill={color} />
        </>
      )}

      {kind === 'demi-droite' && (
        <>
          {/* Trait de l'origine qui dépasse à droite */}
          <line x1={x1} y1={y} x2={xRight} y2={y} stroke={color} strokeWidth="2.5" />
          <circle cx={x1} cy={y} r="5" fill={color} />
          <circle cx={x2} cy={y} r="4" fill={color} />
        </>
      )}

      {kind === 'longueur' && (
        <>
          <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth="2.5" />
          <line x1={x1} y1={y - 9} x2={x1} y2={y + 9} stroke={color} strokeWidth="2" />
          <line x1={x2} y1={y - 9} x2={x2} y2={y + 9} stroke={color} strokeWidth="2" />
        </>
      )}
    </svg>
  )
}
