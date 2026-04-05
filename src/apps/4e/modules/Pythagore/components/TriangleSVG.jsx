/**
 * Triangle rectangle SVG avec sommets étiquetés.
 * L'angle droit est indiqué par un petit carré.
 * Les sommets sont placés de manière aléatoire mais lisible.
 */
export default function TriangleSVG({ vertices, rightAngle }) {
  const [v0, v1, v2] = vertices
  // On place l'angle droit en bas à gauche, les deux autres en haut à gauche et en bas à droite
  const rightIdx = vertices.indexOf(rightAngle)
  const ordered = [vertices[rightIdx], ...vertices.filter(v => v !== rightAngle)]

  // Coordonnées fixes pour un triangle rectangle lisible
  const R = { x: 60, y: 170 }   // angle droit (bas-gauche)
  const T = { x: 60, y: 40 }    // sommet haut (côté vertical)
  const B = { x: 240, y: 170 }  // sommet droit (côté horizontal)

  const pts = { [ordered[0]]: R, [ordered[1]]: T, [ordered[2]]: B }
  const pR = pts[ordered[0]]
  const pT = pts[ordered[1]]
  const pB = pts[ordered[2]]

  const sq = 16 // taille du carré angle droit
  const color = '#10b981' // emerald

  return (
    <svg viewBox="0 0 300 210" className="mx-auto h-48 w-full max-w-xs">
      {/* Triangle rempli */}
      <polygon
        points={`${pR.x},${pR.y} ${pT.x},${pT.y} ${pB.x},${pB.y}`}
        fill="rgba(16, 185, 129, 0.1)"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Carré angle droit */}
      <polyline
        points={`${pR.x},${pR.y - sq} ${pR.x + sq},${pR.y - sq} ${pR.x + sq},${pR.y}`}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Labels des sommets */}
      <text x={pR.x - 16} y={pR.y + 18} textAnchor="middle" className="fill-emerald-400 font-bold" fontSize="16">{ordered[0]}</text>
      <text x={pT.x - 16} y={pT.y + 6} textAnchor="middle" className="fill-slate-300" fontSize="16">{ordered[1]}</text>
      <text x={pB.x + 16} y={pB.y + 6} textAnchor="middle" className="fill-slate-300" fontSize="16">{ordered[2]}</text>

      {/* Labels des côtés */}
      {/* Côté vertical (R → T) */}
      <text
        x={pR.x - 30}
        y={(pR.y + pT.y) / 2}
        textAnchor="middle"
        className="fill-slate-400"
        fontSize="12"
      >
        {ordered[0]}{ordered[1]}
      </text>

      {/* Côté horizontal (R → B) */}
      <text
        x={(pR.x + pB.x) / 2}
        y={pR.y + 20}
        textAnchor="middle"
        className="fill-slate-400"
        fontSize="12"
      >
        {ordered[0]}{ordered[2]}
      </text>

      {/* Hypoténuse (T → B) */}
      <text
        x={(pT.x + pB.x) / 2 + 18}
        y={(pT.y + pB.y) / 2 - 8}
        textAnchor="middle"
        className="fill-slate-400"
        fontSize="12"
      >
        {ordered[1]}{ordered[2]}
      </text>
    </svg>
  )
}
