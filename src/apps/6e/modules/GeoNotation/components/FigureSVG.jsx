/**
 * Dessine un objet géométrique en SVG compact :
 * droite (flèches des deux côtés), segment (points aux extrémités),
 * demi-droite (point à l'origine, flèche de l'autre côté),
 * longueur (segment avec petites barres de cotation).
 */
export default function FigureSVG({ kind, points }) {
  const [a, b] = points
  const w = 240
  const h = 70
  const y = 40
  const x1 = 50
  const x2 = 190
  const color = '#3b82f6'

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="mx-auto">
      {/* Labels */}
      <text x={x1} y={16} textAnchor="middle" className="fill-gray-700 dark:fill-gray-200" fontSize="14" fontWeight="bold">{a}</text>
      <text x={x2} y={16} textAnchor="middle" className="fill-gray-700 dark:fill-gray-200" fontSize="14" fontWeight="bold">{b}</text>

      {kind === 'droite' && (
        <>
          {/* Trait qui dépasse des deux côtés */}
          <line x1={20} y1={y} x2={220} y2={y} stroke={color} strokeWidth="2.5" />
          {/* Flèche gauche */}
          <polygon points={`20,${y} 30,${y - 5} 30,${y + 5}`} fill={color} />
          {/* Flèche droite */}
          <polygon points={`220,${y} 210,${y - 5} 210,${y + 5}`} fill={color} />
          {/* Points */}
          <circle cx={x1} cy={y} r="4" fill={color} />
          <circle cx={x2} cy={y} r="4" fill={color} />
        </>
      )}

      {kind === 'segment' && (
        <>
          <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth="2.5" />
          {/* Points pleins aux extrémités */}
          <circle cx={x1} cy={y} r="5" fill={color} />
          <circle cx={x2} cy={y} r="5" fill={color} />
        </>
      )}

      {kind === 'demi-droite' && (
        <>
          {/* Trait de l'origine vers l'infini */}
          <line x1={x1} y1={y} x2={220} y2={y} stroke={color} strokeWidth="2.5" />
          {/* Point plein à l'origine */}
          <circle cx={x1} cy={y} r="5" fill={color} />
          {/* Point creux au second point */}
          <circle cx={x2} cy={y} r="4" fill={color} />
          {/* Flèche à droite */}
          <polygon points={`220,${y} 210,${y - 5} 210,${y + 5}`} fill={color} />
        </>
      )}

      {kind === 'longueur' && (
        <>
          <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth="2.5" />
          {/* Barres de cotation aux extrémités */}
          <line x1={x1} y1={y - 8} x2={x1} y2={y + 8} stroke={color} strokeWidth="2" />
          <line x1={x2} y1={y - 8} x2={x2} y2={y + 8} stroke={color} strokeWidth="2" />
          {/* Petites flèches horizontales de cotation */}
          <polygon points={`${x1},${y} ${x1 + 8},${y - 3} ${x1 + 8},${y + 3}`} fill={color} />
          <polygon points={`${x2},${y} ${x2 - 8},${y - 3} ${x2 - 8},${y + 3}`} fill={color} />
        </>
      )}
    </svg>
  )
}
