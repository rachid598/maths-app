/**
 * Interactive SVG triangle for Pythagore questions.
 *
 * Renders a right triangle ABC (right angle at A) with labeled sides.
 * The unknown side pulses in accent color.
 */
export default function TriangleFigure({ sides, rightAngle = 'A' }) {
  // Fixed coordinates for a clean right triangle
  // A = bottom-left (right angle), B = top-left, C = bottom-right
  const A = { x: 60, y: 180 }
  const B = { x: 60, y: 40 }
  const C = { x: 240, y: 180 }

  const rightSize = 18

  const sideStyle = (value) =>
    value === '?' ? 'fill-amber-400 font-bold text-base' : 'fill-slate-300 text-sm'

  return (
    <svg viewBox="0 0 300 220" className="mx-auto h-48 w-full max-w-xs">
      {/* Triangle */}
      <polygon
        points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
        fill="rgba(139, 92, 246, 0.1)"
        stroke="#8b5cf6"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Right angle square */}
      <polyline
        points={`${A.x},${A.y - rightSize} ${A.x + rightSize},${A.y - rightSize} ${A.x + rightSize},${A.y}`}
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="1.5"
      />

      {/* Side labels */}
      {/* AB — left side (vertical) */}
      <text
        x={A.x - 20}
        y={(A.y + B.y) / 2}
        textAnchor="middle"
        className={sideStyle(sides.AB)}
        fontSize="14"
      >
        AB = {sides.AB === '?' ? '?' : `${sides.AB}`}
      </text>

      {/* AC — bottom side (horizontal) */}
      <text
        x={(A.x + C.x) / 2}
        y={A.y + 20}
        textAnchor="middle"
        className={sideStyle(sides.AC)}
        fontSize="14"
      >
        AC = {sides.AC === '?' ? '?' : `${sides.AC}`}
      </text>

      {/* BC — hypotenuse (diagonal) */}
      <text
        x={(B.x + C.x) / 2 + 15}
        y={(B.y + C.y) / 2 - 8}
        textAnchor="middle"
        className={sideStyle(sides.BC)}
        fontSize="14"
      >
        BC = {sides.BC === '?' ? '?' : `${sides.BC}`}
      </text>

      {/* Vertex labels */}
      <text x={A.x - 12} y={A.y + 16} textAnchor="middle" className="fill-purple-400 font-bold" fontSize="14">
        {rightAngle}
      </text>
      <text x={B.x - 12} y={B.y + 4} textAnchor="middle" className="fill-slate-400" fontSize="14">
        B
      </text>
      <text x={C.x + 14} y={C.y + 4} textAnchor="middle" className="fill-slate-400" fontSize="14">
        C
      </text>

      {/* Unknown side highlight pulse */}
      {sides.BC === '?' && (
        <line x1={B.x} y1={B.y} x2={C.x} y2={C.y} stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 4" className="animate-pulse" />
      )}
      {sides.AB === '?' && (
        <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 4" className="animate-pulse" />
      )}
      {sides.AC === '?' && (
        <line x1={A.x} y1={A.y} x2={C.x} y2={C.y} stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 4" className="animate-pulse" />
      )}
    </svg>
  )
}
