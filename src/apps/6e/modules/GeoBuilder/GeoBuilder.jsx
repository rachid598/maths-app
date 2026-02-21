import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const TOOLS = [
  { id: 'point', label: '● Point', icon: '📍' },
  { id: 'line', label: '— Droite', icon: '📏' },
  { id: 'circle', label: '◯ Cercle', icon: '⭕' },
  { id: 'symmetry', label: '↔ Symétrie', icon: '🪞' },
  { id: 'eraser', label: 'Gomme', icon: '🧹' },
]

const COLORS = ['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#ec4899']

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

export default function GeoBuilder({ player, onBadgeCheck }) {
  const navigate = useNavigate()
  const svgRef = useRef(null)
  const [tool, setTool] = useState('point')
  const [color, setColor] = useState(COLORS[0])
  const [points, setPoints] = useState([])
  const [lines, setLines] = useState([])
  const [circles, setCircles] = useState([])
  const [pending, setPending] = useState(null) // for 2-click tools
  const [showGrid, setShowGrid] = useState(true)
  const [symAxis, setSymAxis] = useState('vertical') // vertical | horizontal

  const getSVGPoint = useCallback((e) => {
    const svg = svgRef.current
    const rect = svg.getBoundingClientRect()
    const touch = e.changedTouches ? e.changedTouches[0] : e.touches ? e.touches[0] : null
    const clientX = touch ? touch.clientX : e.clientX
    const clientY = touch ? touch.clientY : e.clientY
    // Snap to grid (20px)
    let x = Math.round((clientX - rect.left) / 20) * 20
    let y = Math.round((clientY - rect.top) / 20) * 20
    return { x, y }
  }, [])

  const handleClick = useCallback((e) => {
    const pt = getSVGPoint(e)

    if (tool === 'eraser') {
      setPoints(ps => ps.filter(p => dist(p, pt) > 15))
      setLines(ls => ls.filter(l => {
        const mid = { x: (l.a.x + l.b.x) / 2, y: (l.a.y + l.b.y) / 2 }
        return dist(mid, pt) > 20
      }))
      setCircles(cs => cs.filter(c => Math.abs(dist(c.center, pt) - c.radius) > 15))
      return
    }

    if (tool === 'point') {
      setPoints(ps => [...ps, { ...pt, color }])
      return
    }

    if (tool === 'line') {
      if (!pending) {
        setPending(pt)
      } else {
        setLines(ls => [...ls, { a: pending, b: pt, color }])
        setPending(null)
      }
      return
    }

    if (tool === 'circle') {
      if (!pending) {
        setPending(pt)
      } else {
        const r = dist(pending, pt)
        setCircles(cs => [...cs, { center: pending, radius: r, color }])
        setPending(null)
      }
      return
    }

    if (tool === 'symmetry') {
      // Reflect all points
      const reflected = points.map(p => ({
        x: symAxis === 'vertical' ? 400 - p.x : p.x,
        y: symAxis === 'horizontal' ? 400 - p.y : p.y,
        color: '#ec4899',
      }))
      setPoints(ps => [...ps, ...reflected])
      const refLines = lines.map(l => ({
        a: { x: symAxis === 'vertical' ? 400 - l.a.x : l.a.x, y: symAxis === 'horizontal' ? 400 - l.a.y : l.a.y },
        b: { x: symAxis === 'vertical' ? 400 - l.b.x : l.b.x, y: symAxis === 'horizontal' ? 400 - l.b.y : l.b.y },
        color: '#ec4899',
      }))
      setLines(ls => [...ls, ...refLines])
      if (onBadgeCheck) onBadgeCheck('geo-builder', { action: 'symmetry', pointCount: points.length })
    }
  }, [tool, color, pending, points, lines, symAxis, getSVGPoint, onBadgeCheck])

  const clear = () => {
    setPoints([])
    setLines([])
    setCircles([])
    setPending(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/')} className="text-emerald-600 dark:text-emerald-400 font-medium">
            ← Retour
          </button>
          <h1 className="text-lg font-extrabold dark:text-white">📐 GeoBuilder</h1>
          <button onClick={clear} className="text-red-400 text-sm font-bold">Effacer</button>
        </div>

        {/* Toolbar */}
        <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
          {TOOLS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTool(t.id); setPending(null) }}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition ${
                tool === t.id
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Color picker */}
        <div className="flex gap-2 mb-3 items-center">
          <span className="text-xs text-gray-400">Couleur :</span>
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border-2 transition ${color === c ? 'border-gray-800 dark:border-white scale-125' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
            />
          ))}
          <label className="ml-auto flex items-center gap-1 text-xs text-gray-400">
            <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} />
            Grille
          </label>
        </div>

        {tool === 'symmetry' && (
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setSymAxis('vertical')}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${symAxis === 'vertical' ? 'bg-pink-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600'}`}
            >
              Axe vertical
            </button>
            <button
              onClick={() => setSymAxis('horizontal')}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${symAxis === 'horizontal' ? 'bg-pink-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600'}`}
            >
              Axe horizontal
            </button>
          </div>
        )}

        {pending && (
          <p className="text-xs text-amber-500 mb-2 text-center">
            📍 Premier point placé — clique pour le second point
          </p>
        )}

        {/* Canvas */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border-2 border-emerald-200 dark:border-gray-600">
          <svg
            ref={svgRef}
            width="100%"
            viewBox="0 0 400 400"
            className="touch-none"
            onClick={handleClick}
            onTouchEnd={(e) => { e.preventDefault(); handleClick(e) }}
          >
            {/* Grid */}
            {showGrid && Array.from({ length: 21 }, (_, i) => (
              <g key={i}>
                <line x1={i * 20} y1={0} x2={i * 20} y2={400} stroke="#e2e8f0" strokeWidth="0.5" />
                <line x1={0} y1={i * 20} x2={400} y2={i * 20} stroke="#e2e8f0" strokeWidth="0.5" />
              </g>
            ))}

            {/* Symmetry axis */}
            {tool === 'symmetry' && (
              symAxis === 'vertical'
                ? <line x1={200} y1={0} x2={200} y2={400} stroke="#ec4899" strokeWidth="2" strokeDasharray="8 4" />
                : <line x1={0} y1={200} x2={400} y2={200} stroke="#ec4899" strokeWidth="2" strokeDasharray="8 4" />
            )}

            {/* Lines */}
            {lines.map((l, i) => (
              <line key={`l${i}`} x1={l.a.x} y1={l.a.y} x2={l.b.x} y2={l.b.y}
                stroke={l.color} strokeWidth="2.5" strokeLinecap="round" />
            ))}

            {/* Circles */}
            {circles.map((c, i) => (
              <circle key={`c${i}`} cx={c.center.x} cy={c.center.y} r={c.radius}
                fill="none" stroke={c.color} strokeWidth="2.5" />
            ))}

            {/* Points */}
            {points.map((p, i) => (
              <circle key={`p${i}`} cx={p.x} cy={p.y} r="5" fill={p.color} stroke="#fff" strokeWidth="2" />
            ))}

            {/* Pending point */}
            {pending && (
              <circle cx={pending.x} cy={pending.y} r="6" fill="none" stroke={color} strokeWidth="2" strokeDasharray="4 2" />
            )}
          </svg>
        </div>

        <p className="text-xs text-gray-400 text-center mt-3">
          Utilise les outils pour construire des figures géométriques
        </p>
      </div>
    </div>
  )
}
