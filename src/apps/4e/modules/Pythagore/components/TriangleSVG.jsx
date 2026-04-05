/**
 * Triangle rectangle SVG avec sommets étiquetés.
 * L'angle droit est indiqué par un petit carré.
 *
 * Props:
 * - vertices: ['I', 'J', 'K'] — les 3 sommets
 * - rightAngle: 'I' — le sommet de l'angle droit
 * - sides: { IJ: 4, IK: 3, JK: '?' } — longueurs (optionnel, pour les questions calcul)
 */
export default function TriangleSVG({ vertices, rightAngle, sides }) {
  const rightIdx = vertices.indexOf(rightAngle)
  const ordered = [vertices[rightIdx], ...vertices.filter(v => v !== rightAngle)]

  // Coordonnées fixes pour un triangle rectangle lisible
  const R = { x: 60, y: 170 }   // angle droit (bas-gauche)
  const T = { x: 60, y: 40 }    // sommet haut (côté vertical)
  const B = { x: 240, y: 170 }  // sommet droit (côté horizontal)

  const sq = 16 // taille du carré angle droit
  const color = '#10b981' // emerald

  // Noms des côtés
  const sideRT = ordered[0] + ordered[1] // vertical (angle droit → haut)
  const sideRB = ordered[0] + ordered[2] // horizontal (angle droit → droite)
  const sideTB = ordered[1] + ordered[2] // hypoténuse (diagonal)

  // Valeurs des côtés (si fournies)
  const getVal = (sideName) => {
    if (!sides) return null
    // Chercher dans les deux sens (AB ou BA)
    const reverse = sideName[1] + sideName[0]
    if (sides[sideName] !== undefined) return sides[sideName]
    if (sides[reverse] !== undefined) return sides[reverse]
    return null
  }

  const valRT = getVal(sideRT)
  const valRB = getVal(sideRB)
  const valTB = getVal(sideTB)

  const sideStyle = (val) => {
    if (val === '?') return 'fill-amber-400 font-bold'
    if (val !== null) return 'fill-slate-300'
    return 'fill-slate-500'
  }

  const formatSide = (name, val) => {
    if (val === '?') return `${name} = ?`
    if (val !== null) return `${name} = ${val}`
    return name
  }

  return (
    <svg viewBox="0 0 300 210" className="mx-auto h-48 w-full max-w-xs">
      {/* Triangle rempli */}
      <polygon
        points={`${R.x},${R.y} ${T.x},${T.y} ${B.x},${B.y}`}
        fill="rgba(16, 185, 129, 0.1)"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Carré angle droit */}
      <polyline
        points={`${R.x},${R.y - sq} ${R.x + sq},${R.y - sq} ${R.x + sq},${R.y}`}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Côté inconnu en pointillés */}
      {valRT === '?' && (
        <line x1={R.x} y1={R.y} x2={T.x} y2={T.y} stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 4" className="animate-pulse" />
      )}
      {valRB === '?' && (
        <line x1={R.x} y1={R.y} x2={B.x} y2={B.y} stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 4" className="animate-pulse" />
      )}
      {valTB === '?' && (
        <line x1={T.x} y1={T.y} x2={B.x} y2={B.y} stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 4" className="animate-pulse" />
      )}

      {/* Labels des sommets */}
      <text x={R.x - 16} y={R.y + 18} textAnchor="middle" className="fill-emerald-400 font-bold" fontSize="16">{ordered[0]}</text>
      <text x={T.x - 16} y={T.y + 6} textAnchor="middle" className="fill-slate-300" fontSize="16">{ordered[1]}</text>
      <text x={B.x + 16} y={B.y + 6} textAnchor="middle" className="fill-slate-300" fontSize="16">{ordered[2]}</text>

      {/* Labels des côtés avec valeurs */}
      {/* Côté vertical (R → T) */}
      <text
        x={R.x - 30}
        y={(R.y + T.y) / 2}
        textAnchor="middle"
        className={sideStyle(valRT)}
        fontSize="13"
      >
        {formatSide(sideRT, valRT)}
      </text>

      {/* Côté horizontal (R → B) */}
      <text
        x={(R.x + B.x) / 2}
        y={R.y + 20}
        textAnchor="middle"
        className={sideStyle(valRB)}
        fontSize="13"
      >
        {formatSide(sideRB, valRB)}
      </text>

      {/* Hypoténuse (T → B) */}
      <text
        x={(T.x + B.x) / 2 + 18}
        y={(T.y + B.y) / 2 - 8}
        textAnchor="middle"
        className={sideStyle(valTB)}
        fontSize="13"
      >
        {formatSide(sideTB, valTB)}
      </text>
    </svg>
  )
}
