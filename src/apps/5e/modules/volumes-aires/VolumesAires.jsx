import { useState, useCallback } from 'react'

const SHAPES = [
  {
    id: 'rectangle',
    name: 'Rectangle',
    emoji: '▬',
    type: 'aire',
    generate: () => {
      const l = Math.floor(Math.random() * 10) + 2
      const w = Math.floor(Math.random() * 10) + 2
      return { params: { L: l, l: w }, answer: l * w, unit: 'cm²', formula: 'A = L × l', desc: `L = ${l} cm, l = ${w} cm` }
    },
  },
  {
    id: 'triangle',
    name: 'Triangle',
    emoji: '△',
    type: 'aire',
    generate: () => {
      const b = Math.floor(Math.random() * 10) + 2
      const h = Math.floor(Math.random() * 10) + 2
      return { params: { b, h }, answer: (b * h) / 2, unit: 'cm²', formula: 'A = b × h / 2', desc: `base = ${b} cm, hauteur = ${h} cm` }
    },
  },
  {
    id: 'cercle',
    name: 'Disque',
    emoji: '●',
    type: 'aire',
    generate: () => {
      const r = Math.floor(Math.random() * 8) + 2
      const ans = Math.round(Math.PI * r * r * 10) / 10
      return { params: { r }, answer: ans, unit: 'cm²', formula: 'A = π × r²', desc: `rayon = ${r} cm (arrondis au dixième)` }
    },
  },
  {
    id: 'pave',
    name: 'Pavé droit',
    emoji: '📦',
    type: 'volume',
    generate: () => {
      const l = Math.floor(Math.random() * 8) + 2
      const w = Math.floor(Math.random() * 8) + 2
      const h = Math.floor(Math.random() * 8) + 2
      return { params: { L: l, l: w, h }, answer: l * w * h, unit: 'cm³', formula: 'V = L × l × h', desc: `L=${l}, l=${w}, h=${h} cm` }
    },
  },
  {
    id: 'cylindre',
    name: 'Cylindre',
    emoji: '🥫',
    type: 'volume',
    generate: () => {
      const r = Math.floor(Math.random() * 6) + 2
      const h = Math.floor(Math.random() * 10) + 2
      const ans = Math.round(Math.PI * r * r * h * 10) / 10
      return { params: { r, h }, answer: ans, unit: 'cm³', formula: 'V = π × r² × h', desc: `rayon=${r} cm, hauteur=${h} cm (arrondis au dixième)` }
    },
  },
]

function Shape3D({ shape }) {
  if (shape.id === 'pave') {
    const { L, l, h } = shape.params || { L: 4, l: 3, h: 5 }
    const scale = 8
    return (
      <div className="relative" style={{ width: 160, height: 140, perspective: '500px' }}>
        <div style={{
          position: 'absolute', width: L * scale, height: h * scale,
          background: 'linear-gradient(135deg, #6366f1, #818cf8)',
          border: '2px solid #4f46e5', bottom: 10, left: 20,
          transform: 'skewY(-10deg)', borderRadius: 4
        }} />
        <div style={{
          position: 'absolute', width: l * scale, height: h * scale,
          background: 'linear-gradient(135deg, #818cf8, #a5b4fc)',
          border: '2px solid #4f46e5', bottom: 10, left: 20 + L * scale,
          transform: 'skewY(10deg)', borderRadius: 4
        }} />
        <div style={{
          position: 'absolute', width: L * scale, height: l * scale * 0.6,
          background: 'linear-gradient(135deg, #a5b4fc, #c7d2fe)',
          border: '2px solid #4f46e5', bottom: 10 + h * scale - 5, left: 20 + 5,
          transform: 'skewX(-20deg)', borderRadius: 4
        }} />
      </div>
    )
  }
  if (shape.id === 'cylindre') {
    return (
      <div className="flex flex-col items-center">
        <div className="w-16 h-4 bg-indigo-300 rounded-[50%] border-2 border-indigo-500" />
        <div className="w-16 h-20 bg-gradient-to-b from-indigo-400 to-indigo-600 border-x-2 border-indigo-500 -mt-2" />
        <div className="w-16 h-4 bg-indigo-500 rounded-[50%] border-2 border-indigo-600 -mt-2" />
      </div>
    )
  }
  return null
}

export default function VolumesAires({ onBack }) {
  const [shapeIdx, setShapeIdx] = useState(0)
  const [problem, setProblem] = useState(() => SHAPES[0].generate())
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [showFormula, setShowFormula] = useState(false)

  const shape = SHAPES[shapeIdx]

  const check = useCallback(() => {
    const val = parseFloat(input)
    if (Math.abs(val - problem.answer) < 0.5) {
      setFeedback('✅ Bravo !')
      setScore(s => s + 1)
    } else {
      setFeedback(`❌ Réponse : ${problem.answer} ${problem.unit}`)
    }
    setTotal(t => t + 1)
  }, [input, problem])

  const next = () => {
    const idx = Math.floor(Math.random() * SHAPES.length)
    setShapeIdx(idx)
    setProblem(SHAPES[idx].generate())
    setInput('')
    setFeedback(null)
    setShowFormula(false)
  }

  return (
    <div className="min-h-screen p-4 pb-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-emerald-400 font-medium">← Retour</button>
          <span className="text-sm font-bold text-emerald-400">{score}/{total}</span>
        </div>

        <h1 className="text-2xl font-extrabold text-center mb-6">📐 Volumes & Aires</h1>

        <div className="bg-surface rounded-2xl p-6 mb-4">
          {/* Shape selector */}
          <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
            {SHAPES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => { setShapeIdx(i); setProblem(s.generate()); setInput(''); setFeedback(null); setShowFormula(false) }}
                className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition ${
                  shapeIdx === i ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                {s.emoji} {s.name}
              </button>
            ))}
          </div>

          {/* Visual */}
          <div className="flex justify-center mb-4 min-h-[100px] items-center">
            {shape.type === 'volume' ? (
              <Shape3D shape={{ ...shape, params: problem.params }} />
            ) : (
              <div className="text-6xl">{shape.emoji}</div>
            )}
          </div>

          <p className="text-center text-lg font-bold mb-1">
            {shape.type === 'aire' ? "Calcule l'aire" : 'Calcule le volume'}
          </p>
          <p className="text-center text-slate-400 text-sm mb-3">{problem.desc}</p>

          <button
            onClick={() => setShowFormula(!showFormula)}
            className="text-xs text-amber-400 mb-3 block mx-auto"
          >
            {showFormula ? '🙈 Cacher' : '💡 Voir la formule'}
          </button>
          {showFormula && (
            <p className="text-center text-amber-300 font-mono text-sm mb-3 bg-slate-800 rounded-lg p-2">
              {problem.formula}
            </p>
          )}

          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 text-center text-xl font-bold bg-slate-800 border-2 border-emerald-500/30 rounded-xl p-3 text-white"
              placeholder={`? ${problem.unit}`}
            />
            {!feedback ? (
              <button
                onClick={check}
                disabled={!input}
                className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl disabled:opacity-40"
              >
                OK
              </button>
            ) : (
              <button onClick={next} className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl">
                →
              </button>
            )}
          </div>
          {feedback && <p className="text-center font-bold mt-3">{feedback}</p>}
        </div>
      </div>
    </div>
  )
}
