import { useState, useCallback, useMemo } from 'react'

const FUNCTIONS = [
  { label: 'f(x) = 2x + 1', fn: x => 2 * x + 1, color: '#6366f1' },
  { label: 'f(x) = -x + 3', fn: x => -x + 3, color: '#ef4444' },
  { label: 'f(x) = x²', fn: x => x * x, color: '#10b981' },
  { label: 'f(x) = -x² + 4', fn: x => -x * x + 4, color: '#f59e0b' },
  { label: 'f(x) = 0.5x - 2', fn: x => 0.5 * x - 2, color: '#ec4899' },
  { label: 'f(x) = 3', fn: () => 3, color: '#8b5cf6' },
]

function Graph({ func, highlight, width = 340, height = 300 }) {
  const ox = width / 2, oy = height / 2
  const scale = 25

  // Build path
  const points = []
  for (let px = 0; px < width; px += 2) {
    const x = (px - ox) / scale
    const y = func.fn(x)
    const py = oy - y * scale
    if (py > -50 && py < height + 50) {
      points.push(`${px},${py}`)
    }
  }
  const pathD = points.length > 0 ? 'M' + points.join(' L') : ''

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto">
      {/* Grid */}
      {Array.from({ length: Math.floor(width / scale) + 1 }, (_, i) => {
        const x = i * scale
        return <line key={`v${i}`} x1={x} y1={0} x2={x} y2={height} stroke="#334155" strokeWidth="0.5" />
      })}
      {Array.from({ length: Math.floor(height / scale) + 1 }, (_, i) => {
        const y = i * scale
        return <line key={`h${i}`} x1={0} y1={y} x2={width} y2={y} stroke="#334155" strokeWidth="0.5" />
      })}

      {/* Axes */}
      <line x1={0} y1={oy} x2={width} y2={oy} stroke="#94a3b8" strokeWidth="1.5" />
      <line x1={ox} y1={0} x2={ox} y2={height} stroke="#94a3b8" strokeWidth="1.5" />

      {/* Graduations */}
      {[-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map(n => (
        <g key={n}>
          <text x={ox + n * scale} y={oy + 14} textAnchor="middle" fill="#64748b" fontSize="9">{n}</text>
          <text x={ox - 12} y={oy - n * scale + 3} textAnchor="end" fill="#64748b" fontSize="9">{n}</text>
        </g>
      ))}
      <text x={ox + 4} y={oy + 14} fill="#64748b" fontSize="9">0</text>

      {/* Function curve */}
      <path d={pathD} fill="none" stroke={func.color} strokeWidth="2.5" />

      {/* Highlight point */}
      {highlight && (
        <>
          <line x1={ox + highlight.x * scale} y1={oy} x2={ox + highlight.x * scale} y2={oy - highlight.y * scale}
            stroke={func.color} strokeWidth="1" strokeDasharray="4 2" />
          <line x1={ox} y1={oy - highlight.y * scale} x2={ox + highlight.x * scale} y2={oy - highlight.y * scale}
            stroke={func.color} strokeWidth="1" strokeDasharray="4 2" />
          <circle cx={ox + highlight.x * scale} cy={oy - highlight.y * scale} r="5"
            fill={func.color} stroke="#fff" strokeWidth="2" />
        </>
      )}
    </svg>
  )
}

export default function FonctionsInteractives({ onBack }) {
  const [funcIdx, setFuncIdx] = useState(0)
  const [mode, setMode] = useState('lecture') // lecture | image | antecedent
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)

  const func = FUNCTIONS[funcIdx]

  const [questionX, setQuestionX] = useState(2)
  const [questionY, setQuestionY] = useState(() => func.fn(2))

  const generateQuestion = useCallback((f = func, m = mode) => {
    const x = Math.floor(Math.random() * 9) - 4
    const y = f.fn(x)
    setQuestionX(x)
    setQuestionY(Math.round(y * 100) / 100)
    setInput('')
    setFeedback(null)
  }, [func, mode])

  const check = useCallback(() => {
    const val = parseFloat(input)
    let expected
    if (mode === 'image') {
      expected = Math.round(func.fn(questionX) * 100) / 100
    } else {
      expected = questionX
    }
    if (Math.abs(val - expected) < 0.01) {
      setFeedback('✅ Correct !')
      setScore(s => s + 1)
    } else {
      setFeedback(`❌ Réponse : ${expected}`)
    }
    setTotal(t => t + 1)
  }, [input, mode, func, questionX, questionY])

  const highlight = mode === 'lecture'
    ? { x: questionX, y: func.fn(questionX) }
    : mode === 'image'
    ? (feedback ? { x: questionX, y: func.fn(questionX) } : null)
    : (feedback ? { x: questionX, y: questionY } : null)

  return (
    <div className="min-h-screen p-4 pb-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="text-accent font-medium">← Retour</button>
          <span className="text-sm font-bold text-accent">{score}/{total}</span>
        </div>

        <h1 className="text-2xl font-extrabold text-center mb-2">📈 Fonctions</h1>

        {/* Function selector */}
        <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
          {FUNCTIONS.map((f, i) => (
            <button
              key={i}
              onClick={() => { setFuncIdx(i); generateQuestion(f, mode) }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                funcIdx === i ? 'text-white' : 'bg-surface text-slate-400'
              }`}
              style={funcIdx === i ? { backgroundColor: f.color } : {}}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Mode */}
        <div className="flex gap-2 justify-center mb-4">
          {[
            { id: 'lecture', label: '👁️ Lecture' },
            { id: 'image', label: '→ Image' },
            { id: 'antecedent', label: '← Antécédent' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => { setMode(m.id); generateQuestion(func, m.id) }}
              className={`px-3 py-2 rounded-full text-xs font-bold ${
                mode === m.id ? 'bg-accent text-white' : 'bg-surface text-slate-400'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Graph */}
        <div className="bg-surface rounded-2xl p-4 mb-4 overflow-hidden">
          <Graph func={func} highlight={highlight} />
        </div>

        {/* Question */}
        <div className="bg-surface rounded-2xl p-5 mb-4">
          {mode === 'lecture' && (
            <div className="text-center">
              <p className="text-slate-400 mb-2">Lis sur le graphique :</p>
              <p className="text-lg font-bold">
                f({questionX}) = <span className="text-amber-400">{Math.round(func.fn(questionX) * 100) / 100}</span>
              </p>
              <button
                onClick={() => generateQuestion()}
                className="mt-3 px-5 py-2 bg-accent text-white font-bold rounded-xl"
              >
                Autre point →
              </button>
            </div>
          )}

          {mode === 'image' && (
            <div>
              <p className="text-center text-slate-400 mb-2">Quelle est l'image de {questionX} par f ?</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="flex-1 text-center text-xl font-bold bg-slate-800 border-2 border-accent/30 rounded-xl p-3 text-white"
                  placeholder="f(x) = ?"
                />
                {!feedback ? (
                  <button onClick={check} disabled={!input}
                    className="px-6 py-3 bg-accent text-white font-bold rounded-xl disabled:opacity-40">OK</button>
                ) : (
                  <button onClick={() => generateQuestion()} className="px-6 py-3 bg-accent text-white font-bold rounded-xl">→</button>
                )}
              </div>
              {feedback && <p className="text-center font-bold mt-3">{feedback}</p>}
            </div>
          )}

          {mode === 'antecedent' && (
            <div>
              <p className="text-center text-slate-400 mb-2">Quel est l'antécédent de {questionY} par f ?</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="flex-1 text-center text-xl font-bold bg-slate-800 border-2 border-accent/30 rounded-xl p-3 text-white"
                  placeholder="x = ?"
                />
                {!feedback ? (
                  <button onClick={check} disabled={!input}
                    className="px-6 py-3 bg-accent text-white font-bold rounded-xl disabled:opacity-40">OK</button>
                ) : (
                  <button onClick={() => generateQuestion()} className="px-6 py-3 bg-accent text-white font-bold rounded-xl">→</button>
                )}
              </div>
              {feedback && <p className="text-center font-bold mt-3">{feedback}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
