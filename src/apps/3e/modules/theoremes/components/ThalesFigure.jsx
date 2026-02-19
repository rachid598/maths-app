/**
 * Interactive SVG for Thalès configuration.
 *
 * Shows point A with two secants going to B/C and M/N,
 * with (BM) ∥ (CN) indicated.
 */
export default function ThalesFigure({ config }) {
  // Fixed outer triangle: A (apex), C (bottom-left), N (bottom-right)
  const A = { x: 150, y: 20 }
  const C = { x: 50, y: 180 }
  const N = { x: 250, y: 180 }

  // Compute Thales ratio from known values (AB/AC = AM/AN)
  let ratio
  if (config.AB !== '?' && config.AC !== '?') {
    ratio = config.AB / config.AC
  } else if (config.AM !== '?' && config.AN !== '?') {
    ratio = config.AM / config.AN
  } else {
    ratio = 0.5
  }

  // B on segment AC, M on segment AN (at the correct proportional position)
  const B = {
    x: A.x + ratio * (C.x - A.x),
    y: A.y + ratio * (C.y - A.y),
  }
  const M = {
    x: A.x + ratio * (N.x - A.x),
    y: A.y + ratio * (N.y - A.y),
  }

  // Dimension brackets along segments AC and AN (offset outward)
  const bDist = 18 // bracket offset from segment
  const capLen = 5  // end-cap length

  // AC bracket: outward perpendicular = left of A→C direction
  const lAC = Math.sqrt((C.x - A.x) ** 2 + (C.y - A.y) ** 2)
  const pxAC = -(C.y - A.y) / lAC // outward unit x
  const pyAC = (C.x - A.x) / lAC  // outward unit y
  const acA = { x: A.x + pxAC * bDist, y: A.y + pyAC * bDist }
  const acC = { x: C.x + pxAC * bDist, y: C.y + pyAC * bDist }
  const acLbl = { x: (acA.x + acC.x) / 2 + pxAC * 10, y: (acA.y + acC.y) / 2 + pyAC * 10 }

  // AN bracket: outward perpendicular = right of A→N direction
  const lAN = Math.sqrt((N.x - A.x) ** 2 + (N.y - A.y) ** 2)
  const pxAN = (N.y - A.y) / lAN
  const pyAN = -(N.x - A.x) / lAN
  const anA = { x: A.x + pxAN * bDist, y: A.y + pyAN * bDist }
  const anN = { x: N.x + pxAN * bDist, y: N.y + pyAN * bDist }
  const anLbl = { x: (anA.x + anN.x) / 2 + pxAN * 10, y: (anA.y + anN.y) / 2 + pyAN * 10 }

  const labelStyle = (value) =>
    value === '?' ? 'fill-amber-400 font-bold' : 'fill-slate-300'

  return (
    <svg viewBox="0 0 300 210" className="mx-auto h-48 w-full max-w-xs">
      {/* Secant lines from A */}
      <line x1={A.x} y1={A.y} x2={C.x} y2={C.y} stroke="#6366f1" strokeWidth="1.5" />
      <line x1={A.x} y1={A.y} x2={N.x} y2={N.y} stroke="#6366f1" strokeWidth="1.5" />

      {/* Parallel lines (BM) and (CN) */}
      <line x1={B.x} y1={B.y} x2={M.x} y2={M.y} stroke="#8b5cf6" strokeWidth="2" strokeDasharray="6 3" />
      <line x1={C.x} y1={C.y} x2={N.x} y2={N.y} stroke="#8b5cf6" strokeWidth="2" strokeDasharray="6 3" />

      {/* Parallel markers */}
      <text x={(B.x + M.x) / 2} y={B.y - 4} textAnchor="middle" className="fill-purple-400" fontSize="10">
        //
      </text>
      <text x={(C.x + N.x) / 2} y={C.y - 4} textAnchor="middle" className="fill-purple-400" fontSize="10">
        //
      </text>

      {/* Points */}
      {[
        { ...A, label: 'A' },
        { ...B, label: 'B' },
        { ...C, label: 'C' },
        { ...M, label: 'M' },
        { ...N, label: 'N' },
      ].map((p) => (
        <g key={p.label}>
          <circle cx={p.x} cy={p.y} r="3" fill="#8b5cf6" />
          <text
            x={p.x + (p.label === 'A' ? 0 : p.x < 150 ? -14 : 14)}
            y={p.y + (p.label === 'A' ? -8 : 5)}
            textAnchor="middle"
            className="fill-slate-400 font-medium"
            fontSize="13"
          >
            {p.label}
          </text>
        </g>
      ))}

      {/* Segment labels */}

      {/* AB — sub-segment, close to the left secant */}
      <text x={(A.x + B.x) / 2 - 14} y={(A.y + B.y) / 2 + 4} textAnchor="middle" className={labelStyle(config.AB)} fontSize="11">
        {config.AB === '?' ? '?' : config.AB}
      </text>

      {/* AM — sub-segment, close to the right secant */}
      <text x={(A.x + M.x) / 2 + 14} y={(A.y + M.y) / 2 + 4} textAnchor="middle" className={labelStyle(config.AM)} fontSize="11">
        {config.AM === '?' ? '?' : config.AM}
      </text>

      {/* AC — dimension bracket along segment (full A→C) */}
      <g>
        <line x1={acA.x} y1={acA.y} x2={acC.x} y2={acC.y} stroke="#64748b" strokeWidth="0.75" />
        <line x1={acA.x} y1={acA.y} x2={acA.x - pxAC * capLen} y2={acA.y - pyAC * capLen} stroke="#64748b" strokeWidth="0.75" />
        <line x1={acC.x} y1={acC.y} x2={acC.x - pxAC * capLen} y2={acC.y - pyAC * capLen} stroke="#64748b" strokeWidth="0.75" />
        <text x={acLbl.x} y={acLbl.y + 4} textAnchor="middle" className={labelStyle(config.AC)} fontSize="11">
          {config.AC === '?' ? '?' : config.AC}
        </text>
      </g>

      {/* AN — dimension bracket along segment (full A→N) */}
      <g>
        <line x1={anA.x} y1={anA.y} x2={anN.x} y2={anN.y} stroke="#64748b" strokeWidth="0.75" />
        <line x1={anA.x} y1={anA.y} x2={anA.x - pxAN * capLen} y2={anA.y - pyAN * capLen} stroke="#64748b" strokeWidth="0.75" />
        <line x1={anN.x} y1={anN.y} x2={anN.x - pxAN * capLen} y2={anN.y - pyAN * capLen} stroke="#64748b" strokeWidth="0.75" />
        <text x={anLbl.x} y={anLbl.y + 4} textAnchor="middle" className={labelStyle(config.AN)} fontSize="11">
          {config.AN === '?' ? '?' : config.AN}
        </text>
      </g>
    </svg>
  )
}
